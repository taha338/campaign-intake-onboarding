/**
 * POST /api/submit  — Form 1 (Campaign Intake)
 *
 * Pipeline:
 *   1. Validate clientId + subject type.
 *   2. Insert main row into Supabase `campaign_intakes`.
 *   3. Insert any present credentials into `campaign_intake_secrets`.
 *   4. Best-effort ClickUp:
 *        a. Find Active Clients master task by clientId.
 *        b. Create new task in NEW---Campaign Intake Form list with rich
 *           markdown description, link to Active Clients via Linked Client.
 *        c. Update Active Clients master with Subject Type, Submitted-At,
 *           Supabase Row ID.
 *   5. Best-effort Sheets webhook.
 *
 * Required env vars:
 *   - SUPABASE_URL
 *   - SUPABASE_SECRET_KEY     (server-side only — never client)
 *   - CLICKUP_API_TOKEN
 * Optional:
 *   - SHEETS_WEBHOOK_URL      Apps Script web endpoint
 */

import { createClient } from '@supabase/supabase-js';
import {
  PRIMARY_LIST_ID,
  ACTIVE_CLIENTS_LIST_ID,
  ACTIVE_CLIENTS_FIELD_IDS,
  FIELD_IDS,
} from './clickup-field-map.js';
import { buildCustomFields, getDropdownOptionsMap } from './clickup-build.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ error: 'Invalid JSON body' }); }

  const { state = {}, secrets = {} } = body || {};
  const clientId = String(state.clientId || '').trim();
  if (!clientId || !/^[A-Za-z0-9_-]{1,40}$/.test(clientId)) {
    return res.status(400).json({ error: 'Valid clientId required' });
  }
  if (!['candidate', 'party'].includes(state.subjectType)) {
    return res.status(400).json({ error: 'Subject type required.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey   = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !secretKey) {
    return res.status(500).json({ error: 'Supabase env vars not configured.' });
  }
  const supabase = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });

  // 1) Main row into Supabase
  const submittedAt = new Date().toISOString();
  const { data: row, error: rowErr } = await supabase
    .from('campaign_intakes')
    .insert([{
      client_id:       clientId,
      clickup_task_id: state.clickupTaskId || null,
      submitted_at:    submittedAt,
      subject_type:    state.subjectType,
      payload:         state,
    }])
    .select()
    .single();
  if (rowErr) {
    return res.status(500).json({ error: 'Supabase insert failed', detail: rowErr.message });
  }

  // 2) Secrets — separate strict-RLS table
  const hasSecrets = Object.values(secrets || {}).some(Boolean);
  if (hasSecrets) {
    const { error: secErr } = await supabase
      .from('campaign_intake_secrets')
      .insert([{
        client_id:     clientId,
        intake_row_id: row.id,
        submitted_at:  submittedAt,
        payload:       secrets,
      }]);
    if (secErr) console.error('[campaign-intake] secrets insert failed:', secErr);
  }

  // 3) ClickUp sync — best effort, don't fail submission if ClickUp errors
  const errors = [];
  await syncClickUp({
    state, secrets, clientId, submittedAt,
    supabaseRowId: row.id,
  }).catch((e) => {
    console.error('[campaign-intake] ClickUp sync failed:', e);
    errors.push({ step: 'clickup', detail: String(e.message || e) });
  });

  // 4) Sheets webhook — best effort
  await syncSheets({ state, clientId, submittedAt, supabaseRowId: row.id })
    .catch((e) => errors.push({ step: 'sheets', detail: String(e.message || e) }));

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, id: row.id, syncErrors: errors });
}


// ─── ClickUp helpers ───────────────────────────────────────────────────

async function clickupFetch(path, opts = {}) {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) throw new Error('CLICKUP_API_TOKEN not set');
  const r = await fetch(`https://api.clickup.com/api/v2${path}`, {
    ...opts,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`ClickUp ${r.status} ${path}: ${txt.slice(0, 300)}`);
  }
  return r.json();
}

/**
 * Find the Active Clients master task whose "Client ID" custom field == clientId.
 * Returns the task object or null.
 */
async function findActiveClientByClientId(clientId) {
  // Active Clients list has Client ID as a workspace-shared short_text field.
  // We use the Get Tasks endpoint with the include_closed flag.
  const result = await clickupFetch(
    `/list/${ACTIVE_CLIENTS_LIST_ID}/task?include_closed=true&subtasks=true&page=0`
  );
  const tasks = result.tasks || [];
  for (const t of tasks) {
    const cf = (t.custom_fields || []).find(
      (f) => f.name === 'Client ID' && String(f.value || '').trim() === clientId,
    );
    if (cf) return t;
  }
  return null;
}

async function syncClickUp({ state, secrets, clientId, submittedAt, supabaseRowId }) {
  const displayName = state.displayName || state.candidateName || state.partyName || clientId;
  const taskName    = `${displayName} (${clientId}) — Campaign Intake`;

  // Find Active Clients master row (for Linked Client + master-row updates)
  const activeClientTask = await findActiveClientByClientId(clientId).catch(() => null);

  // Build markdown description (still useful for at-a-glance reading)
  const description = buildDescription(state);

  // Resolve dropdown options once, then build structured custom_fields[]
  const optionsMap = await getDropdownOptionsMap().catch((e) => {
    console.warn('[campaign-intake] dropdown options fetch failed:', e.message);
    return {};
  });
  const { fields: customFields, unresolved } = buildCustomFields(state, secrets, optionsMap);
  if (unresolved.length) {
    console.warn('[campaign-intake] unresolved dropdown values:', unresolved);
  }

  // Create task in NEW---Campaign Intake Form list with all fields populated
  const newTask = await clickupFetch(`/list/${PRIMARY_LIST_ID}/task`, {
    method: 'POST',
    body: JSON.stringify({
      name: taskName,
      description,
      status: 'to do',
      tags: [`subject:${state.subjectType}`],
      custom_fields: customFields,
    }),
  });

  // Set Linked Client relationship (if we found master task)
  if (activeClientTask && FIELD_IDS['Linked Client']) {
    await clickupFetch(`/task/${newTask.id}/field/${FIELD_IDS['Linked Client']}`, {
      method: 'POST',
      body: JSON.stringify({ value: { add: [activeClientTask.id] } }),
    }).catch((e) => console.error('[campaign-intake] linked-client set failed:', e));
  }

  // Update Active Clients master row with: Subject Type, Submitted-At, Supabase Row ID
  if (activeClientTask) {
    // Subject Type was created with options ['Candidate','Party'] → orderindex 0|1
    const subjectOrderIndex = state.subjectType === 'party' ? 1 : 0;
    const updates = [
      { fid: ACTIVE_CLIENTS_FIELD_IDS['Subject Type'],                  value: subjectOrderIndex },
      { fid: ACTIVE_CLIENTS_FIELD_IDS['Campaign Intake Submitted At'],  value: Date.parse(submittedAt) },
      { fid: ACTIVE_CLIENTS_FIELD_IDS['Form 1 Supabase Row ID'],        value: supabaseRowId },
    ].filter((u) => u.fid && u.value !== undefined && u.value !== null);

    for (const u of updates) {
      await setCustomField(activeClientTask.id, u.fid, u.value)
        .catch((e) => console.error('[campaign-intake] master update failed:', u.fid, e.message));
    }

    // Edit-propagation: if the user changed any contact / display name in the
    // form, write those back to the Active Clients master so it doesn't drift.
    // Workspace-shared field IDs are read off the task itself (since they
    // weren't in our manifest — they auto-attach across all workspace lists).
    const masterFieldByName = {};
    for (const cf of activeClientTask.custom_fields || []) masterFieldByName[cf.name] = cf;
    const contactWrites = [
      { name: 'DBA / Trade Name*',         value: state.displayName },
      { name: 'Primary Contact Name*',     value: state.primaryName || state.submitterName },
      { name: 'Primary Contact Email*',    value: state.primaryEmail || state.submitterEmail },
      { name: 'Primary Contact Phone*',    value: state.primaryPhone },
      { name: 'EIN / Tax ID',              value: state.ein },
    ].filter((w) => w.value && masterFieldByName[w.name]?.id)
     .map((w) => ({ fid: masterFieldByName[w.name].id, value: String(w.value).trim() }))
     .filter((w) => w.value);

    for (const w of contactWrites) {
      await setCustomField(activeClientTask.id, w.fid, w.value)
        .catch((e) => console.error('[campaign-intake] contact propagation failed:', w.fid, e.message));
    }

    // If all 3 form Submitted-At dates are now non-null on the master,
    // advance status to "all forms received" so the Worker doesn't have
    // to run a separate automation. We just wrote Campaign Intake's date,
    // so check the other two from the pre-write task snapshot.
    await maybeAdvanceAllFormsReceived(activeClientTask, {
      campaign_intake: true,
    }).catch((e) => console.error('[campaign-intake] status advance failed:', e.message));
  }

  return { task_id: newTask.id, active_client_id: activeClientTask?.id || null };
}

async function maybeAdvanceAllFormsReceived(activeClientTask, justWrote) {
  const get = (name) => (activeClientTask.custom_fields || []).find((f) => f.name === name)?.value;
  const f1 = justWrote.campaign_intake || get('Campaign Intake Submitted At');
  const f2 = justWrote.brand_onboarding || get('Brand Onboarding Submitted At');
  const f3 = justWrote.website_content || get('Website Content Submitted At');
  if (!(f1 && f2 && f3)) return;
  const target = process.env.AC_ALL_FORMS_STATUS || 'all forms received';
  const current = activeClientTask.status?.status || '';
  if (current.toLowerCase() === target.toLowerCase()) return;
  await clickupFetch(`/task/${activeClientTask.id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: target }),
  });
}

async function setCustomField(taskId, fieldId, value) {
  return clickupFetch(`/task/${taskId}/field/${fieldId}`, {
    method: 'POST',
    body: JSON.stringify({ value }),
  });
}


// ─── Description builder ───────────────────────────────────────────────

function buildDescription(state) {
  const lines = [
    `# Campaign Intake — ${state.displayName || state.clientId}`,
    '',
    `**Client ID:** ${state.clientId}`,
    `**Subject type:** ${state.subjectType}`,
    `**Submitted:** ${new Date().toISOString()}`,
    '',
    '_Full structured payload is stored in Supabase. This description shows a human-readable summary._',
    '',
  ];
  // Walk top-level keys and dump
  const skip = new Set(['clientId', 'subjectType', 'displayName', 'currentStage', 'completedStages', 'submitting', 'submitted', 'submitError', 'optInDomainHostingEmail', 'optInDataUsersOps', 'clickupTaskId']);
  for (const [k, v] of Object.entries(state)) {
    if (skip.has(k)) continue;
    if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) continue;
    lines.push(`## ${humanize(k)}`);
    lines.push(formatValue(v));
    lines.push('');
  }
  return lines.join('\n').slice(0, 8000); // ClickUp has description size limits
}

function humanize(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

function formatValue(v) {
  if (Array.isArray(v)) {
    if (v.length && typeof v[0] === 'object') {
      return v.map((item, i) => `${i + 1}. ` + Object.entries(item).map(([k, x]) => `**${humanize(k)}:** ${x}`).join(' · ')).join('\n');
    }
    return v.map((x) => `- ${x}`).join('\n');
  }
  if (v && typeof v === 'object') {
    return Object.entries(v).map(([k, x]) => `- **${humanize(k)}:** ${x ?? ''}`).join('\n');
  }
  return String(v);
}


// ─── Sheets webhook ────────────────────────────────────────────────────

async function syncSheets({ state, clientId, submittedAt, supabaseRowId }) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;
  // Strip clientId from payload — already promoted to top-level client_id,
  // having it twice creates a redundant column in the Sheet.
  const { clientId: _drop, ...payload } = state || {};
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      form: 'campaign_intake',
      client_id: clientId,
      submitted_at: submittedAt,
      supabase_row_id: supabaseRowId,
      payload,
    }),
  });
}

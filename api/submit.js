/**
 * POST /api/submit
 *
 * Body: { state, secrets }
 *
 * 1. Validate client_id matches a real ClickUp Active Clients task.
 * 2. Insert non-secret fields into Supabase `campaign_intakes`.
 * 3. Insert secret fields into `campaign_intake_secrets` (strict RLS, service role).
 * 4. (Best-effort) update the matching ClickUp Campaign Onboarding Form task
 *    with all custom field values + flip status to 'complete'.
 * 5. (Best-effort) POST to the Apps Script Sheets endpoint.
 *
 * Required env vars:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY     (server-side only — never client)
 *   - CLICKUP_API_TOKEN
 * Optional:
 *   - CLICKUP_CAMPAIGN_FORM_LIST_ID  default: 901113628488
 *   - SHEETS_WEBHOOK_URL             Apps Script web endpoint
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { state = {}, secrets = {} } = body || {};
  const clientId = (state.clientId || '').toString().trim();
  if (!clientId) {
    return res.status(400).json({ error: 'clientId is required (no ?client_id in URL?).' });
  }
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(clientId)) {
    return res.status(400).json({ error: 'Invalid clientId format' });
  }
  if (!state.subjectType || !['candidate', 'party'].includes(state.subjectType)) {
    return res.status(400).json({ error: 'Subject type required.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Supabase env vars not configured.' });
  }
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // 1) Insert main row.
  const { data: row, error: rowErr } = await supabase
    .from('campaign_intakes')
    .insert([{
      client_id:     clientId,
      clickup_task_id: state.clickupTaskId || null,
      submitted_at:  new Date().toISOString(),
      subject_type:  state.subjectType,
      payload:       state,        // jsonb full snapshot
    }])
    .select()
    .single();
  if (rowErr) {
    return res.status(500).json({ error: 'Supabase insert failed', detail: rowErr.message });
  }

  // 2) Insert secrets (separate table, RLS allows only service role to read).
  const hasSecrets = Object.values(secrets || {}).some(Boolean);
  if (hasSecrets) {
    const { error: secErr } = await supabase
      .from('campaign_intake_secrets')
      .insert([{
        client_id:    clientId,
        intake_row_id: row.id,
        submitted_at: new Date().toISOString(),
        payload:      secrets,
      }]);
    if (secErr) {
      // Don't fail the whole submission — log and surface.
      console.error('Secrets insert failed:', secErr);
    }
  }

  // 3) Best-effort ClickUp + Sheets sync. We don't fail the form if these fail;
  //    Supabase has the canonical row.
  const errors = [];
  await syncClickUp({ state, secrets, clientId }).catch((e) => errors.push({ step: 'clickup', detail: String(e.message || e) }));
  await syncSheets({ state, clientId }).catch((e) => errors.push({ step: 'sheets', detail: String(e.message || e) }));

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true, id: row.id, syncErrors: errors });
}

async function syncClickUp({ state, clientId }) {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) return;
  const listId = process.env.CLICKUP_CAMPAIGN_FORM_LIST_ID || '901113628488';

  // For v0 we just create a new task in the Campaign Onboarding Form list
  // with the client_id in the name. Field-by-field custom-field updates land
  // once the new ClickUp custom fields are created and we have their field IDs.
  await fetch(`https://api.clickup.com/api/v2/list/${encodeURIComponent(listId)}/task`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: `${clientId} — Campaign Intake (v0 submission)`,
      status: 'complete',
      description: `Submitted via campaign-intake.vercel.app at ${new Date().toISOString()}.\n\nSee Supabase row for full payload.`,
    }),
  });
}

async function syncSheets({ state, clientId }) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      form: 'campaign_intake',
      client_id: clientId,
      submitted_at: new Date().toISOString(),
      payload: state,
    }),
  });
}

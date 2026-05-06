/**
 * GET /api/clickup-prefill?clientId=<id>
 *
 * Returns pre-fill data for the form, sourced from:
 *   1. Active Clients master row (client metadata)
 *   2. Sibling-form Supabase rows linked via Active Clients (cross-form fill)
 *
 * Required env vars (Vercel project settings):
 *   - CLICKUP_API_TOKEN
 *   - SUPABASE_URL
 *   - SUPABASE_SECRET_KEY
 * Optional:
 *   - CLICKUP_ACTIVE_CLIENTS_LIST_ID  (default 901113554047)
 */

import { createClient } from '@supabase/supabase-js';

const FIELDS = {
  // Workspace-shared fields (auto-attached on every list)
  clientId:       'Client ID',
  tradeName:      'DBA / Trade Name*',
  primaryName:    'Primary Contact Name*',
  primaryEmail:   'Primary Contact Email*',
  primaryPhone:   'Primary Contact Phone*',
  secondaryName:  'Secondary Contact Name',
  secondaryEmail: 'Secondary Contact Email',
  secondaryRole:  'Secondary Contact Role',
  commPref:       'Communication Preference*',
  packageSel:     'Package Selected**',
  industry:       'Industry / Niche',
  // Our newly-created Active Clients fields
  subjectType:    'Subject Type',
  form1RowId:     'Form 1 Supabase Row ID',
  form2RowId:     'Form 2 Supabase Row ID',
  form3RowId:     'Form 3 Supabase Row ID',
};

function findFieldValue(customFields, label) {
  if (!Array.isArray(customFields) || !label) return null;
  const m = customFields.find((f) => f?.name?.toLowerCase().trim() === label.toLowerCase().trim());
  if (!m) return null;
  if (m.type === 'drop_down' && m.value !== undefined && m.value !== null) {
    const opt = m.type_config?.options?.[m.value];
    return opt?.name ?? null;
  }
  return m.value ?? null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { clientId } = req.query;
  if (!clientId || typeof clientId !== 'string') {
    return res.status(400).json({ error: 'clientId query parameter is required' });
  }
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(clientId)) {
    return res.status(400).json({ error: 'Invalid clientId format' });
  }

  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_ACTIVE_CLIENTS_LIST_ID || '901113554047';
  if (!token) {
    return res.status(500).json({ error: 'CLICKUP_API_TOKEN not configured on the server' });
  }

  try {
    // ── 1. Find the Active Clients master task ──
    const url = `https://api.clickup.com/api/v2/list/${encodeURIComponent(listId)}/task?include_closed=true&subtasks=false`;
    const upstream = await fetch(url, {
      method: 'GET',
      headers: { Authorization: token, Accept: 'application/json' },
    });
    if (!upstream.ok) {
      const body = await upstream.text();
      return res.status(upstream.status).json({ error: 'ClickUp API failed', detail: body.slice(0, 500) });
    }
    const data = await upstream.json();
    const tasks = data.tasks || [];
    const match = tasks.find((t) =>
      (t.custom_fields || []).some(
        (cf) => cf.name?.toLowerCase().trim() === FIELDS.clientId.toLowerCase().trim()
          && String(cf.value || '').toLowerCase() === clientId.toLowerCase()
      )
    );
    if (!match) {
      return res.status(200).json({ found: false });
    }

    const cfs = match.custom_fields || [];
    const subjectType    = findFieldValue(cfs, FIELDS.subjectType);
    const form2RowId     = findFieldValue(cfs, FIELDS.form2RowId);

    const payload = {
      found: true,
      taskId:    match.id,
      taskName:  match.name,
      taskUrl:   match.url,
      clientId:  findFieldValue(cfs, FIELDS.clientId),
      tradeName: findFieldValue(cfs, FIELDS.tradeName),
      // Subject type (Candidate / Party) — drives all conditional logic
      subjectType: typeof subjectType === 'string' ? subjectType.toLowerCase() : null,
      // Communications metadata
      contact: {
        name:           findFieldValue(cfs, FIELDS.primaryName),
        email:          findFieldValue(cfs, FIELDS.primaryEmail),
        phone:          findFieldValue(cfs, FIELDS.primaryPhone),
        secondaryName:  findFieldValue(cfs, FIELDS.secondaryName),
        secondaryEmail: findFieldValue(cfs, FIELDS.secondaryEmail),
        secondaryRole:  findFieldValue(cfs, FIELDS.secondaryRole),
      },
      // Client metadata
      meta: {
        communicationPreference: findFieldValue(cfs, FIELDS.commPref),
        packageSelected:         findFieldValue(cfs, FIELDS.packageSel),
        industry:                findFieldValue(cfs, FIELDS.industry),
      },
      // Sibling-form completion state — useful for showing "Form 2 already done" hints
      siblingForms: {
        form2RowId,
        form3RowId: findFieldValue(cfs, FIELDS.form3RowId),
      },
      // Will be hydrated below if sibling form data is available
      brand: null,
    };

    // ── 2. Cross-form Supabase lookup — pull Form 2 brand fields if available ──
    if (form2RowId) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const secretKey   = process.env.SUPABASE_SECRET_KEY;
      if (supabaseUrl && secretKey) {
        const supabase = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });
        const { data: brandRow } = await supabase
          .from('brand_submissions')
          .select('subject_type, candidate_name, candidate_office, candidate_state, candidate_district, election_year, party_affiliation, race_focus, candidate_type, party_name, party_acronym, party_type, party_scope, party_state, party_founded_year, brand_core, sub_direction, logo_type, existing_logo_url, color_primary, color_secondary, color_accent, color_background, color_text, color_highlight, font_heading, font_body, backgrounds, policy_priorities')
          .eq('id', form2RowId)
          .maybeSingle();
        if (brandRow) payload.brand = brandRow;
      }
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(502).json({ error: 'Upstream fetch failed', detail: String(err?.message || err) });
  }
}

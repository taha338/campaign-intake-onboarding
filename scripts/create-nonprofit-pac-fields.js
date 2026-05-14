#!/usr/bin/env node
/**
 * One-shot: creates the Nonprofit + PAC custom fields on the
 * NEW---Campaign Intake Form list (901113726567) via ClickUp API.
 *
 * Idempotent: GET existing fields first, skip any whose name already exists.
 *
 * Usage:
 *   CLICKUP_API_TOKEN=pk_xxx node scripts/create-nonprofit-pac-fields.js
 *
 * Writes the resulting name → UUID map to scripts/created-fields-output.json,
 * which can then be folded into api/clickup-field-map.js.
 */

import fs from 'node:fs';

const TOKEN = process.env.CLICKUP_API_TOKEN;
const LIST_ID = '901113726567';
if (!TOKEN) {
  console.error('CLICKUP_API_TOKEN env var required');
  process.exit(1);
}

// ── Field definitions ────────────────────────────────────────────
const ddOpts = (labels) => ({
  default: null,
  placeholder: null,
  new_drop_down: true,
  options: labels.map((name, i) => ({ name, color: null, orderindex: i })),
});

const NONPROFIT_TYPES = [
  '501(c)(3) — Charitable',
  '501(c)(4) — Social Welfare / Advocacy',
  '501(c)(6) — Trade Association',
  '527 / Political Org',
  'Other',
];
const NONPROFIT_SCOPES = ['National', 'Multi-State', 'Statewide', 'Local'];
const IRS_DETERMINATION_STATUS = ['Approved', 'Pending', 'Revoked', 'Fiscally Sponsored', 'N/A'];
const LOBBYING_ACTIVITY = [
  'None',
  'Insubstantial (c3 substantial-part test)',
  '501(h) elected (c3)',
  'Primary purpose (c4)',
  'N/A',
];
const PAC_TYPES = ['Federal PAC', 'State PAC', 'Super PAC', 'Hybrid PAC', 'Carey Committee', 'Leadership PAC', 'Other'];
const PAC_SCOPES = ['Federal', 'Multi-State', 'Statewide', 'Local'];
const FEC_REGISTRATION_STATUS = ['Registered', 'In Progress', 'Not Yet', 'N/A (state-only)'];
const PAC_PRIMARY_ACTIVITY = ['Contributions to candidates', 'Independent expenditures', 'Both (Hybrid)', 'Issue advocacy'];
const PAC_CONNECTED_STATUS = ['Connected', 'Non-connected', 'N/A'];
const FEC_FILING_FREQUENCIES = ['Monthly', 'Quarterly', 'Semi-Annual', 'Pre/Post-Election Only', 'N/A (state-only)'];
const YES_NO = ['Yes', 'No'];
const YES_NO_NA = ['Yes', 'No', 'N/A'];

const FIELDS_TO_CREATE = [
  // ── Nonprofit (18) ─────────────────────────────────────────────
  { name: 'Nonprofit Legal Name',           type: 'short_text' },
  { name: 'Nonprofit Type',                 type: 'drop_down', type_config: ddOpts(NONPROFIT_TYPES) },
  { name: 'Nonprofit Scope',                type: 'drop_down', type_config: ddOpts(NONPROFIT_SCOPES) },
  { name: 'Nonprofit States Covered',       type: 'short_text' },
  { name: 'Nonprofit City / County',        type: 'short_text' },
  { name: 'Nonprofit Mission',              type: 'text' },
  { name: 'Nonprofit Cause Areas',          type: 'short_text' },
  { name: 'Nonprofit Founded Year',         type: 'short_text' },
  { name: 'Nonprofit Membership-Based?',    type: 'drop_down', type_config: ddOpts(YES_NO) },
  { name: 'IRS Determination Status',       type: 'drop_down', type_config: ddOpts(IRS_DETERMINATION_STATUS) },
  { name: 'IRS Determination Date',         type: 'date' },
  { name: 'Fiscal Year End',                type: 'short_text' },
  { name: 'Fiscal Sponsor',                 type: 'short_text' },
  { name: 'State of Incorporation',         type: 'short_text' },
  { name: 'Affiliated Sister Org (c3/c4/c6)', type: 'short_text' },
  { name: '501(h) Election Made?',          type: 'drop_down', type_config: ddOpts(YES_NO_NA) },
  { name: 'Lobbying Activity',              type: 'drop_down', type_config: ddOpts(LOBBYING_ACTIVITY) },

  // ── PAC (17) ───────────────────────────────────────────────────
  { name: 'PAC Legal Name',                 type: 'short_text' },
  { name: 'PAC Type',                       type: 'drop_down', type_config: ddOpts(PAC_TYPES) },
  { name: 'PAC Scope',                      type: 'drop_down', type_config: ddOpts(PAC_SCOPES) },
  { name: 'PAC States Covered',             type: 'short_text' },
  { name: 'FEC Committee ID',               type: 'short_text' },
  { name: 'State Committee IDs (JSON)',     type: 'text' },
  { name: 'PAC Connected Status',           type: 'drop_down', type_config: ddOpts(PAC_CONNECTED_STATUS) },
  { name: 'PAC Sponsoring Organization',    type: 'short_text' },
  { name: 'PAC IE-Only?',                   type: 'drop_down', type_config: ddOpts(YES_NO) },
  { name: 'FEC Registration Status',        type: 'drop_down', type_config: ddOpts(FEC_REGISTRATION_STATUS) },
  { name: 'PAC Date Registered',            type: 'date' },
  { name: 'PAC Affiliated Committees',      type: 'short_text' },
  { name: 'PAC Mission',                    type: 'text' },
  { name: 'PAC Year Established',           type: 'short_text' },
  { name: 'PAC Primary Activity',           type: 'drop_down', type_config: ddOpts(PAC_PRIMARY_ACTIVITY) },
  { name: 'PAC Filing Frequency',           type: 'drop_down', type_config: ddOpts(FEC_FILING_FREQUENCIES) },
];

async function getExistingFields() {
  const r = await fetch(`https://api.clickup.com/api/v2/list/${LIST_ID}/field`, {
    headers: { Authorization: TOKEN },
  });
  if (!r.ok) throw new Error(`GET fields failed ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return Object.fromEntries((j.fields || []).map((f) => [f.name, f.id]));
}

async function createField(def) {
  const r = await fetch(`https://api.clickup.com/api/v2/list/${LIST_ID}/field`, {
    method: 'POST',
    headers: { Authorization: TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(def),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`POST ${def.name} failed ${r.status}: ${text}`);
  return JSON.parse(text);
}

async function main() {
  console.log(`Fetching existing fields on list ${LIST_ID}...`);
  const existing = await getExistingFields();
  console.log(`Found ${Object.keys(existing).length} existing fields.\n`);

  const result = {};
  let created = 0, skipped = 0;

  for (const def of FIELDS_TO_CREATE) {
    if (existing[def.name]) {
      console.log(`SKIP   ${def.name}  (already exists: ${existing[def.name]})`);
      result[def.name] = existing[def.name];
      skipped++;
      continue;
    }
    try {
      const out = await createField(def);
      // ClickUp returns { field: {...} } on some plans, { id, name, ... } on others
      const field = out.field || out;
      const id = field.id || field.field_id;
      console.log(`CREATE ${def.name}  →  ${id}`);
      result[def.name] = id;
      created++;
    } catch (e) {
      console.error(`ERROR  ${def.name}:`, e.message);
    }
    await new Promise((r) => setTimeout(r, 120)); // gentle rate-limit
  }

  const outPath = new URL('./created-fields-output.json', import.meta.url).pathname;
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`\n${created} created, ${skipped} skipped. Wrote ${outPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

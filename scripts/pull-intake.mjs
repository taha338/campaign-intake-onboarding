/**
 * Pull a campaign_intakes row from Supabase and print the full payload.
 *
 * Usage:
 *   cd campaign-intake
 *   vercel env pull .env.local        # gets real SUPABASE_URL + SUPABASE_SECRET_KEY
 *   node scripts/pull-intake.mjs CI-0233
 *   node scripts/pull-intake.mjs --row 1002097d-a16d-47ca-8657-dc535707d25b
 *
 * Env vars (auto-loaded from .env.local / .env.production if present):
 *   SUPABASE_URL
 *   SUPABASE_SECRET_KEY   (or SUPABASE_SERVICE_ROLE_KEY)
 */

import { readFileSync } from 'node:fs';

// ── load env from .env.local then .env.production (first wins) ──
for (const f of ['.env.local', '.env.production']) {
  try {
    for (const line of readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2].trim().replace(/^["']|["']$/g, '');
      if (val && process.env[key] === undefined) process.env[key] = val;
    }
  } catch { /* file may not exist */ }
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SECRET_KEY. Run: vercel env pull .env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
let query;
if (args[0] === '--row') {
  query = `id=eq.${encodeURIComponent(args[1])}`;
} else if (args[0]) {
  query = `client_id=eq.${encodeURIComponent(args[0])}&order=submitted_at.desc&limit=1`;
} else {
  console.error('Usage: node scripts/pull-intake.mjs <CLIENT_ID> | --row <UUID>');
  process.exit(1);
}

const url = `${SUPABASE_URL}/rest/v1/campaign_intakes?${query}&select=*`;
const res = await fetch(url, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
if (!res.ok) {
  console.error(`Supabase ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const rows = await res.json();
if (!rows.length) {
  console.error('No row found.');
  process.exit(1);
}

const row = rows[0];
const payload = row.payload || {};

console.log(`\n=== campaign_intakes row ${row.id} ===`);
console.log(`client_id:    ${row.client_id}`);
console.log(`subject_type: ${row.subject_type}`);
console.log(`submitted_at: ${row.submitted_at}`);
console.log(`clickup_task_id: ${row.clickup_task_id || '(none)'}`);

console.log(`\n--- payload: NON-EMPTY keys (${Object.keys(payload).length} total) ---`);
const isEmpty = (v) =>
  v === null || v === undefined || v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);
for (const [k, v] of Object.entries(payload)) {
  if (isEmpty(v)) continue;
  const disp = typeof v === 'object' ? JSON.stringify(v) : String(v);
  console.log(`  ${k} = ${disp.slice(0, 120)}`);
}

console.log(`\n--- payload: EMPTY keys ---`);
console.log('  ' + Object.entries(payload).filter(([, v]) => isEmpty(v)).map(([k]) => k).join(', '));

// Quick PAC-field focus
const PAC_KEYS = [
  'pacId', 'pacLegalName', 'pacType', 'pacScope', 'pacStatesCovered',
  'pacFecCommitteeId', 'pacStateCommitteeIds', 'pacConnectedStatus',
  'pacSponsoringOrganization', 'pacIndependentExpenditureOnly',
  'pacFecRegistrationStatus', 'pacDateRegistered', 'pacAffiliatedCommittees',
  'pacMission', 'pacYearEstablished', 'pacPrimaryActivity', 'pacFilingFrequency',
];
console.log(`\n--- PAC fields in payload ---`);
for (const k of PAC_KEYS) {
  const v = payload[k];
  console.log(`  ${k.padEnd(30)} ${isEmpty(v) ? '‼️ EMPTY' : (typeof v === 'object' ? JSON.stringify(v) : v)}`);
}
console.log('');

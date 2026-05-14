/**
 * Backfill ClickUp custom fields on a Campaign Intake task from a saved
 * form `state` payload — re-runs the same buildCustomFields() the live
 * /api/submit uses, but with 429 retry + throttling so nothing is dropped.
 *
 * Usage:
 *   cd campaign-intake
 *   source ~/.zshrc                       # exports OP1776_CLICKUP_API_TOKEN
 *   node scripts/backfill-fields.mjs <TASK_ID> scripts/ci0233-payload.json
 *   node scripts/backfill-fields.mjs 868jmqhu9 scripts/ci0233-payload.json --dry
 *
 * Env: OP1776_CLICKUP_API_TOKEN  (or CLICKUP_API_TOKEN)
 */

import { readFileSync } from 'node:fs';
import { buildCustomFields, getDropdownOptionsMap } from '../api/clickup-build.js';

const TOKEN = process.env.OP1776_CLICKUP_API_TOKEN || process.env.CLICKUP_API_TOKEN;
if (!TOKEN) {
  console.error('Missing OP1776_CLICKUP_API_TOKEN. Run: source ~/.zshrc');
  process.exit(1);
}
// clickup-build.js reads process.env.CLICKUP_API_TOKEN internally.
process.env.CLICKUP_API_TOKEN = TOKEN;

const [taskId, payloadPath, ...flags] = process.argv.slice(2);
const DRY = flags.includes('--dry');
if (!taskId || !payloadPath) {
  console.error('Usage: node scripts/backfill-fields.mjs <TASK_ID> <payload.json> [--dry]');
  process.exit(1);
}

const state = JSON.parse(readFileSync(new URL(`../${payloadPath}`, import.meta.url), 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cu(path, opts = {}, attempt = 0) {
  const r = await fetch(`https://api.clickup.com/api/v2${path}`, {
    ...opts,
    headers: {
      Authorization: TOKEN,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (r.status === 429 && attempt < 6) {
    const wait = Number(r.headers.get('retry-after') || 0) * 1000 || 2 ** attempt * 1000;
    console.warn(`  429 — backing off ${wait}ms (attempt ${attempt + 1})`);
    await sleep(wait);
    return cu(path, opts, attempt + 1);
  }
  if (!r.ok) throw new Error(`${r.status} ${path}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

// ── current task state — only write fields that are actually empty ──
const task = await cu(`/task/${taskId}`);
const valById = new Map(
  (task.custom_fields || []).map((f) => [f.id, f.value]),
);
const nameById = new Map((task.custom_fields || []).map((f) => [f.id, f.name]));
const isEmpty = (v) =>
  v === undefined || v === null || v === '' ||
  (Array.isArray(v) && v.length === 0);

const optionsMap = await getDropdownOptionsMap();
const { fields, unresolved } = buildCustomFields(state, {}, optionsMap);

console.log(`\nTask: ${task.name} (${taskId})`);
console.log(`buildCustomFields produced ${fields.length} fields; ${unresolved.length} unresolved dropdowns.\n`);

if (unresolved.length) {
  console.log('UNRESOLVED dropdowns (value did not match any ClickUp option — needs a value-map fix):');
  for (const u of unresolved) console.log(`  ${u.fieldName} <- "${u.value}"`);
  console.log('');
}

const toWrite = fields.filter((f) => isEmpty(valById.get(f.id)));
const alreadySet = fields.filter((f) => !isEmpty(valById.get(f.id)));
console.log(`${alreadySet.length} already populated (skipping), ${toWrite.length} empty → will backfill.\n`);

let ok = 0;
const failed = [];
for (const f of toWrite) {
  const label = nameById.get(f.id) || f.id;
  if (DRY) {
    console.log(`  [dry] would set ${label} = ${JSON.stringify(f.value).slice(0, 80)}`);
    continue;
  }
  try {
    await cu(`/task/${taskId}/field/${f.id}`, {
      method: 'POST',
      body: JSON.stringify({ value: f.value }),
    });
    ok++;
    console.log(`  ✓ ${label}`);
  } catch (e) {
    failed.push({ label, error: String(e.message || e) });
    console.log(`  ✗ ${label} — ${e.message || e}`);
  }
  await sleep(350); // throttle: ~170 req/min ceiling, stays well under 100/min burst
}

console.log(`\nDone. ${ok} written, ${failed.length} failed, ${alreadySet.length} skipped (already set).`);
if (failed.length) {
  console.log('FAILED:');
  for (const f of failed) console.log(`  ${f.label}: ${f.error}`);
  process.exit(1);
}

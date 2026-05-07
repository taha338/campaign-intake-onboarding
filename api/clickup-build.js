/**
 * Build ClickUp custom_fields[] for the Campaign Intake Form list from
 * the form's `state` object. Mirrors sales-intake/api/_clickup.js pattern.
 *
 * Drop-down values are sent as orderindex INTEGERS (or option UUIDs),
 * never label strings — ClickUp returns FIELD_011 ("Value must be an
 * option index or uuid") for label strings. Date values must be epoch ms.
 * Attachment fields are not writeable via the public API → skipped.
 */

import { FIELD_IDS, FIELD_TYPES, PRIMARY_LIST_ID } from './clickup-field-map.js';

// formStateKey → ClickUp field name (must match FIELD_IDS keys exactly)
export const STATE_TO_FIELD = {
  partyName:                     'Party Name',
  partyAcronym:                  'Party Acronym',
  partyType:                     'Party Type',
  partyTypeOther:                'Party Type Other',
  partyScope:                    'Party Scope',
  primaryStateParty:             'Primary State (party)',
  statesCovered:                 'States Covered',
  cityCounty:                    'City / County',
  foundedYear:                   'Founded Year',
  membershipLink:                'Membership / Join Link',
  subdomainsForChapters:         'Subdomains for Chapters / Affiliates',
  newSiteHostingProvider:        'New Site Hosting Provider',
  commsDirectorName:             'Communications Director — Name',
  commsDirectorContact:          'Communications Director — Contact',
  partyChairName:                'Party Chair — Name',
  partyChairContact:             'Party Chair — Contact',
  viceChairName:                 'Vice Chair — Name',
  viceChairContact:              'Vice Chair — Contact',
  execDirectorName:              'Executive Director — Name',
  execDirectorContact:           'Executive Director — Contact',
  treasurerName:                 'Treasurer — Name',
  treasurerContact:              'Treasurer — Contact',
  leadSpokesperson:              'Lead Spokesperson',
  counselName:                   'Campaign / General Counsel — Name',
  counselContact:                'Campaign / General Counsel — Contact',
  membershipDbPlatform:          'Membership Database Platform',
  filedForOffice:                'Filed for office?',
  filingDeadline:                'Filing deadline',
  ballotName:                    'Ballot name (exact spelling)',
  petitionDriveNeeded:           'Petition signature drive needed?',
  signaturesAndDeadline:         'Signatures required + deadline',
  memberPortalPlatform:          'Member portal platform',
  membershipApplicationWorkflow: 'Membership application workflow',
  membershipApprover:            'Membership approver — name & contact',
  affiliatedCandidateIntake:     'Affiliated candidate intake process',
  affiliatedCandidateApprover:   'Affiliated candidate approver — name & contact',
  stateChapterOnboardingProcess: 'State chapter onboarding process',
  stateChapterOnboardingContact: 'State chapter onboarding contact',
  affiliatedPacs:                'Affiliated PACs / Allied Committees',
  candidateRecruitmentLead:      'Candidate recruitment lead',
  // JSON-serialized repeating blocks
  users:                         'Users (JSON)',
  hardMilestones:                'Hard Milestones (JSON)',
  coalitionLeads:                'Coalition Outreach Leads (JSON)',
  internalCommitteeChairs:       'Internal Committee Chairs (JSON)',
  // ── Added 2026-05 (Wix-spec parity, 53 keys) ──
  afterHoursName:                'After-hours contact — name',
  afterHoursPhone:               'After-hours contact — phone',
  campaignManagerContact:        'Campaign manager — contact',
  campaignManagerName:           'Campaign manager — name',
  canSpamAddressOverride:        'CAN-SPAM address override',
  candState:                     'Candidate state',
  candidateFullLegalName:        'Candidate Full Legal Name',
  crisisLeadContact:             'Crisis lead — contact',
  crisisLeadName:                'Crisis lead — name',
  currentDnsProvider:            'Current DNS Provider',
  dataSharingAgreementsOps:      'Data sharing agreements (ops)',
  displayName:                   'Display / operation name',
  district:                      'District',
  donateLink:                    'Donate Link',
  donorCrmPlatform:              'Donor CRM platform',
  ecommerceStore:                'E-commerce store?',
  ein:                           'EIN / Tax ID',
  electionYear:                  'Election year',
  emailMarketingPlatform:        'Email marketing platform',
  existingCmsHost:               'Existing CMS / Host',
  fecId:                         'FEC ID',
  fieldDirectorContact:          'Field director — contact',
  fieldDirectorName:             'Field director — name',
  industry:                      'Industry / Niche',
  launchDeadline:                'Launch deadline',
  mailingAddress:                'Organization Address',
  officeSought:                  'Office sought',
  orgEmail:                      'Organization Email',
  orgLegalName:                  'Legal organization name',
  orgPhone:                      'Organization Phone',
  orgType:                       'Organization type',
  partisanRace:                  'Is this a partisan race?',
  paymentProvider:               'Payment provider',
  preferredAreaCodes:            'Preferred area codes',
  primaryDomain:                 'Primary domain',
  primaryEmail:                  'Primary Contact Email*',
  primaryFromAbove:              'Primary contact also serves as which role?',
  primaryName:                   'Primary Contact Name*',
  primaryPhone:                  'Primary Contact Phone*',
  primaryWebsite:                'Primary website',
  referralSource:                'Referral Source',
  samePersonContacts:            'Same person as primary + secondary?',
  secondaryEmail:                'Secondary Contact Email',
  secondaryName:                 'Secondary Contact Name',
  secondaryPhone:                'Secondary contact phone',
  senderFromName:                'Sender / from name',
  smsOptInLanguage:              'SMS opt-in language',
  submitterEmail:                'Email Address (submitter)',
  submitterName:                 'Full Name (submitter)',
  submitterRole:                 'Submitter role',
  timeZone:                      'Time Zone',
  volunteerLink:                 'Volunteer link',
  websiteLive:                   'Is the website live?',
};

// Secrets-side mapping (text fields capturing access notes, NOT credentials).
// We pass the raw access-method note text — actual credentials live in
// Supabase strict-RLS table only.
export const SECRET_TO_FIELD = {
  pressListAccess:           'Press list / media database access',
  memberPortalAccess:        'Member portal access',
  membershipDbAccess:        'Membership Database Access',
  newSiteHostingAdminAccess: 'New Site Hosting Admin Access',
  // ── Added 2026-05 (Wix-spec parity access notes; credentials stay
  // Supabase-only and are NEVER mapped here) ──
  '10dlcBrandRegistrationInfo':    '10DLC brand registration info',
  dnsAdminAccess:                  'DNS Admin Access',
  donorCrmAccess:                  'Donor CRM access',
  ecommerceStoreAdminAccess:       'E-commerce Store Admin Access',
  emailDeliverabilitySpfDkimDmarc: 'Email deliverability (SPF/DKIM/DMARC) notes',
  emailMarketingAccess:            'Email marketing access',
  ga4Access:                       'GA4 access',
  googleAdsAccess:                 'Google Ads access',
  gtmAccess:                       'GTM access',
  metaPixelAccess:                 'Meta pixel access',
  paymentProviderAccess:           'Payment Provider Account Access',
  searchConsoleAccess:             'Search console access',
  voterFileAccess:                 'Voter file access',
};

const JSON_FIELDS = new Set(['users', 'hardMilestones', 'coalitionLeads', 'internalCommitteeChairs']);

const empty = (v) =>
  v === undefined || v === null ||
  (typeof v === 'string' && v.trim() === '') ||
  (Array.isArray(v) && v.length === 0);

// Strip empty repeating-block rows before serializing
function stripEmptyRows(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.filter((row) => row && typeof row === 'object'
    && Object.values(row).some((v) => v !== '' && v !== null && v !== undefined));
}

// Fetch dropdown options for the primary list once, return {fieldId: options[]}
export async function getDropdownOptionsMap() {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) throw new Error('CLICKUP_API_TOKEN missing');
  const r = await fetch(
    `https://api.clickup.com/api/v2/list/${PRIMARY_LIST_ID}/field`,
    { headers: { Authorization: token } },
  );
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`ClickUp list fields ${r.status}: ${data?.err || ''}`);
  const map = {};
  for (const f of data.fields || []) {
    if (f.type === 'drop_down' || f.type === 'labels') {
      map[f.id] = f.type_config?.options || [];
    }
  }
  return map;
}

// Resolve a form value → ClickUp dropdown option orderindex (integer).
// Tries (a) exact id match, (b) label/name match (case-insensitive),
// (c) numeric orderindex.
function resolveOption(raw, options) {
  if (!options || !options.length) return null;
  const norm = (s) => String(s ?? '').trim().toLowerCase();
  const target = norm(raw);
  if (!target) return null;
  // Try direct id (uuid) match
  const byId = options.find((o) => o.id === raw);
  if (byId) return byId.orderindex;
  // Try name match
  const byName = options.find((o) => norm(o.name) === target);
  if (byName) return byName.orderindex;
  // Try numeric orderindex
  if (/^\d+$/.test(target)) {
    const byIdx = options.find((o) => Number(o.orderindex) === Number(target));
    if (byIdx) return byIdx.orderindex;
  }
  return null;
}

/**
 * Build custom_fields[] from `state` (and optional `secrets`) for a
 * `POST /list/{id}/task` create call.
 *
 * Returns { fields: [{id, value}, ...], unresolved: [...] }. Unresolved
 * dropdowns are logged so we can spot missing option mappings without
 * failing the whole submission.
 */
export function buildCustomFields(state, secrets = {}, optionsMap = {}) {
  const out = [];
  const unresolved = [];
  const seen = new Set();

  const pushField = (stateKey, raw, fieldName) => {
    if (empty(raw)) return;
    const fid = FIELD_IDS[fieldName];
    if (!fid) return;
    if (seen.has(fid)) return;
    const type = FIELD_TYPES[fieldName];
    if (type === 'attachment') return; // not writable via public API

    let value = raw;
    if (JSON_FIELDS.has(stateKey)) {
      const cleaned = stripEmptyRows(raw);
      if (!cleaned || !cleaned.length) return;
      value = JSON.stringify(cleaned);
    } else if (type === 'date') {
      // YYYY-MM-DD or ISO → epoch ms (noon UTC to avoid TZ slop)
      const d = new Date(`${String(raw).slice(0, 10)}T12:00:00Z`);
      if (isNaN(d.getTime())) return;
      value = d.getTime();
    } else if (type === 'drop_down') {
      const idx = resolveOption(raw, optionsMap[fid]);
      if (idx === null || idx === undefined) {
        unresolved.push({ stateKey, fieldName, fieldId: fid, value: String(raw) });
        return;
      }
      value = idx;
    } else if (type === 'labels') {
      // Multi-select: array of option UUIDs
      const arr = Array.isArray(raw) ? raw : [raw];
      const ids = arr.map((v) => {
        const opt = (optionsMap[fid] || []).find((o) => {
          const n = String(v ?? '').trim().toLowerCase();
          return o.id === v || String(o.name).trim().toLowerCase() === n;
        });
        return opt?.id;
      }).filter(Boolean);
      if (!ids.length) return;
      value = ids;
    } else if (type === 'short_text' || type === 'text' || type === 'url' || type === 'email' || type === 'phone') {
      if (Array.isArray(raw)) {
        value = raw.filter((x) => x !== null && x !== undefined && x !== '').join(', ');
        if (!value) return;
      } else if (typeof raw === 'object') {
        value = JSON.stringify(raw);
      } else {
        value = String(raw).trim();
      }
      if (!value) return;
    } else if (type === 'number' || type === 'currency') {
      const n = Number(raw);
      if (!Number.isFinite(n)) return;
      value = n;
    } else {
      // Unknown type — try string
      value = typeof raw === 'object' ? JSON.stringify(raw) : String(raw).trim();
      if (!value) return;
    }

    out.push({ id: fid, value });
    seen.add(fid);
  };

  for (const [k, fname] of Object.entries(STATE_TO_FIELD)) {
    pushField(k, state?.[k], fname);
  }
  for (const [k, fname] of Object.entries(SECRET_TO_FIELD)) {
    pushField(k, secrets?.[k], fname);
  }

  return { fields: out, unresolved };
}

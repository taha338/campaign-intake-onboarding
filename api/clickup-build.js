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

  // ── Added 2026-05-11 (Nonprofit + PAC support — Pass 2) ──
  // Nonprofit (Stage 3 — nonprofit branch)
  // NOTE: `nonprofitLegalName` is captured via Stage 2 `orgLegalName` → 'Legal organization name'.
  // States Covered / City / County / Founded Year reuse the party-side shared fields.
  nonprofitType:                    'Nonprofit Type',
  nonprofitScope:                   'Nonprofit Scope',
  nonprofitStatesCovered:           'States Covered',
  nonprofitCityCounty:              'City / County',
  nonprofitMission:                 'Nonprofit Mission',
  nonprofitCauseAreas:              'Nonprofit Cause Areas',
  nonprofitFoundedYear:             'Founded Year',
  nonprofitMembershipBased:         'Nonprofit Membership-Based?',
  nonprofitIrsDeterminationStatus:  'IRS Determination Status',
  nonprofitDeterminationDate:       'IRS Determination Date',
  nonprofitFiscalYearEnd:           'Fiscal Year End',
  nonprofitFiscalSponsor:           'Fiscal Sponsor',
  nonprofitStateOfIncorporation:    'State of Incorporation',
  nonprofitAffiliatedSisterOrg:     'Affiliated Sister Org (c3/c4/c6)',
  nonprofit501hElectionMade:        '501(h) Election Made?',
  nonprofitLobbyingActivity:        'Lobbying Activity',
  // PAC (Stage 3 — pac branch)
  pacId:                            'PAC ID',
  pacLegalName:                     'PAC Legal Name',
  pacType:                          'PAC Type',
  pacScope:                         'PAC Scope',
  pacStatesCovered:                 'PAC States Covered',
  pacFecCommitteeId:                'FEC Committee ID',
  pacStateCommitteeIds:             'State Committee IDs (JSON)',
  pacConnectedStatus:               'PAC Connected Status',
  pacSponsoringOrganization:        'PAC Sponsoring Organization',
  pacIndependentExpenditureOnly:    'PAC IE-Only?',
  pacFecRegistrationStatus:         'FEC Registration Status',
  pacDateRegistered:                'PAC Date Registered',
  pacAffiliatedCommittees:          'PAC Affiliated Committees',
  pacMission:                       'PAC Mission',
  pacYearEstablished:               'PAC Year Established',
  pacPrimaryActivity:               'PAC Primary Activity',
  pacFilingFrequency:               'PAC Filing Frequency',
};

// Secrets-side mapping. As of 2026-05-11 ALL 27 secret fields — including raw
// credentials — are pushed to ClickUp custom fields per product decision.
// Supabase `campaign_intake_secrets` remains the canonical store.
export const SECRET_TO_FIELD = {
  pressListAccess:           'Press list / media database access',
  memberPortalAccess:        'Member portal access',
  membershipDbAccess:        'Membership Database Access',
  newSiteHostingAdminAccess: 'New Site Hosting Admin Access',
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
  filingPaperworkUploads:          'Filing paperwork uploads',
  // ── Raw credentials (added 2026-05-11) ──
  registrarUsername:               'Registrar Username',
  registrarPassword:               'Registrar Password',
  registrar2faEnabled:             'Registrar 2FA Enabled',
  registrar2faOwner:               'Registrar 2FA Owner',
  emailAdminUsername:              'Email Admin Username',
  emailAdminPassword:              'Email Admin Password',
  emailAdmin2faEnabled:            'Email Admin 2FA Enabled',
  emailAdmin2faOwner:              'Email Admin 2FA Owner',
  existingSiteAdminCredentials:    'Existing Site Admin Credentials',
};

const JSON_FIELDS = new Set([
  'users', 'hardMilestones', 'coalitionLeads', 'internalCommitteeChairs',
  // PAC state committee IDs is array of {state, id} objects — serialize as JSON.
  // String-array fields (nonprofitStatesCovered, nonprofitCauseAreas, pacStatesCovered)
  // are left out so they comma-join into readable text per the short_text branch.
  'pacStateCommitteeIds',
]);

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

// Some form fields capture a value that doesn't literally match any ClickUp
// dropdown option name, so resolveOption() drops them. These maps translate
// the raw form value → the canonical ClickUp option name before resolution.
// fieldName → { rawValueLowercased: 'Canonical ClickUp Option Name' }.
const DROPDOWN_VALUE_ALIASES = {
  // Form sends slug-style IDs (kebab-case); ClickUp options use display
  // labels. Without these aliases, resolveOption returns null and the
  // dropdown silently drops.
  'Party Type': {
    'republican':    'Republican',
    'america-first': 'America-First',
    'non-partisan':  'Non-Partisan',
    'nonpartisan':   'Non-Partisan',
    'independent':   'Independent',
    'third-party':   'Third Party',
    'thirdparty':    'Third Party',
    'coalition':     'Coalition',
    'other':         'Other',
  },
  'Time Zone': {
    'america/new_york':    'Eastern (ET)',
    'america/detroit':     'Eastern (ET)',
    'america/chicago':     'Central (CT)',
    'america/denver':      'Mountain (MT)',
    'america/phoenix':     'Mountain (MT)',
    'america/los_angeles': 'Pacific (PT)',
    'america/anchorage':   'Alaska (AKT)',
    'pacific/honolulu':    'Hawaii (HT)',
  },
  // Organisation type: PAC subtypes all collapse to the one combined PAC
  // option in ClickUp's "Organization Type" dropdown; the form's
  // "501(c)(x) — <desc>" / "527 / Political Org" labels collapse to ClickUp's
  // bare "501(c)(x)" / "527" options.
  'Organization type': {
    'federal pac':       'Federal/State/Super/Hybrid/Carey/Leadership PAC',
    'state pac':         'Federal/State/Super/Hybrid/Carey/Leadership PAC',
    'super pac':         'Federal/State/Super/Hybrid/Carey/Leadership PAC',
    'hybrid pac':        'Federal/State/Super/Hybrid/Carey/Leadership PAC',
    'carey committee':   'Federal/State/Super/Hybrid/Carey/Leadership PAC',
    'carey pac':         'Federal/State/Super/Hybrid/Carey/Leadership PAC',
    'leadership pac':    'Federal/State/Super/Hybrid/Carey/Leadership PAC',
    '501(c)(3) — charitable':                '501(c)(3)',
    '501(c)(4) — social welfare / advocacy': '501(c)(4)',
    '501(c)(6) — trade association':         '501(c)(6)',
    '527 / political org':                   '527',
  },
};

// A few dropdowns need logic rather than a static lookup.
const DROPDOWN_VALUE_TRANSFORMS = {
  // "E-commerce store?" is a Yes/No/N/A field, but the form captures the
  // platform name (e.g. "Shopify"). Any real platform name means "Yes".
  'E-commerce store?': (raw) => {
    const v = String(raw ?? '').trim().toLowerCase();
    if (!v) return raw;
    if (['no', 'none', 'n/a', 'false'].includes(v)) return 'No';
    if (['yes', 'true'].includes(v)) return 'Yes';
    return 'Yes';
  },
};

// Normalise a raw form value for a dropdown field into something
// resolveOption() can match against ClickUp's option names.
function aliasDropdownValue(fieldName, raw) {
  const transform = DROPDOWN_VALUE_TRANSFORMS[fieldName];
  if (transform) return transform(raw);
  const map = DROPDOWN_VALUE_ALIASES[fieldName];
  if (map) {
    const hit = map[String(raw ?? '').trim().toLowerCase()];
    if (hit) return hit;
  }
  return raw;
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
      const idx = resolveOption(aliasDropdownValue(fieldName, raw), optionsMap[fid]);
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
      // ClickUp's phone-type fields silently drop values that aren't E.164
      // (e.g. "+1-555-0100" or "555-0103" come through the API as 200 OK but
      // never appear on the task). Normalise: strip non-digits, prepend +1
      // for 10-digit US numbers, keep an existing leading "+" intact.
      if (type === 'phone') {
        const hadPlus = value.trim().startsWith('+');
        const digits = value.replace(/\D/g, '');
        if (!digits) return;
        if (hadPlus)              value = `+${digits}`;
        else if (digits.length === 10) value = `+1${digits}`;
        else if (digits.length === 11 && digits.startsWith('1')) value = `+${digits}`;
        else                      value = `+${digits}`;
      }
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

  // Catch-all: dump the full state into "Form 1 Full Payload (JSON)" so any
  // form keys not covered by STATE_TO_FIELD are still recoverable from the
  // task itself. Secrets are intentionally NOT included — they go to
  // campaign_intake_secrets with strict RLS.
  const payloadFid = FIELD_IDS['Form 1 Full Payload (JSON)'];
  if (payloadFid && state && !seen.has(payloadFid)) {
    try {
      out.push({ id: payloadFid, value: JSON.stringify(state) });
      seen.add(payloadFid);
    } catch { /* ignore — best effort */ }
  }

  return { fields: out, unresolved };
}

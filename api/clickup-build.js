/**
 * Build ClickUp custom_fields[] for the NEW---Campaign Intake Form list.
 * Mirrors political-brand-discovery/api/clickup-build.js. Per-field POST
 * pattern — see docs/clickup-custom-fields.md §6.
 */

import { FIELD_IDS, FIELD_TYPES, PRIMARY_LIST_ID } from './clickup-field-map.js';

const empty = (v) =>
  v === undefined || v === null ||
  (typeof v === 'string' && v.trim() === '') ||
  (Array.isArray(v) && v.length === 0);

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

function resolveOption(raw, options) {
  if (!options || !options.length) return null;
  const norm = (s) => String(s ?? '').trim().toLowerCase();
  const target = norm(raw);
  if (!target) return null;
  const byId = options.find((o) => o.id === raw);
  if (byId) return byId.orderindex;
  const byName = options.find((o) => norm(o.name) === target);
  if (byName) return byName.orderindex;
  if (/^\d+$/.test(target)) {
    const byIdx = options.find((o) => Number(o.orderindex) === Number(target));
    if (byIdx) return byIdx.orderindex;
  }
  return null;
}

function resolveLabels(raw, options) {
  if (!options || !options.length) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  const norm = (s) => String(s ?? '').trim().toLowerCase();
  const ids = [];
  for (const v of arr) {
    if (empty(v)) continue;
    const opt = options.find((o) =>
      o.id === v || norm(o.name) === norm(v) || norm(o.label) === norm(v),
    );
    if (opt) ids.push(opt.id);
  }
  return ids;
}

// state-key → ClickUp field name mapping. Keys not listed are dumped to the
// description by the existing buildDescription() in submit.js.
function flattenState(state) {
  return {
    // Submitter
    'Full Name (submitter)':         state.submitterName,
    'Email Address (submitter)':     state.submitterEmail,
    'Submitter role':                state.submitterRole,
    'Referral Source':               state.referralSource,
    // Organization identity (shared)
    'Legal organization name':       state.orgLegalName,
    'Display / operation name':      state.displayName,
    'DBA / Trade Name*':             state.displayName,
    'Organization type':             state.orgType,
    'Organization Address':          state.mailingAddress,
    'Organization Phone':            state.orgPhone,
    'Organization Email':            state.orgEmail,
    'Time Zone':                     state.timeZone,
    'EIN / Tax ID':                  state.ein,
    // Candidate-mode race / jurisdiction
    'FEC ID':                        state.fecId,
    'Candidate Full Legal Name':     state.candidateFullLegalName,
    'Office sought':                 state.officeSought,
    'Candidate state':               state.candState,
    'District':                      state.district,
    'Election year':                 state.electionYear,
    'Is this a partisan race?':      state.partisanRace,
    // Web presence
    'Primary website':               state.primaryWebsite,
    'Is the website live?':          state.websiteLive,
    'Donate Link':                   state.donateLink,
    'Volunteer link':                state.volunteerLink,
    'Preferred area codes':          state.preferredAreaCodes,
    // Key people (candidate-mode)
    'Campaign manager — name':       state.campaignManagerName,
    'Campaign manager — contact':    state.campaignManagerContact,
    'Field director — name':         state.fieldDirectorName,
    'Field director — contact':      state.fieldDirectorContact,
    // Primary / secondary contacts
    'Same person as primary + secondary?': state.samePersonContacts,
    'Primary contact also serves as which role?': state.primaryFromAbove,
    'Primary Contact Name*':         state.primaryName,
    'Primary Contact Email*':        state.primaryEmail,
    'Primary Contact Phone*':        state.primaryPhone,
    'Secondary Contact Name':        state.secondaryName,
    'Secondary contact phone':       state.secondaryPhone,
    'Secondary Contact Email':       state.secondaryEmail,
    // Domain / hosting / data
    'Primary domain':                state.primaryDomain,
    'Current DNS Provider':          state.currentDnsProvider,
    'Existing CMS / Host':           state.existingCmsHost,
    'E-commerce store?':             state.ecommerceStore,
    'Payment provider':              state.paymentProvider,
    'Donor CRM platform':            state.donorCrmPlatform,
    'Email marketing platform':      state.emailMarketingPlatform,
    'Data sharing agreements (ops)': state.dataSharingAgreementsOps,
    // Project ops
    'Launch deadline':               state.launchDeadline,
    'After-hours contact — name':    state.afterHoursName,
    'After-hours contact — phone':   state.afterHoursPhone,
    'Crisis lead — name':            state.crisisLeadName,
    'Crisis lead — contact':         state.crisisLeadContact,
    // SMS / Email compliance
    'SMS opt-in language':           state.smsOptInLanguage,
    'Sender / from name':            state.senderFromName,
    'CAN-SPAM address override':     state.canSpamAddressOverride,
    // Party-mode identity
    'Party Name':                    state.partyName,
    'Party Acronym':                 state.partyAcronym,
    'Party Type':                    state.partyType,
    'Party Type Other':              state.partyTypeOther,
    'Party Scope':                   state.partyScope,
    'Primary State (party)':         state.primaryStateParty,
    'States Covered':                state.statesCovered,
    'City / County':                 state.cityCounty,
    'Founded Year':                  state.foundedYear,
    // Roles
    'Party Chair — Name':       state.partyChairName,
    'Party Chair — Contact':    state.partyChairContact,
    'Vice Chair — Name':        state.viceChairName,
    'Vice Chair — Contact':     state.viceChairContact,
    'Executive Director — Name':    state.execDirectorName,
    'Executive Director — Contact': state.execDirectorContact,
    'Treasurer — Name':             state.treasurerName,
    'Treasurer — Contact':          state.treasurerContact,
    'Communications Director — Name':    state.commsDirectorName,
    'Communications Director — Contact': state.commsDirectorContact,
    'Campaign / General Counsel — Name':    state.counselName,
    'Campaign / General Counsel — Contact': state.counselContact,
    'Lead Spokesperson':             state.leadSpokesperson,
    // Filing / ballot
    'Ballot name (exact spelling)':  state.ballotName,
    'Filed for office?':             state.filedForOffice,
    'Filing deadline':               state.filingDeadline,
    'Petition signature drive needed?': state.petitionDriveNeeded,
    'Signatures required + deadline':   state.signaturesAndDeadline,
    // Membership / portal
    'Member portal platform':        state.memberPortalPlatform,
    'Member portal access':          state.memberPortalAccess,
    'Membership Database Platform':  state.membershipDbPlatform,
    'Membership Database Access':    state.membershipDbAccess,
    'Membership application workflow':       state.membershipApplicationWorkflow,
    'Membership approver — name & contact': state.membershipApprover,
    'Membership / Join Link':        state.membershipLink,
    'Affiliated candidate intake process':       state.affiliatedCandidateIntake,
    'Affiliated candidate approver — name & contact': state.affiliatedCandidateApprover,
    'State chapter onboarding process': state.stateChapterOnboardingProcess,
    'State chapter onboarding contact': state.stateChapterOnboardingContact,
    'Candidate recruitment lead':    state.candidateRecruitmentLead,
    'Press list / media database access': state.pressListAccess,
    // Hosting
    'New Site Hosting Provider':       state.newSiteHostingProvider,
    'New Site Hosting Admin Access':   state.newSiteHostingAdminAccess,
    'Subdomains for Chapters / Affiliates': state.subdomainsForChapters,
    'Affiliated PACs / Allied Committees':  state.affiliatedPacs,
    // Repeating blocks → JSON-text fields
    'Coalition Outreach Leads (JSON)':   state.coalitionLeads,
    'Internal Committee Chairs (JSON)':  state.internalCommitteeChairs,
    'Hard Milestones (JSON)':            state.hardMilestones,
    'Users (JSON)':                      state.users,
  };
}

function isProbablyValidPhoneE164(e164) {
  // Reject NANP 555 area code (FIELD_016 from ClickUp)
  if (/^\+1555/.test(e164)) return false;
  return /^\+\d{10,15}$/.test(e164);
}

export function buildCustomFields(state, optionsMap = {}) {
  const flat = flattenState(state);
  const out = [];
  const unresolved = [];

  for (const [name, raw] of Object.entries(flat)) {
    if (empty(raw)) continue;
    const fid = FIELD_IDS[name];
    if (!fid) continue;
    const type = FIELD_TYPES[name];
    if (type === 'attachment') continue;

    let value = raw;
    if (type === 'date') {
      const d = new Date(`${String(raw).slice(0, 10)}T12:00:00Z`);
      if (isNaN(d.getTime())) continue;
      value = d.getTime();
    } else if (type === 'drop_down') {
      const idx = resolveOption(raw, optionsMap[fid]);
      if (idx === null || idx === undefined) {
        unresolved.push({ fieldName: name, fieldId: fid, value: String(raw) });
        continue;
      }
      value = idx;
    } else if (type === 'labels') {
      const ids = resolveLabels(raw, optionsMap[fid]);
      if (!ids.length) continue;
      value = ids;
    } else if (type === 'number' || type === 'currency') {
      const n = Number(raw);
      if (!Number.isFinite(n)) continue;
      value = n;
    } else if (type === 'phone') {
      const digits = String(raw).replace(/\D/g, '');
      if (!digits || digits.length < 10) continue;
      const e164 = digits.length === 10 ? `+1${digits}` : `+${digits}`;
      if (!isProbablyValidPhoneE164(e164)) {
        unresolved.push({ fieldName: name, fieldId: fid, value: String(raw), reason: 'invalid phone (NANP / E.164)' });
        continue;
      }
      value = e164;
    } else if (type === 'url') {
      const s = String(raw).trim();
      if (!/^https?:\/\//i.test(s)) {
        unresolved.push({ fieldName: name, fieldId: fid, value: s, reason: 'URL needs scheme' });
        continue;
      }
      value = s;
    } else {
      // short_text / text / email
      if (Array.isArray(raw)) {
        // Repeating-block rows are objects; serialize as JSON for text fields
        const hasObjects = raw.some((x) => x && typeof x === 'object');
        if (hasObjects) {
          const cleaned = raw.filter((row) =>
            row && typeof row === 'object' &&
            Object.values(row).some((v) => !empty(v))
          );
          if (!cleaned.length) continue;
          value = JSON.stringify(cleaned);
        } else {
          const s = raw.filter((x) => !empty(x)).join(', ');
          if (!s) continue;
          value = s;
        }
      } else if (typeof raw === 'object') {
        value = JSON.stringify(raw);
      } else {
        value = String(raw).trim();
      }
      if (!value) continue;
    }
    out.push({ id: fid, value });
  }
  return { fields: out, unresolved };
}

/**
 * IntakeContext — single source of truth for Form 1 state.
 *
 * Form 1 captures Campaign Intake (operational onboarding). Sections
 * follow the field map in clickup_custom_fields_to_create.xlsx.
 * Subject Type drives all conditional logic; party-only and
 * candidate-only sections show / hide based on it.
 */
import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

const IntakeContext = createContext();

const initialState = {
  // ── Loaded from URL + ClickUp on mount
  clientId: '',
  clickupTaskId: '',          // master Active Clients task id
  prefillStatus: 'idle',      // idle | loading | success | error | empty
  prefillError: '',

  // ── Wizard navigation
  currentStage: 0,
  completedStages: [],
  // Optional-section toggles (user opts in to a bundle if relevant)
  optInDomainHostingEmail: '',  // 'yes' | 'no' | ''
  optInDataUsersOps: '',        // 'yes' | 'no' | ''

  // ── A. Submitter & Subject
  subjectType: '',            // candidate | party | nonprofit | pac (drives all conditionals)
  submitterName: '',
  submitterEmail: '',
  submitterRole: '',
  referralSource: '',

  // ── B. Organization Identity
  orgLegalName: '',
  displayName: '',
  orgType: '',
  partyName: '',
  partyAcronym: '',
  partyType: '',
  partyTypeOther: '',
  partyScope: '',
  primaryStateParty: '',
  statesCovered: [],
  cityCounty: '',
  foundedYear: '',
  ein: '',
  fecId: '',
  mailingAddress: '',
  orgPhone: '',
  orgEmail: '',
  timeZone: '',

  // ── C. Race / Jurisdiction
  candidateFullLegalName: '',
  officeSought: '',
  candState: '',
  district: '',
  electionYear: '',
  partisanRace: '',
  affiliatedPacs: '',

  // ── C-NP. Nonprofit Identity (Stage 3 — nonprofit branch)
  nonprofitLegalName: '',
  nonprofitType: '',
  nonprofitScope: '',
  nonprofitStatesCovered: [],
  nonprofitCityCounty: '',
  nonprofitMission: '',
  nonprofitCauseAreas: [],
  nonprofitFoundedYear: '',
  nonprofitMembershipBased: '',         // Yes | No
  nonprofitIrsDeterminationStatus: '',
  nonprofitDeterminationDate: '',
  nonprofitFiscalYearEnd: '',
  nonprofitFiscalSponsor: '',
  nonprofitStateOfIncorporation: '',
  nonprofitOperatingStates: [],
  nonprofitAffiliatedSisterOrg: '',
  nonprofit501hElectionMade: '',        // Yes | No | N/A
  nonprofitLobbyingActivity: '',

  // ── C-PAC. PAC Identity (Stage 3 — pac branch)
  pacId: '',
  pacLegalName: '',
  pacType: '',
  pacScope: '',
  pacStatesCovered: [],
  pacFecCommitteeId: '',
  pacStateCommitteeIds: [{ state: '', id: '' }],
  pacConnectedStatus: '',
  pacSponsoringOrganization: '',
  pacIndependentExpenditureOnly: '',    // Yes | No
  pacFecRegistrationStatus: '',
  pacDateRegistered: '',
  pacAffiliatedCommittees: '',
  pacMission: '',
  pacYearEstablished: '',
  pacPrimaryActivity: '',
  pacFilingFrequency: '',

  // ── D. Web Presence
  primaryWebsite: '',
  websiteLive: '',
  donateLink: '',
  membershipLink: '',
  volunteerLink: '',
  subdomainsForChapters: '',
  preferredAreaCodes: '',

  // ── E. Key People
  campaignManagerName: '',
  campaignManagerContact: '',
  fieldDirectorName: '',
  fieldDirectorContact: '',
  commsDirectorName: '',
  commsDirectorContact: '',
  partyChairName: '',
  partyChairContact: '',
  viceChairName: '',
  viceChairContact: '',
  execDirectorName: '',
  execDirectorContact: '',
  treasurerName: '',
  treasurerContact: '',
  leadSpokesperson: '',

  // ── F. Primary / Secondary contacts
  samePersonContacts: '',
  primaryFromAbove: '',
  primaryName: '',
  primaryPhone: '',
  primaryEmail: '',
  secondaryName: '',
  secondaryPhone: '',
  secondaryEmail: '',

  // ── G. Domain & DNS  (secrets handled in a separate object)
  primaryDomain: '',
  currentDnsProvider: '',

  // ── I. Existing Site & Hosting
  existingCmsHost: '',
  ecommerceStore: '',
  paymentProvider: '',
  newSiteHostingProvider: '',  // NEW

  // ── J. Data & CRM
  donorCrmPlatform: '',
  membershipDbPlatform: '',
  emailMarketingPlatform: '',
  dataSharingAgreementsOps: '',

  // ── K. User Provisioning  (repeating block)
  users: [{ name: '', email: '', accessLevel: '', role: '' }],

  // ── M. Project Operations
  launchDeadline: '',
  hardMilestones: [{ name: '', date: '' }],
  afterHoursName: '',
  afterHoursPhone: '',
  crisisLeadName: '',
  crisisLeadContact: '',

  // ── N. Analytics & Ad Accounts (all secrets)
  // ── O. SMS & Email Compliance
  smsOptInLanguage: '',
  senderFromName: '',
  canSpamAddressOverride: '',

  // ── P. Filing & Ballot Access (candidate)
  filedForOffice: '',
  filingDeadline: '',
  ballotName: '',
  petitionDriveNeeded: '',
  signaturesAndDeadline: '',

  // ── Q. Party Membership (party)
  memberPortalPlatform: '',
  membershipApplicationWorkflow: '',
  membershipApprover: '',
  affiliatedCandidateIntake: '',
  affiliatedCandidateApprover: '',
  stateChapterOnboardingProcess: '',
  stateChapterOnboardingContact: '',

  // ── R. Coalition Outreach (both)
  coalitionLeads: [{ category: '', name: '', contact: '' }],

  // ── S. Party Governance Ops (party)
  internalCommitteeChairs: [{ committee: '', chairName: '', contact: '' }],
  candidateRecruitmentLead: '',

  // ── F. Counsel
  counselName: '',
  counselContact: '',

  // ── Submission state
  submitting: false,
  submitted: false,
  submitError: '',
};

// Secrets live in their own slice so we can write them only to the
// secrets table (strict RLS) and never leak them into the main row.
const initialSecrets = {
  registrarUsername: '',
  registrarPassword: '',
  registrar2faEnabled: '',
  registrar2faOwner: '',
  dnsAdminAccess: '',
  emailAdminUsername: '',
  emailAdminPassword: '',
  emailAdmin2faEnabled: '',
  emailAdmin2faOwner: '',
  existingSiteAdminCredentials: '',
  ecommerceStoreAdminAccess: '',
  paymentProviderAccess: '',
  newSiteHostingAdminAccess: '',  // NEW
  voterFileAccess: '',
  donorCrmAccess: '',
  membershipDbAccess: '',
  emailMarketingAccess: '',
  memberPortalAccess: '',
  pressListAccess: '',
  ga4Access: '',
  gtmAccess: '',
  searchConsoleAccess: '',
  metaPixelAccess: '',
  googleAdsAccess: '',
  filingPaperworkUploads: '',
  '10dlcBrandRegistrationInfo': '',
  emailDeliverabilitySpfDkimDmarc: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PREFILL_STATUS':
      return { ...state, prefillStatus: action.payload.status, prefillError: action.payload.error || '' };
    case 'PREFILL':
      return { ...state, ...action.payload, prefillStatus: 'success' };
    case 'UPDATE':
      return { ...state, ...action.payload };
    case 'UPDATE_USER': {
      const users = [...state.users];
      users[action.index] = { ...users[action.index], ...action.payload };
      return { ...state, users };
    }
    case 'ADD_USER':
      return { ...state, users: [...state.users, { name: '', email: '', accessLevel: '', role: '' }] };
    case 'REMOVE_USER':
      return { ...state, users: state.users.filter((_, i) => i !== action.index) };
    case 'UPDATE_REPEATING':
      return {
        ...state,
        [action.field]: state[action.field].map((row, i) =>
          i === action.index ? { ...row, ...action.payload } : row
        ),
      };
    case 'ADD_REPEATING':
      return { ...state, [action.field]: [...state[action.field], action.template] };
    case 'REMOVE_REPEATING':
      return { ...state, [action.field]: state[action.field].filter((_, i) => i !== action.index) };
    case 'SET_SUBMIT_STATE':
      return { ...state, ...action.payload };
    case 'SET_STAGE':
      return { ...state, currentStage: action.payload };
    case 'NEXT_STAGE':
      return {
        ...state,
        completedStages: [...new Set([...state.completedStages, state.currentStage])],
        currentStage: state.currentStage + 1,
      };
    case 'PREV_STAGE':
      return { ...state, currentStage: Math.max(0, state.currentStage - 1) };
    default:
      return state;
  }
}

function secretsReducer(state, action) {
  if (action.type === 'UPDATE_SECRET') return { ...state, ...action.payload };
  if (action.type === 'PREFILL_SECRETS') return { ...state, ...action.payload };
  return state;
}

export function IntakeProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [secrets, secretsDispatch] = useReducer(secretsReducer, initialSecrets);

  const update = useCallback((payload) => dispatch({ type: 'UPDATE', payload }), []);
  const updateSecret = useCallback((payload) => secretsDispatch({ type: 'UPDATE_SECRET', payload }), []);

  const updateRepeating = useCallback((field, index, payload) =>
    dispatch({ type: 'UPDATE_REPEATING', field, index, payload }), []);
  const addRepeating = useCallback((field, template) =>
    dispatch({ type: 'ADD_REPEATING', field, template }), []);
  const removeRepeating = useCallback((field, index) =>
    dispatch({ type: 'REMOVE_REPEATING', field, index }), []);

  const isParty = state.subjectType === 'party';
  const isCandidate = state.subjectType === 'candidate';
  const isNonprofit = state.subjectType === 'nonprofit';
  const isPac = state.subjectType === 'pac';
  const subjectChosen = isParty || isCandidate || isNonprofit || isPac;

  const goToStage = useCallback((s) => dispatch({ type: 'SET_STAGE', payload: s }), []);
  const nextStage = useCallback(() => {
    dispatch({ type: 'NEXT_STAGE' });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);
  const prevStage = useCallback(() => {
    dispatch({ type: 'PREV_STAGE' });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const value = useMemo(() => ({
    state,
    secrets,
    update,
    updateSecret,
    updateRepeating,
    addRepeating,
    removeRepeating,
    dispatch,
    secretsDispatch,
    isParty,
    isCandidate,
    isNonprofit,
    isPac,
    subjectChosen,
    goToStage,
    nextStage,
    prevStage,
  }), [state, secrets, update, updateSecret, updateRepeating, addRepeating, removeRepeating, isParty, isCandidate, isNonprofit, isPac, subjectChosen, goToStage, nextStage, prevStage]);

  return <IntakeContext.Provider value={value}>{children}</IntakeContext.Provider>;
}

export function useIntake() {
  const ctx = useContext(IntakeContext);
  if (!ctx) throw new Error('useIntake must be used within IntakeProvider');
  return ctx;
}

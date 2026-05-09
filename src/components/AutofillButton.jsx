import { useEffect, useState } from 'react';
import { useIntake } from '../context/IntakeContext';

const isDevMode = () => {
  const params = new URLSearchParams(window.location.search);
  return ['1', 'true', 'on', 'yes'].includes((params.get('dev') || '').toLowerCase());
};

const today = () => new Date().toISOString().slice(0, 10);

function buildStatePayload(subjectType) {
  const isParty = subjectType === 'party';
  return {
    subjectType,

    // A. Submitter
    submitterName: 'Test Submitter',
    submitterEmail: 'submitter@example.com',
    submitterRole: 'Campaign Manager',
    referralSource: 'Referral via test',

    // B. Org
    orgLegalName: isParty ? 'Test Liberty Party Inc.' : 'Friends of Jane Test',
    displayName: isParty ? 'Test Liberty Party' : 'Jane Q. Test',
    orgType: isParty ? 'Political Party' : 'Candidate Committee',
    partyName: isParty ? 'Test Liberty Party' : '',
    partyAcronym: isParty ? 'TLP' : '',
    partyType: isParty ? 'minor' : '',
    partyTypeOther: '',
    partyScope: isParty ? 'state' : '',
    primaryStateParty: isParty ? 'IL' : '',
    statesCovered: isParty ? ['IL', 'IN'] : [],
    cityCounty: 'Springfield, Sangamon County',
    foundedYear: '2020',
    ein: '12-3456789',
    fecId: 'C00TEST123',
    mailingAddress: '123 Test Lane, Springfield, IL 62701',
    orgPhone: '+1-555-0100',
    orgEmail: 'org@example.com',
    timeZone: 'America/Chicago',

    // C. Race / Jurisdiction
    candidateFullLegalName: isParty ? '' : 'Jane Quincy Test',
    officeSought: isParty ? '' : 'State Senate, District 12',
    candState: isParty ? '' : 'IL',
    district: isParty ? '' : '12',
    electionYear: isParty ? '' : '2026',
    partisanRace: isParty ? '' : 'No',
    affiliatedPacs: 'Test PAC for Liberty',

    // D. Web
    primaryWebsite: 'https://example.com',
    websiteLive: 'Yes',
    donateLink: 'https://example.com/donate',
    membershipLink: isParty ? 'https://example.com/join' : '',
    volunteerLink: 'https://example.com/volunteer',
    subdomainsForChapters: isParty ? 'il.example.com, in.example.com' : '',
    preferredAreaCodes: '217, 312',

    // E. Key People
    campaignManagerName: isParty ? '' : 'Manager Test',
    campaignManagerContact: isParty ? '' : 'manager@example.com / 555-0101',
    fieldDirectorName: 'Field Test',
    fieldDirectorContact: 'field@example.com',
    commsDirectorName: 'Comms Test',
    commsDirectorContact: 'comms@example.com',
    partyChairName: isParty ? 'Chair Test' : '',
    partyChairContact: isParty ? 'chair@example.com' : '',
    viceChairName: isParty ? 'Vice Test' : '',
    viceChairContact: isParty ? 'vice@example.com' : '',
    execDirectorName: isParty ? 'Exec Test' : '',
    execDirectorContact: isParty ? 'exec@example.com' : '',
    treasurerName: 'Treasurer Test',
    treasurerContact: 'treasurer@example.com',
    leadSpokesperson: 'Spokesperson Test',

    // F. Contacts
    samePersonContacts: 'No',
    primaryFromAbove: '',
    primaryName: 'Primary Test',
    primaryPhone: '555-0102',
    primaryEmail: 'primary@example.com',
    secondaryName: 'Secondary Test',
    secondaryPhone: '555-0103',
    secondaryEmail: 'secondary@example.com',

    // G. Domain
    primaryDomain: 'example.com',
    currentDnsProvider: 'Cloudflare',

    // I. Hosting
    existingCmsHost: 'WordPress on Bluehost',
    ecommerceStore: 'Shopify',
    paymentProvider: 'Stripe',
    newSiteHostingProvider: 'Vercel',

    // J. Data & CRM
    donorCrmPlatform: 'NGP VAN',
    membershipDbPlatform: isParty ? 'NationBuilder' : '',
    emailMarketingPlatform: 'Mailchimp',
    dataSharingAgreementsOps: 'No active sharing agreements.',

    // K. Users
    users: [
      { name: 'Admin Test', email: 'admin@example.com', accessLevel: 'Owner', role: 'Operator' },
      { name: 'Editor Test', email: 'editor@example.com', accessLevel: 'Editor', role: 'Comms' },
    ],

    // M. Project Ops
    launchDeadline: today(),
    hardMilestones: [
      { name: 'Filing deadline', date: '2026-03-15' },
      { name: 'Primary date', date: '2026-06-28' },
    ],
    afterHoursName: 'After Hours Test',
    afterHoursPhone: '555-0104',
    crisisLeadName: 'Crisis Test',
    crisisLeadContact: 'crisis@example.com / 555-0105',

    // O. SMS / Email
    smsOptInLanguage: 'Reply YES to opt in. Msg & data rates may apply. Reply STOP to cancel.',
    senderFromName: isParty ? 'Test Liberty Party' : 'Jane Test for Senate',
    canSpamAddressOverride: '',

    // P. Filing & Ballot (candidate)
    filedForOffice: isParty ? '' : 'Yes',
    filingDeadline: isParty ? '' : '2026-03-15',
    ballotName: isParty ? '' : 'Jane Test',
    petitionDriveNeeded: isParty ? '' : 'Yes',
    signaturesAndDeadline: isParty ? '' : '2,500 signatures by 2026-02-15',

    // Q. Party Membership (party)
    memberPortalPlatform: isParty ? 'NationBuilder' : '',
    membershipApplicationWorkflow: isParty ? 'Online form → email confirm → admin approve' : '',
    membershipApprover: isParty ? 'Membership Committee Chair' : '',
    affiliatedCandidateIntake: isParty ? 'Submit candidate questionnaire to chair' : '',
    affiliatedCandidateApprover: isParty ? 'Executive Committee' : '',
    stateChapterOnboardingProcess: isParty ? 'Apply to state board → vote → form chapter' : '',
    stateChapterOnboardingContact: isParty ? 'chapters@example.com' : '',

    // R. Coalition (both)
    coalitionLeads: [
      { category: 'Labor', name: 'Local 123', contact: 'labor@example.com' },
      { category: 'Faith', name: 'Faith Coalition', contact: 'faith@example.com' },
    ],

    // S. Party Governance (party)
    internalCommitteeChairs: isParty ? [
      { committee: 'Policy', chairName: 'Policy Chair', contact: 'policy@example.com' },
      { committee: 'Finance', chairName: 'Finance Chair', contact: 'finance@example.com' },
    ] : [{ committee: '', chairName: '', contact: '' }],
    candidateRecruitmentLead: isParty ? 'Recruitment Lead' : '',

    // F. Counsel
    counselName: 'Test Counsel LLC',
    counselContact: 'counsel@example.com',

    // Optional-section gates — flip on so all sections render
    optInDomainHostingEmail: 'yes',
    optInDataUsersOps: 'yes',
  };
}

function buildSecretsPayload() {
  return {
    registrarUsername: 'test-registrar-user',
    registrarPassword: '[TEST PASSWORD]',
    registrar2faEnabled: 'Yes',
    registrar2faOwner: 'Submitter',
    dnsAdminAccess: 'Cloudflare admin via shared LastPass folder',
    emailAdminUsername: 'test-email-admin',
    emailAdminPassword: '[TEST PASSWORD]',
    emailAdmin2faEnabled: 'Yes',
    emailAdmin2faOwner: 'Submitter',
    existingSiteAdminCredentials: 'WP admin in shared vault',
    ecommerceStoreAdminAccess: 'Shopify admin in shared vault',
    paymentProviderAccess: 'Stripe admin in shared vault',
    newSiteHostingAdminAccess: 'Vercel admin team invite ready',
    voterFileAccess: 'NGP VAN access via state party',
    donorCrmAccess: 'NGP VAN admin',
    membershipDbAccess: 'NationBuilder admin',
    emailMarketingAccess: 'Mailchimp owner',
    memberPortalAccess: 'NationBuilder admin',
    pressListAccess: 'Cision shared seat',
    ga4Access: 'Google Analytics admin',
    gtmAccess: 'GTM admin',
    searchConsoleAccess: 'Search Console owner',
    metaPixelAccess: 'Meta Business Manager admin',
    googleAdsAccess: 'Google Ads admin',
    filingPaperworkUploads: 'https://example.com/filing.pdf',
    '10dlcBrandRegistrationInfo': 'Brand registered with The Campaign Registry — ID TEST123',
    emailDeliverabilitySpfDkimDmarc: 'SPF/DKIM/DMARC all configured at example.com',
  };
}

export default function AutofillButton() {
  const { state, dispatch, secretsDispatch } = useIntake();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => { setEnabled(isDevMode()); }, []);

  if (!enabled) return null;

  const fill = (subjectType) => {
    dispatch({ type: 'PREFILL', payload: buildStatePayload(subjectType) });
    if (secretsDispatch) {
      secretsDispatch({ type: 'PREFILL_SECRETS', payload: buildSecretsPayload() });
    }
    setToast(`✓ Autofilled (${subjectType})`);
    setTimeout(() => setToast(''), 2000);
  };

  const handleClick = () => {
    const params = new URLSearchParams(window.location.search);
    const urlSubject = (params.get('subject') || '').toLowerCase();
    if (urlSubject === 'candidate' || urlSubject === 'party') {
      fill(urlSubject);
      return;
    }
    if (state.subjectType === 'candidate' || state.subjectType === 'party') {
      fill(state.subjectType);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title="Fill all form fields with test data (dev mode only)"
        style={{
          position: 'fixed', top: 12, right: 12, zIndex: 9999,
          background: '#7c3aed', color: '#fff', border: 'none',
          padding: '8px 14px', borderRadius: 8, fontSize: 12,
          fontWeight: 700, letterSpacing: '0.05em',
          textTransform: 'uppercase', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        🧪 Autofill (Test)
      </button>

      {toast && (
        <div style={{
          position: 'fixed', top: 56, right: 12, zIndex: 9999,
          background: '#10b981', color: '#fff',
          padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>{toast}</div>
      )}

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 12, padding: 24, minWidth: 320,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#111' }}>
              Autofill: subject type?
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => { setOpen(false); fill('candidate'); }}
                style={{ flex: 1, padding: '12px 16px', borderRadius: 8, border: '1px solid #1C2E5B', background: '#1C2E5B', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >Candidate</button>
              <button
                type="button"
                onClick={() => { setOpen(false); fill('party'); }}
                style={{ flex: 1, padding: '12px 16px', borderRadius: 8, border: '1px solid #B22234', background: '#B22234', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >Party</button>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ marginTop: 12, padding: '8px', width: '100%', background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13 }}
            >Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

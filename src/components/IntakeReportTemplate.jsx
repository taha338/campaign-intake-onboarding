/**
 * IntakeReportTemplate
 * --------------------
 * Static, capture-friendly visual report for the Campaign Intake (Form 1)
 * submission. Used as the source DOM for the PDF export so html2canvas
 * produces a faithful render. Mirrors the visual identity of the
 * political-brand-discovery brand report (Op1776 navy + red, structured
 * sections with small-caps labels and clean cards).
 *
 * No framer-motion. Inline styles only. Fonts loaded from Google Fonts.
 */

import { useEffect } from 'react';

const PAGE_BG = '#FFFFFF';
const NAVY = '#1C2E5B';
const RED = '#B22234';
const TEXT_DARK = '#1F2937';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const SOFT_BG = '#F9FAFB';

const HEADING_FONT = "'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, sans-serif";
const BODY_FONT = "'Inter', system-ui, -apple-system, Segoe UI, sans-serif";

function useGoogleFonts() {
  useEffect(() => {
    const families = ['Plus Jakarta Sans', 'Inter'];
    families.forEach((family) => {
      const id = `intake-pdf-font-${family.replace(/\s+/g, '-')}`;
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@300;400;500;600;700;800;900&display=swap`;
      link.id = id;
      document.head.appendChild(link);
    });
  }, []);
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: MUTED,
      margin: '0 0 18px',
      fontFamily: BODY_FONT,
    }}>{children}</p>
  );
}

function SectionTitle({ number, label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, padding: 0, borderRadius: '50%',
          background: NAVY, color: '#FFFFFF', fontSize: 12, fontWeight: 700,
          letterSpacing: 0, fontFamily: BODY_FONT,
          boxSizing: 'border-box', flexShrink: 0, lineHeight: 1,
        }}>{number}</span>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: MUTED, fontFamily: BODY_FONT,
        }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>
      <h2 style={{
        fontFamily: HEADING_FONT,
        fontSize: 28, fontWeight: 800, color: NAVY,
        margin: 0, letterSpacing: '-0.01em', lineHeight: 1.15,
      }}>{children}</h2>
    </div>
  );
}

function isFilled(v) {
  if (v === undefined || v === null) return false;
  if (Array.isArray(v)) return v.length > 0;
  return String(v).trim() !== '';
}

function formatValue(v) {
  if (Array.isArray(v)) return v.filter(Boolean).join(', ');
  if (typeof v === 'object' && v !== null) return JSON.stringify(v);
  return String(v).trim();
}

function Field({ label, value }) {
  if (!isFilled(value)) return null;
  const display = formatValue(value);
  if (!display) return null;
  return (
    <div data-pdf-field="" style={{ breakInside: 'avoid' }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: MUTED, margin: '0 0 6px',
        fontFamily: BODY_FONT,
      }}>{label}</p>
      <p style={{
        fontSize: 14, color: TEXT_DARK, margin: 0, lineHeight: 1.55,
        fontFamily: BODY_FONT, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>{display}</p>
    </div>
  );
}

function FieldGrid({ children }) {
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${BORDER}`,
      borderRadius: 14,
      padding: '24px 26px',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '20px 28px',
    }}>{items}</div>
  );
}

/* Renders a section only if at least one Field has a value. */
function Section({ number, label, title, children, hide }) {
  if (hide) return null;
  const items = (Array.isArray(children) ? children : [children]).flat().filter(Boolean);
  // Determine whether any Field child has data — react-children inspection.
  const anyFilled = items.some((c) => {
    if (!c || !c.props) return false;
    if (c.props.value !== undefined) return isFilled(c.props.value);
    return true; // non-Field children (e.g. raw notes) always render
  });
  if (!anyFilled) return null;
  return (
    <div data-pdf-section="" style={{ marginBottom: 38 }}>
      <SectionTitle number={number} label={label}>{title}</SectionTitle>
      <FieldGrid>{items}</FieldGrid>
    </div>
  );
}

export default function IntakeReportTemplate({ state, secrets }) {
  useGoogleFonts();
  const subjectIsCandidate = state.subjectType === 'candidate';
  const subjectIsParty = state.subjectType === 'party';
  const subjectHeadline = subjectIsParty
    ? (state.partyName || state.displayName || 'Party Intake')
    : subjectIsCandidate
      ? (state.candidateFullLegalName || state.displayName || 'Candidate Intake')
      : (state.displayName || 'Campaign Intake');

  const subjectMeta = subjectIsParty
    ? [state.partyType, state.partyScope, state.primaryStateParty].filter(Boolean).join(' · ')
    : subjectIsCandidate
      ? [state.officeSought, state.candState, state.electionYear].filter(Boolean).join(' · ')
      : '';

  const userLines = (state.users || [])
    .filter((u) => u && (u.name || u.email))
    .map((u, i) => `${i + 1}. ${u.name || '?'} (${u.email || '?'}) — ${u.accessLevel || '?'} / ${u.role || '?'}`)
    .join('\n');

  const milestoneLines = (state.hardMilestones || [])
    .filter((m) => m && (m.name || m.date))
    .map((m) => `• ${m.name || '?'} — ${m.date || '?'}`)
    .join('\n');

  const coalitionLines = (state.coalitionLeads || [])
    .filter((c) => c && (c.name || c.contact))
    .map((c) => `• [${c.category || '—'}] ${c.name || '?'} — ${c.contact || ''}`)
    .join('\n');

  const committeeLines = (state.internalCommitteeChairs || [])
    .filter((c) => c && (c.committee || c.chairName))
    .map((c) => `• ${c.committee || '?'} — ${c.chairName || '?'} (${c.contact || ''})`)
    .join('\n');

  return (
    <div style={{
      width: 1100,
      background: PAGE_BG,
      fontFamily: BODY_FONT,
      color: TEXT_DARK,
      padding: '64px 64px 80px',
      boxSizing: 'border-box',
    }}>
      {/* HEADER */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: RED,
          }}>Operation 1776</span>
          <div style={{ width: 200, height: 1, background: BORDER }} />
        </div>
        <h1 style={{
          fontFamily: HEADING_FONT,
          fontSize: 48, fontWeight: 800, color: NAVY,
          margin: 0, letterSpacing: '-0.02em', lineHeight: 1.05,
        }}>Campaign Intake Summary</h1>
        <p style={{ fontSize: 15, color: MUTED, margin: '12px 0 0', fontFamily: BODY_FONT }}>
          A full record of the onboarding details captured for this campaign.
        </p>
      </div>

      {/* HERO CARD */}
      <div data-pdf-section="" style={{
        background: NAVY,
        color: '#FFFFFF',
        borderRadius: 22,
        padding: '44px 44px',
        marginBottom: 44,
        borderTop: `4px solid ${RED}`,
        borderBottom: `4px solid ${RED}`,
      }}>
        <p style={{
          fontSize: 12, fontWeight: 700, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: '#FFFFFF', opacity: 0.78,
          margin: '0 0 18px', fontFamily: BODY_FONT,
        }}>{subjectIsParty ? 'Party' : subjectIsCandidate ? 'Candidate / Campaign' : 'Subject'}</p>

        <h2 style={{
          fontFamily: HEADING_FONT,
          fontSize: 56, fontWeight: 800, lineHeight: 1.05,
          color: '#FFFFFF', margin: 0, letterSpacing: '-0.015em',
        }}>{subjectHeadline}</h2>

        {subjectMeta && (
          <p style={{
            fontFamily: BODY_FONT,
            fontSize: 16, color: '#FFFFFF', opacity: 0.85,
            margin: '14px 0 0', lineHeight: 1.5,
          }}>{subjectMeta}</p>
        )}

        <div style={{ width: 80, height: 3, background: RED, margin: '24px 0' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 28px' }}>
          {[
            { label: 'Client ID', value: state.clientId },
            { label: 'Generated', value: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) },
            { label: 'Submitter', value: state.submitterName },
            { label: 'Email', value: state.submitterEmail },
          ].filter((x) => isFilled(x.value)).map((x) => (
            <div key={x.label}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6, margin: '0 0 4px' }}>{x.label}</p>
              <p style={{ fontSize: 13, color: '#FFFFFF', margin: 0, fontWeight: 500 }}>{x.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTIONS */}
      <Section number="A" label="Stage A" title="Subject &amp; Submitter">
        <Field label="Subject Type" value={state.subjectType} />
        <Field label="Submitter Name" value={state.submitterName} />
        <Field label="Submitter Email" value={state.submitterEmail} />
        <Field label="Submitter Role" value={state.submitterRole} />
        <Field label="Referral Source" value={state.referralSource} />
      </Section>

      <Section number="B" label="Stage B" title="Organization">
        <Field label="Legal Name" value={state.orgLegalName} />
        <Field label="Display / Operation Name" value={state.displayName} />
        <Field label="Organization Type" value={state.orgType} />
        <Field label="EIN / Tax ID" value={state.ein} />
        <Field label="FEC ID / State Committee ID" value={state.fecId} />
        <Field label="Mailing Address" value={state.mailingAddress} />
        <Field label="Organization Phone" value={state.orgPhone} />
        <Field label="Organization Email" value={state.orgEmail} />
        <Field label="Time Zone" value={state.timeZone} />
      </Section>

      {subjectIsCandidate && (
        <Section number="C" label="Stage C" title="Race &amp; Jurisdiction">
          <Field label="Candidate Full Legal Name" value={state.candidateFullLegalName} />
          <Field label="Office Sought" value={state.officeSought} />
          <Field label="State" value={state.candState} />
          <Field label="District" value={state.district} />
          <Field label="Election Year" value={state.electionYear} />
          <Field label="Partisan Race" value={state.partisanRace} />
        </Section>
      )}

      {subjectIsParty && (
        <Section number="C" label="Stage C" title="Party Identity">
          <Field label="Party Name" value={state.partyName} />
          <Field label="Party Acronym" value={state.partyAcronym} />
          <Field label="Party Type" value={state.partyType} />
          <Field label="Party Type — Other" value={state.partyTypeOther} />
          <Field label="Party Scope" value={state.partyScope} />
          <Field label="Primary State" value={state.primaryStateParty} />
          <Field label="States Covered" value={state.statesCovered} />
          <Field label="City / County" value={state.cityCounty} />
          <Field label="Founded Year" value={state.foundedYear} />
          <Field label="Affiliated PACs / Committees" value={state.affiliatedPacs} />
        </Section>
      )}

      <Section number="D" label="Stage D" title="Web Presence">
        <Field label="Primary Website" value={state.primaryWebsite} />
        <Field label="Website Live?" value={state.websiteLive} />
        <Field label="Donate Link" value={state.donateLink} />
        <Field label="Volunteer Link" value={state.volunteerLink} />
        <Field label="Membership / Join Link" value={state.membershipLink} />
        <Field label="Subdomains for Chapters" value={state.subdomainsForChapters} />
        <Field label="Preferred Area Codes" value={state.preferredAreaCodes} />
      </Section>

      <Section number="E" label="Stage E" title="Key People">
        <Field label="Campaign Manager" value={state.campaignManagerName} />
        <Field label="Campaign Manager Contact" value={state.campaignManagerContact} />
        <Field label="Field Director" value={state.fieldDirectorName} />
        <Field label="Field Director Contact" value={state.fieldDirectorContact} />
        <Field label="Communications Director" value={state.commsDirectorName} />
        <Field label="Communications Director Contact" value={state.commsDirectorContact} />
        <Field label="Party Chair" value={state.partyChairName} />
        <Field label="Party Chair Contact" value={state.partyChairContact} />
        <Field label="Vice Chair" value={state.viceChairName} />
        <Field label="Vice Chair Contact" value={state.viceChairContact} />
        <Field label="Executive Director" value={state.execDirectorName} />
        <Field label="Executive Director Contact" value={state.execDirectorContact} />
        <Field label="Treasurer" value={state.treasurerName} />
        <Field label="Treasurer Contact" value={state.treasurerContact} />
        <Field label="Lead Spokesperson" value={state.leadSpokesperson} />
      </Section>

      <Section number="F" label="Stage F" title="Primary &amp; Secondary Contacts">
        <Field label="Same Person?" value={state.samePersonContacts} />
        <Field label="Primary Contact" value={state.primaryName} />
        <Field label="Primary Email" value={state.primaryEmail} />
        <Field label="Primary Phone" value={state.primaryPhone} />
        <Field label="Secondary Contact" value={state.secondaryName} />
        <Field label="Secondary Email" value={state.secondaryEmail} />
        <Field label="Secondary Phone" value={state.secondaryPhone} />
      </Section>

      {state.optInDomainHostingEmail === 'yes' && (
        <Section number="G" label="Stage G–I" title="Domain, Email &amp; Hosting">
          <Field label="Primary Domain" value={state.primaryDomain} />
          <Field label="Current DNS Provider" value={state.currentDnsProvider} />
          <Field label="Existing CMS / Host" value={state.existingCmsHost} />
          <Field label="E-commerce Store?" value={state.ecommerceStore} />
          <Field label="Payment Provider" value={state.paymentProvider} />
          <Field label="New Site Hosting Provider" value={state.newSiteHostingProvider} />
          {secrets && (
            <Field label="Registrar Username" value={secrets.registrarUsername ? '••••• (stored encrypted)' : ''} />
          )}
          {secrets && (
            <Field label="Email Admin Username" value={secrets.emailAdminUsername ? '••••• (stored encrypted)' : ''} />
          )}
        </Section>
      )}

      {state.optInDataUsersOps === 'yes' && (
        <Section number="J" label="Stage J–M" title="Data, Users &amp; Project Ops">
          <Field label="Donor CRM" value={state.donorCrmPlatform} />
          <Field label="Membership Database Platform" value={state.membershipDbPlatform} />
          <Field label="Email Marketing Platform" value={state.emailMarketingPlatform} />
          <Field label="Data-sharing Agreements" value={state.dataSharingAgreementsOps} />
          <Field label="Launch Deadline" value={state.launchDeadline} />
          <Field label="After-hours Contact" value={`${state.afterHoursName || ''} ${state.afterHoursPhone || ''}`.trim()} />
          <Field label="Crisis Lead" value={`${state.crisisLeadName || ''} ${state.crisisLeadContact || ''}`.trim()} />
          <Field label="Users" value={userLines} />
          <Field label="Hard Milestones" value={milestoneLines} />
        </Section>
      )}

      <Section number="N" label="Stage N–O" title="Compliance &amp; Analytics">
        <Field label="Sender From Name" value={state.senderFromName} />
        <Field label="SMS Opt-in Language" value={state.smsOptInLanguage} />
        <Field label="CAN-SPAM Address Override" value={state.canSpamAddressOverride} />
      </Section>

      {subjectIsCandidate && (
        <Section number="P" label="Stage P" title="Filing &amp; Ballot Access">
          <Field label="Filed for Office?" value={state.filedForOffice} />
          <Field label="Filing Deadline" value={state.filingDeadline} />
          <Field label="Ballot Name" value={state.ballotName} />
          <Field label="Petition Drive Needed?" value={state.petitionDriveNeeded} />
          <Field label="Signatures + Deadline" value={state.signaturesAndDeadline} />
        </Section>
      )}

      {subjectIsParty && (
        <Section number="Q" label="Stage Q" title="Party Membership &amp; Affiliates">
          <Field label="Member Portal Platform" value={state.memberPortalPlatform} />
          <Field label="Membership Application Workflow" value={state.membershipApplicationWorkflow} />
          <Field label="Membership Approver" value={state.membershipApprover} />
          <Field label="Affiliated Candidate Intake" value={state.affiliatedCandidateIntake} />
          <Field label="Affiliated Candidate Approver" value={state.affiliatedCandidateApprover} />
          <Field label="State Chapter Onboarding" value={state.stateChapterOnboardingProcess} />
          <Field label="State Chapter Onboarding Contact" value={state.stateChapterOnboardingContact} />
        </Section>
      )}

      {subjectIsParty && (
        <Section number="S" label="Stage S" title="Party Governance Ops">
          <Field label="Candidate Recruitment Lead" value={state.candidateRecruitmentLead} />
          <Field label="Internal Committee Chairs" value={committeeLines} />
        </Section>
      )}

      <Section number="R" label="Stage R" title="Coalition Outreach">
        <Field label="Coalition Leads" value={coalitionLines} />
      </Section>

      <Section number="T" label="Stage T" title="Counsel">
        <Field label="Counsel Name" value={state.counselName} />
        <Field label="Counsel Contact" value={state.counselContact} />
      </Section>

      {/* FOOTER */}
      <div data-pdf-section="" style={{
        marginTop: 48, paddingTop: 24, borderTop: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: BODY_FONT,
      }}>
        <p style={{ fontSize: 11, color: MUTED, margin: 0, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>
          Operation 1776
        </p>
        <p style={{ fontSize: 11, color: MUTED, margin: 0, fontStyle: 'italic' }}>
          Rooted in Freedom. Driven by Purpose.
        </p>
      </div>
    </div>
  );
}

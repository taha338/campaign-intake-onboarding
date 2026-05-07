/**
 * Form 1 — Campaign Intake (Operation 1776)
 *
 * Multi-stage wizard with 9 stages, framer-motion transitions, prev/next
 * navigation, required-field validation, and "do you need this?" gates
 * for optional stage bundles.
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { IntakeProvider, useIntake } from './context/IntakeContext';
import { fetchPrefill, readClientIdFromUrl } from './lib/clickup';
import { generateReportPDF } from './utils/generateReportPDF';
import IntakeReportTemplate from './components/IntakeReportTemplate';
import { Download } from 'lucide-react';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import StageShell from './components/StageShell';
import SubjectTypeToggle from './components/SubjectTypeToggle';
import OptInGate from './components/OptInGate';
import { TextField, TextArea, Select, RadioGroup, MultiSelectChips, TwoCol } from './components/Field';
import {
  SectionWeb, SectionKeyPeople, SectionContacts, SectionDomainDns, SectionEmailInfra,
  SectionHosting, SectionDataCrm, SectionUsers, SectionProjectOps, SectionAnalyticsAds,
  SectionCompliance, SectionFiling, SectionPartyMembership, SectionCoalition,
  SectionPartyGovernance, SectionCounsel,
} from './components/sections';
import {
  SUBMITTER_ROLES, ORGANIZATION_TYPES, PARTY_TYPES, PARTY_SCOPES, US_STATES,
  TIME_ZONES, ELECTION_YEARS, PARTISAN_RACE_OPTIONS,
} from './lib/options';

/* Stage list — used by ProgressBar only. Each Stage* component computes
   its own canContinue from state. */
const STAGE_LIST = [
  { id: 'subject',         label: 'Subject',          Component: () => <Stage1Subject /> },
  { id: 'org',             label: 'Organization',     Component: () => <Stage2Org /> },
  { id: 'race',             label: 'Race / Identity', Component: () => <Stage3Race /> },
  { id: 'web-people',      label: 'Web & People',     Component: () => <Stage4WebPeople /> },
  { id: 'infra',           label: 'Domain & Hosting', Component: () => <Stage5Infra /> },
  { id: 'data-ops',        label: 'Data & Ops',       Component: () => <Stage6DataOps /> },
  { id: 'compliance',      label: 'Compliance',       Component: () => <Stage7Compliance /> },
  { id: 'subject-extras',  label: 'Subject Extras',   Component: () => <Stage8SubjectExtras /> },
  { id: 'review',          label: 'Review',           Component: () => <Stage9Review /> },
];

/* ─────────────────────────────────────────────────────────────────
   STAGE 1 — Subject & Submitter (everything required)
   ───────────────────────────────────────────────────────────────── */
function Stage1Subject() {
  const { state, update } = useIntake();
  const canContinue = Boolean(state.subjectType && state.submitterName && state.submitterEmail && state.submitterRole);
  return (
    <StageShell number={1} title="Who's this for?" subtitle="A few quick details about you and your subject so we can tailor the rest of the form." isFirst canContinue={canContinue}>
      <SubjectTypeToggle />
      {(state.subjectType === 'candidate' || state.subjectType === 'party') && (
        <div className="mt-6 space-y-5">
          <TwoCol>
            <TextField required label="Submitter Full Name" value={state.submitterName} onChange={(v) => update({ submitterName: v })} placeholder="Jane Doe" />
            <TextField required label="Submitter Email" type="email" value={state.submitterEmail} onChange={(v) => update({ submitterEmail: v })} placeholder="jane@example.com" />
          </TwoCol>
          <TwoCol>
            <Select required label="Submitter Role" value={state.submitterRole} onChange={(v) => update({ submitterRole: v })} options={SUBMITTER_ROLES} />
            <TextField label="Referral Source" optional value={state.referralSource} onChange={(v) => update({ referralSource: v })} placeholder="How did you find us?" />
          </TwoCol>
        </div>
      )}
    </StageShell>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STAGE 2 — Organization Identity
   ───────────────────────────────────────────────────────────────── */
function Stage2Org() {
  const { state, update, isCandidate } = useIntake();
  const canContinue = Boolean(state.orgLegalName && state.orgType && state.mailingAddress);
  return (
    <StageShell number={2} title="Organization" subtitle="Legal name, type, and contact info for the registered org behind the brand." canContinue={canContinue}>
      <TwoCol>
        <TextField required label="Organization Legal Name" value={state.orgLegalName} onChange={(v) => update({ orgLegalName: v })} placeholder={isCandidate ? 'Friends of Jane Doe' : 'American Solidarity Party'} />
        <TextField label="Display / Operation Name" optional value={state.displayName} onChange={(v) => update({ displayName: v })} help="If different from legal name." />
      </TwoCol>
      <Select required label="Organization Type" value={state.orgType} onChange={(v) => update({ orgType: v })} options={ORGANIZATION_TYPES} />
      <TwoCol>
        <TextField label="EIN / Tax ID" optional value={state.ein} onChange={(v) => update({ ein: v })} placeholder="93-1234567" />
        <TextField label="FEC ID / State Committee ID" optional value={state.fecId} onChange={(v) => update({ fecId: v })} />
      </TwoCol>
      <TextArea required label="Mailing Address" value={state.mailingAddress} onChange={(v) => update({ mailingAddress: v })} placeholder="Street, City, State, Zip" rows={3} help="Doubles as the CAN-SPAM physical address on email." />
      <TwoCol>
        <TextField label="Organization Phone" type="tel" value={state.orgPhone} onChange={(v) => update({ orgPhone: v })} />
        <TextField label="Organization Email" type="email" value={state.orgEmail} onChange={(v) => update({ orgEmail: v })} help="General / public inbox." />
      </TwoCol>
      <Select label="Time Zone" optional value={state.timeZone} onChange={(v) => update({ timeZone: v })} options={TIME_ZONES} />
    </StageShell>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STAGE 3 — Race / Jurisdiction (candidate) or Party Identity (party)
   ───────────────────────────────────────────────────────────────── */
function Stage3Race() {
  const { state, update, isCandidate, isParty } = useIntake();
  const canContinue = isCandidate
    ? Boolean(state.candidateFullLegalName && state.officeSought && state.candState && state.electionYear)
    : Boolean(state.partyName && state.partyType && state.partyScope);
  return (
    <StageShell
      number={3}
      title={isCandidate ? 'Race & Jurisdiction' : 'Party Identity'}
      subtitle={isCandidate ? 'Which office, where, and when.' : "What kind of party, and where it operates."}
      canContinue={canContinue}
    >
      {isCandidate && (
        <>
          <TextField required label="Candidate Full Legal Name" value={state.candidateFullLegalName} onChange={(v) => update({ candidateFullLegalName: v })} help="As it would appear on a ballot." />
          <TwoCol>
            <TextField required label="Office Sought" value={state.officeSought} onChange={(v) => update({ officeSought: v })} placeholder="US House, State Senate, City Council" />
            <Select required label="State" value={state.candState} onChange={(v) => update({ candState: v })} options={US_STATES} />
          </TwoCol>
          <TwoCol>
            <TextField label="District" optional value={state.district} onChange={(v) => update({ district: v })} placeholder="e.g. CD-3" />
            <Select required label="Election Year" value={state.electionYear} onChange={(v) => update({ electionYear: v })} options={ELECTION_YEARS} />
          </TwoCol>
          <RadioGroup label="Is this a partisan race?" value={state.partisanRace} onChange={(v) => update({ partisanRace: v })} options={PARTISAN_RACE_OPTIONS} />
        </>
      )}
      {isParty && (
        <>
          <TwoCol>
            <TextField required label="Party Name (full)" value={state.partyName} onChange={(v) => update({ partyName: v })} />
            <TextField label="Party Acronym" optional value={state.partyAcronym} onChange={(v) => update({ partyAcronym: v.toUpperCase().slice(0, 8) })} placeholder="ASP, GOP, AFP" />
          </TwoCol>
          <RadioGroup required label="Party Type" value={state.partyType} onChange={(v) => update({ partyType: v })} options={PARTY_TYPES} />
          {state.partyType === 'other' && (
            <TextField label="Party Type — Other" value={state.partyTypeOther} onChange={(v) => update({ partyTypeOther: v })} />
          )}
          <RadioGroup required label="Party Scope" value={state.partyScope} onChange={(v) => update({ partyScope: v })} options={PARTY_SCOPES} />
          {(state.partyScope === 'state' || state.partyScope === 'local') && (
            <Select required label="Primary State" value={state.primaryStateParty} onChange={(v) => update({ primaryStateParty: v })} options={US_STATES} />
          )}
          {state.partyScope === 'multi-state' && (
            <MultiSelectChips required label="States Covered" values={state.statesCovered} onChange={(v) => update({ statesCovered: v })} options={US_STATES} />
          )}
          {state.partyScope === 'local' && (
            <TextField required label="City / County" value={state.cityCounty} onChange={(v) => update({ cityCounty: v })} placeholder="e.g. Travis County" />
          )}
          <TextField label="Founded Year" optional value={state.foundedYear} onChange={(v) => update({ foundedYear: v.replace(/[^0-9]/g, '').slice(0, 4) })} placeholder="YYYY" />
        </>
      )}
    </StageShell>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STAGE 4 — Web Presence + Key People + Contacts
   ───────────────────────────────────────────────────────────────── */
function Stage4WebPeople() {
  const { state } = useIntake();
  const canContinue = Boolean(state.primaryWebsite && state.primaryName && state.primaryEmail);
  return (
    <StageShell number={4} title="Web & People" subtitle="The website you have, the people running this, and who we contact day-to-day." canContinue={canContinue}>
      <SectionWeb />
      <SectionKeyPeople />
      <SectionContacts />
    </StageShell>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STAGE 5 — Domain / DNS / Email / Hosting (skippable)
   ───────────────────────────────────────────────────────────────── */
function Stage5Infra() {
  const { state, update } = useIntake();
  const canContinue = state.optInDomainHostingEmail !== '';
  return (
    <StageShell number={5} title="Domain, Email, Hosting" subtitle="Skip this if Op1776 isn't handling these systems for you." canContinue={canContinue}>
      <OptInGate
        label="Do you want Op1776 to manage your domain, email, and hosting?"
        help="Pick Yes to share the credentials we need. Pick No if you'll handle these yourself or already have a vendor."
        yesLabel="Yes — share credentials"
        noLabel="No — skip"
        value={state.optInDomainHostingEmail}
        onChange={(v) => update({ optInDomainHostingEmail: v })}
      >
        <SectionDomainDns />
        <SectionEmailInfra />
        <SectionHosting />
      </OptInGate>
    </StageShell>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STAGE 6 — Data, CRM, Users, Project Ops (skippable)
   ───────────────────────────────────────────────────────────────── */
function Stage6DataOps() {
  const { state, update } = useIntake();
  const canContinue = state.optInDataUsersOps !== '';
  return (
    <StageShell number={6} title="Data, Users & Ops" subtitle="Voter file, donor CRM, login users, project deadlines." canContinue={canContinue}>
      <OptInGate
        label="Do you have data systems / users / project deadlines to share?"
        help="Most clients answer Yes. Pick No only if there's literally nothing to share here yet."
        yesLabel="Yes — fill in"
        noLabel="No — skip for now"
        value={state.optInDataUsersOps}
        onChange={(v) => update({ optInDataUsersOps: v })}
      >
        <SectionDataCrm />
        <SectionUsers />
        <SectionProjectOps />
      </OptInGate>
    </StageShell>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STAGE 7 — Compliance & Analytics (sender from name required)
   ───────────────────────────────────────────────────────────────── */
function Stage7Compliance() {
  const { state } = useIntake();
  const canContinue = Boolean(state.senderFromName);
  return (
    <StageShell number={7} title="Compliance & Analytics" subtitle="SMS / email compliance, ad accounts, and the 'From' name on outgoing email." canContinue={canContinue}>
      <SectionAnalyticsAds />
      <SectionCompliance />
    </StageShell>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STAGE 8 — Subject-conditional extras (filing / party ops / coalition)
   ───────────────────────────────────────────────────────────────── */
function Stage8SubjectExtras() {
  const { isCandidate, isParty } = useIntake();
  return (
    <StageShell
      number={8}
      title={isCandidate ? 'Filing & Coalition' : 'Party Ops & Coalition'}
      subtitle={isCandidate ? 'Ballot access, signatures, and coalition outreach.' : 'Membership operations, governance, and coalition outreach.'}
    >
      {isCandidate && <SectionFiling />}
      {isParty && <SectionPartyMembership />}
      <SectionCoalition />
      {isParty && <SectionPartyGovernance />}
    </StageShell>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STAGE 9 — Counsel + Review + Submit
   ───────────────────────────────────────────────────────────────── */
function Stage9Review() {
  const { state, secrets, dispatch } = useIntake();
  const pdfRef = useRef(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  const handleDownloadPDF = async () => {
    setPdfGenerating(true);
    setPdfError(null);
    try {
      await new Promise((r) => setTimeout(r, 600));
      if (!pdfRef.current) throw new Error('Report preview not ready — try again.');
      const fileName = `${state.clientId || 'campaign-intake'}-summary.pdf`;
      await generateReportPDF(pdfRef.current, fileName);
    } catch (err) {
      console.error('PDF generation error:', err);
      setPdfError(err?.message || 'Failed to generate PDF.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const submit = async () => {
    dispatch({ type: 'SET_SUBMIT_STATE', payload: { submitting: true, submitError: '' } });
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, secrets }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body.slice(0, 300));
      }
      dispatch({ type: 'SET_SUBMIT_STATE', payload: { submitting: false, submitted: true } });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      dispatch({ type: 'SET_SUBMIT_STATE', payload: { submitting: false, submitError: err.message || 'Submit failed' } });
    }
  };

  if (state.submitted) {
    return (
      <StageShell number={9} title="Submitted" subtitle="" hideContinue isLast>
        <div className="p-8 rounded-2xl border border-emerald-200 bg-emerald-50 text-center">
          <p className="font-display text-3xl text-emerald-900 uppercase mb-2">Thank you</p>
          <p className="font-script text-2xl text-emerald-700 mb-3">We've got it.</p>
          <p className="text-sm text-emerald-800">
            Your campaign intake has been received. The Operation 1776 team will pick up from here.
          </p>
        </div>
      </StageShell>
    );
  }

  return (
    <StageShell
      number={9}
      title="Review & Submit"
      subtitle="One last review, then we take it from here."
      isLast
      hideContinue
    >
      <SectionCounsel />
      <div className="p-6 rounded-2xl border border-[var(--color-op-line)] bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <button
          type="button"
          onClick={submit}
          disabled={state.submitting}
          className="font-display tracking-widest px-8 py-4 rounded-lg bg-[var(--color-op-red)] text-white uppercase text-lg shadow-lg hover:bg-[var(--color-op-red-deep)] disabled:bg-[var(--color-op-muted)] transition-colors"
        >
          {state.submitting ? 'Submitting…' : 'Submit Intake'}
        </button>
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={pdfGenerating}
          className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-white border border-[var(--color-op-ink)] text-[var(--color-op-ink)] font-semibold uppercase tracking-wider text-sm hover:bg-[var(--color-op-cream)] disabled:opacity-60 transition-colors"
        >
          <Download size={16} /> {pdfGenerating ? 'Generating…' : 'Download as PDF'}
        </button>
      </div>
      {pdfError && (
        <p className="mt-3 text-sm text-red-700">{pdfError}</p>
      )}
      {state.submitError && (
        <p className="mt-3 text-sm text-red-700">{state.submitError}</p>
      )}

      {/* Off-screen report template — source DOM for the PDF capture. */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1100 }}>
          <div ref={pdfRef}>
            <IntakeReportTemplate state={state} secrets={secrets} />
          </div>
        </div>
      </div>
    </StageShell>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PrefillBoot + Wizard wrapper
   ───────────────────────────────────────────────────────────────── */
function PrefillBoot() {
  const { state, dispatch } = useIntake();
  useEffect(() => {
    const cid = readClientIdFromUrl();
    dispatch({ type: 'UPDATE', payload: { clientId: cid } });
    if (!cid) return;
    fetchPrefill(cid)
      .then((data) => {
        if (!data?.found) return;
        const brand = data.brand || {};
        dispatch({
          type: 'PREFILL',
          payload: {
            clickupTaskId: data.taskId || '',
            // Active Clients master fields
            submitterName:  data.contact?.name || '',
            submitterEmail: data.contact?.email || '',
            primaryName:    data.contact?.name || '',
            primaryEmail:   data.contact?.email || '',
            primaryPhone:   data.contact?.phone || '',
            secondaryName:  data.contact?.secondaryName || '',
            secondaryEmail: data.contact?.secondaryEmail || '',
            secondaryRole:  data.contact?.secondaryRole || '',
            displayName:    data.tradeName || '',
            subjectType:    data.subjectType || '',
            communicationPreference: data.meta?.communicationPreference || '',
            packageSelected:         data.meta?.packageSelected || '',
            industry:                data.meta?.industry || '',
            // Cross-form pre-fill from Form 2 (brand_submissions)
            ...(brand.candidate_name     ? { candidateName:    brand.candidate_name } : {}),
            ...(brand.candidate_office   ? { candidateOffice:  brand.candidate_office } : {}),
            ...(brand.candidate_state    ? { candidateState:   brand.candidate_state } : {}),
            ...(brand.candidate_district ? { candidateDistrict: brand.candidate_district } : {}),
            ...(brand.election_year      ? { electionYear:     brand.election_year } : {}),
            ...(brand.party_affiliation  ? { partyAffiliation: brand.party_affiliation } : {}),
            ...(brand.race_focus         ? { raceFocus:        brand.race_focus } : {}),
            ...(brand.party_name         ? { partyName:        brand.party_name } : {}),
            ...(brand.party_acronym      ? { partyAcronym:     brand.party_acronym } : {}),
            ...(brand.party_type         ? { partyType:        brand.party_type } : {}),
            ...(brand.party_scope        ? { partyScope:       brand.party_scope } : {}),
            ...(brand.party_state        ? { partyState:       brand.party_state } : {}),
            ...(brand.party_founded_year ? { partyFoundedYear: brand.party_founded_year } : {}),
          },
        });
      })
      .catch(() => { /* silent — form remains fillable */ });
  }, [dispatch]);
  return null;
}

function Wizard() {
  const { state } = useIntake();
  const Stage = STAGE_LIST[state.currentStage]?.Component;
  return (
    <>
      <ProgressBar stages={STAGE_LIST} />
      <AnimatePresence mode="wait">
        {Stage && <Stage key={state.currentStage} />}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   App entry
   ───────────────────────────────────────────────────────────────── */
function HeaderWithClient() {
  const { state } = useIntake();
  return <Header subjectLabel="Campaign Intake" clientId={state.clientId} />;
}

export default function App() {
  return (
    <IntakeProvider>
      <div className="op-paper min-h-screen pb-20">
        <HeaderWithClient />
        <PrefillBoot />
        <Wizard />
      </div>
    </IntakeProvider>
  );
}

import { useEffect, useState } from 'react';
import { IntakeProvider, useIntake } from './context/IntakeContext';
import { fetchPrefill, readClientIdFromUrl } from './lib/clickup';
import Header from './components/Header';
import SubjectTypeToggle from './components/SubjectTypeToggle';
import { Section, TextField, TextArea, Select, RadioGroup, MultiSelectChips, TwoCol } from './components/Field';
import {
  SUBMITTER_ROLES, ORGANIZATION_TYPES, PARTY_TYPES, PARTY_SCOPES, US_STATES,
  TIME_ZONES, ELECTION_YEARS, PARTISAN_RACE_OPTIONS, YES_NO,
} from './lib/options';

function FormBody() {
  const { state, update, isParty, isCandidate, subjectChosen } = useIntake();

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="mb-10 text-center">
        <p className="op-section-num mb-2">SECTION 0 · KICKOFF</p>
        <h2 className="font-display text-3xl md:text-5xl uppercase mb-3">
          Campaign Intake
        </h2>
        <p className="font-script text-2xl text-[var(--color-op-red)] mb-4">
          Let's get you on the ground.
        </p>
        <p className="text-sm text-[var(--color-op-muted)] max-w-xl mx-auto leading-relaxed">
          This form captures the operational details we need to build, host, and
          launch your campaign or party site. Most fields are optional — fill in
          what you have, leave the rest blank.
        </p>
      </div>

      {/* SECTION A — Submitter & Subject */}
      <Section index="A" title="Subject & Submitter" subtitle="Who is this brand for, and who is filling out this form?">
        <SubjectTypeToggle />
        {!subjectChosen && (
          <div className="p-4 rounded-lg border border-dashed border-[var(--color-op-line)] bg-[var(--color-op-cream)] text-sm text-[var(--color-op-muted)]">
            Pick a subject type above to continue.
          </div>
        )}
        {subjectChosen && (
          <>
            <TwoCol>
              <TextField
                label="Submitter Full Name"
                value={state.submitterName}
                onChange={(v) => update({ submitterName: v })}
                placeholder="Jane Doe"
              />
              <TextField
                label="Submitter Email"
                type="email"
                value={state.submitterEmail}
                onChange={(v) => update({ submitterEmail: v })}
                placeholder="jane@example.com"
              />
            </TwoCol>
            <TwoCol>
              <Select
                label="Submitter Role"
                value={state.submitterRole}
                onChange={(v) => update({ submitterRole: v })}
                options={SUBMITTER_ROLES}
              />
              <TextField
                label="Referral Source"
                optional
                value={state.referralSource}
                onChange={(v) => update({ referralSource: v })}
                placeholder="How did you find us?"
              />
            </TwoCol>
          </>
        )}
      </Section>

      {/* SECTION B — Organization Identity */}
      <Section index="B" title="Organization Identity" hidden={!subjectChosen}>
        <TwoCol>
          <TextField
            label="Organization Legal Name"
            value={state.orgLegalName}
            onChange={(v) => update({ orgLegalName: v })}
            placeholder={isCandidate ? 'Friends of Jane Doe' : 'American Solidarity Party'}
            help={isCandidate ? 'Your committee\'s registered legal name.' : 'The party / org\'s legal name.'}
          />
          <TextField
            label="Display / Operation Name"
            optional
            value={state.displayName}
            onChange={(v) => update({ displayName: v })}
            placeholder={isCandidate ? 'Jane Doe for Senate' : 'ASP'}
            help="If different from legal name. Used as the public-facing name on the site."
          />
        </TwoCol>

        <Select
          label="Organization Type"
          value={state.orgType}
          onChange={(v) => update({ orgType: v })}
          options={ORGANIZATION_TYPES}
        />

        {/* Party-only block */}
        {isParty && (
          <>
            <TwoCol>
              <TextField
                label="Party Name (full)"
                value={state.partyName}
                onChange={(v) => update({ partyName: v })}
              />
              <TextField
                label="Party Acronym"
                value={state.partyAcronym}
                onChange={(v) => update({ partyAcronym: v.toUpperCase().slice(0, 8) })}
                placeholder="ASP, GOP, AFP"
              />
            </TwoCol>
            <RadioGroup
              label="Party Type"
              value={state.partyType}
              onChange={(v) => update({ partyType: v })}
              options={PARTY_TYPES}
            />
            {state.partyType === 'other' && (
              <TextField
                label="Party Type — Other"
                value={state.partyTypeOther}
                onChange={(v) => update({ partyTypeOther: v })}
              />
            )}
            <RadioGroup
              label="Party Scope"
              value={state.partyScope}
              onChange={(v) => update({ partyScope: v })}
              options={PARTY_SCOPES}
            />
            {(state.partyScope === 'state' || state.partyScope === 'local') && (
              <Select
                label="Primary State"
                value={state.primaryStateParty}
                onChange={(v) => update({ primaryStateParty: v })}
                options={US_STATES}
              />
            )}
            {state.partyScope === 'multi-state' && (
              <MultiSelectChips
                label="States Covered"
                values={state.statesCovered}
                onChange={(v) => update({ statesCovered: v })}
                options={US_STATES}
                help="Click each state your party operates in."
              />
            )}
            {state.partyScope === 'local' && (
              <TextField
                label="City / County"
                value={state.cityCounty}
                onChange={(v) => update({ cityCounty: v })}
                placeholder="e.g. Travis County, City of Boise"
              />
            )}
            <TextField
              label="Founded Year"
              optional
              value={state.foundedYear}
              onChange={(v) => update({ foundedYear: v.replace(/[^0-9]/g, '').slice(0, 4) })}
              placeholder="YYYY"
            />
          </>
        )}

        <TwoCol>
          <TextField
            label="EIN / Tax ID"
            optional
            value={state.ein}
            onChange={(v) => update({ ein: v })}
            placeholder="93-1234567"
          />
          <TextField
            label="FEC ID / State Committee ID"
            optional
            value={state.fecId}
            onChange={(v) => update({ fecId: v })}
          />
        </TwoCol>

        <TextArea
          label="Mailing Address"
          value={state.mailingAddress}
          onChange={(v) => update({ mailingAddress: v })}
          placeholder="Street, City, State, Zip"
          rows={3}
          help="Used for the CAN-SPAM disclosure on email and as the org's official address."
        />

        <TwoCol>
          <TextField
            label="Organization Phone"
            type="tel"
            value={state.orgPhone}
            onChange={(v) => update({ orgPhone: v })}
            placeholder="+1 (555) 555-1234"
          />
          <TextField
            label="Organization Email"
            type="email"
            value={state.orgEmail}
            onChange={(v) => update({ orgEmail: v })}
            placeholder="contact@example.com"
            help="General / public inbox."
          />
        </TwoCol>

        <Select
          label="Time Zone"
          value={state.timeZone}
          onChange={(v) => update({ timeZone: v })}
          options={TIME_ZONES}
        />
      </Section>

      {/* SECTION C — Race / Jurisdiction (candidate-only) */}
      <Section
        index="C"
        title="Race & Jurisdiction"
        hidden={!isCandidate}
      >
        <TextField
          label="Candidate Full Legal Name"
          value={state.candidateFullLegalName}
          onChange={(v) => update({ candidateFullLegalName: v })}
          help="As it would appear on a ballot."
        />
        <TwoCol>
          <TextField
            label="Office Sought"
            value={state.officeSought}
            onChange={(v) => update({ officeSought: v })}
            placeholder="e.g. US House, State Senate, City Council"
          />
          <Select
            label="State"
            value={state.candState}
            onChange={(v) => update({ candState: v })}
            options={US_STATES}
          />
        </TwoCol>
        <TwoCol>
          <TextField
            label="District"
            optional
            value={state.district}
            onChange={(v) => update({ district: v })}
            placeholder="e.g. CD-3"
          />
          <Select
            label="Election Year"
            value={state.electionYear}
            onChange={(v) => update({ electionYear: v })}
            options={ELECTION_YEARS}
          />
        </TwoCol>
        <RadioGroup
          label="Is this a partisan race?"
          value={state.partisanRace}
          onChange={(v) => update({ partisanRace: v })}
          options={PARTISAN_RACE_OPTIONS}
        />
      </Section>

      {/* The remaining sections D–S are scaffolded in IntakeContext and will
          render once we wire up additional Section components. For v0 we
          render a placeholder so users see the form is in progress. */}
      {subjectChosen && (
        <Section index="D" title="More sections coming">
          <div className="p-5 rounded-xl border border-dashed border-[var(--color-op-line)] bg-[var(--color-op-cream)] text-sm text-[var(--color-op-muted)]">
            Sections D (Web), E (Key People), F (Contacts), G–O (operational
            credentials with strict-RLS storage), P (filing), Q (party
            membership), R (coalitions), S (governance) — all scaffolded in
            state and rendering shortly.
          </div>
        </Section>
      )}

      {/* Footer / submit (stub for now) */}
      <footer className="mt-16 mb-10 pt-6 border-t border-[var(--color-op-line)] text-center text-xs text-[var(--color-op-muted)]">
        <p>
          Operation 1776 · Campaign Intake · {state.clientId ? `client ${state.clientId}` : 'no client_id loaded'}
        </p>
      </footer>
    </main>
  );
}

function PrefillBoot() {
  const { state, dispatch } = useIntake();

  useEffect(() => {
    const cid = readClientIdFromUrl();
    dispatch({ type: 'UPDATE', payload: { clientId: cid } });
    if (!cid) {
      dispatch({ type: 'SET_PREFILL_STATUS', payload: { status: 'empty' } });
      return;
    }
    dispatch({ type: 'SET_PREFILL_STATUS', payload: { status: 'loading' } });
    fetchPrefill(cid)
      .then((data) => {
        if (!data) return;
        // Map ClickUp prefill payload → our state shape.
        const payload = {
          clickupTaskId: data.taskId || '',
          submitterName: data.contact?.name || data.candidate?.fullName || '',
          submitterEmail: data.contact?.email || '',
          orgLegalName: data.party?.name || data.candidate?.organizationName || '',
          displayName: data.tradeName || '',
          orgPhone: data.contact?.phone || '',
          // These are all best-effort — real prefill mapping will expand once
          // we know the exact custom field names from the master task.
        };
        dispatch({ type: 'PREFILL', payload });
      })
      .catch((err) => {
        // Don't block the form on prefill errors; user can still fill manually.
        dispatch({ type: 'SET_PREFILL_STATUS', payload: { status: 'error', error: err.message } });
      });
  }, [dispatch]);

  if (state.prefillStatus === 'loading') {
    return (
      <div className="bg-amber-50 border-y border-amber-200 text-amber-900 text-xs no-print">
        <div className="max-w-5xl mx-auto px-6 py-2">Loading client data from ClickUp…</div>
      </div>
    );
  }
  if (state.prefillStatus === 'error') {
    return (
      <div className="bg-red-50 border-y border-red-200 text-red-900 text-xs no-print">
        <div className="max-w-5xl mx-auto px-6 py-2">
          Couldn't pre-fill from ClickUp ({state.prefillError}). You can still complete the form manually.
        </div>
      </div>
    );
  }
  if (state.prefillStatus === 'empty') {
    return (
      <div className="bg-amber-50 border-y border-amber-200 text-amber-900 text-xs no-print">
        <div className="max-w-5xl mx-auto px-6 py-2">
          No <code className="font-mono">?client_id=</code> in URL. Use the link from your
          ClickUp task to auto-fill known information.
        </div>
      </div>
    );
  }
  return null;
}

export default function App() {
  return (
    <IntakeProvider>
      <div className="op-paper min-h-screen pb-20">
        <Header />
        <PrefillBoot />
        <FormBody />
      </div>
    </IntakeProvider>
  );
}

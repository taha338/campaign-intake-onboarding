/**
 * All Form 1 sections D–S, the Counsel section, and Submit.
 *
 * Each section is a small leaf component that reads from IntakeContext
 * and renders the appropriate fields. Conditional logic (subject type,
 * party scope, "is the website live", etc.) is handled inline.
 */
import { useIntake } from '../../context/IntakeContext';
import {
  Section, TextField, TextArea, Select, RadioGroup, TwoCol,
} from '../Field';
import RepeatingBlock from '../RepeatingBlock';
import {
  PAYMENT_PROVIDERS, ECOMMERCE_PLATFORMS, USER_ACCESS_LEVELS, USER_ROLES,
  YES_NO, YES_NO_INPROGRESS, YES_NO_NA,
  DONOR_CRMS, EMAIL_MARKETING_PLATFORMS,
  MEMBER_PORTAL_PLATFORMS, MEMBERSHIP_WORKFLOWS,
  COALITION_CATEGORIES,
} from '../../lib/options';

/* ─────────── D. Web Presence ─────────── */
export function SectionWeb() {
  const { state, update, isParty, subjectChosen } = useIntake();
  if (!subjectChosen) return null;
  return (
    <Section defaultOpen index="D" title="Web Presence">
      <TwoCol>
        <TextField
          label="Primary Website URL"
          type="url"
          value={state.primaryWebsite}
          onChange={(v) => update({ primaryWebsite: v })}
          placeholder="https://example.com"
        />
        <RadioGroup
          label="Is your website already live?"
          value={state.websiteLive}
          onChange={(v) => update({ websiteLive: v })}
          options={YES_NO}
        />
      </TwoCol>
      <TwoCol>
        <TextField
          label="Donate / Contribute Link"
          type="url"
          optional
          value={state.donateLink}
          onChange={(v) => update({ donateLink: v })}
        />
        <TextField
          label="Volunteer / Get Involved Link"
          type="url"
          optional
          value={state.volunteerLink}
          onChange={(v) => update({ volunteerLink: v })}
        />
      </TwoCol>
      {isParty && (
        <TwoCol>
          <TextField
            label="Membership / Join Link"
            type="url"
            optional
            value={state.membershipLink}
            onChange={(v) => update({ membershipLink: v })}
          />
          <TextField
            label="Subdomains for Chapters / Affiliates"
            optional
            value={state.subdomainsForChapters}
            onChange={(v) => update({ subdomainsForChapters: v })}
            placeholder="texas.party.org, ohio.party.org"
          />
        </TwoCol>
      )}
      <TextField
        label="Preferred Area Codes (for SMS / outreach)"
        optional
        value={state.preferredAreaCodes}
        onChange={(v) => update({ preferredAreaCodes: v })}
        placeholder="503, 971, 541"
      />
    </Section>
  );
}

/* ─────────── E. Key People ─────────── */
export function SectionKeyPeople() {
  const { state, update, isParty, isCandidate, subjectChosen } = useIntake();
  if (!subjectChosen) return null;
  return (
    <Section defaultOpen index="E" title="Key People" subtitle="Who runs day-to-day operations.">
      {isCandidate && (
        <>
          <TwoCol>
            <TextField
              label="Campaign Manager — Name"
              value={state.campaignManagerName}
              onChange={(v) => update({ campaignManagerName: v })}
            />
            <TextField
              label="Campaign Manager — Contact"
              value={state.campaignManagerContact}
              onChange={(v) => update({ campaignManagerContact: v })}
              placeholder="Email + phone"
            />
          </TwoCol>
          <TwoCol>
            <TextField
              label="Field Director — Name"
              optional
              value={state.fieldDirectorName}
              onChange={(v) => update({ fieldDirectorName: v })}
            />
            <TextField
              label="Field Director — Contact"
              optional
              value={state.fieldDirectorContact}
              onChange={(v) => update({ fieldDirectorContact: v })}
            />
          </TwoCol>
        </>
      )}

      <TwoCol>
        <TextField
          label="Communications Director — Name"
          optional
          value={state.commsDirectorName}
          onChange={(v) => update({ commsDirectorName: v })}
          help="Feeds Form 3 'Press contact' if same person."
        />
        <TextField
          label="Communications Director — Contact"
          optional
          value={state.commsDirectorContact}
          onChange={(v) => update({ commsDirectorContact: v })}
        />
      </TwoCol>

      {isParty && (
        <>
          <TwoCol>
            <TextField label="Party Chair — Name" value={state.partyChairName} onChange={(v) => update({ partyChairName: v })} />
            <TextField label="Party Chair — Contact" value={state.partyChairContact} onChange={(v) => update({ partyChairContact: v })} />
          </TwoCol>
          <TwoCol>
            <TextField label="Vice Chair — Name" optional value={state.viceChairName} onChange={(v) => update({ viceChairName: v })} />
            <TextField label="Vice Chair — Contact" optional value={state.viceChairContact} onChange={(v) => update({ viceChairContact: v })} />
          </TwoCol>
          <TwoCol>
            <TextField label="Executive Director — Name" optional value={state.execDirectorName} onChange={(v) => update({ execDirectorName: v })} />
            <TextField label="Executive Director — Contact" optional value={state.execDirectorContact} onChange={(v) => update({ execDirectorContact: v })} />
          </TwoCol>
          <TextField
            label="Lead Spokesperson"
            optional
            value={state.leadSpokesperson}
            onChange={(v) => update({ leadSpokesperson: v })}
            help="Used by Form 2 voice & tone. Falls back to Party Chair if blank."
          />
        </>
      )}

      <TwoCol>
        <TextField label="Treasurer — Name" value={state.treasurerName} onChange={(v) => update({ treasurerName: v })} help="Required for FEC-registered entities." />
        <TextField label="Treasurer — Contact" value={state.treasurerContact} onChange={(v) => update({ treasurerContact: v })} />
      </TwoCol>
    </Section>
  );
}

/* ─────────── F. Primary / Secondary Contacts ─────────── */
export function SectionContacts() {
  const { state, update, subjectChosen } = useIntake();
  if (!subjectChosen) return null;
  return (
    <Section defaultOpen index="F" title="Primary &amp; Secondary Contacts">
      <RadioGroup
        label="Same person for Primary and Secondary?"
        value={state.samePersonContacts}
        onChange={(v) => update({ samePersonContacts: v })}
        options={YES_NO}
      />
      <TwoCol>
        <TextField label="Primary Contact Name" value={state.primaryName} onChange={(v) => update({ primaryName: v })} />
        <TextField label="Primary Contact Email" type="email" value={state.primaryEmail} onChange={(v) => update({ primaryEmail: v })} />
      </TwoCol>
      <TextField label="Primary Contact Phone" type="tel" value={state.primaryPhone} onChange={(v) => update({ primaryPhone: v })} />
      {state.samePersonContacts === 'No' && (
        <>
          <TwoCol>
            <TextField label="Secondary Contact Name" value={state.secondaryName} onChange={(v) => update({ secondaryName: v })} />
            <TextField label="Secondary Contact Email" type="email" value={state.secondaryEmail} onChange={(v) => update({ secondaryEmail: v })} />
          </TwoCol>
          <TextField label="Secondary Contact Phone" type="tel" value={state.secondaryPhone} onChange={(v) => update({ secondaryPhone: v })} />
        </>
      )}
    </Section>
  );
}

/* ─────────── G. Domain & DNS (secrets) ─────────── */
export function SectionDomainDns() {
  const { state, secrets, update, updateSecret, subjectChosen } = useIntake();
  if (!subjectChosen) return null;
  return (
    <Section
      index="G"
      title="Domain &amp; DNS"
      subtitle="Only needed if Operation 1776 is handling domain connection or DNS changes. Anything marked SECRET is stored in a separate restricted-access table."
    >
      <TextField
        label="Primary Domain Name"
        value={state.primaryDomain}
        onChange={(v) => update({ primaryDomain: v })}
        placeholder="yourcampaign.com"
      />
      <TextField
        label="Current DNS Provider"
        optional
        value={state.currentDnsProvider}
        onChange={(v) => update({ currentDnsProvider: v })}
        placeholder="GoDaddy, Cloudflare, Namecheap…"
      />
      <TwoCol>
        <TextField
          label="Registrar Username"
          secret
          value={secrets.registrarUsername}
          onChange={(v) => updateSecret({ registrarUsername: v })}
        />
        <TextField
          label="Registrar Password"
          secret
          value={secrets.registrarPassword}
          onChange={(v) => updateSecret({ registrarPassword: v })}
          help='If you prefer, write "Will provide later."'
        />
      </TwoCol>
      <RadioGroup
        label="Is the registrar login secured with 2FA?"
        value={secrets.registrar2faEnabled}
        onChange={(v) => updateSecret({ registrar2faEnabled: v })}
        options={YES_NO_NA}
      />
      {secrets.registrar2faEnabled === 'Yes' && (
        <TextField
          label="Registrar 2FA Owner — Contact Info"
          secret
          value={secrets.registrar2faOwner}
          onChange={(v) => updateSecret({ registrar2faOwner: v })}
          help="Needed so setup doesn't stall if 2FA codes go to someone else's phone or email."
        />
      )}
      <TextField
        label="DNS Admin Access"
        secret
        optional
        value={secrets.dnsAdminAccess}
        onChange={(v) => updateSecret({ dnsAdminAccess: v })}
        help="Login or delegated access for the DNS provider, if different."
      />
    </Section>
  );
}

/* ─────────── H. Email Infrastructure (secrets) ─────────── */
export function SectionEmailInfra() {
  const { secrets, updateSecret, subjectChosen } = useIntake();
  if (!subjectChosen) return null;
  return (
    <Section defaultOpen index="H" title="Email Infrastructure">
      <TwoCol>
        <TextField
          label="Email Admin Username"
          secret
          value={secrets.emailAdminUsername}
          onChange={(v) => updateSecret({ emailAdminUsername: v })}
          placeholder="e.g. admin@op1776.com"
        />
        <TextField
          label="Email Admin Password"
          secret
          value={secrets.emailAdminPassword}
          onChange={(v) => updateSecret({ emailAdminPassword: v })}
        />
      </TwoCol>
      <RadioGroup
        label="Email admin 2FA enabled?"
        value={secrets.emailAdmin2faEnabled}
        onChange={(v) => updateSecret({ emailAdmin2faEnabled: v })}
        options={YES_NO_NA}
      />
      {secrets.emailAdmin2faEnabled === 'Yes' && (
        <TextField
          label="Email Admin 2FA Owner — Contact Info"
          secret
          value={secrets.emailAdmin2faOwner}
          onChange={(v) => updateSecret({ emailAdmin2faOwner: v })}
        />
      )}
    </Section>
  );
}

/* ─────────── I. Existing Site, Hosting (with NEW hosting field) ─────────── */
export function SectionHosting() {
  const { state, secrets, update, updateSecret, subjectChosen } = useIntake();
  if (!subjectChosen) return null;
  return (
    <Section defaultOpen index="I" title="Existing Site &amp; Hosting">
      {state.websiteLive === 'Yes' && (
        <>
          <TextField
            label="Existing CMS / Host"
            value={state.existingCmsHost}
            onChange={(v) => update({ existingCmsHost: v })}
            placeholder="WordPress, Squarespace, Wix…"
          />
          <TextArea
            label="Existing Site Admin Credentials"
            secret
            value={secrets.existingSiteAdminCredentials}
            onChange={(v) => updateSecret({ existingSiteAdminCredentials: v })}
          />
        </>
      )}

      <TwoCol>
        <TextField
          label="New Site Hosting Provider"
          value={state.newSiteHostingProvider}
          onChange={(v) => update({ newSiteHostingProvider: v })}
          placeholder="WP Engine, Vercel, Netlify, GoDaddy hosting plan, AWS…"
          help="Where the new site will actually live (distinct from registrar)."
        />
        <TextArea
          label="New Site Hosting — Admin Access"
          secret
          value={secrets.newSiteHostingAdminAccess}
          onChange={(v) => updateSecret({ newSiteHostingAdminAccess: v })}
          help="Login URL + credentials, or delegated access notes."
        />
      </TwoCol>

      <RadioGroup
        label="Will there be an e-commerce store?"
        value={state.ecommerceStore}
        onChange={(v) => update({ ecommerceStore: v })}
        options={YES_NO}
      />
      {state.ecommerceStore === 'Yes' && (
        <>
          <Select
            label="E-commerce Platform"
            value={state.paymentProvider}
            onChange={(v) => update({ paymentProvider: v })}
            options={ECOMMERCE_PLATFORMS}
          />
          <TextArea
            label="E-commerce Store Admin Access"
            secret
            value={secrets.ecommerceStoreAdminAccess}
            onChange={(v) => updateSecret({ ecommerceStoreAdminAccess: v })}
          />
        </>
      )}

      <Select
        label="Payment Provider (for donations)"
        value={state.paymentProvider}
        onChange={(v) => update({ paymentProvider: v })}
        options={PAYMENT_PROVIDERS}
      />
      <TextArea
        label="Payment Provider Account Access"
        secret
        optional
        value={secrets.paymentProviderAccess}
        onChange={(v) => updateSecret({ paymentProviderAccess: v })}
      />
    </Section>
  );
}

/* ─────────── J. Data & CRM ─────────── */
export function SectionDataCrm() {
  const { state, secrets, update, updateSecret, isParty, subjectChosen } = useIntake();
  if (!subjectChosen) return null;
  return (
    <Section defaultOpen index="J" title="Data &amp; CRM Systems">
      <TextArea
        label="Voter File / VAN Access"
        secret
        optional
        value={secrets.voterFileAccess}
        onChange={(v) => updateSecret({ voterFileAccess: v })}
      />
      <TwoCol>
        <Select
          label="Donor CRM Platform"
          value={state.donorCrmPlatform}
          onChange={(v) => update({ donorCrmPlatform: v })}
          options={DONOR_CRMS}
        />
        <TextArea
          label="Donor CRM Access"
          secret
          optional
          value={secrets.donorCrmAccess}
          onChange={(v) => updateSecret({ donorCrmAccess: v })}
        />
      </TwoCol>
      {isParty && (
        <TwoCol>
          <TextField
            label="Membership Database Platform"
            value={state.membershipDbPlatform}
            onChange={(v) => update({ membershipDbPlatform: v })}
            placeholder="NationBuilder, custom, etc."
          />
          <TextArea
            label="Membership Database Access"
            secret
            value={secrets.membershipDbAccess}
            onChange={(v) => updateSecret({ membershipDbAccess: v })}
          />
        </TwoCol>
      )}
      <TwoCol>
        <Select
          label="Email Marketing Platform"
          value={state.emailMarketingPlatform}
          onChange={(v) => update({ emailMarketingPlatform: v })}
          options={EMAIL_MARKETING_PLATFORMS}
        />
        <TextArea
          label="Email Marketing Platform Access"
          secret
          optional
          value={secrets.emailMarketingAccess}
          onChange={(v) => updateSecret({ emailMarketingAccess: v })}
        />
      </TwoCol>
      <TextArea
        label="Data-sharing agreements (operational)"
        optional
        value={state.dataSharingAgreementsOps}
        onChange={(v) => update({ dataSharingAgreementsOps: v })}
        help="Free text — partners + scope. Form 3 captures the public-facing version."
      />
    </Section>
  );
}

/* ─────────── K. User Provisioning (repeating block) ─────────── */
export function SectionUsers() {
  const { state, updateRepeating, addRepeating, removeRepeating, subjectChosen } = useIntake();
  if (!subjectChosen) return null;
  return (
    <Section defaultOpen index="K" title="User Provisioning" subtitle="Add anyone who needs login access to the new site.">
      <RepeatingBlock
        items={state.users}
        onAdd={() => addRepeating('users', { name: '', email: '', accessLevel: '', role: '' })}
        onRemove={(i) => removeRepeating('users', i)}
        addLabel="Add another user"
        renderRow={(row, i) => (
          <>
            <TwoCol>
              <TextField
                label={`User ${i + 1} — Full Name`}
                value={row.name}
                onChange={(v) => updateRepeating('users', i, { name: v })}
              />
              <TextField
                label="Email"
                type="email"
                value={row.email}
                onChange={(v) => updateRepeating('users', i, { email: v })}
              />
            </TwoCol>
            <TwoCol>
              <Select
                label="Access Level"
                value={row.accessLevel}
                onChange={(v) => updateRepeating('users', i, { accessLevel: v })}
                options={USER_ACCESS_LEVELS}
              />
              <Select
                label="Functional Role"
                value={row.role}
                onChange={(v) => updateRepeating('users', i, { role: v })}
                options={USER_ROLES}
              />
            </TwoCol>
          </>
        )}
      />
    </Section>
  );
}

/* ─────────── M. Project Operations ─────────── */
export function SectionProjectOps() {
  const { state, update, updateRepeating, addRepeating, removeRepeating, subjectChosen } = useIntake();
  if (!subjectChosen) return null;
  return (
    <Section defaultOpen index="M" title="Project Operations">
      <TextField
        label="Launch deadline / target date"
        type="date"
        value={state.launchDeadline}
        onChange={(v) => update({ launchDeadline: v })}
        help="Hard date the site must be live."
      />
      <RepeatingBlock
        label="Hard Milestones"
        help="Filing deadline, debate dates, primary, convention. Feeds Form 3 events calendar."
        items={state.hardMilestones}
        onAdd={() => addRepeating('hardMilestones', { name: '', date: '' })}
        onRemove={(i) => removeRepeating('hardMilestones', i)}
        addLabel="Add another milestone"
        renderRow={(row, i) => (
          <TwoCol>
            <TextField
              label="Milestone"
              value={row.name}
              onChange={(v) => updateRepeating('hardMilestones', i, { name: v })}
              placeholder="e.g. Filing deadline"
            />
            <TextField
              label="Date"
              type="date"
              value={row.date}
              onChange={(v) => updateRepeating('hardMilestones', i, { date: v })}
            />
          </TwoCol>
        )}
      />
      <TwoCol>
        <TextField
          label="After-hours / crisis contact — name"
          value={state.afterHoursName}
          onChange={(v) => update({ afterHoursName: v })}
        />
        <TextField
          label="After-hours / crisis contact — phone"
          type="tel"
          value={state.afterHoursPhone}
          onChange={(v) => update({ afterHoursPhone: v })}
        />
      </TwoCol>
      <TwoCol>
        <TextField
          label="Crisis spokesperson / rapid-response lead — name"
          value={state.crisisLeadName}
          onChange={(v) => update({ crisisLeadName: v })}
        />
        <TextField
          label="Crisis spokesperson — contact"
          value={state.crisisLeadContact}
          onChange={(v) => update({ crisisLeadContact: v })}
        />
      </TwoCol>
    </Section>
  );
}

/* ─────────── N. Analytics & Ad Accounts (all secrets) ─────────── */
export function SectionAnalyticsAds() {
  const { secrets, updateSecret, subjectChosen } = useIntake();
  if (!subjectChosen) return null;
  return (
    <Section defaultOpen index="N" title="Analytics &amp; Ad Accounts" subtitle="All access notes are stored as secrets with strict RLS.">
      <TwoCol>
        <TextArea label="GA4 access" secret optional value={secrets.ga4Access} onChange={(v) => updateSecret({ ga4Access: v })} help="Property ID + delegated access" />
        <TextArea label="Google Tag Manager access" secret optional value={secrets.gtmAccess} onChange={(v) => updateSecret({ gtmAccess: v })} help="Container ID + delegated access" />
      </TwoCol>
      <TwoCol>
        <TextArea label="Google Search Console access" secret optional value={secrets.searchConsoleAccess} onChange={(v) => updateSecret({ searchConsoleAccess: v })} />
        <TextArea label="Meta Pixel + Business Manager access" secret optional value={secrets.metaPixelAccess} onChange={(v) => updateSecret({ metaPixelAccess: v })} help="Pixel ID + BM admin access" />
      </TwoCol>
      <TextArea label="Google Ads account access" secret optional value={secrets.googleAdsAccess} onChange={(v) => updateSecret({ googleAdsAccess: v })} help="Customer ID + delegated access" />
    </Section>
  );
}

/* ─────────── O. SMS & Email Compliance ─────────── */
export function SectionCompliance() {
  const { state, secrets, update, updateSecret, subjectChosen } = useIntake();
  if (!subjectChosen) return null;
  return (
    <Section defaultOpen index="O" title="SMS &amp; Email Compliance">
      <TextArea
        label="10DLC brand registration info"
        secret
        optional
        value={secrets['10dlcBrandRegistrationInfo']}
        onChange={(v) => updateSecret({ '10dlcBrandRegistrationInfo': v })}
        help="EIN, business legal name, vertical, SMS use case."
      />
      <TextArea
        label="SMS opt-in language preferences"
        optional
        value={state.smsOptInLanguage}
        onChange={(v) => update({ smsOptInLanguage: v })}
        help="Exact wording shown at opt-in."
      />
      <TextArea
        label="Email deliverability — SPF / DKIM / DMARC"
        secret
        optional
        value={secrets.emailDeliverabilitySpfDkimDmarc}
        onChange={(v) => updateSecret({ emailDeliverabilitySpfDkimDmarc: v })}
        help="Current ownership + records state."
      />
      <TwoCol>
        <TextField
          label="Sender 'From' name"
          value={state.senderFromName}
          onChange={(v) => update({ senderFromName: v })}
          help="Display name on outgoing email."
        />
        <TextField
          label="Physical mailing address (CAN-SPAM)"
          optional
          value={state.canSpamAddressOverride}
          onChange={(v) => update({ canSpamAddressOverride: v })}
          help="Override; defaults to Section B mailing address."
        />
      </TwoCol>
    </Section>
  );
}

/* ─────────── P. Filing & Ballot Access (candidate-only) ─────────── */
export function SectionFiling() {
  const { state, secrets, update, updateSecret, isCandidate } = useIntake();
  if (!isCandidate) return null;
  return (
    <Section defaultOpen index="P" title="Filing &amp; Ballot Access">
      <RadioGroup
        label="Filed for office?"
        value={state.filedForOffice}
        onChange={(v) => update({ filedForOffice: v })}
        options={YES_NO_INPROGRESS}
      />
      <TwoCol>
        <TextField
          label="Filing deadline"
          type="date"
          value={state.filingDeadline}
          onChange={(v) => update({ filingDeadline: v })}
        />
        <TextField
          label="Ballot name (exact spelling)"
          value={state.ballotName}
          onChange={(v) => update({ ballotName: v })}
        />
      </TwoCol>
      <RadioGroup
        label="Petition signature drive needed?"
        value={state.petitionDriveNeeded}
        onChange={(v) => update({ petitionDriveNeeded: v })}
        options={YES_NO}
      />
      {state.petitionDriveNeeded === 'Yes' && (
        <TextField
          label="Signatures required + deadline"
          value={state.signaturesAndDeadline}
          onChange={(v) => update({ signaturesAndDeadline: v })}
          placeholder="e.g. 1500 by 2026-08-15"
        />
      )}
      <TextArea
        label="Filing paperwork notes / uploads"
        secret
        optional
        value={secrets.filingPaperworkUploads}
        onChange={(v) => updateSecret({ filingPaperworkUploads: v })}
        help="Note: uploads are added in v1 — for now, paste links to files in Drive/Dropbox here. Treated as secret."
      />
    </Section>
  );
}

/* ─────────── Q. Party Membership & Affiliates (party-only) ─────────── */
export function SectionPartyMembership() {
  const { state, secrets, update, updateSecret, isParty } = useIntake();
  if (!isParty) return null;
  return (
    <Section defaultOpen index="Q" title="Party Membership &amp; Affiliates">
      <TwoCol>
        <Select
          label="Member portal platform"
          value={state.memberPortalPlatform}
          onChange={(v) => update({ memberPortalPlatform: v })}
          options={MEMBER_PORTAL_PLATFORMS}
        />
        <TextArea
          label="Member portal access"
          secret
          value={secrets.memberPortalAccess}
          onChange={(v) => updateSecret({ memberPortalAccess: v })}
        />
      </TwoCol>
      <RadioGroup
        label="Membership application workflow"
        value={state.membershipApplicationWorkflow}
        onChange={(v) => update({ membershipApplicationWorkflow: v })}
        options={MEMBERSHIP_WORKFLOWS}
      />
      {state.membershipApplicationWorkflow === 'Application + approval' && (
        <TextField
          label="Membership approver — name & contact"
          value={state.membershipApprover}
          onChange={(v) => update({ membershipApprover: v })}
        />
      )}
      <TextArea
        label="Affiliated candidate intake process"
        optional
        value={state.affiliatedCandidateIntake}
        onChange={(v) => update({ affiliatedCandidateIntake: v })}
        help="Free text — how candidates get added to the party."
      />
      <TextField
        label="Affiliated candidate approver — name & contact"
        optional
        value={state.affiliatedCandidateApprover}
        onChange={(v) => update({ affiliatedCandidateApprover: v })}
      />
      {(state.partyScope === 'multi-state' || state.partyScope === 'national') && (
        <>
          <TextArea
            label="State chapter onboarding process"
            optional
            value={state.stateChapterOnboardingProcess}
            onChange={(v) => update({ stateChapterOnboardingProcess: v })}
          />
          <TextField
            label="State chapter onboarding contact"
            optional
            value={state.stateChapterOnboardingContact}
            onChange={(v) => update({ stateChapterOnboardingContact: v })}
          />
        </>
      )}
      <TextField
        label="Affiliated PACs / Allied Committees"
        optional
        value={state.affiliatedPacs}
        onChange={(v) => update({ affiliatedPacs: v })}
        help="Free-text list."
      />
    </Section>
  );
}

/* ─────────── R. Coalition Outreach (both, repeating) ─────────── */
export function SectionCoalition() {
  const { state, updateRepeating, addRepeating, removeRepeating, subjectChosen } = useIntake();
  if (!subjectChosen) return null;
  return (
    <Section defaultOpen index="R" title="Coalition Outreach Leads" subtitle="Add the lead point of contact for each coalition you actively work with.">
      <RepeatingBlock
        items={state.coalitionLeads}
        onAdd={() => addRepeating('coalitionLeads', { category: '', name: '', contact: '' })}
        onRemove={(i) => removeRepeating('coalitionLeads', i)}
        addLabel="Add another coalition lead"
        renderRow={(row, i) => (
          <>
            <Select
              label="Category"
              value={row.category}
              onChange={(v) => updateRepeating('coalitionLeads', i, { category: v })}
              options={COALITION_CATEGORIES}
            />
            <TwoCol>
              <TextField
                label="Lead Name"
                value={row.name}
                onChange={(v) => updateRepeating('coalitionLeads', i, { name: v })}
              />
              <TextField
                label="Contact"
                value={row.contact}
                onChange={(v) => updateRepeating('coalitionLeads', i, { contact: v })}
                placeholder="Email + phone"
              />
            </TwoCol>
          </>
        )}
      />
    </Section>
  );
}

/* ─────────── S. Party Governance Ops (party-only) ─────────── */
export function SectionPartyGovernance() {
  const { state, secrets, update, updateSecret, updateRepeating, addRepeating, removeRepeating, isParty } = useIntake();
  if (!isParty) return null;
  return (
    <Section defaultOpen index="S" title="Party Governance Ops">
      <RepeatingBlock
        label="Internal committee chairs"
        items={state.internalCommitteeChairs}
        onAdd={() => addRepeating('internalCommitteeChairs', { committee: '', chairName: '', contact: '' })}
        onRemove={(i) => removeRepeating('internalCommitteeChairs', i)}
        addLabel="Add another committee"
        renderRow={(row, i) => (
          <>
            <TextField
              label="Committee"
              value={row.committee}
              onChange={(v) => updateRepeating('internalCommitteeChairs', i, { committee: v })}
              placeholder="Platform, Rules, Credentials, Finance…"
            />
            <TwoCol>
              <TextField
                label="Chair Name"
                value={row.chairName}
                onChange={(v) => updateRepeating('internalCommitteeChairs', i, { chairName: v })}
              />
              <TextField
                label="Contact"
                value={row.contact}
                onChange={(v) => updateRepeating('internalCommitteeChairs', i, { contact: v })}
              />
            </TwoCol>
          </>
        )}
      />
      <TextField
        label="Candidate recruitment lead — name & contact"
        optional
        value={state.candidateRecruitmentLead}
        onChange={(v) => update({ candidateRecruitmentLead: v })}
      />
      <TextArea
        label="Press list / media database access"
        secret
        optional
        value={secrets.pressListAccess}
        onChange={(v) => updateSecret({ pressListAccess: v })}
      />
    </Section>
  );
}

/* ─────────── F2. Counsel ─────────── */
export function SectionCounsel() {
  const { state, update, subjectChosen } = useIntake();
  if (!subjectChosen) return null;
  return (
    <Section defaultOpen index="T" title="Counsel">
      <TwoCol>
        <TextField
          label="Campaign / General Counsel — Name"
          optional
          value={state.counselName}
          onChange={(v) => update({ counselName: v })}
        />
        <TextField
          label="Counsel — Contact"
          optional
          value={state.counselContact}
          onChange={(v) => update({ counselContact: v })}
          placeholder="Email + phone"
        />
      </TwoCol>
    </Section>
  );
}

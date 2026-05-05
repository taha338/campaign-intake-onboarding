/**
 * Generate a downloadable PDF summary of a Form 1 (Campaign Intake)
 * submission. Uses jsPDF directly with text rendering — avoids
 * html2canvas and its CSS parsing quirks.
 */
import { jsPDF } from 'jspdf';

const PAGE_W = 595;   // A4 portrait in pt
const PAGE_H = 842;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

const COL = {
  ink:   '#1a1a1a',
  red:   '#a61e22',
  black: '#000000',
  muted: '#6b6b6b',
};

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function generateIntakePdf(state, secrets) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = MARGIN;

  const newPageIfNeeded = (needed = 80) => {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const drawDivider = () => {
    doc.setDrawColor(...hexToRgb(COL.red));
    doc.setLineWidth(2);
    doc.line(MARGIN, y, MARGIN + 60, y);
    y += 12;
  };

  const drawTitle = (text) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(COL.black));
    doc.setFontSize(20);
    doc.text(text, MARGIN, y);
    y += 28;
  };

  const drawSubtitle = (text) => {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...hexToRgb(COL.muted));
    doc.setFontSize(11);
    doc.text(text, MARGIN, y);
    y += 18;
  };

  const drawSectionHeader = (text) => {
    newPageIfNeeded(60);
    y += 12;
    drawDivider();
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(COL.black));
    doc.setFontSize(14);
    doc.text(text.toUpperCase(), MARGIN, y);
    y += 22;
  };

  const drawField = (label, value) => {
    if (value === undefined || value === null || value === '') return;
    const display = formatValue(value);
    if (!display) return;
    newPageIfNeeded(40);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(COL.muted));
    doc.setFontSize(9);
    doc.text(label.toUpperCase(), MARGIN, y);
    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(COL.ink));
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(display, CONTENT_W);
    for (const line of lines) {
      newPageIfNeeded(14);
      doc.text(line, MARGIN, y);
      y += 14;
    }
    y += 6;
  };

  // ── Cover ──
  drawTitle('Campaign Intake');
  drawSubtitle(`Operation 1776 · client ${state.clientId || '—'}  ·  generated ${new Date().toLocaleString()}`);
  y += 10;

  // ── Stage A: Subject & Submitter ──
  drawSectionHeader('A · Subject & Submitter');
  drawField('Subject Type', state.subjectType);
  drawField('Submitter Name', state.submitterName);
  drawField('Submitter Email', state.submitterEmail);
  drawField('Submitter Role', state.submitterRole);
  drawField('Referral Source', state.referralSource);

  // ── Stage B: Organization ──
  drawSectionHeader('B · Organization');
  drawField('Legal Name', state.orgLegalName);
  drawField('Display / Operation Name', state.displayName);
  drawField('Organization Type', state.orgType);
  drawField('EIN / Tax ID', state.ein);
  drawField('FEC ID / State Committee ID', state.fecId);
  drawField('Mailing Address', state.mailingAddress);
  drawField('Organization Phone', state.orgPhone);
  drawField('Organization Email', state.orgEmail);
  drawField('Time Zone', state.timeZone);

  // ── Stage C: Race / Party Identity ──
  if (state.subjectType === 'candidate') {
    drawSectionHeader('C · Race & Jurisdiction');
    drawField('Candidate Full Legal Name', state.candidateFullLegalName);
    drawField('Office Sought', state.officeSought);
    drawField('State', state.candState);
    drawField('District', state.district);
    drawField('Election Year', state.electionYear);
    drawField('Partisan Race', state.partisanRace);
  } else if (state.subjectType === 'party') {
    drawSectionHeader('C · Party Identity');
    drawField('Party Name', state.partyName);
    drawField('Party Acronym', state.partyAcronym);
    drawField('Party Type', state.partyType);
    drawField('Party Type — Other', state.partyTypeOther);
    drawField('Party Scope', state.partyScope);
    drawField('Primary State', state.primaryStateParty);
    drawField('States Covered', state.statesCovered);
    drawField('City / County', state.cityCounty);
    drawField('Founded Year', state.foundedYear);
    drawField('Affiliated PACs / Committees', state.affiliatedPacs);
  }

  // ── Stage D: Web Presence ──
  drawSectionHeader('D · Web Presence');
  drawField('Primary Website', state.primaryWebsite);
  drawField('Website Live?', state.websiteLive);
  drawField('Donate Link', state.donateLink);
  drawField('Volunteer Link', state.volunteerLink);
  drawField('Membership / Join Link', state.membershipLink);
  drawField('Subdomains for Chapters', state.subdomainsForChapters);
  drawField('Preferred Area Codes', state.preferredAreaCodes);

  // ── Stage E: Key People ──
  drawSectionHeader('E · Key People');
  drawField('Campaign Manager', state.campaignManagerName);
  drawField('Campaign Manager Contact', state.campaignManagerContact);
  drawField('Field Director', state.fieldDirectorName);
  drawField('Field Director Contact', state.fieldDirectorContact);
  drawField('Communications Director', state.commsDirectorName);
  drawField('Communications Director Contact', state.commsDirectorContact);
  drawField('Party Chair', state.partyChairName);
  drawField('Party Chair Contact', state.partyChairContact);
  drawField('Vice Chair', state.viceChairName);
  drawField('Vice Chair Contact', state.viceChairContact);
  drawField('Executive Director', state.execDirectorName);
  drawField('Executive Director Contact', state.execDirectorContact);
  drawField('Treasurer', state.treasurerName);
  drawField('Treasurer Contact', state.treasurerContact);
  drawField('Lead Spokesperson', state.leadSpokesperson);

  // ── Stage F: Contacts ──
  drawSectionHeader('F · Primary & Secondary Contacts');
  drawField('Same Person?', state.samePersonContacts);
  drawField('Primary Contact', state.primaryName);
  drawField('Primary Email', state.primaryEmail);
  drawField('Primary Phone', state.primaryPhone);
  drawField('Secondary Contact', state.secondaryName);
  drawField('Secondary Email', state.secondaryEmail);
  drawField('Secondary Phone', state.secondaryPhone);

  // ── Stage G/H/I: Domain, Email, Hosting ──
  if (state.optInDomainHostingEmail === 'yes') {
    drawSectionHeader('G–I · Domain, Email, Hosting');
    drawField('Primary Domain', state.primaryDomain);
    drawField('Current DNS Provider', state.currentDnsProvider);
    drawField('Existing CMS / Host', state.existingCmsHost);
    drawField('E-commerce Store?', state.ecommerceStore);
    drawField('Payment Provider', state.paymentProvider);
    drawField('New Site Hosting Provider', state.newSiteHostingProvider);
    if (secrets) {
      drawField('Registrar Username', secrets.registrarUsername ? '••••• (stored encrypted)' : '');
      drawField('Email Admin Username', secrets.emailAdminUsername ? '••••• (stored encrypted)' : '');
    }
  } else if (state.optInDomainHostingEmail === 'no') {
    drawSectionHeader('G–I · Domain, Email, Hosting');
    drawField('', 'Skipped — Op1776 not managing these systems.');
  }

  // ── Stage J/K/M: Data, Users, Project Ops ──
  if (state.optInDataUsersOps === 'yes') {
    drawSectionHeader('J–M · Data, Users & Project Ops');
    drawField('Donor CRM', state.donorCrmPlatform);
    drawField('Membership Database Platform', state.membershipDbPlatform);
    drawField('Email Marketing Platform', state.emailMarketingPlatform);
    drawField('Data-sharing Agreements', state.dataSharingAgreementsOps);
    drawField('Launch Deadline', state.launchDeadline);
    drawField('After-hours Contact', `${state.afterHoursName || ''} ${state.afterHoursPhone || ''}`.trim());
    drawField('Crisis Lead', `${state.crisisLeadName || ''} ${state.crisisLeadContact || ''}`.trim());
    if (state.users && state.users.some((u) => u.name || u.email)) {
      const userLines = state.users
        .filter((u) => u.name || u.email)
        .map((u, i) => `${i + 1}. ${u.name || '?'} (${u.email || '?'}) — ${u.accessLevel || '?'} / ${u.role || '?'}`)
        .join('\n');
      drawField('Users', userLines);
    }
    if (state.hardMilestones && state.hardMilestones.some((m) => m.name || m.date)) {
      const ms = state.hardMilestones
        .filter((m) => m.name || m.date)
        .map((m) => `• ${m.name || '?'} — ${m.date || '?'}`)
        .join('\n');
      drawField('Hard Milestones', ms);
    }
  }

  // ── Stage N/O: Compliance ──
  drawSectionHeader('N–O · Compliance & Analytics');
  drawField('Sender From Name', state.senderFromName);
  drawField('SMS Opt-in Language', state.smsOptInLanguage);
  drawField('CAN-SPAM Address Override', state.canSpamAddressOverride);

  // ── Stage P/Q/R/S: Subject extras ──
  if (state.subjectType === 'candidate') {
    drawSectionHeader('P · Filing & Ballot Access');
    drawField('Filed for Office?', state.filedForOffice);
    drawField('Filing Deadline', state.filingDeadline);
    drawField('Ballot Name', state.ballotName);
    drawField('Petition Drive Needed?', state.petitionDriveNeeded);
    drawField('Signatures + Deadline', state.signaturesAndDeadline);
  }
  if (state.subjectType === 'party') {
    drawSectionHeader('Q · Party Membership & Affiliates');
    drawField('Member Portal Platform', state.memberPortalPlatform);
    drawField('Membership Application Workflow', state.membershipApplicationWorkflow);
    drawField('Membership Approver', state.membershipApprover);
    drawField('Affiliated Candidate Intake', state.affiliatedCandidateIntake);
    drawField('Affiliated Candidate Approver', state.affiliatedCandidateApprover);
    drawField('State Chapter Onboarding', state.stateChapterOnboardingProcess);
    drawField('State Chapter Onboarding Contact', state.stateChapterOnboardingContact);

    drawSectionHeader('S · Party Governance Ops');
    drawField('Candidate Recruitment Lead', state.candidateRecruitmentLead);
    if (state.internalCommitteeChairs && state.internalCommitteeChairs.some((c) => c.committee || c.chairName)) {
      const cs = state.internalCommitteeChairs
        .filter((c) => c.committee || c.chairName)
        .map((c) => `• ${c.committee || '?'} — ${c.chairName || '?'} (${c.contact || ''})`)
        .join('\n');
      drawField('Internal Committee Chairs', cs);
    }
  }

  if (state.coalitionLeads && state.coalitionLeads.some((c) => c.name || c.contact)) {
    drawSectionHeader('R · Coalition Outreach');
    const cs = state.coalitionLeads
      .filter((c) => c.name || c.contact)
      .map((c) => `• [${c.category || '?'}] ${c.name || '?'} — ${c.contact || ''}`)
      .join('\n');
    drawField('Coalition Leads', cs);
  }

  // ── Counsel ──
  drawSectionHeader('T · Counsel');
  drawField('Counsel Name', state.counselName);
  drawField('Counsel Contact', state.counselContact);

  // ── Footer note ──
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...hexToRgb(COL.muted));
  doc.setFontSize(9);
  newPageIfNeeded(30);
  y += 10;
  doc.text('Operation 1776 — Rooted in Freedom. Driven by Purpose.', MARGIN, y);

  // Save
  const fileName = `${state.clientId || 'campaign-intake'}-summary.pdf`;
  doc.save(fileName);
}

function formatValue(v) {
  if (Array.isArray(v)) return v.filter(Boolean).join(', ');
  if (typeof v === 'object' && v !== null) return JSON.stringify(v, null, 2);
  return String(v).trim();
}

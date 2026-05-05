/**
 * Dropdown / multi-select options used across the form.
 * Mirrors the options in the matching ClickUp custom fields.
 */

export const SUBJECT_TYPES = [
  { id: 'candidate', label: 'Candidate', desc: 'An individual running for office' },
  { id: 'party',     label: 'Party / Movement', desc: 'A party, coalition, or political organization' },
];

export const SUBMITTER_ROLES = [
  'Candidate',
  'Campaign Manager',
  'Party Chair',
  'Vice Chair',
  'Executive Director',
  'Treasurer',
  'Communications Director',
  'Field Director',
  'Vendor / Consultant',
  'Other',
];

export const ORGANIZATION_TYPES = [
  'Candidate Committee',
  'State Party',
  'County Party',
  'National Party',
  'PAC',
  '501(c)(4)',
  '501(c)(3)',
  'LLC',
  'Other',
];

export const PARTY_TYPES = [
  { id: 'republican',    label: 'Republican Party' },
  { id: 'america-first', label: 'America First / MAGA' },
  { id: 'non-partisan',  label: 'Non-Partisan' },
  { id: 'independent',   label: 'Independent' },
  { id: 'third-party',   label: 'Third Party' },
  { id: 'coalition',     label: 'Coalition / Movement' },
  { id: 'other',         label: 'Other' },
];

export const PARTY_SCOPES = [
  { id: 'national',    label: 'National' },
  { id: 'multi-state', label: 'Multi-State' },
  { id: 'state',       label: 'Statewide' },
  { id: 'local',       label: 'Local / County / City' },
];

export const TIME_ZONES = [
  'Eastern (ET)',
  'Central (CT)',
  'Mountain (MT)',
  'Pacific (PT)',
  'Alaska (AKT)',
  'Hawaii (HT)',
  'Other',
];

export const COMMUNICATION_PREFS = ['Email', 'Phone', 'Text/SMS', 'ClickUp'];

export const PARTISAN_RACE_OPTIONS = ['Yes', 'No', 'Nonpartisan'];

export const PAYMENT_PROVIDERS = ['WinRed', 'Anedot', 'Stripe', 'Square', 'PayPal', 'Authorize.Net', 'Other', 'N/A'];

export const ECOMMERCE_PLATFORMS = ['Shopify', 'WooCommerce', 'Bonfire', 'Squarespace Commerce', 'Other', 'N/A'];

export const USER_ACCESS_LEVELS = ['Admin', 'Editor', 'Viewer'];

export const USER_ROLES = [
  'Candidate',
  'Campaign Manager',
  'Finance',
  'Field',
  'Communications',
  'Volunteer Coordinator',
  'Party Chair',
  'Other',
];

export const YES_NO = ['Yes', 'No'];
export const YES_NO_INPROGRESS = ['Yes', 'No', 'In progress'];
export const YES_NO_NA = ['Yes', 'No', 'N/A'];

export const DONOR_CRMS = ['NGP VAN', 'NationBuilder', 'Numero', 'Anedot CRM', 'Other'];
export const EMAIL_MARKETING_PLATFORMS = ['Mailchimp', 'Constant Contact', 'NationBuilder Email', 'Sendgrid', 'Other'];

export const MEMBER_PORTAL_PLATFORMS = ['NationBuilder', 'Custom', 'Other'];
export const MEMBERSHIP_WORKFLOWS = ['Open signup', 'Application + approval', 'Invite only'];

export const COALITION_CATEGORIES = [
  'Faith',
  'Veterans',
  'Seniors',
  'Youth',
  'Latino',
  'Black',
  'AAPI',
  'LGBT',
  'Small Business',
  'Agriculture',
  'Labor',
  'Other',
];

export const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia',
  'Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland',
  'Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
  'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina',
  'South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

export const ELECTION_YEARS = ['2026', '2027', '2028', '2029'];

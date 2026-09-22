export type AgingBuckets = {
  d0_30: number;
  d31_60: number;
  d61_90: number;
  d90_plus: number;
};

export type MonthPoint = {
  month: string;
  sessions: number;
  newPatients: number;
};

export type ChecklistItem = {
  id: string;
  label: string;
  owner: "Pepper" | "Client";
  due: string;
  done: boolean;
  archiveLabel?: string | undefined;
  completedOn?: string | undefined;
};

export type ChecklistPhase = {
  id: string;
  name: string;
  description: string;
  items: ChecklistItem[];
};

export type Practice = {
  id: string;
  name: string;
  location: string;
  ehr: string;
  syncedMinutesAgo: number;
  clinicians: number;
  defaultRate: number;
  monthLabel: string;
  current: {
    sessions: number;
    newPatientsOnboarded: number;
    newPatientAppointments: number;
    patientCancellations: number;
    noShows: number;
    lateCancellations: number;
    therapistCancellations: number;
    patientBalances: number;
    aging: AgingBuckets;
  };
  previous: {
    sessions: number;
    newPatientsOnboarded: number;
    newPatientAppointments: number;
    patientCancellations: number;
    noShows: number;
    lateCancellations: number;
    therapistCancellations: number;
    patientBalances: number;
    agingTotal: number;
  };
  history: MonthPoint[];
  revenueGoal: number;
  asanaBoard: { name: string; syncedMinutesAgo: number };
  onboarding: ChecklistPhase[];
};

export const practices: Practice[] = [
  {
    id: "willow-creek",
    name: "Willow Creek Counseling",
    location: "Austin, TX",
    ehr: "Simple Practice",
    syncedMinutesAgo: 6,
    clinicians: 9,
    defaultRate: 225,
    monthLabel: "September 2026 (month to date)",
    current: {
      sessions: 642,
      newPatientsOnboarded: 38,
      newPatientAppointments: 46,
      patientCancellations: 51,
      noShows: 19,
      lateCancellations: 24,
      therapistCancellations: 11,
      patientBalances: 18420,
      aging: { d0_30: 42100, d31_60: 18650, d61_90: 7400, d90_plus: 3120 },
    },
    previous: {
      sessions: 598,
      newPatientsOnboarded: 31,
      newPatientAppointments: 40,
      patientCancellations: 58,
      noShows: 24,
      lateCancellations: 27,
      therapistCancellations: 14,
      patientBalances: 21050,
      agingTotal: 76300,
    },
    history: [
      { month: "Apr", sessions: 512, newPatients: 22 },
      { month: "May", sessions: 548, newPatients: 26 },
      { month: "Jun", sessions: 571, newPatients: 24 },
      { month: "Jul", sessions: 560, newPatients: 29 },
      { month: "Aug", sessions: 598, newPatients: 31 },
      { month: "Sep", sessions: 642, newPatients: 38 },
    ],
    revenueGoal: 165000,
    asanaBoard: { name: "Willow Creek — Client Onboarding", syncedMinutesAgo: 12 },
    onboarding: [
      {
        id: "agreements",
        name: "Agreements",
        description: "Contracts and paperwork required before work begins.",
        items: [
          {
            id: "msa",
            label: "Sign services agreement",
            owner: "Client",
            due: "Aug 4",
            done: true,
            archiveLabel: "Services Agreement (signed)",
            completedOn: "Aug 3, 2026",
          },
          {
            id: "baa",
            label: "Sign HIPAA business associate agreement",
            owner: "Client",
            due: "Aug 4",
            done: true,
            archiveLabel: "HIPAA BAA (signed)",
            completedOn: "Aug 3, 2026",
          },
          {
            id: "w9",
            label: "Return completed W-9",
            owner: "Client",
            due: "Aug 8",
            done: true,
            archiveLabel: "W-9 2026",
            completedOn: "Aug 7, 2026",
          },
        ],
      },
      {
        id: "credentialing",
        name: "Credentialing",
        description: "Payer enrollment and clinician rosters.",
        items: [
          {
            id: "roster",
            label: "Provide clinician roster with NPIs",
            owner: "Client",
            due: "Aug 12",
            done: true,
            archiveLabel: "Clinician roster v2",
            completedOn: "Aug 11, 2026",
          },
          {
            id: "caqh",
            label: "Grant CAQH access for each clinician",
            owner: "Client",
            due: "Aug 18",
            done: true,
            completedOn: "Aug 19, 2026",
          },
          {
            id: "payers",
            label: "Confirm payer mix and contracted rates",
            owner: "Pepper",
            due: "Aug 25",
            done: true,
            archiveLabel: "Payer mix summary",
            completedOn: "Aug 24, 2026",
          },
        ],
      },
      {
        id: "ehr",
        name: "EHR access",
        description: "Read access so the dashboard can stay live.",
        items: [
          {
            id: "sp-user",
            label: "Create Simple Practice billing user for Pepper",
            owner: "Client",
            due: "Aug 28",
            done: true,
            completedOn: "Aug 27, 2026",
          },
          {
            id: "sp-perms",
            label: "Enable reporting permissions on that user",
            owner: "Client",
            due: "Aug 29",
            done: true,
            completedOn: "Aug 30, 2026",
          },
          {
            id: "sp-verify",
            label: "Verify session data pulls cleanly",
            owner: "Pepper",
            due: "Sep 2",
            done: true,
            completedOn: "Sep 1, 2026",
          },
        ],
      },
      {
        id: "data",
        name: "Data connection",
        description: "Historic data and reconciliation before go-live.",
        items: [
          {
            id: "backlog",
            label: "Import 12 months of historic claims",
            owner: "Pepper",
            due: "Sep 10",
            done: true,
            completedOn: "Sep 9, 2026",
          },
          {
            id: "recon",
            label: "Reconcile opening AR balance",
            owner: "Pepper",
            due: "Sep 18",
            done: false,
          },
          {
            id: "rate",
            label: "Confirm median billing per session",
            owner: "Client",
            due: "Sep 19",
            done: false,
          },
        ],
      },
      {
        id: "training",
        name: "Training",
        description: "Getting the practice team comfortable with the dashboard.",
        items: [
          {
            id: "kickoff",
            label: "Dashboard walkthrough with practice owner",
            owner: "Pepper",
            due: "Sep 24",
            done: false,
          },
          {
            id: "metrics",
            label: "Complete 'what numbers matter to you' questionnaire",
            owner: "Client",
            due: "Sep 24",
            done: false,
          },
          {
            id: "cadence",
            label: "Book recurring monthly review",
            owner: "Client",
            due: "Sep 30",
            done: false,
          },
        ],
      },
    ],
  },
  {
    id: "harborlight",
    name: "Harborlight Therapy Group",
    location: "Portland, OR",
    ehr: "Simple Practice",
    syncedMinutesAgo: 22,
    clinicians: 5,
    defaultRate: 210,
    monthLabel: "September 2026 (month to date)",
    current: {
      sessions: 318,
      newPatientsOnboarded: 21,
      newPatientAppointments: 28,
      patientCancellations: 34,
      noShows: 15,
      lateCancellations: 18,
      therapistCancellations: 9,
      patientBalances: 12760,
      aging: { d0_30: 24800, d31_60: 11200, d61_90: 5100, d90_plus: 1900 },
    },
    previous: {
      sessions: 301,
      newPatientsOnboarded: 17,
      newPatientAppointments: 23,
      patientCancellations: 30,
      noShows: 12,
      lateCancellations: 15,
      therapistCancellations: 7,
      patientBalances: 11340,
      agingTotal: 41200,
    },
    history: [
      { month: "Apr", sessions: 268, newPatients: 14 },
      { month: "May", sessions: 279, newPatients: 15 },
      { month: "Jun", sessions: 288, newPatients: 18 },
      { month: "Jul", sessions: 294, newPatients: 16 },
      { month: "Aug", sessions: 301, newPatients: 17 },
      { month: "Sep", sessions: 318, newPatients: 21 },
    ],
    revenueGoal: 80000,
    asanaBoard: { name: "Harborlight — Client Onboarding", syncedMinutesAgo: 3 },
    onboarding: [
      {
        id: "agreements",
        name: "Agreements",
        description: "Contracts and paperwork required before work begins.",
        items: [
          {
            id: "msa",
            label: "Sign services agreement",
            owner: "Client",
            due: "Sep 8",
            done: true,
            archiveLabel: "Services Agreement (signed)",
            completedOn: "Sep 8, 2026",
          },
          {
            id: "baa",
            label: "Sign HIPAA business associate agreement",
            owner: "Client",
            due: "Sep 8",
            done: true,
            archiveLabel: "HIPAA BAA (signed)",
            completedOn: "Sep 9, 2026",
          },
          { id: "w9", label: "Return completed W-9", owner: "Client", due: "Sep 12", done: false },
        ],
      },
      {
        id: "credentialing",
        name: "Credentialing",
        description: "Payer enrollment and clinician rosters.",
        items: [
          {
            id: "roster",
            label: "Provide clinician roster with NPIs",
            owner: "Client",
            due: "Sep 15",
            done: true,
            completedOn: "Sep 14, 2026",
          },
          {
            id: "caqh",
            label: "Grant CAQH access for each clinician",
            owner: "Client",
            due: "Sep 19",
            done: false,
          },
          {
            id: "payers",
            label: "Confirm payer mix and contracted rates",
            owner: "Pepper",
            due: "Sep 26",
            done: false,
          },
        ],
      },
      {
        id: "ehr",
        name: "EHR access",
        description: "Read access so the dashboard can stay live.",
        items: [
          {
            id: "sp-user",
            label: "Create Simple Practice billing user for Pepper",
            owner: "Client",
            due: "Sep 17",
            done: true,
            completedOn: "Sep 16, 2026",
          },
          {
            id: "sp-perms",
            label: "Enable reporting permissions on that user",
            owner: "Client",
            due: "Sep 18",
            done: false,
          },
          {
            id: "sp-verify",
            label: "Verify session data pulls cleanly",
            owner: "Pepper",
            due: "Sep 22",
            done: false,
          },
        ],
      },
      {
        id: "data",
        name: "Data connection",
        description: "Historic data and reconciliation before go-live.",
        items: [
          {
            id: "backlog",
            label: "Import 12 months of historic claims",
            owner: "Pepper",
            due: "Sep 30",
            done: false,
          },
          {
            id: "recon",
            label: "Reconcile opening AR balance",
            owner: "Pepper",
            due: "Oct 4",
            done: false,
          },
          {
            id: "rate",
            label: "Confirm median billing per session",
            owner: "Client",
            due: "Oct 4",
            done: false,
          },
        ],
      },
      {
        id: "training",
        name: "Training",
        description: "Getting the practice team comfortable with the dashboard.",
        items: [
          {
            id: "kickoff",
            label: "Dashboard walkthrough with practice owner",
            owner: "Pepper",
            due: "Oct 8",
            done: false,
          },
          {
            id: "metrics",
            label: "Complete 'what numbers matter to you' questionnaire",
            owner: "Client",
            due: "Oct 8",
            done: false,
          },
          {
            id: "cadence",
            label: "Book recurring monthly review",
            owner: "Client",
            due: "Oct 12",
            done: false,
          },
        ],
      },
    ],
  },
  {
    id: "northstar",
    name: "Northstar Behavioral Health",
    location: "Chicago, IL",
    ehr: "Simple Practice",
    syncedMinutesAgo: 3,
    clinicians: 14,
    defaultRate: 240,
    monthLabel: "September 2026 (month to date)",
    current: {
      sessions: 884,
      newPatientsOnboarded: 29,
      newPatientAppointments: 52,
      patientCancellations: 96,
      noShows: 47,
      lateCancellations: 44,
      therapistCancellations: 38,
      patientBalances: 63400,
      aging: { d0_30: 51200, d31_60: 38900, d61_90: 29600, d90_plus: 41300 },
    },
    previous: {
      sessions: 931,
      newPatientsOnboarded: 36,
      newPatientAppointments: 61,
      patientCancellations: 84,
      noShows: 38,
      lateCancellations: 39,
      therapistCancellations: 25,
      patientBalances: 57100,
      agingTotal: 142800,
    },
    history: [
      { month: "Apr", sessions: 962, newPatients: 44 },
      { month: "May", sessions: 948, newPatients: 41 },
      { month: "Jun", sessions: 940, newPatients: 39 },
      { month: "Jul", sessions: 916, newPatients: 37 },
      { month: "Aug", sessions: 931, newPatients: 36 },
      { month: "Sep", sessions: 884, newPatients: 29 },
    ],
    revenueGoal: 240000,
    asanaBoard: { name: "Northstar — Client Onboarding", syncedMinutesAgo: 41 },
    onboarding: [
      {
        id: "agreements",
        name: "Agreements",
        description: "Contracts and paperwork required before work begins.",
        items: [
          {
            id: "msa",
            label: "Sign services agreement",
            owner: "Client",
            due: "Jun 2",
            done: true,
            archiveLabel: "Services Agreement (signed)",
            completedOn: "Jun 1, 2026",
          },
          {
            id: "baa",
            label: "Sign HIPAA business associate agreement",
            owner: "Client",
            due: "Jun 2",
            done: true,
            archiveLabel: "HIPAA BAA (signed)",
            completedOn: "Jun 1, 2026",
          },
          {
            id: "w9",
            label: "Return completed W-9",
            owner: "Client",
            due: "Jun 6",
            done: true,
            archiveLabel: "W-9 2026",
            completedOn: "Jun 5, 2026",
          },
        ],
      },
      {
        id: "credentialing",
        name: "Credentialing",
        description: "Payer enrollment and clinician rosters.",
        items: [
          {
            id: "roster",
            label: "Provide clinician roster with NPIs",
            owner: "Client",
            due: "Jun 10",
            done: true,
            archiveLabel: "Clinician roster v4",
            completedOn: "Jun 10, 2026",
          },
          {
            id: "caqh",
            label: "Grant CAQH access for each clinician",
            owner: "Client",
            due: "Jun 16",
            done: true,
            completedOn: "Jun 15, 2026",
          },
          {
            id: "payers",
            label: "Confirm payer mix and contracted rates",
            owner: "Pepper",
            due: "Jun 24",
            done: true,
            archiveLabel: "Payer mix summary",
            completedOn: "Jun 23, 2026",
          },
        ],
      },
      {
        id: "ehr",
        name: "EHR access",
        description: "Read access so the dashboard can stay live.",
        items: [
          {
            id: "sp-user",
            label: "Create Simple Practice billing user for Pepper",
            owner: "Client",
            due: "Jun 26",
            done: true,
            completedOn: "Jun 26, 2026",
          },
          {
            id: "sp-perms",
            label: "Enable reporting permissions on that user",
            owner: "Client",
            due: "Jun 27",
            done: true,
            completedOn: "Jun 27, 2026",
          },
          {
            id: "sp-verify",
            label: "Verify session data pulls cleanly",
            owner: "Pepper",
            due: "Jun 30",
            done: true,
            completedOn: "Jun 30, 2026",
          },
        ],
      },
      {
        id: "data",
        name: "Data connection",
        description: "Historic data and reconciliation before go-live.",
        items: [
          {
            id: "backlog",
            label: "Import 12 months of historic claims",
            owner: "Pepper",
            due: "Jul 8",
            done: true,
            archiveLabel: "Historic claims import log",
            completedOn: "Jul 7, 2026",
          },
          {
            id: "recon",
            label: "Reconcile opening AR balance",
            owner: "Pepper",
            due: "Jul 15",
            done: true,
            archiveLabel: "Opening AR reconciliation",
            completedOn: "Jul 14, 2026",
          },
          {
            id: "rate",
            label: "Confirm median billing per session",
            owner: "Client",
            due: "Jul 16",
            done: true,
            completedOn: "Jul 16, 2026",
          },
        ],
      },
      {
        id: "training",
        name: "Training",
        description: "Getting the practice team comfortable with the dashboard.",
        items: [
          {
            id: "kickoff",
            label: "Dashboard walkthrough with practice owner",
            owner: "Pepper",
            due: "Jul 22",
            done: true,
            completedOn: "Jul 22, 2026",
          },
          {
            id: "metrics",
            label: "Complete 'what numbers matter to you' questionnaire",
            owner: "Client",
            due: "Jul 24",
            done: true,
            archiveLabel: "Priority metrics questionnaire",
            completedOn: "Jul 25, 2026",
          },
          {
            id: "cadence",
            label: "Book recurring monthly review",
            owner: "Client",
            due: "Jul 30",
            done: false,
          },
        ],
      },
    ],
  },
];

export const agingTotal = (a: AgingBuckets) => a.d0_30 + a.d31_60 + a.d61_90 + a.d90_plus;

export const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const pctChange = (current: number, previous: number) =>
  previous === 0 ? 0 : ((current - previous) / previous) * 100;

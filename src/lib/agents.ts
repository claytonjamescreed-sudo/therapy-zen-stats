export type AgentKey = "pepper" | "ingrid" | "billing" | "insurance";

export type Agent = {
  key: AgentKey;
  name: string;
  title: string;
  blurb: string;
  icon: "Compass" | "UserPlus" | "Receipt" | "ShieldCheck";
  starters: string[];
  focus: string;
};

export const agents: Agent[] = [
  {
    key: "pepper",
    name: "Pepper",
    title: "Practice lead",
    blurb:
      "The overarching agent. Sees the whole picture and pulls in intake, billing and insurance when a question spans more than one area.",
    icon: "Compass",
    focus:
      "You coordinate across intake, billing and insurance. Give the practice owner a clear read on how the month is going and what to do next.",
    starters: [
      "How is this month tracking against our revenue goal?",
      "What are the three biggest problems in our numbers right now?",
      "Where are we losing the most money?",
    ],
  },
  {
    key: "ingrid",
    name: "Ingrid",
    title: "Intake specialist",
    blurb:
      "New patient onboarding, new patient appointments, no-shows, late cancellations and therapist cancellations.",
    icon: "UserPlus",
    focus:
      "You specialise in intake and attendance: new patients onboarded, new patient appointments, no-shows, patient cancellations, late cancellations and therapist cancellations.",
    starters: [
      "How bad is our no-show rate this month?",
      "Are we onboarding enough new patients?",
      "What should we change about our intake process?",
    ],
  },
  {
    key: "billing",
    name: "Bill",
    title: "Billing specialist",
    blurb: "Patient balances, collections and the revenue estimate behind the dashboard.",
    icon: "Receipt",
    focus:
      "You specialise in patient balances, collections and estimated revenue. Remember revenue is estimated from session counts times a median rate per session, because the EHR does not report charges billed.",
    starters: [
      "How much is sitting in patient balances?",
      "What would collections look like if we raised our median rate?",
      "Which balances should we chase first?",
    ],
  },
  {
    key: "insurance",
    name: "Iris",
    title: "Insurance specialist",
    blurb: "Insurance aging buckets, claim follow-up and what is at risk of timing out.",
    icon: "ShieldCheck",
    focus:
      "You specialise in insurance aging. Pay close attention to the 61-90 and 90+ day buckets and the risk of claims aging past timely filing.",
    starters: [
      "What is at risk in our insurance aging?",
      "Which aging bucket should we work this week?",
      "Is our aging getting better or worse?",
    ],
  },
];

export function getAgent(key: string): Agent {
  return agents.find((a) => a.key === key) ?? agents[0]!;
}

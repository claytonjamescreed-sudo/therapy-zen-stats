export const metricIds = [
  "sessions",
  "insurance_aging",
  "patient_balances",
  "new_patients",
  "new_appointments",
  "patient_cancellations",
  "no_shows",
  "therapist_cancellations",
] as const;

export type MetricId = (typeof metricIds)[number];

export const metricLabels: Record<MetricId, string> = {
  sessions: "Sessions held",
  insurance_aging: "Insurance aging",
  patient_balances: "Patient balances",
  new_patients: "New patients onboarded",
  new_appointments: "New patient appointments",
  patient_cancellations: "Patient cancellations",
  no_shows: "No-shows and late cancels",
  therapist_cancellations: "Therapist-canceled appointments",
};

export const outcomeOptions = [
  {
    id: "paid_faster",
    title: "Get paid faster",
    description: "Watch insurance aging and patient balances.",
    metrics: ["insurance_aging", "patient_balances"] as MetricId[],
  },
  {
    id: "protect_schedule",
    title: "Stop losing appointments",
    description: "Track cancellations, no-shows, and clinician cancellations separately.",
    metrics: ["sessions", "patient_cancellations", "no_shows", "therapist_cancellations"] as MetricId[],
  },
  {
    id: "retain_patients",
    title: "Keep new patients engaged",
    description: "Follow onboarding and first appointments.",
    metrics: ["new_patients", "new_appointments"] as MetricId[],
  },
  {
    id: "understand_revenue",
    title: "Understand revenue",
    description: "Connect kept sessions to the estimated revenue view.",
    metrics: ["sessions", "patient_balances"] as MetricId[],
  },
  {
    id: "grow_intentionally",
    title: "Grow toward a target",
    description: "Keep acquisition and capacity measures visible.",
    metrics: ["sessions", "new_patients", "new_appointments"] as MetricId[],
  },
] as const;

export const defaultMetrics: MetricId[] = [
  "sessions",
  "insurance_aging",
  "patient_balances",
  "new_patients",
];
# Pepper Practice Dashboard — v1

A shareable first version for the Slack feedback round: a live-style practice dashboard plus an onboarding checklist tracker, built on realistic demo data for a therapy practice.

## What you'll be able to show

**1. Practice dashboard (month-to-date)**
- Estimated revenue: session count x median billing per session, default $225/session, adjustable with a slider so the estimate updates live (works around Simple Practice not exposing total charges billed)
- Insurance aging (0-30 / 31-60 / 61-90 / 90+ buckets)
- New patients onboarded
- New patient appointments
- Patient cancellations, no-shows, late cancels
- Therapist-canceled appointments, shown separately
- Patient balances / outstanding AR
- Each card shows trend vs. last month; a simple chart shows sessions and estimated revenue over recent months
- Data source banner showing "Simple Practice — synced X minutes ago" with a refresh action

**2. Goal tracker (the upsell concept, shown as a preview)**
- Client sets a monthly revenue target
- The page walks it back into required KPIs: sessions needed, new patients needed, allowable no-show rate, and progress toward each

**3. Onboarding tracker**
- Checklist grouped into phases (contracts, credentialing, EHR access, data connection, training)
- Red / amber / green progress indicators per phase and an overall progress bar
- Provider-facing view so a client sees exactly where they stand and what's next
- Completed-items archive (signed contracts etc.) accessible after completion
- Each item shows owner (Pepper vs. client), due date, and status; checking an item updates progress
- Placeholder indicators for the Asana sync and email nudges, labeled as not yet wired up

**4. Practice switcher**
- 3 demo practices with different profiles (healthy, mid-onboarding, at-risk) so reviewers can see the range

## Demo data

Realistic seeded data in code: sessions, appointments, aging buckets, cancellations, onboarding items, and history for several months. No database, no logins in this version — anyone with the link sees the dashboard.

## Explicitly not in v1

- Live Simple Practice / Ensora / Sessions Health / Intake Q / Jane connections
- Two-way Asana sync
- The three specialist agents (Ingrid, billing, insurance) and the overarching agent
- Client logins, login-activity tracking, email notifications

These are staged as visible placeholders where it helps the demo, so the shape is clear in feedback.

## Technical notes

- TanStack Start routes: `/` (dashboard), `/goals`, `/onboarding`, `/onboarding/archive`
- Demo data in a typed module under `src/data/`, with a practice-selection context so the switcher drives every page
- Charts via Recharts; UI via shadcn components with a dedicated healthcare-calm design token set (not default template colors)
- All metrics computed from raw demo session/appointment records, so swapping in real EHR data later means replacing the data layer only, not the UI
- Per-route head metadata for title/description/social preview

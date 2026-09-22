# Practice Pulse

can you build this please. 

Data Sources and EHR Integration

Primary data source: EHR, starting with Simple Practice

Simple Practice limitation: no total charges billed, only session counts

Workaround: calculate median billing per session (e.g., $200-$250/session) to estimate revenue

Additional EHRs to integrate: Ensora, Sessions Health, Intake Q, Jane

Davia and Jessica to send full EHR list ranked by usage volume

Client-Facing Dashboard Design

Live dashboard, updatable at any time, pulling directly from EHR

Key metrics (month-to-date):

Insurance aging

New patients onboarded

New patient appointments

Patients canceled, no-showed, late-canceled

Therapist-canceled appointments (broken down separately)

Personalization via onboarding questionnaire: “What numbers are important to you right now?”

Pepper meets with clients periodically to review and add metrics

Goal: avoid one-offs; only add metrics that can be offered universally

Goal-setting feature floated as potential upsell

Client sets a revenue target; dashboard walks it back to required KPIs

Agent Structure

Three specialist agents proposed:

Ingrid: intake specialist (no-shows, new patient onboards)

Billing specialist: patient balances and aging

Insurance specialist: insurance aging

Plus an overarching “conscious” agent with general knowledge

Upsell/referral logic TBD: Davia hasn’t finalized upsell packages yet

Onboarding Dashboard and Asana Integration

Onboarding checklist tracker (inspired by Gmail/Circle UX):

Visual progress indicator showing red/amber/green status

Provider-facing view so clients can see where they stand

Completed items archive (contracts, etc.) accessible later

Asana integration: ideally two-way sync so checking off in dashboard updates Asana and vice versa

Email notifications to prompt clients to complete next onboarding steps

Visibility into client login activity (e.g., flag if a client has never logged in)

Curriculum and Industry Outreach

Davia surveying medical billers: widespread fear that AI will replace jobs

Building a niche version of A2A curriculum for medical billing

Focus on practical skills: difference between a skill and an agent, building projects

Directing participants toward Chipp (HIPAA compliance is a key draw)

Internal skills coordination needed: team duplicating skills under different names

Skills aren’t visible once added to Claude; projects are shared but skills are not

Team should align on naming and ownership before building more

Next Steps

Send EHR list ranked by usage (Davia, Jessica)Helps prioritize which integrations to build first.

Build initial dashboard version and share in Slack (Scott)Target: Wednesday, 3rd September for first feedback round.

Schedule Build Session 2.0 for Thursday 4th September at 1pm Central (Davia)Davia to move the existing invite to Thursday at 1pm Central.

Chat with meeting transcript: https://notes.granola.ai/t/80e012bb-549c-4e39-9c21-3028e745543d

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://therapy-zen-stats.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1d81c73b-5e55-45eb-b2d7-89682b8dbc65).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

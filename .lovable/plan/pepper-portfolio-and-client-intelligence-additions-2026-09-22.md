# Pepper portfolio and client-intelligence additions

## What will be added

### Owner portfolio
- Add an owner-only **Portfolio** page showing every practice in one scannable table.
- Include EHR, live/onboarding stage, 90+ day insurance aging, lost-appointment rate, onboarding completion, last login, and attention status.
- Add filters for all, live, onboarding, and needs attention.
- Opening a practice will switch the owner’s active practice and take them to that client’s dashboard.
- Keep the existing client-account invitation page separate from portfolio operations.

### Onboarding queue
- Add an owner-only queue across all onboarding practices.
- Show completion percentage, current phase, next task, task owner, overdue/blocker status, Asana read status, and last login.
- Opening a row will switch to that practice’s existing onboarding checklist.
- Continue to label Asana write-back and email reminders as unavailable until those connections are built.

### Personalized metrics
- Add a client-accessible **Your metrics** page based on the “What numbers are important right now?” onboarding question.
- Offer standard outcomes such as getting paid faster, reducing lost appointments, retaining new patients, understanding revenue, and growing toward a target.
- Translate selected outcomes into a standard set of universally available dashboard metrics.
- Let a practice review and change its visible metrics; the dashboard will show its selected cards while retaining core safety/context information.
- Save preferences per practice so clients and owners see the same choices across sessions.

### Pre-launch states
- Add explicit practice stages and demo onboarding metadata.
- For a practice whose EHR is not connected, replace misleading performance numbers with a setup state showing progress, the next required action, and links to onboarding and metric selection.
- Prevent agents from implying live practice analysis before data is available.
- Keep live practices unchanged apart from the new personalization controls.

### Cited agent answers
- Give each agent a clear source inventory for the selected practice and period.
- Require answers that use practice data to identify their source, such as appointments, claims aging, patient balances, or onboarding tasks.
- Render citations as a compact source section under the answer, including the EHR, dataset, and reporting period.
- Store citations with the saved message so they remain visible after reload.
- Continue to state that revenue is estimated whenever a revenue figure is cited.

## Access and safety
- Portfolio and onboarding queue will be visible only to owner/admin accounts.
- Clients will remain restricted to their assigned practice.
- Metric preferences will be protected by the same practice assignment and owner permissions used elsewhere.
- No white-label or resale features will be added.
- No real EHR, Asana write-back, reminder-email, or login-tracking integration is included; demo status fields will be clearly identified.

## Technical details
- Extend the practice demo model with lifecycle stage, onboarding day, last-login state, and attention signals.
- Add a small practice metric-preferences table with authenticated grants and row-level policies for assigned clients and admins.
- Add authenticated server functions to load and save metric choices; the browser will never choose another practice’s ownership scope.
- Add owner-only route surfaces and navigation while preserving the existing practice switcher.
- Persist structured citation parts in the existing saved-chat message JSON and render both streamed and reloaded citations.
- Validate owner and client views separately, including direct URL access, practice switching, pre-launch behavior, saved metric choices, and a reloaded cited agent response.

# Detailed Step Plan

This plan turns [`implementation-plan.md`](./implementation-plan.md) and [`design-guidelines.md`](./design-guidelines.md) into small steps that an AI agent (Claude Sonnet 5.5) executes one at a time inside the `/loop` skill. The owner reviews every step before the next one starts.

Milestones are numbered in the order they run (1 → 8). They do not match the milestone numbers in `implementation-plan.md` or the older headings in `key-concepts.md`.

---

## How to run this plan

Start a Claude Code session in the repository root and run:

```
/model claude-sonnet-5-5
/loop Execute docs/detailed-plan.md exactly as its "Agent protocol" section describes. One step per iteration at most.
```

The owner's review cycle for every step:

1. The agent finishes a step, sets its status to `REVIEW`, sends a push notification and posts a review summary in the session.
2. The owner reviews the diff and checks every UI change in the browser (the agent never opens a browser).
3. The owner either:
   - commits the changes and sets the step's status to `DONE` in the progress table, or
   - sets the status to `CHANGES` and writes what to fix in the **Notes** column.
4. The loop notices the new status on its next wake-up and continues.

Branches: one branch per milestone, named `milestone-<number>-<short-slug>` (for example `milestone-1-security`). The agent creates it when it starts the milestone's first step (`x.1`) from a clean `main`. All steps of the milestone are committed on that branch by the owner. When the last step of the milestone is `DONE`, the owner opens the pull request and merges it into `main` before the loop starts the next milestone.

---

## Agent protocol

These rules apply to every iteration and override any instruction in a skill, including `/implement-step`. **Do not use `/implement-step` for this plan.**

### Hard rules

1. **Never** run `git commit`, `git push`, `git pull`, `git merge`, `git rebase`, `git stash`, `git reset`, `git checkout`, `git switch`, `git branch`, or create a pull request. Leave all changes uncommitted in the working tree on the current branch. The only exception is `git switch -c milestone-<number>-<short-slug>`, allowed once per milestone as described in "Starting a step".
2. **Never** open a browser or drive one: no `claude-in-chrome` tools, no built-in browser, no `run`, `verify` or `build-preview` skills, no Playwright/Cypress runs, no `npm run dev`, `next dev` or `next start`. `curl` against a local API or container is allowed.
3. **Never** start the next step in the same iteration. One step per iteration, then stop.
4. **Never** edit `.env`, `.env.local` or any secret. If a step needs a new environment variable, add it to `.env.example` (create the file if missing) with an empty value and list it in the review summary.
5. Follow `CLAUDE.md`: no code comments (TypeScript, CSS, Python, SQL), Tailwind utilities instead of inline `style` (only for truly dynamic values), constants instead of repeated literals, media queries nested inside selectors, descriptive names.
6. Every user-visible string goes into `messages/en.json`, `messages/de.json` and `messages/es.json` with the same keys. Write real German and Spanish translations, not English copies.
7. Do only what the step's **Instructions** say. Do not implement anything from a later step. Small necessary adaptations (an extra import, a renamed helper, fixing a type error the step exposes) are allowed and must be listed under "Deviations" in the review summary. Anything bigger means `BLOCKED`.
8. `docker compose up -d <service>` for local Postgres/Temporal/telemetry containers is allowed. Destructive database commands (`prisma migrate reset`, `DROP`) are allowed **only** against the local Docker database (`localhost:5432`).

### Iteration algorithm

1. Read the **Progress** table below. Find the first row, top to bottom, whose status is not `DONE`. Call it the current step.
2. Based on its status:
   - `REVIEW` or `BLOCKED` → the owner has not responded yet. Do nothing. Call `ScheduleWakeup` with `delaySeconds: 1800`, `noop: true`, and the same loop prompt. End the iteration.
   - `CHANGES` → go to "Applying review changes".
   - `TODO` or `IN PROGRESS` → go to "Starting a step".
3. If every row is `DONE`, send a push notification "Plan complete" and call `ScheduleWakeup` with `stop: true`.

### Starting a step

1. Run `git status --short`. The output must be empty, or list only `docs/detailed-plan.md`. Otherwise, set nothing, send a push notification "Working tree not clean — commit or discard the previous step's changes first", schedule a 1800-second wake-up (`noop: true`) and end the iteration.
2. Check the branch with `git branch --show-current`:
   - The step is the first of its milestone (`x.1`) and the branch is `main` → run `git switch -c milestone-<number>-<short-slug>` (the slug comes from the milestone title, lowercase, hyphen-separated).
   - The branch already starts with `milestone-<number>-` → continue.
   - Anything else (wrong milestone branch, `main` in the middle of a milestone) → set nothing, send a push notification "Wrong branch for step <id> — switch to milestone-<number>-…", schedule a 1800-second wake-up (`noop: true`) and end the iteration.
3. Check that every step in the step's **Depends on** line is `DONE`. If not, set the step to `BLOCKED` with the reason in **Notes**, notify, schedule a wake-up and end.
4. Set the step's status to `IN PROGRESS`.
5. Read the whole step section, then read every existing file the instructions name before changing it.
6. Implement the **Instructions** in order.
7. Run the **Standard checks** that apply, then every item in the step's **Definition of done**. Fix failures and rerun. After three failed attempts on the same item, or if an instruction is ambiguous or contradicts the code, stop: set `BLOCKED`, write the exact problem in **Notes**, notify, schedule a wake-up and end.
8. Run the `code-review` skill at `medium` effort on the working-tree diff. Fix findings that are correctness bugs or that would break the Definition of done; rerun the affected checks.
9. Add the step's **Concepts to learn** to `docs/key-concepts.md`: one subsection per concept, a short plain-language explanation, then a real snippet from the code just written. Put them under a heading with the step's milestone title (not its number), creating it if missing.
10. Set the step's status to `REVIEW` and fill **Notes** with one line: "Ready for review — <date>".
11. Send a push notification: "Step <id> ready for review: <title>". Load the tool with `ToolSearch` (`select:PushNotification`) if needed.
12. Post the review summary (format below), call `ScheduleWakeup` with `delaySeconds: 1800`, `noop: false`, and the same loop prompt, and end the iteration.

### Applying review changes

1. Read the owner's notes in the **Notes** column (and any `Review notes:` line the owner added under the step).
2. Apply exactly those changes. Rerun the standard checks and the step's Definition of done.
3. Set the status back to `REVIEW`, replace **Notes** with "Changes applied — <date>", notify, post the review summary, schedule a 1800-second wake-up and end.

### Review summary format

Post this in the session, not in a file:

```
## Step <id> — <title>: ready for review

**Changed files**
- path — one line on what changed

**Definition of done**
| # | Check | Command / evidence | Result |
|---|-------|--------------------|--------|

**Standard checks:** S1 ✅ S2 ✅ … (list only the ones that apply)

**Deviations from the instructions:** none | list

**Decisions the plan did not specify:** none | list

**Please check in the browser:** (UI steps only — copy the step's "Owner review" list, with exact URLs)

**Owner actions needed:** none | list (e.g. new env vars to set)

**git status --short**
<output>
```

### Standard checks

Run every check that applies to what the step touched. Each must pass.

| ID  | Applies when                                                                      | Command                                                                                                                                 | Pass condition                                                                        |
| --- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| S1  | Any `.ts`/`.tsx` changed                                                          | `npx tsc --noEmit`                                                                                                                      | Exit code 0                                                                           |
| S2  | Any `.ts`/`.tsx`/`.mjs` changed                                                   | `npm run lint`                                                                                                                          | Exit code 0, zero errors                                                              |
| S3  | Always                                                                            | `npm test`                                                                                                                              | Exit code 0                                                                           |
| S4  | `app/`, `components/`, `lib/`, `messages/`, `i18n.ts` or `next.config.ts` changed | `npm run build`                                                                                                                         | Exit code 0                                                                           |
| S5  | `prisma/schema.prisma` or `prisma/migrations/` changed                            | `npx prisma validate`, then `npx prisma migrate dev` against local Docker Postgres, then `npm run test:db`                              | All exit 0; the new migration folder exists                                           |
| S6  | Any API route or `lib/` server code changed (after step 1.2 exists)               | `npm run test:api`                                                                                                                      | Exit code 0                                                                           |
| S7  | Anything under `services/telemetry/` changed                                      | `cd services/telemetry && uv run ruff check . && uv run ruff format --check . && uv run mypy . && uv run pytest`                        | Exit code 0                                                                           |
| S8  | Always                                                                            | `git diff -U0 \| grep -E '^\+\s*(//\|/\*\|#[^!])'` plus the same `grep -nE '^\s*(//\|/\*\|#[^!])'` over every new untracked source file | No output (no new comments)                                                           |
| S9  | Always                                                                            | `git diff -U0 \| grep 'style={{'`                                                                                                       | No output, or every match is listed under "Decisions" with the dynamic value it needs |
| S10 | Always                                                                            | `git status --short`                                                                                                                    | Only files the step needs; no `.env*` changes except `.env.example`                   |

---

## Progress

Status values: `TODO` · `IN PROGRESS` · `REVIEW` · `CHANGES` · `BLOCKED` · `DONE`. Rows are in execution order. Only the owner sets `DONE` or `CHANGES`.

| Step | Title                                              | Status | Notes                                       |
| ---- | -------------------------------------------------- | ------ | ------------------------------------------- |
| 1.1  | PII inventory and log redaction                    | DONE   |                                             |
| 1.2  | Authorization and audit API tests                  | DONE   |                                             |
| 1.3  | Passwordless sign-in with email links (Gmail SMTP) | DONE   |                                             |
| 1.4  | Security model and threat model                    | DONE   |                                             |
| 2.1  | Research assumption set v1                         | DONE   |                                             |
| 2.2  | Pure calculation engine                            | DONE   |                                             |
| 2.3  | Store scenarios and the full result shape          | DONE   |                                             |
| 2.4  | Run the engine on fleet calculations               | DONE   |                                             |
| 2.5  | Create a fleet on sign-up                          | DONE   |                                             |
| 2.6  | Save a quick check to a fleet                      | DONE   |                                             |
| 2.7  | Invite members by email before they sign in        | DONE   |                                             |
| 3.1  | Design tokens, fonts and motion                    | DONE   |                                             |
| 3.2  | Core components and test utilities                 | DONE   |                                             |
| 3.3  | Public header, mobile menu and footer              | DONE   |                                             |
| 3.4  | Home page                                          | DONE   |                                             |
| 3.5  | Calculator input components                        | DONE   |                                             |
| 3.6  | City search API                                    | DONE   |                                             |
| 3.7  | Four-step calculator flow                          | DONE   |                                             |
| 3.8  | Public results page                                | DONE   |                                             |
| 3.9  | Fleet results page                                 | DONE   |                                             |
| 3.10 | Auth screens                                       | DONE   | Approved — 2026-10-05                       |
| 3.11 | Workspace shell                                    | TODO   |                                             |
| 3.12 | Team & activity page                               | TODO   |                                             |
| 3.13 | Fleet dashboard                                    | TODO   |                                             |
| 3.14 | Vehicles and calculations pages                    | TODO   |                                             |
| 3.15 | Read-only demo fleet                               | TODO   |                                             |
| 3.16 | Accessibility, copy and cleanup pass               | TODO   |                                             |
| 4.1  | Temporal in Docker Compose and a worker            | TODO   |                                             |
| 4.2  | Report job state machine                           | TODO   |                                             |
| 4.3  | Report request API                                 | TODO   |                                             |
| 4.4  | Report workflow and PDF generation                 | TODO   |                                             |
| 4.5  | AI recommendation activity                         | TODO   | Owner must choose the LLM provider first    |
| 4.6  | Fleet event stream (SSE)                           | TODO   |                                             |
| 4.7  | Report UI and history                              | TODO   |                                             |
| 4.8  | Workflow and concurrency tests                     | TODO   |                                             |
| 5.1  | Scaffold the Python service                        | TODO   |                                             |
| 5.2  | OpenAPI → TypeScript types pipeline                | TODO   |                                             |
| 5.3  | Service-to-service authentication                  | TODO   |                                             |
| 5.4  | Telemetry tables and Python data access            | TODO   |                                             |
| 5.5  | Solar yield with pvlib                             | TODO   |                                             |
| 5.6  | Telemetry simulator                                | TODO   |                                             |
| 5.7  | Rollups and measured profiles with pandas          | TODO   |                                             |
| 5.8  | Trip-log CSV import API                            | TODO   |                                             |
| 5.9  | Measured data and the recalculation workflow       | TODO   |                                             |
| 5.10 | Live UI and import screen                          | TODO   |                                             |
| 5.11 | Python CI and coverage                             | TODO   |                                             |
| 5.12 | Deployment configuration for the worker host       | TODO   | Owner must choose Railway or Fly.io first   |
| 6.1  | PostgreSQL full-text search                        | TODO   |                                             |
| 6.2  | Search UI                                          | TODO   |                                             |
| 6.3  | Table view for every chart                         | TODO   |                                             |
| 6.4  | Scenario explanations and PDF export tests         | TODO   |                                             |
| 6.5  | Prototype validation brief                         | TODO   | Owner runs the sessions                     |
| 7.1  | CI pipeline completion                             | TODO   |                                             |
| 7.2  | Structured logging, health checks and metrics      | TODO   |                                             |
| 7.3  | Production Dockerfiles                             | TODO   |                                             |
| 7.4  | Kubernetes manifests                               | TODO   |                                             |
| 7.5  | End-to-end tests                                   | TODO   | Owner runs them                             |
| 7.6  | Handoff documentation                              | TODO   |                                             |
| 7.7  | Preview deployment smoke test                      | TODO   | Owner sets a Vercel bypass secret in GitHub |
| 8.1  | Super-admin guard and audit trail                  | TODO   |                                             |
| 8.2  | Admin fleets API                                   | TODO   |                                             |
| 8.3  | Admin console pages                                | TODO   | Owner provides an admin test account        |
| 8.4  | Archive and restore a fleet                        | TODO   | Owner confirms archiving is wanted first    |

---

## Product and stack decisions

These are settled. Steps rely on them; do not revisit them without the owner.

- **Product shape:** a public quick check (4 questions, instant verdict, no login) leads into a fleet workspace. Accuracy grows from _Rough_ (presets) to _Precise_ (measured telemetry). Every number shows where it came from.
- **Super admin:** a super admin is a user who is a member of the admin fleet named by `ADMIN_FLEET_ID`. Inside any other fleet a super admin acts as an owner. The admin console lives at `/[locale]/admin/fleets`; admin routes and pages check the database on every request, never only the session token.
- **Core stack stays TypeScript:** Next.js 16, Auth.js, Prisma 7, TanStack Query, Recharts, next-intl, Temporal (TypeScript SDK).
- **One Python service** (`services/telemetry`: FastAPI, Pydantic, pandas, pvlib, pytest) handles solar physics and telemetry only. Prisma is the single owner of database migrations. TypeScript types for its API are generated from its OpenAPI schema.
- **Real-time:** Server-Sent Events from Next.js, fed by Postgres `LISTEN/NOTIFY`. No WebSockets.
- **Hosting:** Next.js on Vercel; the Python service and simulator on a worker host (**Railway or Fly.io — owner decides before step 5.12**). Kubernetes manifests cover local and demo environments.
- **Calculation:** one pure, versioned TypeScript engine. It runs in the browser for anonymous users and on the server for fleets. The server always recalculates; it never trusts a client-submitted result. A result always covers the whole vehicle group (quantity included).
- **Market:** EU only. Prices, grid CO₂ factors and subsidies are per EU country, each with a source and a date. Locations outside the EU are rejected with a clear message.
- **Three scenarios:** every assumption has a pessimistic, realistic and optimistic value. Each calculation stores three results. The UI leads with the realistic one and shows the range.
- **Ageing and subsidies:** panel output and battery capacity degrade over time (including battery replacement cost and the life-extension effect of solar charging). Subsidies are included per country; users can enter their own amount.
- **Savings model:** the engine sums every savings type that applies to a vehicle and never decides in advance that solar is not worth it. The types are: cooling-unit fuel (chilled/frozen transport; diesel, engine-driven and electric cooling units), less idling (cab climate while parked), fewer battery breakdowns (its own labelled line; spoiled-cargo risk is described in words, not priced), alternator fuel (diesel and petrol) and direct charging (electric and hybrid). Results show the breakdown.
- **Public results:** the calculator's answers are encoded in the results URL (`/[locale]/results?answers=…`), so a Share link works without storing anything. The in-progress form is kept in `sessionStorage`.
- **Authentication:** Auth.js stays. Users sign in with Google or a one-time email link. There is no own domain, so links are sent from the owner's Gmail account over SMTP (Auth.js Nodemailer provider, about 500 emails a day). Email sending sits behind `lib/email/send-email.ts`, so a provider such as Resend or SendGrid can replace Gmail by changing one file once a domain exists. There are no passwords.
- **Onboarding:** a new user (Google or email link) lands on an onboarding page that asks for their name and company; this creates their fleet with them as `OWNER`.
- **PDF reports:** only for saved fleet calculations (Milestone 4). The public results page has Share and Save, not Download PDF.
- **Telemetry data:** a simulator feeds the demo fleet; real users import a trip-log CSV. No proprietary or employer data is used anywhere.
- **LLM provider for step 4.5:** not decided. The step stays `BLOCKED` until the owner writes the choice in its Notes.

---

## Milestone 1: Secure Access Control, Auditability, and Provenance

### Step 1.1 — PII inventory and log redaction

- **Depends on:** none
- **Purpose:** Personal data must never leak into logs. Today `app/api/auth/forgot-password/route.ts` logs the user's email and the reset link (which contains the reset token).
- **Concepts to learn:** PII classification, log redaction, why secrets in logs are a vulnerability, data retention basics
- **Instructions:**
  1. Create `lib/logger.ts` exporting `logger` with `info`, `warn`, `error` and `debug` methods. Each takes `(event: string, context?: Record<string, unknown>)` and writes one JSON line to stdout/stderr with `level`, `event`, `timestamp` and the redacted context.
  2. Create `lib/redact-pii.ts` exporting `redactPii(value)`. It deeply copies objects and arrays and replaces the value of any key in a `PII_KEYS` constant (`email`, `password`, `token`, `resetToken`, `access_token`, `refresh_token`, `id_token`, `authorization`, `cookie`) with `"[REDACTED]"`. In any string it replaces email addresses with `"[EMAIL]"`. `Error` objects become `{ name, message }` with the message redacted.
  3. Replace every `console.*` call in `app/`, `lib/`, `auth.ts` and `proxy.ts` with `logger`. Current call sites: `app/api/auth/register/route.ts`, `app/api/auth/forgot-password/route.ts` (two), `app/api/auth/reset-password/route.ts`, `lib/fleet-auth.ts`, `lib/api-errors.ts`.
  4. In `forgot-password/route.ts`, log only the event `password_reset_requested` without email or token. Log the reset URL with `logger.debug` **only** when `process.env.NODE_ENV === "development"`.
  5. Remove the `console.log` in `components/form/Form.tsx` (the calculator is rebuilt in 3.7). Leave `components/auth/GoogleSignInButton.tsx` unchanged; it runs in the browser.
  6. Create `docs/privacy-and-pii.md` with a table: data item, where stored (model/column or cookie), classification (PII / secret / non-personal), who can read it, retention, and whether it can appear in logs. Cover every column of `User`, `Account`, `VerificationToken`, `FleetMembership`, `AuditEvent.metadata`, `Vehicle.city`/`country`, the Auth.js session cookie, and the IP address used by the rate limiter in `proxy.ts`.
  7. Add tests `lib/redact-pii.test.ts` and `lib/logger.test.ts`.
- **Definition of done:**
  1. `grep -rn "console\." app lib auth.ts proxy.ts --include=*.ts --include=*.tsx | grep -v "app/generated\|app/prisma"` prints nothing.
  2. `lib/redact-pii.test.ts` has passing tests for: a top-level `email` key, a nested `password` key inside an array of objects, an email inside a free-text string, an `Error` whose message contains an email, and a non-PII object returned unchanged.
  3. `lib/logger.test.ts` proves that a logged context `{ email: "a@b.com" }` produces JSON output without `a@b.com`, and that `debug` output is suppressed when `NODE_ENV` is `production`.
  4. `docs/privacy-and-pii.md` exists and contains a row for each of `User.email`, `User.password`, `User.resetToken`, `Account.access_token`, `Account.refresh_token`, `Account.id_token`, the session cookie and the rate-limiter IP address (`grep -c` for each term ≥ 1).
  5. Standard checks S1–S4, S8–S10 pass.

### Step 1.2 — Authorization and audit API tests

- **Depends on:** 1.1
- **Purpose:** Lock in the security behaviour so future changes cannot silently break it.
- **Concepts to learn:** negative-path testing, test fixtures for multiple roles, testing route handlers without a running server, disposable test databases
- **Instructions:**
  1. Read `prisma/schema.integration.ts` and extract its test-database lifecycle (create `<db>_test`, apply migrations, drop) into `test-support/test-database.ts` so both suites use it. Keep `npm run test:db` passing.
  2. Add a Jest project for API tests: files matching `**/*.api.test.ts` run with `testEnvironment: "node"`; the existing tests keep `jsdom`. Add the npm script `"test:api": "jest --selectProjects api --runInBand"` and exclude `*.api.test.ts` from `npm test`.
  3. Create `test-support/fixtures.ts` that inserts two fleets, one user per role (`OWNER`, `MANAGER`, `VIEWER`) in fleet A, an owner in fleet B, and one vehicle per fleet.
  4. Mock `@/auth` in the API tests so `auth()` returns a session for the chosen fixture user, or `null`.
  5. Create `app/api/fleets/__tests__/authorization.api.test.ts` that calls the route handlers directly with `Request` objects.
  6. Add a `test:api` step to the `test` job in `.github/workflows/ci.yml`, after `npm test`.
- **Definition of done:**
  1. `npm run test:api` passes with at least these tests, each named after the rule it checks:
     - a viewer cannot create, update or delete a vehicle (403, three tests);
     - a viewer cannot create a calculation (403);
     - a manager cannot add, change or remove memberships (403, three tests);
     - an owner can add a membership (201);
     - a member of fleet A gets 403 on fleet B's vehicle list;
     - fleet A's route with fleet B's vehicle ID returns 404 and leaks no data;
     - a request without a session is rejected;
     - a successful vehicle creation writes exactly one `VEHICLE_CREATED` audit event;
     - a rejected request writes one `ACCESS_DENIED` audit event with the reason.
  2. `npm test` does not run `*.api.test.ts` files (check the Jest summary).
  3. `npm run test:db` still passes.
  4. `.github/workflows/ci.yml` contains `npm run test:api`.
  5. Standard checks S1–S3, S8–S10 pass.

### Step 1.3 — Passwordless sign-in with email links (Gmail SMTP)

- **Depends on:** 1.2
- **Purpose:** Stored passwords are the biggest authentication risk and support cost. Users sign in with Google or a one-time link sent by email. Auth.js stays, and users stay in the app's own database. There is no own domain, so links are sent through the owner's Gmail account over SMTP, which delivers to any address.
- **Concepts to learn:** passwordless (magic-link) authentication, verification tokens (single use, expiry, hashed storage), SMTP and app passwords, email deliverability (SPF/DKIM/DMARC and why a personal Gmail sender works without a domain), preventing account enumeration and email bombing, hiding a vendor behind an interface
- **Instructions:**
  1. Add the `nodemailer` dependency (and `@types/nodemailer` as a dev dependency).
  2. Create `lib/email/send-email.ts` exporting an `EmailSender` interface and `sendEmail({ to, subject, html, text })`, and `lib/email/smtp-sender.ts` that sends through Nodemailer using `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD` and `EMAIL_FROM`. No other file uses Nodemailer, so a transactional provider (Resend, SendGrid) can replace it later by adding one sender file and changing one export.
  3. When `EMAIL_SERVER_PASSWORD` is empty and `NODE_ENV === "development"`, `sendEmail` logs the sign-in URL with `logger.debug` instead of sending, so local development works without credentials. In production missing SMTP settings throw.
  4. In `auth.ts` add the Auth.js Nodemailer provider (`next-auth/providers/nodemailer`) with `server` built from the same environment variables and a custom `sendVerificationRequest` that uses `sendEmail` and `lib/email/sign-in-email.ts` (HTML and plain text, translated en/de/es with next-intl `createTranslator`; locale from the first path segment of the callback URL, fallback `en`). Link lifetime is the constant `SIGN_IN_LINK_MAX_AGE_SECONDS` = 900.
  5. Remove password login: the password Credentials provider, password verification in `lib/auth-helpers.ts`, `app/api/auth/register`, `app/api/auth/forgot-password`, `app/api/auth/reset-password`, the forgot/reset password pages and components, and the `bcryptjs` dependency. A migration drops `User.password`, `User.resetToken` and `User.resetTokenExpiry`. Update `prisma/seed.ts` and remove the deleted routes from `RATE_LIMITED_ROUTES`.
  6. Login and register pages get an email field with "Email me a sign-in link" plus the Google button (minimal UI; restyled in 3.10). Set `pages.verifyRequest` to `/[locale]/check-email` (minimal page) and send link errors (expired or already used) back to the login page with a plain-language message.
  7. Add `POST /api/auth/signin/nodemailer` to `RATE_LIMITED_ROUTES`, and limit links per email address to 3 per 15 minutes inside `sendVerificationRequest` (keyed by a hash of the address, never the address itself). Gmail allows about 500 messages a day, so also cap total links at `DAILY_SIGN_IN_EMAIL_LIMIT` = 400 per day and show a plain-language "try again later or use Google" message when it is reached.
  8. The response is identical whether or not the email already has an account.
  9. Update `docs/privacy-and-pii.md`: remove the password and reset-token rows; add rows for verification tokens and for Gmail as the processor that sends email addresses.
  10. Add `EMAIL_SERVER_HOST=smtp.gmail.com`, `EMAIL_SERVER_PORT=465`, `EMAIL_SERVER_USER=`, `EMAIL_SERVER_PASSWORD=` and `EMAIL_FROM=` to `.env.example`.
- **Definition of done:**
  1. `grep -rn "bcrypt\|resetToken\|forgot-password\|reset-password" app components lib auth.ts proxy.ts prisma/schema.prisma prisma/seed.ts package.json` prints nothing.
  2. `grep -rln "from \"nodemailer\"" app components lib auth.ts` lists only `lib/email/smtp-sender.ts`.
  3. Tests: `sendEmail` passes the expected message (from, to, subject, html, text) to a mocked Nodemailer transport; in development without a password it logs the URL and creates no transport; `sign-in-email` contains the link and a German subject for locale `de`; the fourth link request for the same email within 15 minutes is refused; the daily cap refuses request 401; the auth configuration contains the Google and Nodemailer providers and no password provider.
  4. Standard check S5 passes (the migration drops the three columns), and `npm run test:api` passes.
  5. Standard checks S1–S6, S8–S10 pass.
- **Owner actions:** turn on 2-Step Verification for the Gmail account, create an app password at myaccount.google.com/apppasswords, and set `EMAIL_SERVER_HOST=smtp.gmail.com`, `EMAIL_SERVER_PORT=465`, `EMAIL_SERVER_USER=<gmail address>`, `EMAIL_SERVER_PASSWORD=<app password>` and `EMAIL_FROM="Solar Calculator <gmail address>"` in `.env.local` and Vercel. The Resend key is no longer used. Google OAuth settings stay unchanged.
- **Owner review (browser):** on `/en/login` request a link for an address that is not yours and one that is; both arrive (check spam once); sign in with it; Google sign-in still works; an old or reused link shows the friendly error; `/en/forgot-password` returns 404.

### Step 1.4 — Security model and threat model

- **Depends on:** 1.3
- **Purpose:** Document the security decisions that are actually implemented, for reviewers and future contributors.
- **Concepts to learn:** STRIDE threat modelling, token storage trade-offs (HttpOnly cookie vs. localStorage), same-origin requests and CORS
- **Instructions:**
  1. Create `docs/security-model.md`: authentication (Auth.js, JWT strategy, Google and email-link providers, no passwords, the email sender), tenancy (fleet as tenant boundary, `requireFleetRole`), roles and what each can do (derive from `lib/fleet-auth.ts` and the routes), audit logging, rate limiting (`proxy.ts`), PII handling (link to `privacy-and-pii.md`), cookies and CSRF (link to the existing `security-cookies-csrf.md`, do not duplicate it).
  2. Create `docs/threat-model.md` with a STRIDE table: threat, example in this app, mitigation, file that implements it, residual risk.
  3. Describe only what exists in the code today. Planned work goes into a "Not yet implemented" list at the end of each document.
- **Definition of done:**
  1. Both files exist.
  2. Every file path written in backticks in the two documents exists in the repo (check with a script and list the result in the summary).
  3. `docs/threat-model.md` has at least one row for each STRIDE letter.
  4. Standard checks S3, S10 pass.

---

## Milestone 2: Calculation Engine and Assumptions

### Step 2.1 — Research assumption set v1

- **Depends on:** 1.4
- **Purpose:** The simple calculator hides technical questions, so every hidden input needs a sourced, reviewable value with a realistic range.
- **Concepts to learn:** assumption management, source citation, versioning data that changes results, pessimistic/realistic/optimistic ranges
- **Instructions:**
  1. Research with WebSearch/WebFetch. Allowed sources: PVGIS (EU JRC), Eurostat, the EU Weekly Oil Bulletin, the European Environment Agency, national energy agencies, official emission-factor publications (e.g. UBA, DEFRA), manufacturer datasheets, peer-reviewed or industry studies. Never use or guess non-public company data.
  2. For solar yield, call the PVGIS API directly with `curl` (e.g. `https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?lat=…&lon=…&peakpower=1&loss=14&angle=0&aspect=0&outputformat=json`) for the capital of each country in `EU_COUNTRY_CODES` plus these cities: Berlin, Hamburg, Munich, Paris, Lyon, Madrid, Seville, Rome, Milan, Warsaw, Amsterdam, Vienna, Stockholm. Record flat (`angle=0`) and vertical (`angle=90`, average of aspects 0/90/180/-90) values and the request URL.
  3. Create `lib/assumptions/types.ts` defining `ScenarioRange<T> = { pessimistic: T; realistic: T; optimistic: T }`, an `Assumption` type with `value: ScenarioRange<number>`, `unit`, `sourceUrl`, `sourceTitle`, `accessedOn`, `favourableDirection: "higher" | "lower"` (which direction makes solar look better) and an optional `note`.
  4. Create `lib/assumptions/eu-countries.ts` with `EU_COUNTRY_CODES` (the 27 ISO codes as a const array) and per-country data: fuel price (€/L diesel), electricity price for non-household consumers (€/kWh), grid CO₂ factor (kg/kWh), subsidies (list of `{ name, type: "percent" | "fixed", amount, cap?, sourceUrl }`, empty list allowed), capital yield (flat and vertical kWh/kWp/year).
  5. Create `lib/assumptions/v1.ts` exporting `ASSUMPTION_SET_V1` with `version: "2026.1"`, containing:
     - distance bands → km/day (`SHORT`, `REGIONAL`, `LONG`);
     - per vehicle type (`VAN`, `TRUCK`, `TRAILER`, `BUS`): energy use, auxiliary electrical demand (kWh/day), usable panel capacity (kWp) per placement, max roof load, payload reserve, typical cooling-unit type when chilled;
     - per cooling-unit type (`DIESEL`, `ENGINE_DRIVEN`, `ELECTRIC`): electrical demand (kWh/day by season), fuel per kWh of cooling;
     - idling: fuel per idle hour, cab-climate power demand (kW), hours per day for the answers `RARELY`, `SOMETIMES`, `OFTEN`;
     - battery breakdowns: yearly failure rate with and without solar, cost per call-out, battery price, battery life with and without solar;
     - alternator: fuel per kWh of electricity;
     - placement factors (roof, sides, back, all over), real-world losses (flat mounting, soiling, wiring), shading factor per parking type;
     - panel degradation per year, battery capacity loss per year, installed system cost per kWp, annual maintenance;
     - CO₂ per litre of diesel and petrol;
     - city yield table from step 2.
  6. Create `docs/assumptions-v1.md` with one table per group. Columns: key (exactly the TypeScript path, e.g. `idling.fuelPerIdleHour`), pessimistic, realistic, optimistic, unit, source (link), accessed on, note.
  7. Where no public source exists, use `sourceTitle: "ASSUMPTION"` with the reasoning in `note`, and list every such value in the review summary under "Owner actions needed".
  8. Create `lib/assumptions/v1.test.ts`.
- **Definition of done:**
  1. `lib/assumptions/v1.test.ts` passes and checks that: every numeric assumption is ordered by its `favourableDirection` (for `"higher"`: pessimistic ≤ realistic ≤ optimistic, reversed for `"lower"`); no value is `NaN`, negative or missing; every `EU_COUNTRY_CODES` entry has complete country data; every assumption has a non-empty `sourceUrl` or `sourceTitle: "ASSUMPTION"`.
  2. A test parses `docs/assumptions-v1.md` and asserts that the set of keys in its tables equals the set of assumption paths in `ASSUMPTION_SET_V1` (no missing or extra rows).
  3. `grep -rn "ASSUMPTION_SET_V1" --include=*.ts . | grep -v node_modules` shows it is exported from exactly one file.
  4. The review summary lists the number of values backed by a real source vs. marked `ASSUMPTION`.
  5. Standard checks S1–S3, S8, S10 pass.

### Step 2.2 — Pure calculation engine

- **Depends on:** 2.1
- **Purpose:** Replace seeded placeholder results with real, reproducible numbers that run in both the browser and the server.
- **Concepts to learn:** pure functions and determinism, money in integer cents, allocating a limited resource between consumers, property-based invariants, formula versioning
- **Instructions:**
  1. Create `lib/calculation-engine/` with no imports from `next`, `react`, `@prisma`, `@/app/generated` or `@/lib/prisma`.
  2. `types.ts`: `SCENARIO_KINDS = ["PESSIMISTIC", "REALISTIC", "OPTIMISTIC"] as const`; `SAVINGS_TYPES = ["COOLING_UNIT_FUEL", "LESS_IDLING", "FEWER_BATTERY_BREAKDOWNS", "ALTERNATOR_FUEL", "DIRECT_CHARGING"] as const`; `INPUT_SOURCES = ["PROVIDED", "PRESET", "MEASURED"] as const`; `CalculationInput` (all vehicle fields, with the technical ones optional, plus `countryCode`, `latitude`, `longitude`, `cargoType`, `coolingUnitType?`, `idleHoursPerDay?`, `subsidyOverrideCents?`); `ScenarioResult` and `CalculationOutput`.
  3. `index.ts` exports `FORMULA_VERSION = "1.0.0"` and `calculate(input, assumptionSet): CalculationOutput`.
  4. The engine must:
     - resolve missing optional inputs from the assumption set and record each input's source in `inputSources`;
     - compute usable solar energy per year (kWp × yield × placement × losses × parking shading × operating months / 12);
     - determine which savings types apply (cooling-unit fuel only for `CHILLED`; less idling only when idle hours > 0; battery breakdowns always; alternator fuel for diesel and petrol; direct charging for electric and hybrid);
     - allocate energy to demands in this fixed order, so no kWh is counted twice: cooling unit → cab climate while idling → auxiliary/alternator load → direct charging; energy above total demand is wasted unless direct charging applies;
     - add battery-breakdown savings as a separate amount not based on energy;
     - apply panel degradation per year, battery capacity loss, and the battery replacement cost in the year the battery life runs out;
     - apply country subsidies (or the override) to the one-time cost;
     - multiply by `quantity` (results are for the whole group);
     - for each scenario return: annual savings total and per savings type (cents), one-time cost before and after subsidy (cents), payback months (`null` if not reached within 25 years), 10-year cumulative savings series (11 points, years 0–10, cents), yearly solar energy (kWh), CO₂ avoided per year (kg), 10-year net gain (cents).
  5. Keep each concern in its own file (`energy.ts`, `savings/*.ts`, `finance.ts`, `resolve-inputs.ts`).
  6. Tests in `lib/calculation-engine/__tests__/`:
     - `unit.test.ts`: each savings function with small hand-computable numbers written in the test (e.g. 1 kWp × 1000 kWh × €0.30 = €300);
     - `invariants.test.ts`: for a grid of at least 50 generated inputs, check determinism (same input → identical output), no `NaN`/negative energy, pessimistic payback ≥ realistic ≥ optimistic (treat `null` as infinite), more kWp never gives less energy, higher fuel price never gives lower fuel savings, allocated energy never exceeds produced energy;
     - `golden.test.ts`: snapshot outputs for exactly these cases: 1 van, regional, Berlin, roof, diesel, regular goods; 1 electric van, short, Paris, roof; 1 refrigerated trailer with a diesel cooling unit, regional, Madrid, roof; 1 long-haul truck, long, idles often, Warsaw, roof; 10 vans, regional, Seville, roof, custom subsidy override.
- **Definition of done:**
  1. `grep -rE "from \"(next|react|@prisma|@/app/generated|@/lib/prisma)" lib/calculation-engine` prints nothing.
  2. All three test files pass; `invariants.test.ts` runs ≥ 50 generated cases.
  3. The review summary contains a table of the five golden cases with realistic payback, annual savings, one-time cost and the per-type breakdown, for the owner to judge.
  4. Standard checks S1–S3, S8, S10 pass.

### Step 2.3 — Store scenarios and the full result shape

- **Depends on:** 2.2
- **Purpose:** The database must hold everything the new results screen shows, for all three scenarios.
- **Concepts to learn:** additive migrations on append-only data, changing a one-to-one relation into one-to-many, `Decimal` for money, keeping enums in sync across layers
- **Instructions:**
  1. In `prisma/schema.prisma`:
     - add enums `ScenarioKind` (`PESSIMISTIC`, `REALISTIC`, `OPTIMISTIC`), `CargoType` (`REGULAR`, `CHILLED`, `PASSENGERS`), `CoolingUnitType` (`DIESEL`, `ENGINE_DRIVEN`, `ELECTRIC`);
     - on `CalculationScenario` add `kind ScenarioKind`, remove `@unique` from `calculationId`, add `@@unique([calculationId, kind])`; on `Calculation` rename the relation `scenario` to `scenarios CalculationScenario[]`;
     - on `CalculationResult` add `annualSavingsAmount Decimal @db.Decimal(12, 2)`, `oneTimeCostAmount Decimal @db.Decimal(12, 2)`, `subsidyAmount Decimal @db.Decimal(12, 2)`, `savingsBreakdown Json`, `cumulativeSavingsSeries Json`; make `paybackPeriodMonths` nullable;
     - on `Vehicle` add `cargoType CargoType @default(REGULAR)`, `coolingUnitType CoolingUnitType?`, `idleHoursPerDay Float @default(0)`, `latitude Float?`, `longitude Float?`.
  2. Create the migration with `npx prisma migrate dev --name add_scenarios_and_result_shape`. Existing scenario rows get `kind = REALISTIC` in the migration SQL.
  3. Update `lib/vehicle-schema.ts` so the new fields are derived from the Prisma enums.
  4. Update every usage of `calculation.scenario` (the results page, the calculation GET route, `prisma/seed.ts`, `prisma/schema.integration.ts`) to use `scenarios` and pick `REALISTIC` where one scenario is shown.
  5. Rewrite the calculation part of `prisma/seed.ts` to call `calculate()` with `ASSUMPTION_SET_V1` and store all three scenarios. Remove every hard-coded result number.
  6. Add a test that `Object.values(ScenarioKind)` equals `SCENARIO_KINDS` from the engine (same for cargo and cooling types, if the engine defines them).
  7. Update `docs/data-model.md` (the Mermaid diagram) and `docs/security-model.md` to describe three scenarios per calculation.
- **Definition of done:**
  1. Standard check S5 passes, and `npx prisma migrate reset --force` followed by `npx prisma db seed` exits 0 against local Docker Postgres.
  2. A new case in `prisma/schema.integration.ts` proves that inserting two scenarios of the same kind for one calculation fails, and three different kinds succeed.
  3. `grep -rn "paybackPeriodMonths: [0-9]" prisma/seed.ts` prints nothing.
  4. The enum-sync test passes.
  5. `grep -rn "\.scenario\b" app lib prisma --include=*.ts --include=*.tsx | grep -v "app/generated\|app/prisma"` prints nothing.
  6. Standard checks S1–S4, S6, S8–S10 pass.

### Step 2.4 — Run the engine on fleet calculations

- **Depends on:** 2.3
- **Purpose:** `POST /api/fleets/[fleetId]/calculations` currently creates an empty calculation.
- **Concepts to learn:** server-side recomputation as a trust boundary, immutable input snapshots, atomic multi-row writes
- **Instructions:**
  1. Create `lib/calculation-service.ts` exporting `createCalculationForVehicle(tx, { fleetId, vehicle, requestedByUserId, notes })`. It builds a `CalculationInput` from the vehicle, calls `calculate()` with the current assumption set, and writes `Calculation`, three `CalculationScenario` rows (with `formulaVersion`, `assumptionSetVersion`, `kind`), each with a `CalculationInputSnapshot` (the resolved input and `inputSources` in `vehicleSpec`) and a `CalculationResult`.
  2. Use it in the POST route inside the existing transaction, keeping the `CALCULATION_CREATED` audit event. Return the calculation with its three results.
  3. The calculation GET route returns all scenarios with results.
  4. Update `calculationInputSchema` so unknown fields are stripped (a client cannot send results).
- **Definition of done:**
  1. A new API test proves: POST returns 201 with three results whose kinds are the three `ScenarioKind` values; the database has three scenarios, three snapshots and three results for the new calculation; `formulaVersion` equals `FORMULA_VERSION`.
  2. A test sends a body with extra fields (`paybackPeriodMonths: 1`, `result: {...}`) and proves the stored payback equals the engine's value, not 1.
  3. A test proves that a failure inside the transaction (mock the result insert to throw) leaves no calculation rows.
  4. Standard checks S1–S4, S6, S8–S10 pass.

### Step 2.5 — Create a fleet on sign-up

- **Depends on:** 2.4
- **Purpose:** New users currently have no fleet, so the workspace is unreachable for them.
- **Concepts to learn:** onboarding as a transaction, unique slug generation, reserved route names, post-login routing hubs
- **Instructions:**
  1. Make `Fleet.type` optional in the schema (fleets are mixed); migrate and update usages.
  2. Create `lib/fleet-slug.ts` with `slugifyFleetName(name)` (lowercase, transliterate ä→ae, ö→oe, ü→ue, ß→ss and accents, non-alphanumerics → `-`, trim dashes, max 48 chars) and `createUniqueFleetSlug(tx, name)` (appends `-2`, `-3`, …). Add `RESERVED_FLEET_SLUGS` with every static folder name under `app/[locale]/` plus `api`, `results`, `workspace`, `onboarding`, `dev`.
  3. Create `lib/fleet-service.ts` with `createFleetWithOwner(tx, { name, userId })`: creates the fleet, the `OWNER` membership and a `FLEET_CREATED` audit event (add the action to `AuditAction`).
  4. Add `app/api/fleets/route.ts`: `GET` lists the signed-in user's fleets (id, name, slug, role); `POST` creates a fleet for the signed-in user with `{ companyName, userName? }` (company 2–80 chars): it sets `User.name` when it is empty and calls `createFleetWithOwner`, all in one transaction. Add `POST /api/fleets` to `RATE_LIMITED_ROUTES` in `proxy.ts`.
  5. Add `app/[locale]/workspace/page.tsx` (server): no session → redirect to login; no fleets → redirect to `/[locale]/onboarding`; otherwise redirect to the first fleet's slug. Make it the default callback URL after every sign-in (Google and email link).
  6. Add `app/[locale]/onboarding/page.tsx` with "Your name" and "Company" fields that call `POST /api/fleets`, then go to `/[locale]/workspace` (minimal UI; restyled in 3.10).
- **Definition of done:**
  1. `lib/fleet-slug.test.ts` passes for: "Müller Kühltransporte GmbH" → `mueller-kuehltransporte-gmbh`; " ACME " → `acme`; a 100-character name → ≤ 48 chars; a reserved name such as "Calculator" never produces `calculator`.
  2. A test reads the folders under `app/[locale]/` and asserts every static folder name is in `RESERVED_FLEET_SLUGS`.
  3. API tests prove: `POST /api/fleets` creates the fleet, the `OWNER` membership and a `FLEET_CREATED` event and sets the user's name, in one transaction; two users creating "Nordwind" get slugs `nordwind` and `nordwind-2`; a missing or 1-character company returns 400; `GET /api/fleets` returns only the caller's fleets; `POST /api/fleets` without a session is rejected.
  4. Standard checks S1–S6, S8–S10 pass.
- **Owner review (browser):** sign in with an email link using a new address → you land on `/en/onboarding` → enter name and company → you land on `/en/<slug>` (the old pages may still look unstyled); sign in with Google as a user with no fleet → `/en/onboarding`.

---

## Milestone 3: Daylight UI Redesign

Every step follows [`design-guidelines.md`](./design-guidelines.md) and the previews in [`design/preview/`](./design/preview/index.html) (read the matching `design/canvas/*.dc.html` markup as reference; never copy its inline styles). Every data view implements loading, empty and error states (guidelines 7.22). The owner checks all visual results at 390, 834 and 1440 px, in light and dark mode.

### Step 3.1 — Design tokens, fonts and motion

- **Depends on:** 2.6
- **Purpose:** One token system that every later screen uses.
- **Concepts to learn:** design tokens, semantic vs. raw colours, Tailwind v4 `@theme inline`, theming with `data-theme`, `prefers-reduced-motion`, font subsetting
- **Instructions:**
  1. Rewrite the token part of `app/globals.css` per guidelines 4.1, 4.4, 4.5, 6 and 11.2: every colour token in light (`:root`) and dark (`:root[data-theme="dark"]`), `segment-track`, radii, shadows, easing, the keyframes `rise`, `step-in`, `swap`, `fill`, `grow`, `pulse`, `spin`, and `--animate-*` theme entries. Reduced-motion rules are nested inside selectors.
  2. Map every old variable to a new token and replace all usages in `app/` and `components/` (`grep -rn "var(--" app components`). Mapping: `--accent`→`lime`, `--background`/`--main`→`ground`, `--card`/`--form-bg`/`--input`→`surface`, `--text-heading`/`--text-body`→`ink`, `--description-text`→`muted`, `--border`→`line-strong`, `--container-border`→`line`, `--info-box`→`soft`, `--invert-bg-color`→`forest`, `--text-on-accent`→`on-lime`. Decide the rest and list them under "Decisions". Then delete the old variables and the custom `--breakpoint-*` values.
  3. In `app/[locale]/layout.tsx` replace Lexend and Inter with `Bricolage_Grotesque` (500, 700, 800) and `Instrument_Sans` (400, 500, 600), subsets `latin` and `latin-ext`, exposed as `--font-bricolage`/`--font-instrument`.
  4. Create `app/design-tokens.test.ts` that reads `app/globals.css` and asserts every token name in a `DESIGN_TOKEN_NAMES` list is defined in both the light and the dark block.
- **Definition of done:**
  1. `app/design-tokens.test.ts` passes.
  2. `grep -rnE "var\(--(accent|background|card|form-bg|input|main|text-heading|text-body|text-white|text-on-accent|info-box|border|container-border|invert-bg-color|description-text|card-shadow)\)" app components` prints nothing.
  3. `grep -n "^@media" app/globals.css` prints nothing (no top-level media queries).
  4. `grep -rn "Lexend\|Inter\b" app` prints nothing.
  5. Standard checks S1–S4, S8–S10 pass.
- **Owner review (browser):** `/en`, `/en/calculator`, `/en/login` in light and dark mode: new colours and fonts everywhere, no unreadable text, no broken layouts (old layouts are expected; only colours and fonts change).

### Step 3.2 — Core components and test utilities

- **Depends on:** 3.1
- **Purpose:** Shared building blocks, built once.
- **Concepts to learn:** component variant APIs, `<a>` vs `<button>` semantics, focus-visible styling, accessible names, testing components with real translations
- **Instructions:**
  1. Create `test-support/render-with-intl.tsx`: renders with `NextIntlClientProvider` using `messages/en.json`.
  2. Create `messages/messages.test.ts`: `en`, `de` and `es` have identical key sets; no value is empty.
  3. Build per guidelines section 7: `components/form/Button.tsx` (variants `primary`, `dark`, `secondary`, `ghost`, `danger`; sizes `lg`, `md`, `sm`; `icon`, `loading`), `components/form/ButtonLink.tsx`, `components/common/Card.tsx` (`as`, `tone`), `components/form/Input.tsx` (label, hint, error), `components/common/Logo.tsx` (placeholder mark per guidelines 4.6: forest circle with a gold centre; the owner will supply a final image later), `components/common/Badge.tsx` (`sample`, `info`), `components/common/RolePill.tsx` (roles from `Object.values(Role)`), `components/common/StatusPill.tsx` with `lib/report-status-display.ts` mapping every `ReportJobStatus` to a variant and message key, `components/common/Avatar.tsx`, `components/common/ProgressBar.tsx`, `components/common/Disclosure.tsx`.
  4. Create a development-only showcase page `app/[locale]/dev/components/page.tsx` that renders every component in every variant. It calls `notFound()` when `NODE_ENV === "production"`.
  5. Write a test file for each component.
- **Definition of done:**
  1. `messages/messages.test.ts` passes. Add missing keys and fix empty values in de/es if the test exposes them.
  2. Each component has a test file that checks, using role queries: Button renders a `button` with `aria-busy="true"` when loading and is disabled when `disabled`; ButtonLink renders a `link`; Input links hint and error via `aria-describedby` and sets `aria-invalid`; StatusPill renders a text label for every `ReportJobStatus` value (loop over the enum); RolePill renders every `Role` value; ProgressBar has `role="progressbar"` with `aria-valuenow`.
  3. A test proves `lib/report-status-display.ts` covers every value of `Object.values(ReportJobStatus)`.
  4. A test proves the showcase page calls `notFound` in production.
  5. Standard checks S1–S4, S8–S10 pass.
- **Owner review (browser):** `/en/dev/components` in light and dark mode: every variant matches guidelines section 7; press Tab through the page and check the focus ring on every interactive element.

### Step 3.3 — Public header, mobile menu and footer

- **Depends on:** 3.2
- **Purpose:** Consistent navigation on public screens at every breakpoint.
- **Concepts to learn:** the native `<dialog>` element for menus, focus trapping, returning focus to the trigger, `aria-expanded`
- **Instructions:**
  1. Rebuild `components/layout/Header.tsx` per guidelines 7.16: logo, desktop nav (How it works, Calculator, My fleet only when signed in → `/[locale]/workspace`), language switcher, theme toggle, Log in (`dark`, `sm`) or the user menu.
  2. Build `components/layout/MobileMenu.tsx` using `<dialog>` with `showModal()`: opens from the right, closes on Escape and on link click, returns focus to the hamburger button. In tests, stub `HTMLDialogElement.prototype.showModal` and `close` if jsdom lacks them.
  3. Restyle `LanguageSwitcher` and `ThemeToggle` per 7.23. Simplify `Footer` per 8.1 point 6.
  4. Delete components that are no longer used (`ClientMenu`, `NavLink` if unused) after grepping for imports.
- **Definition of done:**
  1. Header tests: Log in link present without a session; "My fleet" link present only with a session; the hamburger button has an accessible name and toggles `aria-expanded`; the menu's close button and Escape (the dialog `cancel` event) close it; focus returns to the hamburger button after closing.
  2. `grep -rn "ClientMenu\|NavLink" app components` prints nothing, or each remaining usage is explained under "Decisions".
  3. Standard checks S1–S4, S8–S10 pass.
- **Owner review (browser):** `/en` at 1440, 834 and 390 px: header layout per breakpoint; open the mobile menu, Tab stays inside it, Escape closes it; switch language and theme.

### Step 3.4 — Home page

- **Depends on:** 3.3
- **Purpose:** Explain the value in one sentence and start the calculator.
- **Concepts to learn:** honest marketing numbers (computed example vs. invented values), staggered entrance animation within the motion budget, server components calling pure functions
- **Instructions:**
  1. Rebuild `app/[locale]/page.tsx` per guidelines 8.1: hero, example panel, How it works, Built for band, footer.
  2. Create `lib/home-example.ts` with `HOME_EXAMPLE_QUICK_CHECK` (10 vans, regional, Berlin, roof). The example panel values come from `calculate()` on it (realistic scenario) and show a "Sample" badge.
  3. Create `components/common/BrandIllustration.tsx` per guidelines 4.7: a plain gold circle placeholder (decorative, `aria-hidden`, no animation). It is the only place the illustration is drawn, because the owner will replace it with a custom image later.
  4. Delete `components/home/CardCarousel.tsx`, `public/forestlight.webp`, `public/forestdark.webp`, `public/bus.webp` and the old home copy keys that are no longer used.
  5. Replace `app/page.test.tsx` with tests for the new page.
- **Definition of done:**
  1. Tests: exactly one `h1`; the primary CTA is a link to `/en/calculator`; the example panel's payback text equals the engine's formatted realistic payback for `HOME_EXAMPLE_QUICK_CHECK`; a "Sample" badge is present; the three How-it-works items render.
  2. `grep -rn "CardCarousel\|forestlight\|forestdark\|bus.webp" app components` prints nothing, and the three image files are gone.
  3. Standard checks S1–S4, S8–S10 pass.
- **Owner review (browser):** `/en` at three widths in both themes against the Home previews; `/de` for text length; with the OS "reduce motion" setting on, nothing animates.

### Step 3.5 — Calculator input components

- **Depends on:** 3.4
- **Purpose:** Big, forgiving controls instead of selects and small radios.
- **Concepts to learn:** native radio groups and keyboard behaviour, `role="radiogroup"`, react-hook-form `Controller`, controlled inputs
- **Instructions:**
  1. Build per guidelines 7.2–7.5, 7.8, 7.9: `components/form/ChoiceCard.tsx` + `ChoiceCardGroup.tsx` (native visually hidden radios inside labels; optional icon and sun-dot rating), `components/form/ChipGroup.tsx`, `components/form/NumberStepper.tsx` (1–999), `components/calculator/StepIndicator.tsx` (rail, bars and compact renderings), `components/calculator/AnswersPanel.tsx`.
  2. Create vehicle icons in `components/icons/` (van, truck, bus, trailer) as inline SVG components if Lucide lacks a good match.
  3. Create `lib/estimate-accuracy.ts` with `ESTIMATE_ACCURACY_LEVELS` (Rough < 50 %, Good 50–89 %, Precise ≥ 90 %) and `estimateAccuracy(inputSources)`; measured inputs count fully, provided inputs count fully, presets count zero.
  4. Add all components to the showcase page.
- **Definition of done:**
  1. Tests: `getByRole("radio", { name: /van/i })` can be selected; ArrowRight/ArrowDown moves the selection within a ChoiceCardGroup (via `@testing-library/user-event`; if jsdom does not support native arrow-key radio navigation, implement an explicit `onKeyDown` and test that); the group has `role="radiogroup"` and an accessible name; the stepper's minus button is disabled at 1 and plus at 999, and typed input outside the range shows an error; StepIndicator marks the current step with `aria-current="step"`.
  2. `lib/estimate-accuracy.test.ts` covers all three levels and both boundaries (49/50 %, 89/90 %).
  3. Standard checks S1–S4, S8–S10 pass.
- **Owner review (browser):** `/en/dev/components`: choice cards, chips, stepper, step indicator (resize for the three renderings), answers panel; keyboard use of every control.

### Step 3.6 — City search API

- **Depends on:** 3.5
- **Purpose:** Step 3 of the calculator needs an EU city with coordinates for solar yield.
- **Concepts to learn:** server-side API proxies that hide keys, input allowlists, rate limiting, mocking `fetch` in tests
- **Instructions:**
  1. Add `GET /api/geocode?q=&locale=` that calls the Mapbox Geocoding v6 forward endpoint with the server-side `MAPBOX_API` key, `types=place`, `country=` set to `EU_COUNTRY_CODES` and the request locale. Return at most 5 results `{ label, countryCode, latitude, longitude }`.
  2. Validate `q` (2–80 chars) with zod; return 400 otherwise. Add the route to `RATE_LIMITED_ROUTES`.
  3. Return 503 with a plain error key if the key is missing or Mapbox fails; never forward the raw Mapbox error.
- **Definition of done:**
  1. API tests with a mocked `fetch`: a valid query returns ≤ 5 normalised results; the outgoing URL contains `country=` with all 27 codes and never exposes the key in the response; `q` of 1 char returns 400; a Mapbox 500 returns 503 without Mapbox details; a missing key returns 503.
  2. Standard checks S1–S4, S6, S8–S10 pass.
- **Owner actions:** make sure `MAPBOX_API` is set in `.env.local` and in Vercel.

### Step 3.7 — Four-step calculator flow

- **Depends on:** 3.6
- **Purpose:** Collect inputs with the least effort; clicking Continue on the defaults four times must produce a result.
- **Concepts to learn:** multi-step form state, optional fields filled from presets, focus management on step change, `aria-live` announcements, validation on blur
- **Instructions:**
  1. Build `components/calculator/CalculatorWizard.tsx` and step components `VehiclesStep`, `DailyDrivingStep`, `LocationStep`, `PanelsStep` per guidelines 8.2, including the "Additions not on the canvas" block (cargo type, idling, cooling-unit type). Use `lib/quick-check-schema.ts` with react-hook-form.
  2. Defaults: Van, quantity 1, Regular goods, Regional, Rarely, Depot, Roof. The city has no default; step 3 cannot continue without one.
  3. The city field uses `/api/geocode` with a 300 ms debounce and an accessible combobox (`role="combobox"`, `aria-expanded`, `aria-activedescendant`, listbox options).
  4. Persist answers to `sessionStorage` (try/catch) and restore them on load.
  5. On step change: `step-in` animation, focus the new `h1` (`tabIndex={-1}`), announce "Step n of 4: <name>" in a polite live region.
  6. "See my results" navigates to `/[locale]/results?answers=<encodeQuickCheck(...)>`.
  7. Rewrite `app/[locale]/calculator/page.tsx`. Delete the old step components, `components/form/Form.tsx`, `Select.tsx`, `Dropdown.tsx`, `Textarea.tsx`, `FormSection.tsx` if nothing else imports them.
- **Definition of done:**
  1. Tests: with a mocked geocoder, choosing a city and pressing Continue four times on the defaults navigates to a URL whose `answers` decodes to the default answers plus the city; step 3 shows an error and moves focus to the city field when Continue is pressed without a city; after each step change the focused element is the new `h1`; the live region text changes to "Step 2 of 4…"; answers survive an unmount/remount through `sessionStorage`; choosing "Chilled or frozen" reveals the cooling-unit field inside the exact-numbers disclosure.
  2. `grep -rn "console\." components/calculator` prints nothing.
  3. Standard checks S1–S4, S8–S10 pass.
- **Owner review (browser):** `/en/calculator` at three widths: all four steps, defaults visibly selected, city search, exact-numbers disclosures, Back/Continue, refresh keeps answers; keyboard-only run through the whole flow.

### Step 3.8 — Public results page

- **Depends on:** 3.7
- **Purpose:** A yes/no verdict, the key numbers, when the money comes back, where the savings come from, and why the numbers can be trusted.
- **Concepts to learn:** humanising durations, locale-aware number/currency/unit formatting, accessible charts (figcaption and hidden table), view models shared by several pages
- **Instructions:**
  1. Create `lib/results-view-model.ts` with `toResultsViewModel(output, context)` that turns engine output into everything the page shows (verdict variant, humanised durations, ranges, tiles, chart series, breakdown, input sources).
  2. Build `components/results/`: `VerdictHeadline` (three templates and the range line), `StatTile` (rewrite `components/calculation/StatTile.tsx` per 7.10), `PaybackChart` (three lines per 7.20), `SavingsBreakdown`, `HowWeCalculated` (disclosure listing every input with its source label and the formula/assumption versions), `SaveToFleetCard`.
  3. Create `app/[locale]/results/page.tsx`: decode `answers` with `decodeQuickCheck`, run `calculate()` in the browser, render the view model. Invalid or missing answers show an error state with a link to the calculator.
  4. Save to my fleet: signed out → `savePendingQuickCheck` then go to `/[locale]/register`; signed in → post to the user's fleet (`GET /api/fleets`; if several, the first one) and go to the saved calculation.
  5. Share link copies the current URL with the Clipboard API and confirms in a live region.
  6. Format all numbers with next-intl `useFormatter`; never concatenate currency symbols.
- **Definition of done:**
  1. `lib/results-view-model.test.ts`: the verdict variant is "pays off" for payback ≤ 120 months, "slowly" for 121–300, "unlikely" for `null`; 52 months humanises to "4 years 4 months"; the range uses the pessimistic and optimistic scenarios.
  2. Component tests: the chart's `figcaption` states the break-even year; the hidden table has 11 rows × 3 series; SavingsBreakdown shows one line per applicable savings type and always shows battery breakdowns; HowWeCalculated lists every input with a source label; an invalid `answers` value renders the error state.
  3. `grep -rn "€\|\\$" components/results` finds no hard-coded currency symbols.
  4. Standard checks S1–S4, S8–S10 pass.
- **Owner review (browser):** complete the calculator, then check `/en/results?...` at three widths against the Results previews; try a refrigerated trailer in Madrid and a plain van in Stockholm to see different verdicts; Share link; Save to my fleet while signed out (should end in the new fleet after registering).

### Step 3.9 — Fleet results page

- **Depends on:** 3.8
- **Purpose:** Saved results look and behave the same as public ones.
- **Concepts to learn:** sharing UI between server-loaded and client-computed data, server-only data loading
- **Instructions:**
  1. Add `storedCalculationToEngineOutput(calculation)` in `lib/results-view-model.ts` that rebuilds engine-shaped output from the three stored scenarios.
  2. Rebuild `app/[locale]/[fleetSlug]/calculations/[calculationId]/page.tsx` with the `components/results/` components. Replace `SaveToFleetCard` with nothing (it is already saved). The Download PDF button is added in step 4.7.
  3. Move the fields of `components/calculation/ProvenancePanel.tsx` into `HowWeCalculated`, then delete `ProvenancePanel.tsx` if unused.
- **Definition of done:**
  1. A test proves that `toResultsViewModel(storedCalculationToEngineOutput(stored))` deep-equals `toResultsViewModel(calculate(sameInput))` for a seeded calculation.
  2. Access tests still pass: a user from another fleet gets 404/403 on the page's data loader.
  3. Standard checks S1–S4, S6, S8–S10 pass.
- **Owner review (browser):** sign in as `k.skoryna@gmail.com`, open `/en/berlin/calculations/calc_berlin_1` at three widths; it should match the public results page layout.

### Step 3.10 — Auth screens

- **Depends on:** 3.9
- **Purpose:** One consistent shell for log in, create account, "check your email" and onboarding.
- **Concepts to learn:** shareable tab URLs (links vs. tabs), form-level vs. field-level errors, designing the waiting moment of a passwordless flow
- **Instructions:**
  1. Build `components/auth/AuthShell.tsx` per guidelines 8.4 and `components/common/SegmentedControl.tsx` (links variant with `aria-current="page"`; the tabs variant is built in 3.12).
  2. Restyle login and register (Google button, divider "or with email", email field, primary action "Email me a sign-in link"; register uses the "Create your free account" copy), `check-email` ("We sent a link to {email}. It works for 15 minutes.", a "Send it again" button enabled after 60 seconds, and a "Use a different email" link) and onboarding (Your name + Company) with `AuthShell`.
  3. Link errors (expired or already used) appear form-level above the button with a plain sentence and a "Send a new link" action.
- **Definition of done:**
  1. `grep -rni "password" components/auth components/login components/register app/\[locale\]/login app/\[locale\]/register` prints nothing.
  2. Tests: submitting an email goes to check-email showing that address; "Send it again" is disabled for 60 seconds (fake timers); the segmented control marks the current page with `aria-current="page"`; a link-error query parameter shows the expired-link message; onboarding cannot submit without a company.
  3. Standard checks S1–S4, S6, S8–S10 pass.
- **Owner review (browser):** `/en/login`, `/en/register`, `/en/check-email`, `/en/onboarding` at three widths against the Login previews; the full sign-up flow with an email link and with Google.

### Step 3.13 — Fleet dashboard

- **Depends on:** 3.12
- **Purpose:** "What does solar mean for my whole fleet, and what needs my attention?"
- **Concepts to learn:** "latest row per group" queries, handling stale assumption versions, pure aggregation functions, role-based actions
- **Instructions:**
  1. Create `lib/fleet-dashboard.ts`: `loadFleetDashboardData(fleetId)` (latest calculation per non-deleted vehicle with its realistic result) and a pure `aggregateFleetKpis(groups, currentAssumptionSetVersion)`:
     - could save per year = sum of realistic annual savings of groups calculated with the current assumption set;
     - average payback = mean of those groups' paybacks weighted by vehicle quantity (groups with `null` payback excluded and counted separately);
     - CO₂ avoided = sum;
     - not calculated yet = groups without a calculation plus groups calculated with an older assumption set.
  2. Create `app/[locale]/[fleetSlug]/overview/page.tsx` per guidelines 8.5: header with Add vehicles (editors only, → `/[slug]/vehicles/new`), KPI row, vehicle groups list (`components/fleet/VehicleGroupList.tsx`), recent activity (2 items + link), with loading, empty and error states. The report-in-progress card is added in 4.7.
  3. Mark the guidelines' open question 12.8 as decided with these rules.
- **Definition of done:**
  1. `lib/fleet-dashboard.test.ts` covers: an empty fleet, mixed current/stale groups, a group with `null` payback, the weighted average with quantities 1 and 9, and a group without a calculation.
  2. Component tests: the empty state shows the sentence and the Add vehicles action for editors; a Viewer sees no Add vehicles button; "based on {n} calculated groups" shows the right n.
  3. Standard checks S1–S4, S6, S8–S10 pass.
- **Owner review (browser):** `/en/berlin` as owner and viewer at three widths and in dark mode against the Dashboard previews; a new empty fleet shows the empty state.

### Step 3.14 — Vehicles and calculations pages

- **Depends on:** 3.13
- **Purpose:** The navigation links to these pages; they are not on the canvas, so they are built from the design system.
- **Concepts to learn:** designing from a system instead of a mockup, list/detail patterns, reusing a wizard in a second context
- **Instructions:**
  1. First add sections "8.8 Vehicles" and "8.9 Calculations" to `design-guidelines.md`: purpose, content order and a breakpoint table, in the style of 8.5.
  2. `/[slug]/vehicles`: list of vehicle groups (reuse `VehicleGroupList`), each with edit and "Run calculation" for editors, soft delete with a confirm dialog (`danger` button).
  3. `/[slug]/vehicles/new`: `CalculatorWizard` in fleet mode; the last button is "Save to fleet" and posts to the quick-checks API.
  4. `/[slug]/vehicles/[vehicleId]/edit`: form with all vehicle fields (reuse the wizard's controls), PATCH on save.
  5. `/[slug]/calculations`: history (vehicle, date, realistic payback, assumption version, status pill "Calculated" or "Needs calculation" when stale), each row linking to the result.
- **Definition of done:**
  1. The two guideline sections exist (`grep -n "### 8.8 Vehicles\|### 8.9 Calculations" docs/design-guidelines.md`).
  2. Tests: fleet-mode wizard posts to `/api/fleets/<id>/quick-checks`; Viewers see no edit, run or delete actions; the delete dialog requires confirmation; a stale calculation shows "Needs calculation".
  3. Every page has loading, empty and error states (one test each for the lists).
  4. Standard checks S1–S4, S6, S8–S10 pass.
- **Owner review (browser):** `/en/berlin/vehicles`, `/new`, `/edit`, `/en/berlin/calculations` at three widths; add a vehicle, edit it, run a calculation, delete it.

### Step 3.15 — Read-only demo fleet

- **Depends on:** 3.14
- **Purpose:** Reviewers see the workspace in one click without signing up.
- **Concepts to learn:** safe demo access (read-only role, data reset), feature switches through environment variables, abuse prevention
- **Instructions:**
  1. Create `prisma/demo-seed.ts` (script `npm run demo:reset`): recreates fleet `demo` ("Nordwind Logistics (demo)") with 8 vehicle groups (vans, refrigerated trailers with each cooling-unit type, a bus, a long-haul truck; several EU cities), engine-computed calculations, members with each role, and a set of audit events. User `demo@solar-calculator.app` is a `VIEWER`.
  2. Add an Auth.js Credentials provider with id `demo` that signs in the demo user without a password, active only when `DEMO_MODE_ENABLED === "true"`. Add its callback path to `RATE_LIMITED_ROUTES`.
  3. Add "Explore a demo fleet" to the home hero (secondary) and the login page, shown only in demo mode.
- **Definition of done:**
  1. Tests: the demo provider is absent when `DEMO_MODE_ENABLED` is unset; the demo user has only the `VIEWER` role; a POST to vehicles as the demo user returns 403; the demo button is not rendered without demo mode.
  2. `npm run demo:reset` runs twice in a row without errors, and the fleet has exactly 8 groups afterwards.
  3. Standard checks S1–S6, S8–S10 pass.
- **Owner actions:** set `DEMO_MODE_ENABLED=true` locally and in Vercel.
- **Owner review (browser):** from `/en`, "Explore a demo fleet" opens the demo dashboard; no editing actions are visible.

### Step 3.16 — Accessibility, copy and cleanup pass

- **Depends on:** 3.15
- **Purpose:** Close the redesign against the checklist, not by eye.
- **Concepts to learn:** WCAG 2.2 AA auditing with axe, translation length expansion, removing global CSS that fights utilities
- **Instructions:**
  1. Add `jest-axe` (dev dependency) and an axe test for every page component: Home, Calculator (each step), Results, fleet Results, the auth pages, Dashboard, Team & activity, Vehicles, Calculations.
  2. Remove the global element styles from `globals.css` (`button`, `li`, `h1`–`h6` rules); keep only `body` background/colour/font and `box-sizing`. Fix any component that relied on them.
  3. Review all `de` and `es` copy against guidelines 9.1–9.2 and fix typos (e.g. "independant").
  4. Tick the section 10 checklist items that can be verified in code, and list the ones that need the owner (zoom, screen reader, 320 px) under "Please check in the browser".
- **Definition of done:**
  1. Every axe test reports zero violations.
  2. `grep -nE "^\s*(button|li|h[1-6])\s*[,{]" app/globals.css` prints nothing.
  3. `grep -rni "independant" messages` prints nothing.
  4. Standard checks S1–S4, S8–S10 pass.
- **Owner review (browser):** every screen at 320 px (no horizontal scroll), 200 % zoom, reduced motion, dark mode, German; one screen-reader pass through calculator → results.

---

## Milestone 4: Temporal Report Workflow and Real-Time Progress

### Step 4.1 — Temporal in Docker Compose and a worker

- **Depends on:** 3.16
- **Purpose:** A local orchestration environment before any workflow code.
- **Concepts to learn:** what a workflow engine solves that a queue does not (durability, replay, visibility); Temporal server, worker and client
- **Instructions:**
  1. Add a `temporal` service to `docker-compose.yml` using `temporalio/temporal` with `server start-dev --ip 0.0.0.0` (ports 7233 and 8233).
  2. Install `@temporalio/client`, `@temporalio/worker`, `@temporalio/workflow`, `@temporalio/activity`.
  3. Create `workers/temporal/worker.ts` (task queue constant `REPORTS_TASK_QUEUE` in `lib/temporal-config.ts`, address from `TEMPORAL_ADDRESS`, default `localhost:7233`) and the script `"worker": "tsx workers/temporal/worker.ts"`.
  4. Add a trivial `pingWorkflow` and a script `workers/temporal/ping.ts` that runs it and prints the result.
- **Definition of done:**
  1. `docker compose up -d temporal` succeeds and `curl -s -o /dev/null -w "%{http_code}" localhost:8233` prints `200`.
  2. With the worker started in the background (`timeout 60 npm run worker &`), `npx tsx workers/temporal/ping.ts` prints `pong` within 30 seconds.
  3. Standard checks S1–S3, S8–S10 pass.
- **Owner review (browser):** Temporal UI at `http://localhost:8233` shows the completed ping workflow.

### Step 4.2 — Report job state machine

- **Depends on:** 4.1
- **Purpose:** Define the allowed report states and transitions before orchestration code uses them.
- **Concepts to learn:** state machines, valid vs. invalid transitions, terminal states
- **Instructions:**
  1. Create `lib/report-job-state-machine.ts` with `REPORT_JOB_TRANSITIONS` keyed by every `ReportJobStatus`: `QUEUED → VALIDATING → CALCULATING → RENDERING_CHARTS → GENERATING_REPORT → (GENERATING_RECOMMENDATIONS) → COMPLETED`; any non-terminal → `FAILED` or `CANCELLED`; terminal states have no exits. Export `canTransition` and `assertTransition` (throws `InvalidReportTransitionError`).
  2. Create `docs/report-workflow.md` with a Mermaid state diagram generated from the same transitions (write it by hand, then verify with the test below).
- **Definition of done:**
  1. Tests: every `ReportJobStatus` value is a key; every listed transition is allowed; `COMPLETED → CALCULATING` and `QUEUED → COMPLETED` throw; terminal states have empty transition lists.
  2. A test parses the Mermaid block in `docs/report-workflow.md` and asserts its edges equal `REPORT_JOB_TRANSITIONS`.
  3. Standard checks S1–S3, S8–S10 pass.

### Step 4.3 — Report request API

- **Depends on:** 4.2
- **Purpose:** A synchronous entry point that starts asynchronous work.
- **Concepts to learn:** idempotency keys, separating "accept the request" from "do the work", dependency injection for testability
- **Instructions:**
  1. Add `POST /api/fleets/[fleetId]/reports` (roles: `FLEET_EDITOR_ROLES`) with body `{ calculationId, idempotencyKey }` (UUID). It creates a `ReportJob` (`QUEUED`, `temporalWorkflowId = report/{fleetId}/{jobId}`) and starts the workflow through `lib/report-workflow-client.ts`, which the tests mock.
  2. The same idempotency key returns 200 with the existing job and starts nothing. A calculation from another fleet returns 404.
  3. Add `GET /api/fleets/[fleetId]/reports` (list) and `GET /api/fleets/[fleetId]/reports/[jobId]` (one job), roles `ANY_FLEET_ROLE`.
  4. Add the POST route to `RATE_LIMITED_ROUTES`.
- **Definition of done:**
  1. API tests: first POST → 201, job `QUEUED`, workflow client called once with the deterministic ID; second POST with the same key → 200, same job, client not called again; a viewer → 403; another fleet's calculation → 404; the list returns only the fleet's jobs.
  2. Standard checks S1–S4, S6, S8–S10 pass.

### Step 4.4 — Report workflow and PDF generation

- **Depends on:** 4.3
- **Purpose:** The durable, retryable business logic that turns a calculation into a PDF.
- **Concepts to learn:** workflow determinism rules, activities vs. workflows, retry policies, deterministic workflow IDs, storage behind an interface
- **Instructions:**
  1. Create `workers/temporal/workflows/generate-report.ts` and activities in `workers/temporal/activities/`: `loadCalculationSnapshot`, `renderReportPdf`, `storeReportFile`, `updateReportJobStatus` (uses `assertTransition` and `pg_notify('fleet_events', json)` with `{ type: "report.progress", fleetId, jobId, status }`).
  2. Generate the PDF with `jspdf` (already a dependency) in Node: title, fleet and vehicle, verdict, the four key numbers with ranges, the payback lines drawn from the stored series, the savings breakdown, and provenance. Use a fixed creation date from the job for determinism.
  3. Create `lib/report-file-store.ts` with a `ReportFileStore` interface and a local-disk implementation writing to `storage/reports/{fleetId}/{jobId}.pdf` (add `storage/` to `.gitignore`).
  4. Add `GET /api/fleets/[fleetId]/reports/[jobId]/file` that streams the PDF for fleet members.
  5. Retry policy: 3 attempts with backoff for activities. `REPORT_SIMULATE_TRANSIENT_FAILURE=1` makes `renderReportPdf` fail on its first attempt.
- **Definition of done:**
  1. With Temporal, the worker and Postgres running, a script `workers/temporal/run-report-demo.ts` creates a job for `calc_berlin_1`, waits for completion, and prints the job's final status `COMPLETED` and the file path; the file exists and starts with `%PDF`.
  2. With `REPORT_SIMULATE_TRANSIENT_FAILURE=1` the same script still ends `COMPLETED`.
  3. API tests: a member downloads the file (200, `application/pdf`); another fleet's member gets 403/404.
  4. Standard checks S1–S4, S6, S8–S10 pass.

### Step 4.5 — AI recommendation activity

- **Depends on:** 4.4, and the owner has written the chosen LLM provider and model in this step's Notes
- **Purpose:** A generative feature that cannot contaminate deterministic financial output.
- **Concepts to learn:** structured output validation, separating deterministic and generated content, per-tenant feature flags, failing soft
- **Instructions:**
  1. If the Notes column has no provider, set `BLOCKED` with the reason "Choose the LLM provider and model".
  2. Add a `ReportRecommendation` model (`reportJobId` unique, `content Json`, `model`, `promptVersion`, `createdAt`); migrate.
  3. Add activity `generateRecommendations`: sends only the calculation's non-personal numbers (no names, emails or cities finer than country) to the provider, validates the answer with a strict zod schema (max 5 tips, each ≤ 280 chars), stores it. On invalid output or provider failure it records nothing and the workflow continues.
  4. The workflow runs it only when the fleet's `FeatureFlag` key `AI_RECOMMENDATIONS` is enabled (constant in `lib/feature-flags.ts`).
  5. The PDF shows the section with the heading "Generated guidance, not financial advice".
- **Definition of done:**
  1. Tests with a mocked provider: valid output is stored; invalid JSON stores nothing and the job still completes; the flag off means the activity is never called; the prompt payload contains no email, user name or fleet name (assert on the captured request).
  2. Standard checks S1–S5, S6, S8–S10 pass.

### Step 4.6 — Fleet event stream (SSE)

- **Depends on:** 4.5
- **Purpose:** Real-time updates over one channel that Milestone 5 reuses for telemetry.
- **Concepts to learn:** SSE vs. WebSockets, the SSE wire format, heartbeats, Postgres `LISTEN/NOTIFY`, serverless duration limits and reconnecting by design, sending a snapshot on connect instead of replaying history
- **Instructions:**
  1. Create `lib/fleet-events.ts` with `FLEET_EVENT_TYPES` (`snapshot`, `report.progress`, `activity.created`; `telemetry.updated` is added in 5.6) and `formatSseEvent({ id, type, data })`.
  2. Add `GET /api/fleets/[fleetId]/stream` (`runtime = "nodejs"`, roles `ANY_FLEET_ROLE`): opens a dedicated `pg` client, `LISTEN fleet_events`, forwards only events for this fleet, sends a `snapshot` event first (current non-terminal report jobs), a heartbeat comment every 15 s, and cleans up the listener when the request is aborted.
  3. Emit `activity.created` from `recordAuditEvent` after commit (via `pg_notify` in the same transaction).
  4. Create `lib/use-fleet-stream.ts`: a hook around `EventSource` exposing `status` (`connecting`, `live`, `reconnecting`, `offline`) that writes events into the TanStack Query cache (report job queries, activity queries).
- **Definition of done:**
  1. `lib/fleet-events.test.ts` checks the exact SSE wire format, including multi-line data.
  2. API tests: a non-member gets 403; the first chunk read from the stream is a `snapshot` event; a `pg_notify` for another fleet is not forwarded; aborting the request releases the `pg` client (spy on `end`).
  3. Hook tests with a mock `EventSource`: status moves `connecting → live`, an error moves it to `reconnecting`; a `report.progress` event updates the cached job.
  4. `curl -N` against the local stream (with a session cookie from a test login script) prints the snapshot within 2 seconds — list the command in the summary.
  5. Standard checks S1–S4, S6, S8–S10 pass.

### Step 4.7 — Report UI and history

- **Depends on:** 4.6
- **Purpose:** Request a PDF, watch it progress live, and find past reports.
- **Concepts to learn:** push vs. polling for lists, optimistic UI, live status announcements
- **Instructions:**
  1. First add section "8.10 Reports" to `design-guidelines.md` (Download PDF behaviour on fleet results, progress card, history list).
  2. Add Download PDF (`dark`) to the fleet results page: posts a report request with a new idempotency key, shows the progress card (7.19 progress bar with plain-language step labels from `lib/report-status-display.ts`), and offers the file when `COMPLETED`.
  3. Enable the report-in-progress card on the dashboard (hidden when no job is running).
  4. Add `/[slug]/reports` with the history (status pill, requested by, duration, download link), linked from the Calculations page header.
  5. Status changes are announced in a polite live region.
- **Definition of done:**
  1. Component tests with a mocked stream: the progress card goes from "Checking your data…" to "Ready" as events arrive; the download link appears only when completed; a failed job shows "Something went wrong — try again" with a retry button; the history renders loading, empty and error states.
  2. Standard checks S1–S4, S6, S8–S10 pass.
- **Owner review (browser):** with the worker running, press Download PDF on `/en/berlin/calculations/calc_berlin_1`: watch live progress, open the PDF; check `/en/berlin/reports` and the dashboard card.

### Step 4.8 — Workflow and concurrency tests

- **Depends on:** 4.7
- **Purpose:** Prove durability and isolation instead of demoing them once.
- **Concepts to learn:** time-skipping test environments, forcing transient failures, testing cancellation
- **Instructions:**
  1. Add `@temporalio/testing` and `workers/temporal/__tests__/generate-report.test.ts` using `TestWorkflowEnvironment.createTimeSkipping()`.
  2. Add a script `"test:workflows"` and a CI step for it.
- **Definition of done:**
  1. `npm run test:workflows` passes with tests for: the happy path through all statuses in order; a transient failure retried to success; a permanent failure ending `FAILED` with the job row updated; cancellation ending `CANCELLED` in Temporal and the database; two concurrent requests with the same idempotency key starting exactly one workflow.
  2. `.github/workflows/ci.yml` runs `npm run test:workflows`.
  3. Standard checks S1–S3, S8–S10 pass.

---

## Milestone 5: Python Telemetry Service and Live Data

Also a Python deep dive: every step's concepts go into `docs/key-concepts.md` with Python snippets. The `CLAUDE.md` rules apply to Python too: no comments or docstrings, descriptive names, constants for repeated literals.

### Step 5.1 — Scaffold the Python service

- **Depends on:** 4.8
- **Purpose:** A modern, typed Python project before any logic.
- **Concepts to learn:** `uv` projects, lockfiles and virtual environments, type hints and `mypy --strict`, ASGI vs. WSGI, FastAPI app structure, `async def` vs. `def` endpoints
- **Instructions:**
  1. Create `services/telemetry/` with `uv init --package` (Python 3.13): package `telemetry`, dependencies `fastapi`, `uvicorn[standard]`, `pydantic-settings`; dev dependencies `ruff`, `mypy`, `pytest`, `pytest-asyncio`, `httpx`.
  2. Configure `ruff` (lint + format, line length 100) and `mypy` (`strict = true`) in `pyproject.toml`.
  3. `telemetry/main.py` creates the app with `GET /health/live` → `{"status": "ok"}`; `telemetry/settings.py` uses pydantic-settings.
  4. Add `services/telemetry/Dockerfile` (python:3.13-slim, `uv sync --frozen --no-dev`, non-root user, `uvicorn telemetry.main:app --host 0.0.0.0 --port 8000`) and a `telemetry` service in `docker-compose.yml`.
  5. Add `tests/test_health.py`.
- **Definition of done:**
  1. Standard check S7 passes.
  2. `docker compose up -d --build telemetry` succeeds and `curl -s localhost:8000/health/live` prints `{"status":"ok"}`.
  3. `docker compose exec telemetry id -u` prints a non-zero number.
  4. Standard checks S8–S10 pass.

### Step 5.2 — OpenAPI → TypeScript types pipeline

- **Depends on:** 5.1
- **Purpose:** Keep the two languages in sync without hand-writing types twice.
- **Concepts to learn:** API contracts as the source of truth, code generation, detecting contract drift in CI
- **Instructions:**
  1. Add `telemetry/export_openapi.py` that writes the app's OpenAPI JSON to stdout.
  2. Add `openapi-typescript` (dev dependency) and scripts: `"api:types"` (export to `types/telemetry-openapi.json`, generate `types/telemetry-api.ts`) and `"api:types:check"` (regenerate into a temp dir and `diff` against the committed files; exit 1 on difference).
  3. Create `lib/telemetry-client.ts` (server-only) with a typed `getHealth()` built only on `types/telemetry-api.ts`.
  4. Add `npm run api:types:check` to CI.
- **Definition of done:**
  1. `npm run api:types:check` exits 0.
  2. Temporarily renaming the `status` field in the health response, running `npm run api:types`, then `npx tsc --noEmit` fails in `lib/telemetry-client.ts`; revert afterwards (describe the result in the summary).
  3. Standard checks S1–S3, S7–S10 pass.

### Step 5.3 — Service-to-service authentication

- **Depends on:** 5.2
- **Purpose:** The Python service must never be a public back door into fleet data.
- **Concepts to learn:** FastAPI dependency injection, signed short-lived JWTs, carrying tenant scope in token claims, keeping internal services off the public internet
- **Instructions:**
  1. Add `pyjwt`. Create `telemetry/auth.py` with a dependency `require_service_token` that verifies HS256 tokens signed with `TELEMETRY_SERVICE_SECRET`: `iss = "solar-calculator-web"`, `aud = "telemetry-service"`, `exp` at most 60 s ahead, and a `scope` claim (`fleet:<id>` or `public:solar-yield`).
  2. Add `require_fleet_scope(fleet_id)` that rejects tokens whose scope does not match the path's fleet.
  3. `lib/telemetry-client.ts` signs a fresh token per request with `jsonwebtoken`.
  4. Add a protected placeholder `GET /fleets/{fleet_id}/ping` for testing; remove it in 5.7.
- **Definition of done:**
  1. pytest: no token → 401; wrong secret → 401; expired → 401; wrong audience → 401; scope for fleet A on fleet B's path → 403; a valid token → 200.
  2. Jest: the client's token has the exact claims and an `exp` ≤ 60 s ahead.
  3. `.env.example` contains `TELEMETRY_SERVICE_SECRET=` and `TELEMETRY_SERVICE_URL=`.
  4. Standard checks S1–S3, S7–S10 pass.

### Step 5.4 — Telemetry tables and Python data access

- **Depends on:** 5.3
- **Purpose:** Store readings and rollups without a second migration system.
- **Concepts to learn:** one owner for the schema, mapping Python to tables it does not migrate, async database access, time-series table design and indexing
- **Instructions:**
  1. In Prisma add: enum `TelemetrySource` (`SIMULATOR`, `CSV_IMPORT`); `TelemetryReading` (`id BigInt @id @default(autoincrement())`, `fleetId`, `vehicleId`, `recordedAt`, `kmDriven`, `energyUsedKwh`, `solarEnergyKwh`, `batteryVoltage?`, `engineIdleMinutes`, `coolingUnitRunMinutes?`, `setpointCelsius?`, `ambientCelsius?`, `source`, `importId?`; indexes `[vehicleId, recordedAt]`, `[fleetId, recordedAt]`; unique `[vehicleId, recordedAt, source]`); `VehicleDailyRollup` (unique `[vehicleId, day]`, daily sums and averages, `readingCount`, `isComplete`); `TelemetryImport` (`fleetId`, `uploadedByUserId`, `fileSha256`, `acceptedRows`, `rejectedRows`, `errors Json`, `createdAt`; unique `[fleetId, fileSha256]`). Migrate.
  2. Add `sqlalchemy[asyncio]` and `asyncpg`. Create `telemetry/db/tables.py` (SQLAlchemy Core `Table` definitions matching the Prisma tables) and `telemetry/db/repository.py` with typed async functions (insert readings in bulk, upsert rollups, read readings for a vehicle and period).
  3. Add a pytest fixture that uses the `<db>_test` database with migrations applied (reuse `npx prisma migrate deploy` via subprocess, or require it to be prepared by a script).
- **Definition of done:**
  1. Standard check S5 passes.
  2. pytest: insert and read back readings; a duplicate `(vehicleId, recordedAt, source)` is ignored; a drift test compares every column in `tables.py` with `information_schema.columns` (name and nullability) and passes.
  3. Standard checks S1–S3, S7–S10 pass.

### Step 5.5 — Solar yield with pvlib

- **Depends on:** 5.4
- **Purpose:** Replace the static yield table from 2.1 with solar physics for any EU location.
- **Concepts to learn:** irradiance components (GHI/DNI/DHI), plane-of-array irradiance for flat and vertical panels, typical meteorological years, caching expensive external calls
- **Instructions:**
  1. Add `pvlib`, `pandas`, `numpy`. Create `telemetry/solar/yield_model.py`: fetch a TMY with `pvlib.iotools.get_pvgis_tmy`, compute monthly kWh per kWp for `ROOF` (horizontal), `SIDES` (vertical, averaged over four azimuths), `BACK` (vertical, averaged over four azimuths), `ALL_OVER` (area-weighted mix defined as a constant), with system losses from a constant.
  2. Add a Prisma model `SolarYieldCache` (latitude and longitude rounded to 0.1°, placement, `monthlyKwhPerKwp Json`, `source`, `fetchedAt`; unique on the rounded coordinates and placement); migrate. Cache hits skip PVGIS.
  3. Add `GET /solar-yield?lat=&lon=&placement=` (scope `public:solar-yield` or any fleet scope). Reject coordinates outside the EU bounding box constant with 422.
  4. Add Next route `GET /api/solar-yield` that proxies to the service (rate-limited) and falls back to the 2.1 table with `source: "COUNTRY_TABLE"` if the service is down.
  5. The engine accepts an optional `yieldOverride` with its source; the calculator and results fetch it and the provenance shows "PVGIS + pvlib" or "Country table (offline)".
  6. Save one real PVGIS TMY response for Berlin as a test fixture (`tests/fixtures/pvgis_tmy_berlin.json`); tests never call the network.
- **Definition of done:**
  1. pytest with the fixture: Berlin `ROOF` annual yield is within ±15 % of the flat PVGIS value recorded in `docs/assumptions-v1.md`; `SIDES` < `ROOF`; all 12 months ≥ 0; a second call with the same rounded coordinates reads the cache (mock PVGIS called once); coordinates of New York → 422.
  2. Jest: the Next route returns the country-table fallback when the service call fails, with the correct `source`.
  3. `npm run api:types:check` exits 0 after regenerating.
  4. Standard checks S1–S7, S8–S10 pass.

### Step 5.6 — Telemetry simulator

- **Depends on:** 5.5
- **Purpose:** Realistic, continuously arriving data for the demo fleet without real vehicles.
- **Concepts to learn:** asyncio tasks and graceful shutdown, pure data generators, seeded randomness, plausible synthetic data (daily and weekly patterns, sun position, temperature-driven cooling demand)
- **Instructions:**
  1. Create `telemetry/simulator/generator.py` with a pure `generate_reading(vehicle, timestamp, rng) -> Reading`: km follow the vehicle's distance band and a weekday pattern; solar energy follows `pvlib.solarposition` (zero at night); cooling-unit run time rises with ambient temperature for chilled vehicles; idle minutes follow the idling answer; battery voltage drops without solar.
  2. Create `telemetry/simulator/run.py` (`uv run python -m telemetry.simulator.run --seed 42 --interval 5`): every interval it generates one reading per vehicle in fleets whose `FeatureFlag` `TELEMETRY_SIMULATOR` is enabled, stores them, and sends `NOTIFY fleet_events` with `{ "type": "telemetry.updated", "fleetId", "vehicleId" }`. SIGTERM finishes the current batch and exits 0.
  3. Add `telemetry.updated` to `FLEET_EVENT_TYPES`. Enable the flag for the demo fleet in `prisma/demo-seed.ts`.
  4. Add a `telemetry-simulator` service to `docker-compose.yml`.
- **Definition of done:**
  1. pytest: the same seed and timestamps give identical readings; solar energy is 0 at 02:00 local time in Berlin in December; a chilled trailer at 30 °C runs its cooling unit longer than at 10 °C; all values are within physical bounds (a bounds constant).
  2. pytest: SIGTERM during a run exits with code 0 and no partial batch (all-or-nothing insert).
  3. With the stack running for 60 seconds, a SQL count shows new readings for every demo vehicle (command and output in the summary).
  4. Standard checks S1–S3, S7–S10 pass.

### Step 5.7 — Rollups and measured profiles with pandas

- **Depends on:** 5.6
- **Purpose:** Turn raw readings into the measured values the engine needs.
- **Concepts to learn:** DataFrames, `resample` and `rolling`, time zones in time series, handling gaps and outliers
- **Instructions:**
  1. Create `telemetry/rollups/compute.py` with pure functions: `compute_daily_rollups(readings: DataFrame, timezone: str) -> DataFrame` (days in the vehicle's local time zone; a country → time zone constant) and `compute_measured_profile(rollups, window_days=30) -> MeasuredProfile` (average km/day, kWh/100 km, idle hours/day, cooling hours/day, observed solar yield; `is_reliable` only with ≥ 20 complete days).
  2. Outliers (negative values, > 1,500 km/day) are dropped and counted.
  3. A rollup job runs every 5 minutes in the simulator process and upserts `VehicleDailyRollup`.
  4. Add `GET /fleets/{fleet_id}/measured-profiles` (fleet scope). Remove the 5.3 ping endpoint. Regenerate the TypeScript types.
- **Definition of done:**
  1. pytest with small hand-built frames: daily sums match; a reading at 23:30 UTC lands on the next local day in Europe/Berlin in summer; a missing day lowers `readingCount` and sets `isComplete` false; outliers are dropped and counted; 19 complete days → `is_reliable` false, 20 → true.
  2. The endpoint rejects another fleet's token (403) and returns profiles matching a manual SQL aggregate on the demo fleet (query and both outputs in the summary).
  3. Standard checks S1–S3, S7–S10 pass.

### Step 5.8 — Trip-log CSV import API

- **Depends on:** 5.7
- **Purpose:** Real users can replace presets with their own data.
- **Concepts to learn:** safe file uploads (size, type, row limits), row-level validation with clear error reports, idempotent imports by content hash, never trusting IDs in uploaded files
- **Instructions:**
  1. Define the CSV format in `lib/telemetry-import-format.ts` (columns `vehicle_id`, `date`, `km_driven`, `energy_used_kwh`, `engine_idle_hours`, `cooling_unit_hours`; limits 5 MB and 50,000 rows as constants shared by the template and the checks).
  2. Add `GET /api/fleets/[fleetId]/telemetry-imports/template` that returns a CSV template pre-filled with the fleet's vehicle IDs and names.
  3. Add `POST /api/fleets/[fleetId]/telemetry-imports` (roles `FLEET_EDITOR_ROLES`, rate-limited): checks size and type, computes SHA-256, forwards to Python `POST /fleets/{fleet_id}/imports`, writes a `TELEMETRY_IMPORTED` audit event, and maps Python error codes to message keys.
  4. Python validates each row with Pydantic, rejects rows whose `vehicle_id` does not belong to the fleet, stores valid rows as `CSV_IMPORT` readings, stores the `TelemetryImport`, triggers a rollup for the affected vehicles, and returns `{ importId, acceptedRows, rejectedRows, errors: [{ row, code }] }`. The same file hash returns the existing import without new rows.
- **Definition of done:**
  1. pytest: a file with 2 bad rows (bad date, negative km) imports the rest and reports rows and codes; a row with another fleet's vehicle ID is rejected with `VEHICLE_NOT_IN_FLEET`; uploading the same file twice creates no new readings; 50,001 rows → rejected before parsing.
  2. API tests: a viewer → 403; a 6 MB file → 413 without calling Python; a non-CSV type → 415; a successful import writes one audit event; every Python error code has a message key in all three locales (test loops over the code list constant).
  3. Standard checks S1–S7, S8–S10 pass.

### Step 5.9 — Measured data and the recalculation workflow

- **Depends on:** 5.8
- **Purpose:** Close the loop from _Rough_ to _Precise_.
- **Concepts to learn:** per-input provenance, triggering recalculation from data changes, debouncing with workflow IDs and timers, system actors in audit logs
- **Instructions:**
  1. Make `Calculation.requestedByUserId` nullable and add `trigger CalculationTrigger @default(USER)` (`USER`, `MEASURED_DATA`); migrate.
  2. Add the Temporal workflow `recalculateFromMeasuredData` with workflow ID `recalc/{vehicleId}` (use signal-with-start so repeated triggers within 5 minutes collapse into one run after a 5-minute timer). It loads the measured profile, and if it is reliable and differs from the last calculation's inputs by more than `MEASURED_CHANGE_THRESHOLD` (10 %, constant), it creates a new calculation with the measured inputs marked `MEASURED`, `trigger = MEASURED_DATA`, and a `CALCULATION_RECALCULATED` audit event with a null actor.
  3. The rollup job (5.7) and imports (5.8) trigger it through a small Next endpoint or a Temporal client in Python — pick one, and document the choice under "Decisions".
  4. The activity sentence for `CALCULATION_RECALCULATED` reads "Recalculated from 30 days of measured data for {vehicle}".
- **Definition of done:**
  1. Workflow tests (time-skipping): three triggers within 5 minutes produce one recalculation; an unreliable profile produces none; a change below the threshold produces none; the previous calculation is unchanged.
  2. The new calculation's snapshot marks the measured inputs as `MEASURED`, and `estimateAccuracy` returns "Precise" for it.
  3. Standard checks S1–S7, S8–S10 pass.

### Step 5.10 — Live UI and import screen

- **Depends on:** 5.9
- **Purpose:** Make live data visible and useful.
- **Concepts to learn:** merging pushed events into cached queries, throttling UI updates, designing live, reconnecting and offline states
- **Instructions:**
  1. First add sections "8.11 Live state", "8.12 Vehicle group detail" and "8.13 Import trip data" to `design-guidelines.md`.
  2. `components/fleet/LiveIndicator.tsx` driven by `useFleetStream` status (live, reconnecting, offline) with text labels, not colour alone.
  3. Dashboard: on `telemetry.updated`, invalidate the dashboard query at most once every 5 seconds.
  4. `/[slug]/vehicles/[vehicleId]`: estimated vs. measured table (each input with its source), a 30-day daily chart (km, solar energy), accuracy meter, link to the latest calculation.
  5. `/[slug]/vehicles/import`: template download, file upload, result summary with accepted/rejected counts and translated row errors.
- **Definition of done:**
  1. Tests: the indicator shows the three states with text; ten `telemetry.updated` events within one second cause one invalidation; the import screen renders row errors in plain language, never raw codes; the detail page shows "Measured" labels only for measured inputs.
  2. Standard checks S1–S4, S6, S8–S10 pass.
- **Owner review (browser):** with the simulator running, `/en/demo` updates without refresh; turn off Wi-Fi → "Reconnecting…" → recovers; open a vehicle's detail page; import a CSV with a bad row.

### Step 5.11 — Python CI and coverage

- **Depends on:** 5.10
- **Purpose:** Hold the Python code to the same standard as the TypeScript code.
- **Concepts to learn:** property-based testing with Hypothesis, coverage thresholds, CI service containers for Python
- **Instructions:**
  1. Add `hypothesis` and `pytest-cov`. Add property tests: yield is never negative; more kWp never gives less energy; rollup sums equal input sums for any generated readings.
  2. Set `--cov=telemetry --cov-fail-under=80` in the pytest configuration.
  3. Add a `python` job to `.github/workflows/ci.yml`: `astral-sh/setup-uv`, Postgres service, migrations applied with Prisma, then ruff, mypy and pytest.
- **Definition of done:**
  1. Standard check S7 passes with coverage ≥ 80 % (total shown in the summary).
  2. `.github/workflows/ci.yml` contains the `python` job with the four commands.
  3. Standard checks S8–S10 pass.

### Step 5.12 — Deployment configuration for the worker host

- **Depends on:** 5.11, and the owner has written "Railway" or "Fly.io" in this step's Notes
- **Purpose:** Make live data work in the hosted demo.
- **Concepts to learn:** long-running processes next to serverless, private networking and secrets, pooled vs. direct Postgres connections (`LISTEN` needs a direct connection)
- **Instructions:**
  1. If the Notes column has no provider, set `BLOCKED` with the reason "Choose Railway or Fly.io".
  2. Add the provider's configuration for two processes (API and simulator) using `services/telemetry/Dockerfile`.
  3. Add `DATABASE_DIRECT_URL` usage for `LISTEN` in both the SSE route and the simulator, falling back to `DATABASE_URL`.
  4. List every environment variable each platform (Vercel and the worker host) needs, with where its value comes from, in the review summary. The agent does not deploy.
- **Definition of done:**
  1. The configuration file(s) exist and pass the provider's local validation command if one exists without login (otherwise say so).
  2. A test proves the SSE route uses `DATABASE_DIRECT_URL` when set.
  3. Standard checks S1–S3, S7–S10 pass.
- **Owner actions:** create the service on the chosen provider, set the variables, deploy, and confirm the demo fleet updates live in production.

---

## Milestone 6: Search, Visual Quality, and Product Validation

### Step 6.1 — PostgreSQL full-text search

- **Depends on:** 5.12
- **Purpose:** Search with the existing database instead of a new system.
- **Concepts to learn:** `tsvector`/`tsquery`, generated columns, GIN indexes, combining full-text with structured filters, reading `EXPLAIN ANALYZE`
- **Instructions:**
  1. Add a generated `searchVector` column (`Unsupported("tsvector")`) on `Vehicle` from manufacturer, model, city and country (language `simple`), and a GIN index, via a Prisma migration with custom SQL.
  2. Add `GET /api/fleets/[fleetId]/search?q=` (roles `ANY_FLEET_ROLE`) returning vehicles with their latest calculation, fleet-scoped, using `websearch_to_tsquery` with prefix matching.
  3. Add `scripts/perf-search.ts` (`npm run perf:search`): inserts 5,000 vehicles into the test database, runs `EXPLAIN ANALYZE` for a sample query and prints the plan and the execution time.
- **Definition of done:**
  1. API tests: a partial model name finds the vehicle; results never include another fleet's vehicles; an empty `q` returns 400.
  2. `npm run perf:search` output contains `Bitmap Index Scan` on the GIN index and an execution time under 100 ms (both shown in the summary).
  3. Standard checks S1–S6, S8–S10 pass.

### Step 6.2 — Search UI

- **Depends on:** 6.1
- **Purpose:** Expose search where users need it.
- **Concepts to learn:** URL-based filter state, debounced input, shareable filter URLs
- **Instructions:**
  1. Add the search field to the Vehicles page (desktop inline 260 px input, tablet icon button that expands, mobile full-width field) per guidelines 8.5/8.8.
  2. State lives in the `?q=` search param; input is debounced 300 ms; an empty result shows "No vehicles match "{q}"." with a clear button.
- **Definition of done:**
  1. Tests: typing updates `q` after the debounce (fake timers); loading `?q=van` pre-fills the field and filters; the clear button resets the list; the no-match state renders.
  2. Standard checks S1–S4, S8–S10 pass.
- **Owner review (browser):** `/en/demo/vehicles?q=...` at three widths; copy the URL into a new tab and see the same filter.

### Step 6.3 — Table view for every chart

- **Depends on:** 6.2
- **Purpose:** Chart data must be verifiable and accessible, not just visual.
- **Concepts to learn:** WCAG for data visualisation, semantic tables, one wrapper for all charts
- **Instructions:**
  1. Create `components/common/ChartFigure.tsx`: `figure`, `figcaption`, the chart, and a "View as table" toggle that shows a semantic `<table>` built from the same data.
  2. Wrap every Recharts chart in it (payback chart, vehicle detail chart, and any other).
- **Definition of done:**
  1. `grep -rln "from \"recharts\"" components` lists only files whose chart is rendered inside `ChartFigure` (check each and list them in the summary).
  2. Tests: the toggle shows a table with the same number of rows as data points; the toggle button has `aria-expanded`; jest-axe reports no violations with the table open.
  3. Standard checks S1–S4, S8–S10 pass.
- **Owner review (browser):** toggle the table on the results page and the vehicle detail page.

### Step 6.4 — Scenario explanations and PDF export tests

- **Depends on:** 6.3
- **Purpose:** Explain why the optimistic and pessimistic results differ, and make PDF export trustworthy.
- **Concepts to learn:** one-at-a-time sensitivity analysis, explaining derived values in plain language, deterministic export testing
- **Instructions:**
  1. Add `explainScenarioSpread(input, assumptionSet)` to the engine: for each assumption, swap only that value from realistic to pessimistic (and to optimistic) and measure the payback change; return the top three drivers.
  2. Show them in the results "How we calculated this" disclosure as a sentence ("The range mostly depends on fuel price, sun hours and battery life").
  3. Add `pdf-parse` (dev dependency) and tests that generate a report PDF for a fixed calculation and check its text contains the fleet name, the verdict, all three paybacks and the provenance versions; generating twice gives identical text.
- **Definition of done:**
  1. Engine tests: the drivers are sorted by impact; changing a single assumption to a huge value makes it the top driver.
  2. The PDF tests pass.
  3. Standard checks S1–S4, S8–S10 pass.
- **Owner review (browser):** the explanation sentence on a results page.

### Step 6.5 — Prototype validation brief

- **Depends on:** 6.4
- **Purpose:** Show the "validate before building further" discipline.
- **Concepts to learn:** hypothesis-driven prototyping, acceptance criteria, go/no-go decisions
- **Instructions:**
  1. Create `docs/prototype-brief.md` with: hypotheses (e.g. "A fleet manager gets a verdict for their fleet in under 2 minutes without help"), scope and exclusions, method (tasks, participants, what is measured), acceptance criteria as numbers, a results table with empty cells for the owner, and a go/no-go section.
  2. Do not invent results.
- **Definition of done:**
  1. The file exists with the sections above; every acceptance criterion contains a number.
  2. The results table has one row per task with empty result cells.
  3. Standard check S10 passes.
- **Owner actions:** run the sessions, fill in the results and the go/no-go decision.

---

## Milestone 7: CI, Observability, Kubernetes, and Handoff

### Step 7.1 — CI pipeline completion

- **Depends on:** 6.5
- **Purpose:** Prove the project is correct from a clean clone.
- **Concepts to learn:** CI job composition, caching, migration drift detection, running on pull requests
- **Instructions:**
  1. Extend `.github/workflows/ci.yml`: trigger on `push` and `pull_request`; add jobs `format` (`npx prettier --check .`), `build` (`npm run build`), `migrations` (`npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --shadow-database-url <service db> --exit-code`).
  2. If `npx prettier --check .` fails on existing files, run `npx prettier --write .` in this step and list the reformatted files.
- **Definition of done:**
  1. Every command in `ci.yml` exits 0 when run locally (list each with its result in the summary).
  2. `npx prettier --check .` exits 0.
  3. The migration diff command exits 0 locally.
  4. Standard checks S1–S10 that apply pass.
- **Owner actions:** push the branch and confirm all CI jobs are green on GitHub.

### Step 7.2 — Structured logging, health checks and metrics

- **Depends on:** 7.1
- **Purpose:** Make the system observable the way production systems are.
- **Concepts to learn:** correlation IDs, liveness vs. readiness, the four golden signals, protecting metrics endpoints
- **Instructions:**
  1. `proxy.ts` sets an `x-request-id` header (keeps an incoming valid one); `lib/logger.ts` includes it; `lib/telemetry-client.ts` forwards it; the Python service logs JSON with the same ID.
  2. Add `GET /api/health/live` (always 200) and `GET /api/health/ready` (checks Postgres `SELECT 1`, Temporal connection, telemetry `/health/ready`; returns 503 with per-dependency status when one fails).
  3. Add `prom-client` and `GET /api/metrics` protected by `Authorization: Bearer $METRICS_TOKEN`: HTTP request duration histogram, calculation count, report job outcomes, SSE connections gauge. Add `/health/ready` and `/metrics` (`prometheus-client`) to the Python service.
- **Definition of done:**
  1. API tests: ready returns 503 and names the failing dependency when Postgres is mocked to fail; metrics without the token → 401, with the token → Prometheus text containing each metric name.
  2. A test proves a request's `x-request-id` appears in its log line and in the outgoing telemetry request.
  3. pytest for the Python health and metrics endpoints.
  4. Standard checks S1–S10 that apply pass.

### Step 7.3 — Production Dockerfiles

- **Depends on:** 7.2
- **Purpose:** Package the web app and the Temporal worker for deployment.
- **Concepts to learn:** multi-stage builds, Next.js standalone output, non-root containers, pinned base images, image size
- **Instructions:**
  1. Set `output: "standalone"` in `next.config.ts`.
  2. Create `Dockerfile` (web; `node:24-alpine` pinned by digest, multi-stage, non-root) and `workers/temporal/Dockerfile`.
  3. Harden `services/telemetry/Dockerfile` the same way (pinned digest, multi-stage).
- **Definition of done:**
  1. `docker build` succeeds for all three images; their sizes are listed in the summary.
  2. `docker run --rm <image> id -u` prints a non-zero number for each.
  3. The web container started with the local database URL answers `curl -s localhost:3000/api/health/live` with 200.
  4. Standard checks S3, S4, S8–S10 pass.

### Step 7.4 — Kubernetes manifests

- **Depends on:** 7.3
- **Purpose:** A deployable, reviewable Kubernetes setup for local and demo environments.
- **Concepts to learn:** Deployments, Services, ConfigMaps, Secrets, probes, NetworkPolicy, Kustomize overlays
- **Instructions:**
  1. Create `deploy/base/` with Deployments and Services for web, Temporal worker, telemetry API and simulator; a ConfigMap; Secret templates without values; an Ingress for web only; a NetworkPolicy allowing traffic to the telemetry API only from web and the worker; readiness and liveness probes on the health endpoints.
  2. Create `deploy/overlays/local` and `deploy/overlays/demo`.
- **Definition of done:**
  1. `kubectl kustomize deploy/overlays/local` and `kubectl kustomize deploy/overlays/demo` exit 0 (use the `registry.k8s.io/kubectl` image via Docker if kubectl is missing).
  2. The rendered output passes `kubeconform -strict` (run via the `ghcr.io/yannh/kubeconform` image).
  3. The NetworkPolicy's allowed sources are exactly web and the worker (shown in the summary).
  4. Standard check S10 passes.
- **Owner actions (optional):** apply the local overlay to a kind cluster.

### Step 7.5 — End-to-end tests

- **Depends on:** 7.4
- **Purpose:** Verify the main journeys work together.
- **Concepts to learn:** E2E test structure, test data isolation, running browsers in CI
- **Instructions:**
  1. Add Playwright (dev dependency) and `e2e/` tests for: the anonymous quick check (Home → Results using defaults and a mocked geocoder), sign-up with save-to-fleet, adding a vehicle, running a calculation, requesting a report, a live stream update, and a rejected cross-fleet access attempt.
  2. Add an `e2e` CI job that runs the suite and uploads the HTML report.
  3. **Do not run the tests** (they open a browser). Verify them only with `npx playwright test --list` and `npx tsc --noEmit`.
- **Definition of done:**
  1. `npx playwright test --list` lists at least 7 tests.
  2. `.github/workflows/ci.yml` contains the `e2e` job.
  3. Standard checks S1–S3, S8–S10 pass.
- **Owner actions:** run `npx playwright test` locally and report failures as `CHANGES`.

### Step 7.6 — Handoff documentation

- **Depends on:** 7.5
- **Purpose:** Another engineer can pick up the project without tribal knowledge.
- **Concepts to learn:** writing for an unfamiliar reader, documenting known limitations honestly, C4-style diagrams
- **Instructions:**
  1. Create `docs/architecture.md` (system context, containers, authorization, calculation lifecycle, report workflow, telemetry flow, deployment — Mermaid diagrams), `docs/api-contracts.md`, `docs/deployment-runbook.md`, `docs/operational-runbook.md`, `docs/demo-script.md`, `docs/known-limitations.md` (including local-disk report storage), `docs/decision-log.md` (links to the key decisions in `README.md` and to the decisions section of this plan).
  2. Update `README.md` so it separates implemented features from the roadmap.
  3. Create `scripts/check-docs.mjs` (`npm run docs:check`) that fails on broken relative links and on backticked file paths that do not exist.
- **Definition of done:**
  1. All seven documents exist; `npm run docs:check` exits 0 over `docs/` and `README.md`.
  2. Every Mermaid block is inside a fenced `mermaid` code block (grep count equals the number of diagrams listed).
  3. Standard checks S3, S10 pass.
- **Owner actions:** follow `deployment-runbook.md` once from a clean clone.

### Step 7.7 — Preview deployment smoke test

- **Depends on:** 7.1
- **Purpose:** Catch differences between local and production that only appear over real HTTPS on Vercel: `Secure` and `__Host-` cookies, redirects, proxy headers and serverless behaviour.
- **Concepts to learn:** smoke tests vs end-to-end tests, environment parity, deployment status events, Vercel deployment protection bypass
- **Instructions:**
  1. Create `scripts/smoke-test.mjs` (`npm run smoke -- <base-url>`) that uses `fetch` (no browser) and checks, with each check named after its rule: the base URL is `https`; `GET /en` returns 200; `GET /en/user` without a session redirects to `/en/login`; `GET /api/fleets/any-id/vehicles` without a session returns 403; `GET /api/auth/csrf` sets a `__Host-authjs.csrf-token` cookie with `Secure`, `HttpOnly`, `SameSite=Lax` and `Path=/`; a request to a `http://` URL is redirected to `https://`. The script exits non-zero and prints every failed check. When the `VERCEL_AUTOMATION_BYPASS_SECRET` environment variable is set, it sends it as the `x-vercel-protection-bypass` header.
  2. Move the check definitions into `scripts/smoke-checks.ts` so they can be unit-tested; add `scripts/smoke-checks.test.ts` with mocked `fetch` responses proving one passing and one failing case per check.
  3. Add a `preview-smoke` job to `.github/workflows/ci.yml` that runs on the `deployment_status` event when `github.event.deployment_status.state == 'success'` and the environment is a Vercel preview, using `github.event.deployment_status.environment_url` as the base URL and `secrets.VERCEL_AUTOMATION_BYPASS_SECRET`.
  4. **Do not run the script against any URL** and do not start a server. Verify with the unit test and `npx tsc --noEmit`.
  5. Add a "Preview smoke test" section to `docs/security-cookies-csrf.md` describing what the script proves and what it does not (logged-in flows).
- **Definition of done:**
  1. `scripts/smoke-checks.test.ts` passes with at least 6 checks covered, each with a passing and a failing case.
  2. `.github/workflows/ci.yml` contains the `preview-smoke` job and `deployment_status`.
  3. `package.json` has the `smoke` script.
  4. Standard checks S1–S3, S8–S10 pass.
- **Owner actions:** in Vercel enable Protection Bypass for Automation and copy the secret; add it to the GitHub repository secrets as `VERCEL_AUTOMATION_BYPASS_SECRET`; open a pull request and confirm `preview-smoke` is green.

---

## Milestone 8: Super-admin console

Goal: the owner of the product can see and manage every fleet from one place, without touching the database. Every privileged action leaves an audit trail the fleet's own owners can see.

### Step 8.1 — Super-admin guard and audit trail

- **Depends on:** 3.12
- **Purpose:** One strict, fresh check for "is this person a super admin", and a visible trail when a super admin looks into someone else's fleet.
- **Concepts to learn:** stale session tokens vs fresh database checks, defense in depth, auditing privileged access
- **Instructions:**
  1. Create `lib/super-admin.ts` with `requireSuperAdmin(session)`: reads the membership in `ADMIN_FLEET_ID` from the database on every call (the token's `isSuperAdmin` is only used to decide whether to show the Admin link) and throws `ForbiddenError` otherwise. A failed attempt records `ACCESS_DENIED` with reason `NOT_SUPER_ADMIN`.
  2. Add `AuditAction.SUPER_ADMIN_FLEET_VIEWED` (recorded by the admin fleet page in 8.3) and `AuditAction.FLEET_UPDATED` (used by the rename in 8.2, metadata `changes: [{ field, from, to }]`). Add their sentences to `lib/activity-sentences.ts` and `audit.events.*` in `messages/en.json`, `de.json` and `es.json` ("{actor} opened this fleet as an administrator", "{actor} renamed the fleet from {from} to {to}").
  3. Add `admin` to `RESERVED_FLEET_SLUGS` in `lib/fleet-slug.ts`.
- **Definition of done:**
  1. API test: `requireSuperAdmin` passes for a member of the admin fleet; rejects a signed-out visitor and an ordinary owner; and rejects a user whose admin membership was deleted after their token was issued.
  2. A rejected call writes an `ACCESS_DENIED` audit event with reason `NOT_SUPER_ADMIN`.
  3. `lib/activity-sentences.test.ts` still passes (every `AuditAction` has a mapping); `lib/fleet-slug.test.ts` passes and a fleet named "Admin" gets a different slug.
  4. Standard checks S1–S4, S6, S8–S10 pass.

### Step 8.2 — Admin fleets API

- **Depends on:** 8.1
- **Purpose:** List every fleet with the numbers an administrator needs, and rename one.
- **Concepts to learn:** aggregate queries without N+1, search and pagination, privileged routes next to tenant routes
- **Instructions:**
  1. `GET /api/admin/fleets?query=&page=&pageSize=`: `requireSuperAdmin`. Returns fleets (not the admin fleet) with name, slug, created date, owner emails, member count, vehicle count (not deleted), calculation count and last activity (latest audit event). `query` matches name, slug or an owner's email, case-insensitive. Load the counts with grouped queries for the whole page, not one query per fleet. Add `lib/admin-fleet-query-schema.ts` for the parameters.
  2. `GET /api/admin/fleets/[fleetId]`: the same numbers plus members with roles and pending invitations.
  3. `PATCH /api/admin/fleets/[fleetId]`: rename only (the slug never changes). Records `FLEET_UPDATED` with `changes`.
  4. Member changes by a super admin keep using the existing `/api/fleets/[fleetId]/members` routes, which already treat a super admin as an owner.
- **Definition of done:**
  1. API tests: every admin route returns 403 for an ordinary owner and for a signed-out visitor.
  2. The list returns counts that match the seeded fixtures (members, vehicles, calculations), excludes the admin fleet, finds a fleet by an owner's email, and paginates.
  3. Renaming stores `{ field: "name", from, to }`, keeps the slug and is audited.
  4. Standard checks S1–S4, S6, S8–S10 pass.

### Step 8.3 — Admin console pages

- **Depends on:** 8.2
- **Purpose:** One place where the owner of the product sees and manages all fleets.
- **Concepts to learn:** server-side page guards, reusing a tenant component in an admin context, links that only show for the right people
- **Instructions:**
  1. `app/[locale]/(public)/admin/fleets/page.tsx` (server): a search field, a table (name, slug, owners, members, vehicles, calculations, last activity, created) with pagination; below 768 px each fleet is a card instead of a table row. Loading, empty and error states. A visitor who is not a super admin gets a 404.
  2. `app/[locale]/(public)/admin/fleets/[fleetId]/page.tsx` (server): summary tiles, a rename form, the existing `components/team/TeamCard.tsx` with `canManageTeam` true, an "Open workspace" button to `/[locale]/[slug]/overview`, and the banner "You are viewing this fleet as an administrator." Loading the page records `SUPER_ADMIN_FLEET_VIEWED`.
  3. Show an "Admin" item in the user menu (`UserProfileButton` and `MobileMenu`) only when `session.user.isSuperAdmin`; the pages themselves re-check with `requireSuperAdmin`.
  4. Add the `admin.*` messages to `en.json`, `de.json` and `es.json`. No raw enum names in any text.
- **Definition of done:**
  1. Component tests: the table shows one row per fleet with its counts; typing in search requests the API with `query`; the user menu shows Admin only for a super admin.
  2. A test proves the admin page loader returns not-found for an ordinary user.
  3. Standard checks S1–S4, S6, S8–S10 pass.
- **Owner review (browser):** sign in as a super admin (add one test user to `fleet_admin`) and open `/en/admin/fleets` at three widths: search, open a fleet, rename it, change a member's role, open its workspace and check the "opened this fleet as an administrator" line in that fleet's activity. Then sign in as an ordinary user and confirm `/en/admin/fleets` is a 404.

### Step 8.4 — Archive and restore a fleet

- **Depends on:** 8.3
- **Purpose:** Let the administrator switch a fleet off (for example for non-payment or a deletion request) without losing its data, and switch it back on.
- **Concepts to learn:** soft delete at the tenant level, enforcing it in the authorization helper, reversible privileged actions
- **Instructions:**
  1. Add `Fleet.archivedAt DateTime?` to `prisma/schema.prisma` with a migration.
  2. `requireFleetRole` rejects members of an archived fleet with `ForbiddenError` (a super admin still passes); `loadWorkspaceLayout` returns null for an archived fleet; the `/workspace` redirect and the fleet switcher skip archived fleets; a user with only archived fleets goes to onboarding.
  3. `POST /api/admin/fleets/[fleetId]/archive` and `.../restore` (super admin only), recording `FLEET_ARCHIVED` and `FLEET_RESTORED` with sentences in all three languages.
  4. The admin list gets an Active / Archived filter and a status pill; the detail page gets Archive (a `danger` button with a confirm dialog) or Restore.
- **Definition of done:**
  1. API tests: an archived fleet's members get 403 on its routes and 404 on its workspace; a super admin still opens it; restoring brings access back; archive and restore are audited.
  2. The workspace redirect test: a user with one active and one archived fleet lands on the active one.
  3. Standard checks S1–S6, S8–S10 pass.
- **Owner actions:** confirm that archiving is wanted before this step starts.

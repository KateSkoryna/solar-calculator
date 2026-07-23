# Orcrist-Oriented Detailed Step Plan

This document breaks [`implementation-plan.md`](./implementation-plan.md) into individual, learnable, demonstrable steps. It follows the same five milestones and scope rules from that plan and from [`vacancy-match-analysis.md`](./vacancy-match-analysis.md).

Each step has the same structure:

- **Purpose** — why this step exists in the product
- **Technology** — what you touch
- **Main concepts to learn** — what to actually study/understand while doing it
- **Goal** — the concrete deliverable
- **Visible result** — how you or a reviewer can see/verify it worked

Steps are meant to be done in order within a milestone. Milestones can be reordered if needed, but 1 must come before 2, 2 before 3.

---

## Milestone 1: Complete the PostgreSQL Domain Model

### Step 1.1 — Design the domain entity-relationship model on paper

- **Purpose**: Avoid schema churn later by deciding entities and relationships before writing Prisma code.
- **Technology**: Mermaid ER diagram, markdown
- **Main concepts to learn**: entity-relationship modeling, cardinality (1-1, 1-many, many-many), multi-tenant data modeling patterns
- **Goal**: A reviewed diagram covering `Fleet`, `FleetMembership`, `Vehicle`, `LocationProfile`, `Calculation`, `CalculationInputSnapshot`, `CalculationResult`, `CalculationScenario`, `ReportJob`, `AuditEvent`, `FeatureFlag`.
- **Visible result**: `docs/data-model.md` with a Mermaid `erDiagram` block that renders on GitHub.

### Step 1.2 — Add tenancy and role enums to the Prisma schema

- **Purpose**: Establish the fleet as the tenant boundary before any domain table depends on it. There is no separate organization entity — a fleet is a top-level tenant.
- **Technology**: Prisma schema language
- **Main concepts to learn**: Prisma enums, `@@id`, `@@unique`, `onDelete` referential actions
- **Goal**: `Fleet` and `FleetMembership` models with a `Role` enum (`OWNER`, `FLEET_MANAGER`, `ANALYST`, `VIEWER`).
- **Visible result**: `npx prisma validate` passes; `prisma studio` shows the two new tables.

### Step 1.3 — Add vehicle and location domain tables

- **Purpose**: Represent the physical assets the calculator reasons about.
- **Technology**: Prisma schema language
- **Main concepts to learn**: foreign keys, cascading deletes vs. restrict, composite indexes
- **Goal**: `Vehicle` model scoped by `fleetId`, plus `LocationProfile` for site/location data.
- **Visible result**: A migration file under `prisma/migrations/` creating `vehicles`, `location_profiles`.

### Step 1.4 — Add calculation, snapshot, result, and scenario tables

- **Purpose**: Make every calculation reproducible and explainable instead of a transient client-side number.
- **Technology**: Prisma schema language, JSON columns
- **Main concepts to learn**: immutability by convention (append-only rows, no update on financial data), storing versioned assumptions, JSON vs. relational trade-offs
- **Goal**: `Calculation`, `CalculationInputSnapshot`, `CalculationResult`, `CalculationScenario` models with version fields (`formulaVersion`, `assumptionSetVersion`).
- **Visible result**: Creating a calculation via Prisma Studio produces a linked snapshot + result row that cannot be edited, only superseded.

### Step 1.5 — Add report job, audit event, and feature flag tables

- **Purpose**: Lay the groundwork for Milestones 2 and 3 without retrofitting later.
- **Technology**: Prisma schema language
- **Main concepts to learn**: state-machine modeling in a column (`status` enum), append-only audit log design
- **Goal**: `ReportJob` (with a `status` enum matching the state machine in Milestone 3), `AuditEvent`, `FeatureFlag`.
- **Visible result**: Full schema diff reviewed in a PR description, all 11 models present.

### Step 1.6 — Write and run the migration against local PostgreSQL

- **Purpose**: Prove the schema is realizable, not just theoretical.
- **Technology**: Prisma Migrate, Docker Compose, PostgreSQL
- **Main concepts to learn**: migration generation vs. `db push`, migration history, rollback strategy
- **Goal**: A clean `prisma migrate dev` run from an empty database.
- **Visible result**: `npm run db:migrate` succeeds; `prisma/migrations/` contains a new timestamped folder; `prisma studio` shows all tables with correct relations.

### Step 1.7 — Write a seed script for two fleets

- **Purpose**: Give yourself (and reviewers) realistic, isolated multi-tenant data to test against.
- **Technology**: `prisma/seed.ts`, Prisma Client
- **Main concepts to learn**: idempotent seeding, `upsert`, fixture design
- **Goal**: Seed script creating 2 fleets, 3+ users with different roles, vehicles, and a few calculations each.
- **Visible result**: `npx prisma db seed` runs without errors; Prisma Studio shows two fleets with non-overlapping data.

### Step 1.8 — Write schema-level tests

- **Purpose**: Catch tenancy and constraint regressions automatically instead of by inspection.
- **Technology**: Jest, a disposable test database
- **Main concepts to learn**: integration testing against a real database, test database lifecycle (setup/teardown per suite)
- **Goal**: Tests proving: unique constraints are fleet-scoped, deleting a vehicle preserves historical calculations (soft delete or restrict), migrations apply cleanly to an empty DB.
- **Visible result**: `npm test` shows a new `prisma.schema.test.ts` (or similar) suite passing in CI-equivalent conditions.

---

## Milestone 2: Secure Access Control, Auditability, and Provenance

### Step 2.1 — Build a fleet-scoped authorization helper

- **Purpose**: Centralize "who can do what in which fleet" instead of scattering checks across routes.
- **Technology**: TypeScript, Next.js server actions/route handlers, Auth.js session
- **Main concepts to learn**: policy-based authorization, the principle of least privilege, avoiding IDOR (insecure direct object reference) bugs
- **Goal**: A `requireFleetRole(session, fleetId, allowedRoles)` helper used by every server action touching domain data.
- **Visible result**: A protected server action throws/returns 403 when called with a role outside the allowed set — demonstrable via a Jest test or a manual API call with the wrong user.

### Step 2.2 — Wire the helper into every vehicle/calculation route

- **Purpose**: Make authorization the default, not opt-in.
- **Technology**: Next.js route handlers and server actions
- **Main concepts to learn**: defense in depth, fail-closed vs. fail-open design
- **Goal**: Every mutation and sensitive read checks role membership before touching Prisma.
- **Visible result**: Attempting to fetch another fleet's vehicle by guessing an ID returns 403/404, verified manually or via a test.

### Step 2.3 — Add append-only audit event logging

- **Purpose**: Give the product a compliance-style trail for who changed what and when.
- **Technology**: Prisma, a small `recordAuditEvent()` utility
- **Main concepts to learn**: append-only log patterns, structured event payloads, correlating events to actors and requests
- **Goal**: Audit events written for fleet/membership changes, vehicle changes, calculation creation, report generation/download, permission failures, feature-flag changes.
- **Visible result**: Performing any of the above actions in the UI creates a new `AuditEvent` row visible in Prisma Studio.

### Step 2.4 — Build the audit log UI page

- **Purpose**: Turn the audit table into something a reviewer can actually inspect without a database client.
- **Technology**: Next.js page, TanStack Query, server-side pagination
- **Main concepts to learn**: cursor/offset pagination, filter UX for logs, role-gating a whole page
- **Goal**: `/[locale]/fleet/audit` page listing events with filters by actor, entity type, and date range.
- **Visible result**: Logging in as an `OWNER`, performing 3 different actions, and seeing all 3 appear on the page in order.

### Step 2.5 — Build the calculation provenance panel

- **Purpose**: Make a displayed ROI number explainable — the core "auditability" requirement of the target role.
- **Technology**: React component, the `CalculationInputSnapshot`/`CalculationResult` data
- **Main concepts to learn**: data provenance UX patterns, presenting versioned assumptions to non-technical users
- **Goal**: A panel on the calculation results page showing input snapshot date, formula version, assumption sources, actor, and timestamp.
- **Visible result**: Opening any calculation shows a "How this was calculated" panel with real, non-placeholder values.

### Step 2.6 — Add rate limiting to sensitive endpoints

- **Purpose**: Prevent brute-force and abuse on auth and calculation-creation endpoints.
- **Technology**: A token-bucket or fixed-window limiter (in-memory or Redis-backed), Next.js middleware
- **Main concepts to learn**: rate-limiting algorithms, per-IP vs. per-user limiting, where to enforce limits in a Next.js app
- **Goal**: Login, registration, password reset, and report-generation endpoints reject excessive requests.
- **Visible result**: Scripted burst of requests (e.g., 20 login attempts in 10 seconds) starts returning 429s partway through.

### Step 2.7 — Harden session/cookie/CSRF configuration

- **Purpose**: Close common web auth vulnerabilities before calling the auth system "secure."
- **Technology**: Auth.js configuration, Next.js
- **Main concepts to learn**: `SameSite`/`Secure`/`HttpOnly` cookie flags, CSRF token flow, session fixation
- **Goal**: Documented and verified secure-cookie settings; CSRF protection confirmed on state-changing routes.
- **Visible result**: Browser dev tools show `Secure; HttpOnly; SameSite=Lax` (or stricter) on the session cookie in a deployed/staging environment.

### Step 2.8 — Write a PII inventory and redact logs

- **Purpose**: Demonstrate privacy-aware engineering, an explicit vacancy expectation.
- **Technology**: Structured logging (see Milestone 5), grep/audit of log call sites
- **Main concepts to learn**: PII classification, log redaction patterns, data retention basics
- **Goal**: `docs/privacy-and-pii.md` listing every PII field and where it's stored/logged; log statements updated to redact emails/tokens.
- **Visible result**: Grepping application logs after a login attempt shows no raw email, password, or token values.

### Step 2.9 — Write authorization and audit tests

- **Purpose**: Lock in the security behavior so future changes can't silently regress it.
- **Technology**: Jest, integration test helpers
- **Main concepts to learn**: writing negative-path tests (proving something is denied), test fixtures for multiple roles
- **Goal**: Tests proving viewers cannot mutate data, analysts cannot manage memberships, cross-fleet access is rejected, audit events fire on success and rejection.
- **Visible result**: `npm test` shows a new authorization suite, all green.

### Step 2.10 — Write security/ADR documentation

- **Purpose**: Produce the "handoff package" evidence the target role explicitly asks for.
- **Technology**: Markdown, ADR format
- **Main concepts to learn**: Architecture Decision Records (ADR) structure, threat modeling basics (STRIDE or similar)
- **Goal**: `docs/security-model.md`, `docs/threat-model.md`, `docs/adr/0001-fleet-tenancy.md`, `docs/adr/0002-calculation-versioning.md`.
- **Visible result**: Four new files in `docs/`, each reflecting decisions actually implemented (not aspirational).

---

## Milestone 3: Temporal Report Workflow and Real-Time Progress

### Step 3.1 — Add Temporal server and worker to Docker Compose

- **Purpose**: Get a local orchestration environment running before writing any workflow code.
- **Technology**: Docker Compose, Temporal (server + UI)
- **Main concepts to learn**: what a workflow engine solves that a plain queue doesn't (durability, replay, visibility), Temporal's architecture (server, worker, client)
- **Goal**: `docker compose up` starts Temporal alongside Postgres and the app.
- **Visible result**: Temporal Web UI reachable locally (e.g. `localhost:8080`), showing an empty namespace.

### Step 3.2 — Model the report job state machine

- **Purpose**: Define the states a report goes through before writing orchestration code around them.
- **Technology**: TypeScript enum, the `ReportJob.status` column from Milestone 1
- **Main concepts to learn**: state machine design, valid transitions vs. invalid ones
- **Goal**: `QUEUED → VALIDATING → CALCULATING → RENDERING_CHARTS → GENERATING_REPORT → (GENERATING_RECOMMENDATIONS) → COMPLETED | FAILED | CANCELLED`.
- **Visible result**: `docs/calculation-provenance.md` or a new `docs/report-workflow.md` with a Mermaid state diagram matching the implemented enum.

### Step 3.3 — Create the report-request API and initial job record

- **Purpose**: Give the UI a synchronous entry point that kicks off async work.
- **Technology**: Next.js route handler, Prisma, idempotency keys
- **Main concepts to learn**: idempotency key patterns, separating "accept the request" from "do the work"
- **Goal**: `POST /api/reports` creates a `ReportJob` row with status `QUEUED` and starts a Temporal workflow, deduplicating on idempotency key.
- **Visible result**: Firing the same request twice with the same key produces exactly one workflow run, verified in the Temporal UI.

### Step 3.4 — Write the report generation workflow and activities

- **Purpose**: Implement the actual durable, retryable business logic.
- **Technology**: Temporal TypeScript SDK (workflows + activities)
- **Main concepts to learn**: workflow determinism rules, activities vs. workflows, retry policies, deterministic workflow IDs
- **Goal**: A workflow that loads the immutable calculation snapshot, renders charts, generates a PDF, and stores file metadata — using `report/{fleetId}/{reportJobId}` as the workflow ID.
- **Visible result**: Triggering a report from the UI produces a downloadable PDF and a visible run history entry in the Temporal UI, including any simulated activity retry.

### Step 3.5 — Add the optional AI recommendation activity with safeguards

- **Purpose**: Demonstrate safe integration of a generative feature without letting it contaminate deterministic financial output.
- **Technology**: An LLM API call as a Temporal activity, Zod
- **Main concepts to learn**: structured output validation, separating deterministic vs. generated content, feature-flagging risky features per tenant
- **Goal**: An activity that calls an AI provider for narrative recommendations, validates the response against a strict Zod schema, and stores it separately from `CalculationResult`.
- **Visible result**: A report clearly labels the AI section as "generated guidance, not financial advice"; disabling the `FeatureFlag` for a fleet skips the activity entirely.

### Step 3.6 — Stream job progress to the UI with Server-Sent Events

- **Purpose**: Give the user real-time visibility into a long-running job instead of a spinner.
- **Technology**: Server-Sent Events (SSE), a Next.js streaming route handler, React
- **Main concepts to learn**: SSE vs. WebSockets trade-offs, last-event-ID reconnect pattern, backpressure basics
- **Goal**: A status component subscribing to `/api/reports/[id]/events`, updating live as the workflow progresses through its states.
- **Visible result**: Watching the browser network tab shows a live event stream; refreshing mid-job reconnects and shows the correct current state (not stuck at `QUEUED`).

### Step 3.7 — Build the report status and job history UI

- **Purpose**: Let a user find and revisit past reports, not just watch the current one.
- **Technology**: Next.js page, TanStack Query
- **Main concepts to learn**: polling vs. push for list views, empty/error/loading state design
- **Goal**: A job history page listing past `ReportJob`s with status, duration, and download links.
- **Visible result**: After running 2-3 reports, the page lists all of them with correct final statuses.

### Step 3.8 — Write workflow and concurrency tests

- **Purpose**: Prove the durability and isolation claims, not just demo them once.
- **Technology**: Temporal's testing framework, Jest
- **Main concepts to learn**: testing time-based/retry logic deterministically, simulating transient failures
- **Goal**: Tests proving duplicate requests don't double-run, transient activity failures retry successfully, cancellation updates both Temporal and the database, cross-fleet SSE subscriptions are rejected.
- **Visible result**: `npm test` shows a passing workflow test suite, including at least one test that forces and recovers from a simulated failure.

---

## Milestone 4: Search, Visual Quality, and Product Validation

### Step 4.1 — Add PostgreSQL full-text search

- **Purpose**: Satisfy the vacancy's search/data-layer expectation using the existing database instead of a new system.
- **Technology**: PostgreSQL `tsvector`/`tsquery`, Prisma raw queries or extensions
- **Main concepts to learn**: full-text search indexing, `GIN` indexes, combining full-text with structured filters
- **Goal**: Search across vehicle registration/name, fleet name, calculation ID, location, report status, scenario labels.
- **Visible result**: A search box returning relevant fleets/vehicles/calculations in under ~100ms on seeded data, with an `EXPLAIN ANALYZE` showing index usage.

### Step 4.2 — Build the search and filter UI

- **Purpose**: Expose the new search capability where users actually need it.
- **Technology**: React, URL-based filter state (search params)
- **Main concepts to learn**: shareable/bookmarkable filter URLs, debounced search input
- **Goal**: A combined search + filter bar on the fleet/calculation list pages.
- **Visible result**: Typing a partial vehicle registration filters the list live; the URL reflects the current filters and is shareable.

### Step 4.3 — Add accessible data-table alternatives to charts

- **Purpose**: Meet accessibility expectations and make chart data verifiable, not just visual.
- **Technology**: React, ARIA attributes, semantic HTML tables
- **Main concepts to learn**: WCAG basics for data visualization, screen-reader-friendly table markup
- **Goal**: Every Recharts visualization has a toggleable table view with the same underlying data.
- **Visible result**: Toggling "View as table" on any chart shows an accessible `<table>`; a quick axe/Lighthouse accessibility scan shows no chart-related violations.

### Step 4.4 — Add scenario-difference explanations and export tests

- **Purpose**: Make the comparison between ROI scenarios legible, and make PDF export trustworthy.
- **Technology**: React, jsPDF/html2canvas (existing), Jest snapshot or visual-diff testing
- **Main concepts to learn**: explaining derived/delta values in UI copy, deterministic PDF export testing
- **Goal**: A "why scenario B beats scenario A" summary; a test suite verifying exported PDFs contain expected content deterministically.
- **Visible result**: Comparing two scenarios shows a plain-language explanation; `npm test` includes a passing export-consistency test.

### Step 4.5 — Write the prototype-validation brief

- **Purpose**: Demonstrate the "validate before building further" discipline the role expects from a prototyping engineer.
- **Technology**: Markdown, basic usability-testing method
- **Main concepts to learn**: hypothesis-driven prototyping, defining acceptance criteria and a go/no-go decision up front
- **Goal**: `docs/prototype-brief.md` covering the fleet-manager hypothesis ("...compare three scenarios and export a report in under five minutes"), scope, exclusions, and findings from even a small self-run test (e.g., timing yourself or a colleague through the flow).
- **Visible result**: A filled-in brief with real timing/error-rate numbers, not placeholders, plus a stated go/no-go recommendation.

---

## Milestone 5: CI, Observability, Kubernetes, and Handoff

### Step 5.1 — Build the CI pipeline

- **Purpose**: Prove the project is verifiably correct from a clean clone, not just "works on my machine."
- **Technology**: GitHub Actions
- **Main concepts to learn**: CI job composition, caching dependencies, running Postgres as a service container
- **Goal**: `.github/workflows/ci.yml` running install, Prettier, ESLint, `tsc`, unit/component tests, Postgres integration tests, Next.js build, Prisma migration validation.
- **Visible result**: A pull request shows all CI checks green; deliberately breaking a type shows the check fail.

### Step 5.2 — Add critical-path E2E tests

- **Purpose**: Verify the full user journeys work together, not just isolated units.
- **Technology**: Playwright (or Cypress)
- **Main concepts to learn**: E2E test structure, test data isolation, running a browser in CI
- **Goal**: Tests for sign-in + fleet selection, vehicle creation, calculation creation, report viewing, and a rejected cross-fleet access attempt.
- **Visible result**: `npx playwright test` passes locally and in CI, with an HTML report artifact.

### Step 5.3 — Write production Dockerfiles

- **Purpose**: Package the app and worker for real deployment, not just local dev.
- **Technology**: Docker multi-stage builds
- **Main concepts to learn**: multi-stage builds, non-root containers, image size/layer optimization, pinned base images
- **Goal**: A production `Dockerfile` for the web app and a separate one for the Temporal worker.
- **Visible result**: `docker build` produces a runnable image; `docker run` serves the app on the expected port as a non-root user.

### Step 5.4 — Write Kubernetes/Kustomize manifests

- **Purpose**: Satisfy the Kubernetes/GitOps expectation with a deployable, reviewable artifact.
- **Technology**: Kubernetes YAML, Kustomize
- **Main concepts to learn**: Deployments/Services/ConfigMaps/Secrets, readiness/liveness probes, NetworkPolicy basics, overlay-based environment config
- **Goal**: `deploy/base` with web/worker deployments, services, configmap, ingress, network policy; `deploy/overlays/local` and `deploy/overlays/demo`.
- **Visible result**: `kubectl apply -k deploy/overlays/local` (against a local cluster like kind/minikube) brings up the app with passing readiness probes.

### Step 5.5 — Add structured logging, health checks, and metrics

- **Purpose**: Make the system observable in a way that matches production expectations.
- **Technology**: Structured JSON logging, Prometheus client library, health-check routes
- **Main concepts to learn**: correlation IDs, the difference between liveness and readiness, what to measure (latency, error rate, workflow retries, calculation volume)
- **Goal**: `/health/live`, `/health/ready` (checking Postgres and Temporal), and a `/metrics` endpoint.
- **Visible result**: `curl localhost:3000/health/ready` returns 200 with dependency status; `curl localhost:3000/metrics` returns Prometheus-formatted output.

### Step 5.6 — Write the adoption/handoff documentation package

- **Purpose**: Prove the project could be picked up by another engineer with no tribal knowledge — the explicit "handoff package" requirement.
- **Technology**: Markdown, Mermaid diagrams
- **Main concepts to learn**: writing for an unfamiliar reader, documenting known limitations honestly
- **Goal**: `docs/architecture.md`, `docs/api-contracts.md`, `docs/deployment-runbook.md`, `docs/operational-runbook.md`, `docs/demo-script.md`, `docs/integration-backlog.md`, `docs/known-limitations.md`, `docs/decision-log.md`, with system-context, container, authorization, calculation-lifecycle, workflow, and deployment diagrams.
- **Visible result**: A new contributor (or you, after a week away) can follow `deployment-runbook.md` alone to get the app running and demo it end to end.

---

## How to use this plan

Work top to bottom within a milestone. After each step, check its **Visible result** against reality before moving on — if you can't produce that result, the step isn't done yet, regardless of how much code was written.

This plan intentionally does not include time estimates per step; see `implementation-plan.md` for milestone-level effort estimates (~17-26 focused days total).

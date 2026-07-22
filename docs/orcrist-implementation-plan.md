# Orcrist-Oriented Implementation Plan

## Goal

Upgrade Solar Calculator into a validated, adoption-ready full-stack TypeScript prototype aligned with the Orcrist Technologies Full-Stack Engineer (TypeScript - Prototyping) vacancy.

The finished project should prove:

- Next.js and TypeScript product delivery;
- PostgreSQL domain design;
- secure multi-tenant access;
- auditable and reproducible calculations;
- asynchronous workflow orchestration;
- real-time job progress;
- tests, CI, observability, and Kubernetes packaging;
- clear handoff documentation.

## Scope principle

The project should remain a fleet solar-analysis product. Do not attach unrelated technologies merely to mirror vacancy keywords. Every infrastructure choice must support a visible user or operational need.

---

## Milestone 1: Complete the PostgreSQL domain model

### Objectives

- move from authentication-only persistence to a real fleet-analysis domain;
- introduce organization tenancy;
- make calculations reproducible and queryable.

### Work items

1. Extend the Prisma schema with:
   - `Organization`
   - `OrganizationMembership`
   - `Fleet`
   - `Vehicle`
   - `LocationProfile`
   - `Calculation`
   - `CalculationInputSnapshot`
   - `CalculationResult`
   - `CalculationScenario`
   - `ReportJob`
   - `AuditEvent`
   - `FeatureFlag`
2. Add `organizationId` to every domain entity.
3. Add role values:
   - `OWNER`
   - `FLEET_MANAGER`
   - `ANALYST`
   - `VIEWER`
4. Store immutable input snapshots for every completed calculation.
5. Add version fields for:
   - calculation formula set;
   - energy-price assumptions;
   - emissions factors;
   - solar-yield assumptions;
   - currency conversion source.
6. Add database constraints and indexes.
7. Add seed data for two organizations, multiple users, fleets, vehicles, and calculations.
8. Add migration tests against an empty PostgreSQL database.

### Suggested entity relationships

```text
Organization
  ├── OrganizationMembership
  ├── Fleet
  │    └── Vehicle
  ├── Calculation
  │    ├── CalculationInputSnapshot
  │    ├── CalculationResult
  │    └── CalculationScenario
  ├── ReportJob
  ├── AuditEvent
  └── FeatureFlag
```

### Required tests

- a user sees only organizations where they have membership;
- organization-scoped unique constraints behave correctly;
- calculation snapshots cannot be silently overwritten;
- deleting a vehicle does not destroy historical calculation evidence;
- migrations apply and rollback safely in a test environment;
- two organizations can use the same vehicle label without conflict.

### Definition of done

- the database schema supports the product described in the README;
- major README claims are either implemented or clearly marked as roadmap;
- calculations are stored with immutable inputs and versions;
- tenant isolation is enforced in data access.

---

## Milestone 2: Secure access control, auditability, and provenance

### Objectives

- make access control and audit evidence part of normal product behavior;
- show privacy-aware engineering;
- make every result explainable.

### Work items

1. Add organization-aware authorization helpers for server actions and route handlers.
2. Define explicit permissions, for example:
   - owner: manage organization and memberships;
   - fleet manager: manage fleets and vehicles;
   - analyst: create and compare calculations;
   - viewer: read approved results and reports.
3. Add append-only audit events for:
   - organization and membership changes;
   - fleet and vehicle changes;
   - calculation creation and recalculation;
   - report generation and download;
   - permission failures;
   - feature-flag changes.
4. Add an organization audit page with filters.
5. Add a calculation provenance panel showing:
   - input snapshot date;
   - formula version;
   - assumption sources;
   - actor;
   - generation timestamp;
   - report version.
6. Add rate limiting to sensitive endpoints.
7. Add CSRF, secure-cookie, and session configuration checks.
8. Add a PII inventory and retention statement.
9. Redact tokens, email addresses, and raw personal data from logs.

### Required tests

- viewers cannot create or delete calculations;
- analysts cannot manage organization memberships;
- users cannot access another organization's report by guessing an ID;
- audit events are created for successful and rejected operations;
- historical results remain linked to the original assumptions;
- log output excludes passwords, tokens, reset tokens, and session values.

### Documentation

Create:

- `docs/security-model.md`
- `docs/threat-model.md`
- `docs/privacy-and-pii.md`
- `docs/calculation-provenance.md`
- `docs/adr/0001-organization-tenancy.md`
- `docs/adr/0002-calculation-versioning.md`

### Definition of done

A reviewer can switch roles, observe permission differences, inspect the audit history, and explain how a displayed ROI result was produced.

---

## Milestone 3: Temporal report workflow and real-time progress

### Objectives

- add a justified orchestration integration;
- turn report generation into a durable workflow;
- demonstrate visible progress, retries, and failure handling.

### Workflow design

Use Temporal for report generation.

1. user requests a report for a completed calculation;
2. API creates a `ReportJob` with status `QUEUED`;
3. Temporal workflow loads the immutable calculation snapshot;
4. workflow renders charts and a PDF;
5. optional AI recommendation activity generates structured suggestions;
6. output is validated with Zod;
7. file metadata and report version are stored;
8. status changes are published to the UI;
9. audit event records success or failure.

### Job states

```text
QUEUED
VALIDATING
CALCULATING
RENDERING_CHARTS
GENERATING_REPORT
GENERATING_RECOMMENDATIONS
COMPLETED
FAILED
CANCELLED
```

### Work items

1. Add Temporal server and worker to local Docker Compose.
2. Create workflow and activity packages.
3. Use deterministic workflow IDs, such as `report/{organizationId}/{reportJobId}`.
4. Add retry policies with bounded attempts.
5. Add cancellation support.
6. Add Server-Sent Events for job progress.
7. Add reconnect support using last-event IDs.
8. Add a report status component and job history page.
9. Add idempotency keys for report requests.
10. Store generated files outside the database and keep metadata in PostgreSQL.

### AI recommendation safeguards

If the optional AI helper is implemented:

- keep deterministic calculations separate from generated recommendations;
- validate output against a strict schema;
- label recommendations as generated guidance, not financial advice;
- record model, prompt version, latency, and cost metadata;
- redact sensitive data before sending it to an external provider;
- allow the feature to be disabled through a tenant feature flag.

### Required tests

- duplicate report requests do not create duplicate workflows;
- workflow retries transient failures;
- cancellation updates UI and database state;
- users cannot subscribe to another organization's report events;
- invalid AI output is rejected safely;
- completed reports reference the exact input snapshot and versions used;
- SSE reconnect restores missed progress events.

### Definition of done

A demo can generate a report, show real-time progress, survive a simulated transient failure, complete successfully, and display the corresponding audit record and provenance metadata.

---

## Milestone 4: Search, visual quality, and product validation

### Objectives

- strengthen the data-heavy product experience;
- demonstrate a disciplined prototype-validation loop;
- make visual outputs accessible and explainable.

### Search

Implement PostgreSQL search and filters for:

- organization fleets;
- vehicles;
- calculation IDs;
- location names;
- report status;
- scenario labels;
- date ranges;
- vehicle and engine types.

Add indexes and document query choices.

### Visualization improvements

1. Add accessible data-table alternatives for every chart.
2. Add tooltips explaining assumptions and units.
3. Add scenario-difference explanations.
4. Add loading, empty, and error states.
5. Add deterministic chart export tests.
6. Add performance tests for larger fleets and calculation histories.
7. Use consistent colour semantics and contrast checks.

### Prototype-validation package

Create `docs/prototype-brief.md` containing:

- user problem;
- target user;
- assumptions;
- 1-3 week prototype scope;
- excluded scope;
- acceptance criteria;
- validation method;
- findings;
- go/no-go recommendation;
- integration backlog.

Suggested hypothesis:

> A fleet manager can enter vehicle and operating data, compare three solar-investment scenarios, and export an explainable report in under five minutes without specialist support.

Collect evidence such as:

- task completion time;
- validation-error rate;
- report generation latency;
- percentage of users who understand scenario differences;
- accessibility audit results;
- calculation reproducibility checks.

### Definition of done

The repository demonstrates not only implementation but also a documented process for testing whether the prototype solves the intended user problem.

---

## Milestone 5: CI, observability, Kubernetes, and handoff

### CI pipeline

Add `.github/workflows/ci.yml` with:

1. lockfile-enforced install;
2. Prettier check;
3. ESLint;
4. TypeScript type check;
5. unit and component tests;
6. PostgreSQL integration tests;
7. Playwright or Cypress critical-path tests;
8. Next.js production build;
9. Prisma migration validation;
10. Docker image build;
11. dependency and image vulnerability scans.

### E2E journeys

At minimum:

- user signs in and selects an organization;
- fleet manager creates a vehicle;
- analyst creates a calculation;
- viewer opens an approved report;
- unauthorized cross-organization access is rejected;
- report workflow completes and progress is visible.

### Containerization

Create:

- production multi-stage `Dockerfile`;
- worker Dockerfile for Temporal activities if separated;
- `.dockerignore`;
- `compose.yaml` containing application, PostgreSQL, Temporal, and required local dependencies.

Use non-root containers and pinned base images.

### Kubernetes packaging

Create:

```text
deploy/
  base/
    web-deployment.yaml
    web-service.yaml
    worker-deployment.yaml
    configmap.yaml
    ingress.yaml
    network-policy.yaml
  overlays/
    local/
    demo/
```

Use Kustomize with:

- readiness and liveness probes;
- resource requests and limits;
- Secret references;
- NetworkPolicy;
- rolling updates;
- separate web and worker workloads.

### Observability

Implement:

- structured JSON logging;
- correlation and job IDs;
- `/health/live`;
- `/health/ready` checking PostgreSQL and Temporal;
- Prometheus metrics for request latency, errors, report duration, workflow retries, and calculation volume;
- OpenTelemetry traces for user request to workflow completion as a stretch goal.

### Adoption package

Create:

- `docs/architecture.md`
- `docs/api-contracts.md`
- `docs/data-model.md`
- `docs/deployment-runbook.md`
- `docs/operational-runbook.md`
- `docs/demo-script.md`
- `docs/integration-backlog.md`
- `docs/known-limitations.md`
- `docs/decision-log.md`

Include Mermaid diagrams for:

- system context;
- container architecture;
- organization authorization;
- calculation lifecycle;
- report workflow;
- deployment topology.

### Definition of done

- CI passes from a clean clone;
- Docker Compose starts the complete local system;
- Kubernetes manifests render successfully;
- health and metrics endpoints work;
- a new engineer can deploy and demo the project using only repository documentation.

---

## Suggested repository structure

```text
app/
components/
lib/
  auth/
  authorization/
  calculations/
  database/
  observability/
  reports/
  workflows/
prisma/
  schema.prisma
  migrations/
worker/
docs/
  adr/
  architecture.md
  security-model.md
  calculation-provenance.md
  prototype-brief.md
  deployment-runbook.md
  integration-backlog.md
deploy/
  base/
  overlays/
.github/workflows/
```

## Portfolio evidence checklist

- [ ] PostgreSQL domain migrations
- [ ] organization tenancy
- [ ] role-based authorization and tests
- [ ] immutable calculation snapshots
- [ ] assumption and formula versioning
- [ ] audit-log UI
- [ ] Temporal report workflow
- [ ] real-time job progress
- [ ] accessible scenario visualizations
- [ ] integration and E2E tests
- [ ] green CI
- [ ] production container images
- [ ] Kubernetes/Kustomize assets
- [ ] structured logs, health checks, and metrics
- [ ] architecture, security, and runbook documentation
- [ ] prototype findings and integration backlog

## Recommended README opening after completion

> Fleet Solar Intelligence Prototype is a multi-tenant Next.js and PostgreSQL application for secure commercial-fleet solar analysis. It provides reproducible calculation snapshots, role-based access, audit trails, scenario visualizations, durable report workflows, operational telemetry, and a documented Kubernetes adoption package.

## Scope controls

Do not add OpenSearch before PostgreSQL search is complete. Do not add Kafka unless a real event-streaming requirement emerges. Do not make AI recommendations part of the critical calculation path.

## Estimated effort

- Milestone 1: 4-6 focused days
- Milestone 2: 3-5 focused days
- Milestone 3: 4-6 focused days
- Milestone 4: 3-4 focused days
- Milestone 5: 3-5 focused days

Total: approximately 17-26 focused development days.

## Final acceptance test

The project is ready when a reviewer can create two organizations, verify isolation, add fleet data, run and reproduce a calculation, inspect provenance, start a report workflow, observe live progress, download the report, inspect the audit record, and understand the deployment and handoff path from the documentation.
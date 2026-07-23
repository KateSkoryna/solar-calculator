# Orcrist Full-Stack Engineer Match Analysis

## Purpose

This document evaluates the Solar Calculator repository against the Orcrist Technologies Full-Stack Engineer (TypeScript - Prototyping) vacancy.

The role emphasizes validated vertical slices across React/Next.js, Node.js APIs, PostgreSQL/search integrations, secure access control, auditability, multitenancy assumptions, observability, workflow orchestration, Kubernetes/GitOps, tests, and an adoption package that enables handoff.

## Why Solar Calculator is selected

Among the four main projects, Solar Calculator is one of the two strongest foundations for this vacancy because it already demonstrates:

- Next.js 16 and React 19
- TypeScript
- PostgreSQL with Prisma
- authentication with Auth.js/NextAuth
- Zod validation and React Hook Form
- TanStack Query and Zustand
- Jest and React Testing Library
- Recharts data visualization
- internationalization
- PDF export
- a commercial, data-heavy domain
- Docker-based local development

Unlike QuizDOM and Tie Breaker, it already covers the vacancy's most explicit data-layer requirement: PostgreSQL. It also has a domain where auditability, calculations, data provenance, scenario comparison, and secure fleet-scoped access can be introduced naturally.

## Current project baseline

The README describes a commercial fleet solar-investment calculator with vehicle inputs, ROI scenarios, environmental-impact calculations, charts, multilingual output, authentication, saved calculation history, and PDF export.

The current Prisma schema, however, contains only authentication-oriented models. The README describes many planned domain features that are not yet represented in the visible database schema. This mismatch must be resolved before the repository is presented as completed evidence.

## Requirement-by-requirement assessment

| Vacancy expectation | Current evidence | Gap | Priority |
|---|---|---|---|
| React/Next.js + TypeScript | Strong | None | Low |
| Node.js APIs | Next.js server/API capabilities | Need explicit service/API architecture and contracts | High |
| PostgreSQL | Prisma/PostgreSQL configured | Domain schema is incomplete | Critical |
| Search integration | Not evident | Add fleet/calculation search | Medium |
| Product prototyping | Strong domain and UI scope | Need hypotheses, validation results, and scope decisions | High |
| Feature flags | Not evident | Add fleet/tenant rollout controls | Medium |
| Auth flows | Auth.js and credential/OAuth support | Add fleet access model and stronger policy tests | High |
| Auditability | Not evident | Add calculation and admin audit events | Critical |
| Multitenancy assumptions | Not evident | Add fleet-based tenant model | Critical |
| Observability | Not evident | Add logs, metrics, traces, and health checks | High |
| Kafka/Temporal | Not present | Add a justified orchestration workflow | High |
| Kubernetes/GitOps | Local Docker only | Add production images and Kubernetes assets | High |
| Tests and CI | Jest tooling exists | Need broader tests, E2E, and CI enforcement | High |
| Security/PII | Auth dependencies present | Add threat model, data classification, privacy handling | High |
| Complex visualization | Recharts and scenario views | Strengthen with data provenance and performance evidence | Medium |
| Python comfort | Not present | Optional; not required for this project | Low |
| Handoff package | Very detailed README | Separate implementation claims from roadmap; add ADRs/runbooks | Critical |

## Strategic repositioning

Recommended portfolio name:

> Fleet Solar Intelligence Prototype

Recommended one-line description after implementation:

> A multi-tenant Next.js and PostgreSQL prototype for secure fleet-energy analysis, with auditable calculation provenance, scenario comparison, asynchronous report workflows, observability, and Kubernetes deployment assets.

This phrasing should be used only after the corresponding functionality exists.

## Strongest vacancy alignment

### 1. Next.js and PostgreSQL

The repository already uses the vacancy's preferred frontend framework and relational database. This gives it a major advantage over the other candidate projects.

### 2. Data-heavy product workflow

The calculator processes structured fleet, vehicle, location, energy, and financial inputs into visible outcomes. This can demonstrate the role's expectation of turning ambiguity into an end-to-end prototype with visible product value.

### 3. Complex visualization

Scenario charts, ROI timelines, energy production, and CO2-impact views provide credible visualization evidence. The project does not need artificial geospatial features to be relevant.

### 4. Mission- and compliance-oriented framing

Fleet investment calculations can be made reproducible, explainable, and auditable. This is a natural place to demonstrate provenance, immutable calculation versions, privacy, and secure fleet-scoped access.

## Critical gaps

### 1. README-to-code mismatch

The README presents a broad feature set, while the visible Prisma schema currently contains only user/account/token models.

Required response:

- label unimplemented items explicitly as roadmap items;
- implement the core domain schema;
- ensure every major README claim is backed by code and tests;
- avoid presenting planned AI recommendations, E2E tests, or account features as complete unless verified.

### 2. No explicit multitenancy

The vacancy expects multitenancy assumptions. A fleet calculator naturally supports fleet-based tenancy: each fleet is itself the tenant, with no separate organization layer above it.

Recommended model:

- `Fleet`
- `FleetMembership`
- `Vehicle`
- `Calculation`
- `CalculationScenario`
- `ReportJob`
- `AuditEvent`
- `FeatureFlag`

All domain records should be scoped by `fleetId`.

### 3. No calculation provenance

For a data-heavy system, results should be explainable and reproducible.

Add:

- input snapshot;
- formula/configuration version;
- data-source version;
- currency and energy-price assumptions;
- timestamps;
- actor identity;
- deterministic recalculation support.

### 4. No asynchronous workflow

PDF generation, AI recommendations, or bulk fleet analysis are good orchestration candidates.

Temporal is a better match than Kafka for the first version because it supports durable, long-running jobs with retries and status visibility.

### 5. No operational packaging

The repository has local Docker startup, but it does not yet prove Kubernetes/GitOps, observability, secure secret management, or deployment runbooks.

## Recommended technical direction

### Tenant model

Use fleets as tenants. Each user belongs to one or more fleets through memberships. There is no separate organization entity; a fleet is the top-level tenant.

Roles:

- `OWNER`
- `FLEET_MANAGER`
- `ANALYST`
- `VIEWER`

### Domain model

Core entities:

- `Fleet`
- `FleetMembership`
- `Vehicle`
- `LocationProfile`
- `Calculation`
- `CalculationInputSnapshot`
- `CalculationResult`
- `CalculationScenario`
- `ReportJob`
- `AuditEvent`
- `FeatureFlag`

### Orchestration use case

Use Temporal for report generation and optional AI recommendations:

1. user requests a report;
2. API stores a report job;
3. workflow loads an immutable calculation snapshot;
4. workflow generates charts and PDF;
5. optional recommendation activity calls an AI provider;
6. output is validated and stored;
7. UI receives progress updates;
8. audit event records completion or failure.

### Search

Implement PostgreSQL search across:

- vehicle registration/name;
- fleet name;
- calculation ID;
- location;
- report status;
- scenario labels.

Use full-text search plus structured filters. OpenSearch can remain an integration backlog item.

### Visualization

Strengthen existing charts with:

- source/assumption tooltips;
- accessible tabular alternatives;
- scenario-difference explanations;
- export consistency tests;
- loading and large-dataset performance measurements.

## What not to do

Do not turn the project into a random map application merely because geospatial UX is listed as a nice-to-have. Location can remain a meaningful calculation input. Add maps only if they improve fleet or solar-insolation analysis.

Do not present AI recommendations as factual financial advice. Label them clearly, validate structured outputs, and separate deterministic calculations from generated suggestions.

## Success criteria

The upgraded repository should let a reviewer verify:

1. two fleets have isolated vehicles and calculations;
2. calculation results are reproducible from immutable snapshots;
3. every calculation records its formula and assumption version;
4. users have role-based permissions;
5. report generation runs as a durable asynchronous workflow;
6. progress appears in the UI in real time;
7. audit history shows who created, recalculated, exported, or deleted data;
8. CI is green;
9. Docker and Kubernetes deployment instructions work;
10. architecture, security, limitations, and adoption backlog are documented.

## Final match projection

Current project match for the vacancy: **7.5/10**

Projected match after implementation: **9/10**

The highest-value improvements are completing the PostgreSQL domain model, adding fleet tenancy, calculation provenance, Temporal-based report workflows, security/audit controls, CI, observability, and deployment packaging.
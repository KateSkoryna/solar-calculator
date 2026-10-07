# SunFleet – Solar Payback Calculator for Commercial Fleets

A multi-tenant web app that helps commercial fleet operators (buses, trucks, vans, trailers) evaluate solar panel investments — plus the fleet management, authorization, and vehicle/calculation domain model behind it.

Built with Next.js 16, React 19, and TypeScript. The full implementation plan, including what's built and what's next, lives in [`docs/detailed-plan.md`](docs/detailed-plan.md).

## Status

The project is built milestone by milestone against [`docs/detailed-plan.md`](docs/detailed-plan.md):

- ✅ **Foundation**: PostgreSQL domain model, migrations, seed script, fleet-scoped authorization, vehicle, calculation, member and audit-log API routes, audit logging, rate limiting.
- 🚧 **Milestone 1 — Secure access control, auditability, provenance**: log redaction and PII inventory ✅, authorization and audit API tests ✅, passwordless sign-in (Google or email link) ✅, security model and threat model 🔍 in review.
- ⬜ **Milestone 2 — Calculation engine and assumptions**
- ⬜ **Milestone 3 — Daylight UI redesign**
- ⬜ **Milestone 4 — Temporal report workflow and real-time progress**
- ⬜ **Milestone 5 — Python telemetry service and live data**
- ⬜ **Milestone 6 — Search, visual quality, product validation**
- ⬜ **Milestone 7 — CI, observability, Kubernetes, handoff**

The calculator's multi-step form UI exists on the frontend but is not yet wired to the backend domain model or a calculation engine — see [Known gaps](#known-gaps).

## Tech Stack

### Core

| Technology          | Purpose                     |
| ------------------- | --------------------------- |
| **Next.js 16**      | App Router, API routes, SSR |
| **React 19**        | UI library                  |
| **TypeScript**      | Type safety                 |
| **Tailwind CSS v4** | Utility-first styling       |

### Data & Auth

| Technology                               | Purpose                                                                           |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| **PostgreSQL**                           | Relational database — local dev via Docker Compose, production hosted on **Neon** |
| **Prisma 7** (`prisma-client` generator) | Type-safe ORM, migrations                                                         |
| **@prisma/adapter-pg**                   | Driver adapter (`pg`) for the Prisma query engine                                 |
| **NextAuth.js v5 (Auth.js)**             | Sessions (JWT strategy), Google OAuth + email sign-in links                       |
| **nodemailer**                           | Sends sign-in links through Gmail SMTP (behind `lib/email/send-email.ts`)         |
| **zod**                                  | Request/form validation                                                           |

### Forms & i18n

| Technology              | Purpose                                |
| ----------------------- | -------------------------------------- |
| **react-hook-form**     | Form state                             |
| **@hookform/resolvers** | Wires Zod schemas into react-hook-form |
| **next-intl**           | Internationalization (en, de, es)      |
| **next-themes**         | Dark/light theme toggle                |

### Installed for upcoming milestones (not yet wired into any feature)

`@tanstack/react-query`, `zustand`, `recharts`, `jspdf`, `html2canvas` — present in `package.json` for the report/results/search work in Milestones 3–4, but no source file imports them yet.

### Dev & Test

| Technology                            | Purpose                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| **Jest** + **@testing-library/react** | Unit/component tests (jsdom) and API route tests against a disposable Postgres (node) |
| **tsx** + Node's built-in test runner | Schema-level integration tests against real Postgres (`prisma/schema.integration.ts`) |
| **ESLint**, **Prettier**              | Linting and formatting                                                                |
| **Docker Compose**                    | Local PostgreSQL for development                                                      |

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL)

### Setup

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd solar-calculator
   npm install
   ```

2. **Set environment variables**

   Create `.env.local` (see `.env` for the full set this project reads):

   ```env
   DATABASE_URL="postgresql://dev_user:dev_password@localhost:5432/dev_database"
   NEXTAUTH_SECRET="..."
   NEXTAUTH_URL="http://localhost:3002"
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT="465"
   EMAIL_SERVER_USER="<gmail address>"
   EMAIL_SERVER_PASSWORD="<gmail app password>"
   EMAIL_FROM="SunFleet <gmail address>"
   ```

   The email variables are listed in `.env.example`. Without `EMAIL_SERVER_PASSWORD` in development, sign-in links are printed in the terminal instead of being emailed. Add `http://localhost:3002/api/auth/callback/google` as an authorised redirect URI in your Google OAuth client.

   `GEMINI_API_KEY` and `MAPBOX_API` are also read from the environment but reserved for future milestones — nothing in the codebase uses them yet.

3. **Run the app** (`npm run dev` starts local Postgres via Docker Compose automatically)

   ```bash
   npm run dev
   ```

4. **Apply migrations and seed data** (in another terminal)

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Open [http://localhost:3002](http://localhost:3002)

### Production Database

Production uses [Neon](https://neon.tech) for hosted Postgres. `DATABASE_URL` is set as a Vercel environment variable (never committed) and points at the Neon connection string instead of the local Docker instance. Deploys run `npm run vercel-build` (`prisma migrate deploy && next build`), which applies already-generated migrations against Neon — it never runs `migrate dev`, so it can't create new migrations on its own.

### Available Scripts

- `npm run dev` — start Postgres (Docker) + Next.js dev server on port 3002
- `npm run build` — `prisma generate` + production build
- `npm start` — start the production server
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run format` — Prettier, write mode
- `npm test` / `npm run test:watch` / `npm run test:coverage` — Jest unit tests
- `npm run test:api` — API route tests against a throwaway `_test` database (needs local Postgres)
- `npm run test:db` — schema-level integration tests against real Postgres (`prisma/schema.integration.ts`)
- `npm run db:migrate` — `prisma migrate dev`
- `npm run db:studio` — Prisma Studio
- `npm run db:seed` — seed two example fleets (see `prisma/seed.ts`)

## Project Structure

```
solar-calculator/
├── app/
│   ├── [locale]/                    # next-intl locale-scoped routes
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Landing page
│   │   ├── calculator/page.tsx      # Multi-step calculator UI
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── check-email/page.tsx     # "Check your email" after requesting a link
│   │   └── user/page.tsx            # Signed-in user page
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   └── fleets/[fleetId]/
│   │       ├── vehicles/route.ts               # GET (list), POST (create)
│   │       ├── vehicles/[vehicleId]/route.ts   # GET, PATCH, DELETE (soft)
│   │       ├── calculations/route.ts           # GET (list), POST (create)
│   │       ├── calculations/[calculationId]/route.ts  # GET
│   │       ├── members/route.ts                # GET, POST
│   │       ├── members/[userId]/route.ts       # PATCH, DELETE
│   │       ├── audit-events/route.ts           # GET
│   │       └── __tests__/authorization.api.test.ts  # Role and tenancy tests
│   ├── generated/prisma/            # Prisma client output (gitignored)
│   ├── globals.css
│   └── page.test.tsx
├── components/
│   ├── auth/                        # Google button and email sign-in form
│   ├── calculator/
│   │   ├── MultiStepForm.tsx
│   │   └── steps/                   # VehicleTypeStep, VehicleDetailsStep, LocationSetupStep, UserPromptStep
│   ├── form/                        # Reusable form primitives (Input, Select, Checkbox, Dropdown, ...)
│   ├── home/                        # Landing page sections
│   ├── language/, theme/            # Locale switcher, theme toggle
│   ├── layout/                      # Header, Footer, Container, Section, nav
│   └── providers/                   # SessionProvider, ThemeProvider
├── lib/
│   ├── prisma.ts                    # PrismaClient singleton (pg driver adapter)
│   ├── logger.ts, redact-pii.ts     # JSON logger with PII redaction
│   ├── audit.ts                     # recordAuditEvent() and action constants
│   ├── rate-limit.ts                # In-memory rate limiter
│   ├── sign-in-link-limits.ts       # Per-address and daily email link limits
│   ├── email/                       # sendEmail() interface, SMTP sender, sign-in email
│   ├── fleet-auth.ts                # requireFleetRole() + role constants
│   ├── fleet-auth.test.ts
│   ├── api-errors.ts                # Shared error → HTTP response mapping for route handlers
│   ├── vehicle-schema.ts            # Zod schemas for vehicle create/update
│   ├── calculation-schema.ts        # Zod schema for calculation create
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.ts                      # Seeds two example fleets with users in different roles
│   └── schema.integration.ts        # Real-Postgres schema tests (node:test)
├── test-support/                    # Test database lifecycle and fixtures for API tests
├── types/
│   ├── auth.ts                      # NextAuth session/user type augmentation
│   └── calculator.ts                # Frontend enums for the calculator form
├── messages/                        # i18n translations: en.json, de.json, es.json
├── docs/                            # Plan, security model, threat model, PII inventory, key concepts
├── auth.ts                          # NextAuth config (providers, callbacks, JWT session)
├── i18n.ts                          # next-intl config
├── proxy.ts                          # Locale routing, rate limiting, session redirects (Next.js 16 naming)
└── docker-compose.yml                # Local PostgreSQL
```

## Authorization Model

Access is fleet-scoped role-based access control:

- Every user–fleet relationship is a `FleetMembership` row with a role: `OWNER`, `MANAGER`, or `VIEWER`.
- `requireFleetRole(session, fleetId, allowedRoles)` in `lib/fleet-auth.ts` is the single place that checks "is this session's user allowed to do this in this fleet." It throws a `ForbiddenError` (HTTP 403) if there's no session, no membership, or the membership's role isn't in `allowedRoles`.
- Every vehicle/calculation route handler calls it before touching Prisma. Role constants (`ANY_FLEET_ROLE`, `FLEET_EDITOR_ROLES`, `FLEET_OWNER_ONLY`) live in the same file so the role-to-action mapping has one source of truth.
- Vehicle and calculation lookups by ID are always scoped to the fleet in the URL (`{ id, fleetId }`), so guessing another fleet's record ID returns 404, not another fleet's data.
- `lib/api-errors.ts`'s `toErrorResponse()` is the single place every route handler's `catch` block delegates to, turning `ForbiddenError`, Zod validation errors, malformed JSON, and "record not found" Prisma errors into the right HTTP status code.

## Key Decisions

- **The fleet is the tenant.** Every record belongs to a fleet and every route checks the caller's role in that fleet first. One person can work for several companies with a different role in each. The check lives in application code, not in PostgreSQL row-level security.
- **Calculations record what produced them.** Each result stores the formula version, the assumption versions and a frozen copy of the inputs, and is never edited. A number can be explained later, even after prices or formulas change.
- **No passwords.** Users sign in with Google or a one-time email link, so there is nothing to leak or reset.

Details: [`docs/security-model.md`](docs/security-model.md) and [`docs/threat-model.md`](docs/threat-model.md).

## Database Schema

Defined in `prisma/schema.prisma`, generated via Prisma 7's `prisma-client` generator into `app/generated/prisma` (gitignored).

**Auth (NextAuth-managed):** `User`, `Account`, `VerificationToken`

**Multi-tenancy:** `Fleet`, `FleetMembership` (join table with a `Role`: `OWNER` | `MANAGER` | `VIEWER`)

**Domain:**

- `Vehicle` — fleet-scoped vehicle specs (manufacturer, model, `VehicleType`, `EngineType`, `ParkingType`, distance/consumption, solar panel capacity and placement, payload/roof-load limits, operating months, winter usage, location); soft-deleted via `deletedAt`.
- `Calculation` — a request to evaluate a specific vehicle, linked to the fleet, vehicle, and requesting user.
- `CalculationScenario`, `CalculationInputSnapshot`, `CalculationResult` — three scenarios (pessimistic, realistic, optimistic) per calculation, each with frozen inputs and a full result (payback, savings by type, 10-year series). The pure engine is in `lib/calculation-engine`.
- `ReportJob` — async report generation job state (`ReportJobStatus`), designed for the Temporal-based workflow in Milestone 4.
- `AuditEvent` — append-only action log (fleet/actor/action/entity), written by every change and every refused request.
- `FeatureFlag` — per-fleet or global boolean/JSON flags.

## API Routes

All routes under `/api/fleets/[fleetId]/...` require an authenticated session with fleet membership; the required role is noted below.

| Route                                                | Method | Role required  | Notes                                               |
| ---------------------------------------------------- | ------ | -------------- | --------------------------------------------------- |
| `/api/fleets/[fleetId]/vehicles`                     | GET    | any member     | Lists non-deleted vehicles in the fleet             |
| `/api/fleets/[fleetId]/vehicles`                     | POST   | OWNER, MANAGER | Creates a vehicle                                   |
| `/api/fleets/[fleetId]/vehicles/[vehicleId]`         | GET    | any member     | 404 if the vehicle belongs to a different fleet     |
| `/api/fleets/[fleetId]/vehicles/[vehicleId]`         | PATCH  | OWNER, MANAGER | 404 if not found or soft-deleted                    |
| `/api/fleets/[fleetId]/vehicles/[vehicleId]`         | DELETE | OWNER          | Soft-delete (`deletedAt`)                           |
| `/api/fleets/[fleetId]/calculations`                 | GET    | any member     | Lists calculations in the fleet                     |
| `/api/fleets/[fleetId]/calculations`                 | POST   | OWNER, MANAGER | 404 if the referenced vehicle isn't in this fleet   |
| `/api/fleets/[fleetId]/calculations/[calculationId]` | GET    | any member     | 404 if the calculation belongs to a different fleet |
| `/api/fleets/[fleetId]/members`                      | GET    | any member     | Lists members                                       |
| `/api/fleets/[fleetId]/members`                      | POST   | OWNER          | Adds an existing user by email                      |
| `/api/fleets/[fleetId]/members/[userId]`             | PATCH  | OWNER          | Changes a role                                      |
| `/api/fleets/[fleetId]/members/[userId]`             | DELETE | OWNER          | Removes a member                                    |
| `/api/fleets/[fleetId]/audit-events`                 | GET    | OWNER, MANAGER | Filterable, paginated audit log                     |

Auth routes (`/api/auth/*`) are handled by Auth.js: Google sign-in, email sign-in links and sign-out. There are no passwords and no registration route.

## Testing

- **Unit/component tests** — colocated `*.test.ts(x)` files, run by Jest under jsdom (`npm test`).
- **API tests** — `*.api.test.ts` files call the route handlers directly against a disposable Postgres database (`npm run test:api`).
- **Schema integration tests** — `prisma/schema.integration.ts`, run with `npm run test:db` against a real local Postgres instance (constraints, cascades, uniqueness).

## Internationalization

Locales: English (`en`), German (`de`), Spanish (`es`) — see `messages/*.json` and `i18n.ts`.

## Known Gaps

- The calculator form UI (`components/calculator/`) is not yet connected to the `Vehicle`/`Calculation` API routes or a real calculation engine.
- Session revocation, a last-owner guard and sign-in audit events are not implemented (see [`docs/security-model.md`](docs/security-model.md)).
- Rate-limit counters live in server memory, so they are per instance on Vercel.
- No report generation, dashboard, results pages, or AI-assisted recommendations exist yet (Milestones 3+).

See [`docs/detailed-plan.md`](docs/detailed-plan.md) for the authoritative, up-to-date plan.

# Solar Calculator for Commercial Vehicles

A multi-tenant web app that helps commercial fleet operators (buses, trucks, vans, trailers) evaluate solar panel investments — plus the fleet management, authorization, and vehicle/calculation domain model behind it.

Built with Next.js 16, React 19, and TypeScript. The full implementation plan, including what's built and what's next, lives in [`docs/detailed-plan.md`](docs/detailed-plan.md).

## Status

The project is being built milestone by milestone against the plan in `docs/detailed-plan.md`:

- ✅ **Milestone 1 — PostgreSQL domain model**: schema for fleets, memberships, vehicles, calculations, report jobs, audit events, and feature flags; migrations; seed script; schema-level integration tests.
- 🚧 **Milestone 2 — Access control, auditability, provenance**: fleet-scoped authorization (`requireFleetRole`) and the vehicle/calculation API routes are in place; audit logging, rate limiting, session hardening, and the security write-up are still to come.
- ⬜ **Milestone 3 — Temporal report workflow**: report generation as an async job with real-time progress — not started.
- ⬜ **Milestone 4 — Search, visual quality, product validation**: not started.
- ⬜ **Milestone 5 — CI, observability, Kubernetes, handoff**: not started.

The calculator's multi-step form UI (vehicle type → vehicle details → location setup → user prompt) exists on the frontend but is not yet wired to the backend domain model or a calculation engine — see [Known gaps](#known-gaps).

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
| **NextAuth.js v5 (Auth.js)**             | Sessions (JWT strategy), Google OAuth + credentials                               |
| **bcryptjs**                             | Password hashing                                                                  |
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
| **Jest** + **@testing-library/react** | Colocated unit/component tests (jsdom)                                                |
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
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```

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

5. Open [http://localhost:3000](http://localhost:3000)

### Production Database

Production uses [Neon](https://neon.tech) for hosted Postgres. `DATABASE_URL` is set as a Vercel environment variable (never committed) and points at the Neon connection string instead of the local Docker instance. Deploys run `npm run vercel-build` (`prisma migrate deploy && next build`), which applies already-generated migrations against Neon — it never runs `migrate dev`, so it can't create new migrations on its own.

### Available Scripts

- `npm run dev` — start Postgres (Docker) + Next.js dev server
- `npm run build` — `prisma generate` + production build
- `npm start` — start the production server
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run format` — Prettier, write mode
- `npm test` / `npm run test:watch` / `npm run test:coverage` — Jest
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
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── user/page.tsx            # Signed-in user page
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── forgot-password/route.ts
│   │   │   └── reset-password/route.ts
│   │   └── fleets/[fleetId]/
│   │       ├── vehicles/route.ts               # GET (list), POST (create)
│   │       ├── vehicles/[vehicleId]/route.ts   # GET, PATCH, DELETE (soft)
│   │       ├── calculations/route.ts           # GET (list), POST (create)
│   │       └── calculations/[calculationId]/route.ts  # GET
│   ├── generated/prisma/            # Prisma client output (gitignored)
│   ├── globals.css
│   └── page.test.tsx
├── components/
│   ├── auth/                        # Login/register/reset-password forms
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
│   ├── auth-helpers.ts              # Credentials-provider password verification
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
├── types/
│   ├── auth.ts                      # NextAuth session/user type augmentation
│   └── calculator.ts                # Frontend enums for the calculator form
├── messages/                        # i18n translations: en.json, de.json, es.json
├── docs/detailed-plan.md            # Living, milestone-by-milestone implementation plan
├── auth.ts                          # NextAuth config (providers, callbacks, JWT session)
├── i18n.ts                          # next-intl config
├── proxy.ts                          # next-intl routing middleware (Next.js 16 naming)
└── docker-compose.yml                # Local PostgreSQL
```

## Authorization Model

Access is fleet-scoped role-based access control:

- Every user–fleet relationship is a `FleetMembership` row with a role: `OWNER`, `MANAGER`, or `VIEWER`.
- `requireFleetRole(session, fleetId, allowedRoles)` in `lib/fleet-auth.ts` is the single place that checks "is this session's user allowed to do this in this fleet." It throws a `ForbiddenError` (HTTP 403) if there's no session, no membership, or the membership's role isn't in `allowedRoles`.
- Every vehicle/calculation route handler calls it before touching Prisma. Role constants (`ANY_FLEET_ROLE`, `FLEET_EDITOR_ROLES`, `FLEET_OWNER_ONLY`) live in the same file so the role-to-action mapping has one source of truth.
- Vehicle and calculation lookups by ID are always scoped to the fleet in the URL (`{ id, fleetId }`), so guessing another fleet's record ID returns 404, not another fleet's data.
- `lib/api-errors.ts`'s `toErrorResponse()` is the single place every route handler's `catch` block delegates to, turning `ForbiddenError`, Zod validation errors, malformed JSON, and "record not found" Prisma errors into the right HTTP status code.

## Database Schema

Defined in `prisma/schema.prisma`, generated via Prisma 7's `prisma-client` generator into `app/generated/prisma` (gitignored).

**Auth (NextAuth-managed):** `User`, `Account`, `VerificationToken`

**Multi-tenancy:** `Fleet`, `FleetMembership` (join table with a `Role`: `OWNER` | `MANAGER` | `VIEWER`)

**Domain:**

- `Vehicle` — fleet-scoped vehicle specs (manufacturer, model, `VehicleType`, `EngineType`, `ParkingType`, distance/consumption, solar panel capacity and placement, payload/roof-load limits, operating months, winter usage, location); soft-deleted via `deletedAt`.
- `Calculation` — a request to evaluate a specific vehicle, linked to the fleet, vehicle, and requesting user.
- `CalculationScenario`, `CalculationInputSnapshot`, `CalculationResult` — versioned inputs/outputs for a calculation (the actual computation engine is not yet implemented — Milestone 3).
- `ReportJob` — async report generation job state (`ReportJobStatus`), designed for the Temporal-based workflow in Milestone 3.
- `AuditEvent` — append-only action log (fleet/actor/action/entity), not yet written to by any route (Step 2.3).
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

Auth routes (`/api/auth/*`) handle NextAuth sign-in/out, registration, and password reset.

## Testing

- **Unit/component tests** — colocated `*.test.ts(x)` files, run by Jest under jsdom (e.g. `lib/fleet-auth.test.ts`, `app/page.test.tsx`).
- **Schema integration tests** — `prisma/schema.integration.ts`, run with `npm run test:db` against a real local Postgres instance (constraints, cascades, uniqueness).

## Internationalization

Locales: English (`en`), German (`de`), Spanish (`es`) — see `messages/*.json` and `i18n.ts`.

## Known Gaps

- The calculator form UI (`components/calculator/`) is not yet connected to the `Vehicle`/`Calculation` API routes or a real calculation engine.
- No audit logging, rate limiting, or CSRF/session hardening yet (Milestone 2, Steps 2.3–2.7).
- No report generation, dashboard, results pages, or AI-assisted recommendations exist yet (Milestone 3+).

See [`docs/detailed-plan.md`](docs/detailed-plan.md) for the authoritative, up-to-date plan.

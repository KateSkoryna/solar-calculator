# Key Concepts — Steps 1.1 to 2.7

A tutor-style companion to [`detailed-plan.md`](./detailed-plan.md). Each concept
is explained in plain language with a real snippet from this codebase, so you
can see it, not just read about it. Read top to bottom — Milestone 1 concepts
are the foundation the Milestone 2 ones build on.

---

## Milestone 1 — Domain Model

### Entity-relationship modeling & cardinality

Cardinality just answers "how many of A relate to how many of B?"

- **1-to-many**: one `Fleet` has many `Vehicle`s.
- **1-to-1**: one `CalculationScenario` has exactly one `CalculationResult`.
- **many-to-many**: many `User`s belong to many `Fleet`s — modeled with a join
  table in between, since relational databases can't express many-to-many
  directly.

```prisma
model FleetMembership {
  fleetId String
  userId  String
  role    Role

  fleet Fleet @relation(fields: [fleetId], references: [id])
  user  User  @relation(fields: [userId], references: [id])

  @@unique([fleetId, userId])
}
```

`FleetMembership` **is** the many-to-many join: a row means "this user belongs
to this fleet, with this role."

### Multi-tenant data modeling

A "tenant" is an isolated customer/organization whose data must never leak
into another tenant's view. Here, **`Fleet` is the tenant** — every domain
table carries a `fleetId` so a query can never accidentally cross fleets.

```prisma
model Vehicle {
  fleetId String
  fleet   Fleet @relation(fields: [fleetId], references: [id], onDelete: Restrict)

  @@index([fleetId, deletedAt])
}
```

Every query for vehicles filters `where: { fleetId }` — the tenant boundary is
baked into the schema, not just enforced in application code (though we also
enforce it there — see [`requireFleetRole`](#policy-based-authorization--least-privilege) below).

### Prisma enums

An enum restricts a column to a fixed set of string values instead of any
string — the database rejects anything outside the list.

```prisma
enum Role {
  OWNER
  MANAGER
  VIEWER
}
```

Beats a plain `String` column because a typo like `"Ownerr"` fails at the
database level, not silently at 2am in production.

### `@@id`, `@@unique`, and composite indexes

- `@id` / `@@id` marks the primary key.
- `@@unique([a, b])` says "no two rows can share this _combination_" — not
  each field alone.

```prisma
model FleetMembership {
  @@unique([fleetId, userId]) // one membership row per (fleet, user) pair
}

model Vehicle {
  @@unique([id, fleetId]) // lets Calculation FK into (vehicleId, fleetId)
  @@index([fleetId, deletedAt]) // speeds up "active vehicles in fleet X"
}
```

A composite **index** (`@@index`) doesn't add a constraint — it just makes
queries filtering on those columns together fast.

### `onDelete` referential actions: Restrict vs. Cascade

When a parent row is deleted, what happens to its children?

- `Cascade` — delete the children too.
- `Restrict` — refuse the delete if children still exist.

```prisma
model FleetMembership {
  fleet Fleet @relation(fields: [fleetId], references: [id], onDelete: Restrict)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Deleting a `Fleet` with members still attached is **blocked** (you'd lose a
tenant's history by accident). Deleting a `User` **cascades** their
memberships — no orphaned rows pointing at a user that no longer exists.
Financial/history tables (`Vehicle`, `Calculation`, `ReportJob`, `AuditEvent`)
all use `Restrict` on `fleetId` for the same reason: never silently destroy
audit trail data.

### Immutability by convention

Some rows should never be `UPDATE`d after creation — only ever inserted fresh.
`CalculationResult` has no update path anywhere in the app: a new calculation
means a brand-new row, not editing an old number.

```prisma
model CalculationResult {
  netSavingsAmount Decimal  @db.Decimal(12, 2)
  computedAt       DateTime @default(now())
}
```

This isn't enforced by a database constraint — it's a **convention**: nothing
in the codebase calls `.update()` on this model. The payoff is that a
displayed ROI number can never quietly drift from what was actually
calculated at the time.

### Versioned assumptions

Financial calculations depend on inputs that change over time (fuel prices,
solar yield formulas). Instead of overwriting old assumptions, stamp each
calculation with **which version** it used.

```prisma
model CalculationScenario {
  formulaVersion       String
  assumptionSetVersion String
}
```

Six months from now, when someone asks "why did this number change?", the
answer is in the row, not lost.

### JSON vs. relational columns

Most fields get their own relational column (queryable, type-checked,
indexable). But `vehicleSpec` in `CalculationInputSnapshot` is `Json`:

```prisma
model CalculationInputSnapshot {
  vehicleSpec Json // a frozen copy of the vehicle's fields at calculation time
}
```

Why JSON here? This is a **point-in-time snapshot** of a `Vehicle`'s fields —
its shape doesn't need its own indexes or foreign keys, and it must stay
exactly as captured even if the `Vehicle` model gains new columns later. JSON
trades queryability for "store this blob exactly as-is, forever."

### State-machine modeling in a column

A `status` enum plus a documented set of valid transitions turns a column
into a mini state machine:

```prisma
enum ReportJobStatus {
  QUEUED
  VALIDATING
  CALCULATING
  RENDERING_CHARTS
  GENERATING_REPORT
  COMPLETED
  FAILED
  CANCELLED
}
```

The enum lists every state; application code (Milestone 3) enforces which
transitions are legal (e.g. you can't jump from `QUEUED` straight to
`COMPLETED`).

### Append-only audit log design

Like `CalculationResult`, `AuditEvent` rows are only ever **created**, never
updated or deleted:

```prisma
model AuditEvent {
  actorUserId String?
  action      String
  entityType  String
  entityId    String
  metadata    Json
  createdAt   DateTime @default(now())
}
```

An append-only log is trustworthy specifically _because_ nothing can rewrite
history — see [structured event payloads](#append-only-log-patterns--structured-event-payloads) below for how it's written.

### Migration generation vs. `db push`

- `prisma migrate dev` **generates a SQL file** recording the exact schema
  change, and applies it. It builds a history you can replay from scratch.
- `prisma db push` mutates the database to match the schema directly, with
  **no file, no history** — fine for quick prototyping, unsafe for anything
  you need to reproduce or roll out to production.

This project only uses `migrate dev`/`migrate deploy` — every schema change
has a matching file under `prisma/migrations/`.

### Migration history & rollback strategy

Each migration is a timestamped, one-way folder:

```
prisma/migrations/
  20260724145819_add_domain_models/
  20260724150722_tighten_audit_and_flag_constraints/
  20260727114449_fleet_membership_restrict_delete/
  20260728064707_add_fleet_short_name/
```

Prisma migrations are **forward-only** — there's no built-in "undo." To roll
back a bad change, you write a _new_ migration that reverses it (e.g. drop
the column you just added), rather than editing or deleting an old migration
folder that may already be applied elsewhere.

### Idempotent seeding & `upsert`

A seed script should be safe to run twice without erroring or creating
duplicates. `upsert` does that: update if the row exists, create if it
doesn't.

```ts
const fleet = await prisma.fleet.upsert({
  where: { id: "fleet_berlin_delivery" },
  update: {},
  create: {
    id: "fleet_berlin_delivery",
    name: "Berlin Delivery Fleet",
    slug: "berlin",
    type: "VAN",
  },
});
```

Run `npx prisma db seed` five times in a row and you still get exactly one
`fleet_berlin_delivery`.

### Fixture design

A "fixture" is deliberately-crafted test data that exercises the scenarios
you care about. This project's seed creates **two separate fleets**, each
with users in different roles (`OWNER`, `MANAGER`, `VIEWER`), specifically so
tenant isolation and role checks have something real to test against —
instead of one fleet where every bug looks the same.

### Integration testing against a real database

A unit test with a mocked database can't catch a bad `onDelete` rule or a
broken constraint — only a real Postgres instance can. `prisma/schema.integration.ts`
spins up an actual database and runs real queries against it:

```ts
const testDatabaseName = `${sourceUrl.pathname.slice(1)}_test`;
```

Run via `npm run test:db`.

### Test database lifecycle

Integration tests need a clean slate each run, and must clean up after
themselves so they don't pollute your real dev database:

```ts
async function createFreshTestDatabase() {
  /* ... */
}
async function dropTestDatabase() {
  /* ... */
}
```

Pattern: `before` → create a fresh `_test` database and migrate it → run
tests → `after` → drop it.

### Environment-specific configuration & secrets management

The same code runs against different databases in different environments —
local, CI, production. The **only** thing that should change between them is
an environment variable, never a hardcoded value:

```ts
const sourceUrl = new URL(process.env.DATABASE_URL as string);
```

Local dev uses a throwaway `dev_user`/`dev_password` in Docker Compose;
production's `DATABASE_URL` is set as a Vercel environment variable and is
never committed to the repo.

### `migrate dev` vs. `migrate deploy`

- `migrate dev` (local only) — compares your schema to the database,
  **generates a new migration file**, and applies it. Requires interactive
  confidence that the generated SQL is correct.
- `migrate deploy` (CI/production) — applies migrations that **already
  exist** in `prisma/migrations/`. It never generates anything; it just runs
  what's already been reviewed.

The production deploy pipeline only ever calls `migrate deploy`.

---

## Milestone 2 — Access Control, Auditability, Provenance (through Step 2.7)

### Policy-based authorization & least privilege

Instead of scattering `if (user.role === "OWNER")` checks across every route,
centralize the rule into one place that every route calls:

```ts
export const FLEET_EDITOR_ROLES: Role[] = [Role.OWNER, Role.MANAGER];

export async function requireFleetRole(
  session: Session | null,
  fleetId: string,
  allowedRoles: Role[],
): Promise<FleetAccess> {
  // throws ForbiddenError if the caller isn't one of allowedRoles for this fleet
}
```

**Least privilege** means each role gets exactly the access it needs and no
more — a `VIEWER` can read but never appears in `FLEET_EDITOR_ROLES`, so it's
structurally impossible for a viewer-only route check to let them write.

### IDOR — Insecure Direct Object Reference

An IDOR bug is when an app trusts an ID from the URL/request without checking
"does the current user actually own this?" — e.g. changing
`/api/fleets/fleet-A/vehicles/123` to `/api/fleets/fleet-B/vehicles/123` and
getting fleet B's data because nothing checked the caller belongs to fleet B.

`requireFleetRole` closes this by looking up membership **keyed on the
specific `fleetId` in the request**, before any Prisma call touches the data:

```ts
const membership = await prisma.fleetMembership.findUnique({
  where: { fleetId_userId: { fleetId, userId } },
});

if (!membership || !allowedRoles.includes(membership.role)) {
  throw new ForbiddenError();
}
```

No membership row for that fleet → no access, regardless of what other
fleets the user belongs to.

### Defense in depth & fail-closed vs. fail-open

**Defense in depth**: don't rely on a single check (e.g. only hiding a button
in the UI) — enforce the same rule again at the API layer, since a UI check
is trivially bypassed with `curl`.

**Fail-closed** means the default outcome on doubt/error is _deny_, not
_allow_. `requireFleetRole` fail-closes twice over: no session → denied, no
membership row → denied. There's no code path where an exception or missing
data quietly falls through to "allowed."

```ts
if (!userId) {
  throw new ForbiddenError("You must be signed in to perform this action");
}
```

### Append-only log patterns & structured event payloads

Same append-only idea as `AuditEvent` in Milestone 1, now from the writing
side. `recordAuditEvent` always **creates**, never updates, and stores
context as structured JSON rather than a free-text string:

```ts
export function recordAuditEvent(
  client: Prisma.TransactionClient,
  {
    fleetId,
    actorUserId,
    action,
    entityType,
    entityId,
    metadata = {},
  }: RecordAuditEventInput,
) {
  return client.auditEvent.create({
    data: { fleetId, actorUserId, action, entityType, entityId, metadata },
  });
}
```

`metadata` being JSON (not a string) means a reviewer or future query can
filter/inspect _what_ changed, not just parse a sentence.

### Correlating events to actors and requests

Every audit row answers "who did what to which thing" by carrying explicit
IDs rather than a description:

```ts
await recordAuditEvent(prisma, {
  fleetId,
  actorUserId, // who
  action: AuditAction.ACCESS_DENIED, // what
  entityType: AuditEntityType.FLEET, // to which kind of thing
  entityId: fleetId, // to which specific thing
  metadata: { reason, allowedRoles, actualRole },
});
```

This is what makes the audit log page's "filter by actor" and "filter by
entity type" features possible — the data is structured, not scraped from
text.

### Cursor/offset pagination

**Offset pagination** ("skip 40, take 20") is simple and used here because
audit logs are filtered/sorted by date, not infinitely scrolled by millions
of users:

```ts
const [events, totalCount] = await Promise.all([
  prisma.auditEvent.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
  }),
  prisma.auditEvent.count({ where }),
]);
```

(**Cursor pagination** — "give me everything after row X" — scales better
for huge, constantly-growing feeds, but needs a stable sort key; offset is
the simpler, correct-enough choice for a filtered admin log.)

### Role-gating a whole page

Not just individual buttons — the entire audit route requires an editor role
before any data is fetched:

```ts
const session = await auth();
await requireFleetRole(session, fleetId, FLEET_EDITOR_ROLES);
```

Same helper as every other route — no separate "page-level" auth system to
keep in sync.

### Data provenance UX patterns

"Provenance" = where a number came from. Instead of just showing a result,
the calculation page shows the **input snapshot, formula version, and who
requested it**, so a non-technical reviewer can trust the number without
reading code:

```tsx
<ProvenancePanel
  formulaVersion={scenario.formulaVersion}
  assumptionSetVersion={scenario.assumptionSetVersion}
  capturedAt={snapshot.capturedAt}
  requestedByUser={calculation.requestedByUser}
/>
```

This is the UI-facing payoff of the [versioned assumptions](#versioned-assumptions) modeled back in Milestone 1 — the data existed in the schema first, the panel just surfaces it.

### Rate-limiting algorithms & per-IP limiting

A **fixed-window** limiter counts requests in a time bucket and resets it
when the window expires:

```ts
export function checkRateLimit(
  key: string,
  { windowMs, maxRequests }: RateLimitConfig,
): boolean {
  const bucket = buckets.get(key);
  if (!bucket || Date.now() >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: Date.now() + windowMs });
    return true;
  }
  if (bucket.count >= maxRequests) return false;
  bucket.count += 1;
  return true;
}
```

The `key` is per-IP for anonymous endpoints like login (`getClientIp`
extracts it from the `x-forwarded-for` header), so one abusive IP can't lock
out everyone, and one legitimate user isn't limited by someone else's
traffic.

### Where to enforce limits in a Next.js app

Enforced in **middleware** (`proxy.ts`), which runs before the request
reaches any route handler — the cheapest possible place to reject a flood of
requests:

```ts
const rateLimitedRoute = findRateLimitedRoute(pathname, request.method);
if (rateLimitedRoute) {
  const allowed = checkRateLimit(
    `${rateLimitedRoute.name}:${getClientIp(request)}`,
    SENSITIVE_ENDPOINT_RATE_LIMIT,
  );
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
}
```

Only listed sensitive routes (login, register, password reset, calculation
creation) pay this cost — everything else skips straight through.

### `SameSite`, `Secure`, `HttpOnly` cookie flags

- **`HttpOnly`** — JavaScript can't read the cookie (`document.cookie` won't
  show it), so a stolen-via-XSS script can't steal it.
- **`Secure`** — the browser only ever sends the cookie over HTTPS, never
  plain HTTP.
- **`SameSite=Lax`** — the browser withholds the cookie on cross-site
  background requests (another site's `fetch`/image/script can't attach it),
  while still sending it on normal top-level navigation.

```ts
useSecureCookies: process.env.VERCEL === "1",
```

One flag controls every cookie Auth.js issues (session, CSRF, OAuth state),
so it's consistent everywhere instead of set field-by-field.

### CSRF token flow

CSRF tricks a logged-in user's browser into submitting a request they didn't
intend (e.g. a hidden form on an attacker's site that POSTs to your
`/logout`). Auth.js defends its own routes with a **double-submit cookie**:
it sets a `csrfToken` cookie, and requires the _same_ token to also be
present in the request body. A cross-site attacker can trigger the request
but can't read the cookie to copy its value into the body, so the two won't
match.

This project's own mutating routes (`/api/fleets/[fleetId]/...`) rely on
`SameSite=Lax` doing the same job implicitly: the browser simply won't attach
the session cookie to a cross-site request in the first place, so there's no
valid session to CSRF against.

### Session fixation

Session fixation is an attack where an attacker gets a victim to use a
_known_ session identifier (e.g. via a crafted link), then reuses that same
identifier after the victim logs in — hijacking their now-authenticated
session. It's mitigated by never reusing a pre-login token as the
post-login one. This project uses JWT-strategy sessions:

```ts
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60,
}
```

A JWT session token is only ever **minted at login** (inside the `jwt`
callback, after credentials are verified) — there's no pre-existing
anonymous session identifier for an attacker to fixate on and later inherit.

### Token storage tradeoffs: `HttpOnly` cookie vs. localStorage

"JWT" is just the _format_ of the token (a signed blob of data); it says
nothing about _where_ the browser keeps it. That's a separate choice, and it
changes which attack the token is exposed to:

- **`HttpOnly` cookie** (what this project uses): JavaScript can't read it —
  `document.cookie` won't show it — so a malicious script injected via XSS
  can't steal it and reuse it elsewhere. Trade-off: the browser attaches it
  automatically to every request, including ones triggered by another site,
  which is the CSRF risk `SameSite` defends against.
- **`localStorage`**: your own JS has to manually attach it to each request
  (`Authorization: Bearer <token>`), so nothing gets sent automatically to
  other sites — no CSRF exposure. Trade-off: _any_ script running on the
  page, including an attacker's via XSS, can do
  `localStorage.getItem("token")` and exfiltrate it. Once stolen this way,
  the attacker can reuse it from anywhere, indefinitely — worse than a
  one-shot CSRF request.

```ts
useSecureCookies: process.env.VERCEL === "1",
session: { strategy: "jwt" },
```

This project stores its JWT in an `HttpOnly` cookie rather than
`localStorage` for exactly this reason: OWASP recommends against putting
auth tokens in `localStorage` because the XSS-theft risk it invites is
considered worse than the CSRF risk a cookie invites (and CSRF is the easier
one to close, via `SameSite`).

### Same-origin vs. cross-origin requests, and CORS

An **origin** is the combination of protocol + domain + port. Two URLs are
the same origin only if all three match:

```
https://solarcalc.com          → origin A
https://solarcalc.com:3000     → different origin (port differs)
https://api.solarcalc.com      → different origin (subdomain differs)
```

This project's frontend and API live in the **same** Next.js app on the
**same origin** — a page under `app/[locale]/...` calling
`/api/fleets/[fleetId]/...` never crosses an origin boundary, which is why
the cookie-based session "just works" with no extra configuration.

If the frontend and API were ever split into separate deployments (e.g. a
React app on `app.solarcalc.com` calling an API on `api.solarcalc.com`, or
calling a third-party API like Firebase's), that becomes a **cross-origin**
request, and two things change:

1. The API must opt in via **CORS** (Cross-Origin Resource Sharing) response
   headers, or the browser blocks the response from reaching the calling
   page's JavaScript.
2. A cookie set by one origin isn't reliably sent on requests initiated from
   a different origin — browsers increasingly restrict this "third-party
   cookie" behavior by default. This is exactly why cross-origin APIs (like
   Firebase) don't use cookies at all: they issue a JWT that the client SDK
   manually attaches to every request instead.

This project doesn't have that problem today — one app, one origin — but
it's the concept to reach for if the architecture ever splits.

## PII inventory and log redaction

### PII classification

Every stored field falls into one of three buckets: personal data (email, name, IP address), secrets (password hash, tokens, session cookie) and non-personal data (ids, timestamps). Each bucket gets different handling, so the first step is writing down which is which. `docs/privacy-and-pii.md` does that for every column:

```md
| `User.resetToken` | `User.resetToken` | Secret | Nobody in the app; database admins | One hour (`resetTokenExpiry`), cleared after use | No, redacted |
```

### Log redaction

Redaction removes sensitive values before a log line is written, so no code path can leak them by accident. It works by key name and by pattern:

```ts
export function redactPii(value: unknown): unknown {
  if (typeof value === "string") {
    return redactString(value);
  }
  if (value instanceof Error) {
    return { name: value.name, message: redactString(value.message) };
  }
```

### Why secrets in logs are a vulnerability

Logs are copied to dashboards, vendors and laptops, and far more people can read them than can read the database. The old forgot-password route logged the full reset link. Anyone with log access could have taken over an account. Now only the event name is logged, and the link appears in a debug line that runs in development only:

```ts
logger.info("password_reset_requested");
if (process.env.NODE_ENV === "development") {
  logger.debug("password_reset_link_created", { resetUrl });
}
```

### Data retention basics

Keep personal data only as long as it has a purpose, and write the limit down. Reset tokens live one hour and are cleared after use. Rate-limiter IP addresses exist only in memory for one window and never reach the database. Both facts are recorded in the retention column of the PII table.

## Authorization and audit API tests

### Negative-path testing

A security test proves what is refused, not only what works. Each test is named after the rule it locks in and asserts the rejection:

```ts
it("a viewer cannot create a vehicle", async () => {
  signInAs(fixtures.viewerA);

  const response = await createVehicle(
    jsonRequest("POST", validVehicleInput),
    routeParams({ fleetId: fixtures.fleetA.id }),
  );

  expect(response.status).toBe(403);
});
```

### Test fixtures for multiple roles

Fixtures build the same small world before every test: two fleets, one user per role in fleet A, an owner in fleet B and one vehicle each. Tests pick who they act as, so a rule is checked from every side:

```ts
const ownerA = await createMember(fleetA.id, Role.OWNER, "owner-a");
const managerA = await createMember(fleetA.id, Role.MANAGER, "manager-a");
const viewerA = await createMember(fleetA.id, Role.VIEWER, "viewer-a");
const ownerB = await createMember(fleetB.id, Role.OWNER, "owner-b");
```

### Testing route handlers without a running server

A Next.js route handler is a plain function from `Request` to `Response`. Tests call it directly, so nothing needs to listen on a port. The session lookup `auth()` is replaced by a mock that returns the chosen user or `null`:

```ts
jest.mock("@/auth", () => ({ auth: jest.fn() }));

function signInAs(user: { id: string } | null) {
  mockedAuth.mockResolvedValue(
    user ? { user: { id: user.id }, expires: futureIsoDate } : null,
  );
}
```

### Disposable test databases

Tests run against a database that is created and migrated before the run and dropped after it, so they never touch development data. One helper serves both the Jest API suite and the migration suite:

```ts
export async function createFreshTestDatabase() {
  await withAdminConnection(async (admin) => {
    await terminateActiveConnectionsToTestDatabase(admin);
    await admin.query(`DROP DATABASE IF EXISTS "${testDatabaseName}"`);
    await admin.query(`CREATE DATABASE "${testDatabaseName}"`);
  });
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
  });
}
```

## Passwordless sign-in with email links (Gmail SMTP)

### Passwordless (magic-link) authentication

Instead of a password, the user proves they control an email address by opening a link sent to it. No password is stored, so there is nothing to leak, reset or brute-force. Auth.js does the flow when the Nodemailer provider is registered:

```ts
Nodemailer({
  server: getSmtpServerConfig(),
  from: process.env.EMAIL_FROM,
  maxAge: SIGN_IN_LINK_MAX_AGE_SECONDS,
  sendVerificationRequest: sendSignInLink,
}),
```

### Verification tokens: single use, expiry, hashed storage

The link carries a random token. Auth.js stores only a hash of it in the `VerificationToken` table, deletes the row when the link is used, and refuses it after `expires`. A stolen database therefore contains no usable links:

```ts
export const SIGN_IN_LINK_MAX_AGE_SECONDS = 900;
```

### SMTP and app passwords

SMTP is the protocol mail programs use to hand a message to a mail server. Gmail does not accept your normal password for this. You turn on 2-Step Verification and create a separate app password that can only send mail and can be revoked on its own:

```ts
auth: {
  user: process.env.EMAIL_SERVER_USER ?? "",
  pass: process.env.EMAIL_SERVER_PASSWORD ?? "",
},
```

### Email deliverability (SPF, DKIM, DMARC)

Receiving servers check that a message really comes from the domain in its `From` address. SPF lists the servers allowed to send for a domain, DKIM signs each message, and DMARC says what to do when checks fail. A message sent through the owner's Gmail account is signed and authorised by Google for `gmail.com`, so it passes without owning a domain. The trade-off is a daily limit of about 500 messages and a sender name that is a personal address.

### Preventing account enumeration and email bombing

The response must not reveal whether an address has an account, and one address must not be flooded with mail. The per-address limit silently skips the send, so the page looks the same, and the daily cap protects the Gmail quota. Addresses are hashed before they become rate-limit keys:

```ts
const addressKey = `sign-in-email:address:${hashEmailAddress(emailAddress)}`;

if (!checkRateLimit(addressKey, PER_ADDRESS_RATE_LIMIT)) {
  return SignInLinkDecision.ADDRESS_LIMIT_REACHED;
}
```

### Hiding a vendor behind an interface

Only one file talks to Nodemailer. The rest of the app calls `sendEmail`, so moving to Resend or SendGrid later means adding one sender file and changing one line:

```ts
export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

const activeEmailSender: EmailSender = smtpSender;
```

## Security model and threat model

### STRIDE threat modelling

A checklist of six attack types: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. For each, write the example, the mitigation, the file and the risk that remains.

```md
| **E**levation of privilege | Viewer creates a vehicle | Role check, tested | `lib/fleet-auth.ts` | Stale `isSuperAdmin` flag |
```

### Token storage: HttpOnly cookie vs. localStorage

A script can read `localStorage`, so one XSS bug leaks the token. An `HttpOnly` cookie is invisible to scripts but is sent automatically, so it needs CSRF protection. This app uses the cookie.

```ts
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60,
},
```

### Same-origin requests and CORS

Browsers only let a page read responses from its own origin unless the server sends CORS headers. Pages and API live in one Next.js app, so no CORS headers are needed.

## Calculation Engine and Assumptions

### Assumption management

Every hidden number the calculator needs (fuel price, panel losses, battery life) lives in one typed object instead of being scattered through the code. Each one has a unit, a source and the date it was read, so a reviewer can check it:

```ts
idling: {
  fuelPerIdleHour: assumption({
    range: [2.27, 3.03, 5.68],
    unit: "L/h",
    direction: "higher",
    source: SOURCES.afdcIdling,
  }),
```

### Source citation

A number without a source is an opinion. Where no public source exists, the value is marked `ASSUMPTION` with the reasoning in a note, so it is easy to find the ones that need an owner's review:

```ts
export const ASSUMED: AssumptionSource = {
  sourceUrl: "",
  sourceTitle: ASSUMPTION_SOURCE_TITLE,
};
```

### Versioning data that changes results

Prices and factors change, but an old calculation must stay explainable. The whole set carries a version, and a calculation will later store which version it used:

```ts
export const ASSUMPTION_SET_V1 = {
  version: "2026.1",
```

### Pessimistic, realistic and optimistic ranges

A single number hides uncertainty. Each assumption has three values, and `favourableDirection` says which direction helps solar, so "pessimistic" always means the unfavourable end. A test checks the order for every value:

```ts
if (assumption.favourableDirection === "higher") {
  expect(pessimistic).toBeLessThanOrEqual(realistic);
  expect(realistic).toBeLessThanOrEqual(optimistic);
}
```

### Pure functions and determinism

A pure function gives the same output for the same input and touches nothing outside itself: no database, no clock, no random numbers. That is why the engine can run in the browser for anonymous users and on the server for fleets and always agree:

```ts
export function calculate(
  input: CalculationInput,
  assumptionSet: AssumptionSet,
): CalculationOutput {
```

### Money in integer cents

Adding decimal euros in floating point drifts (0.1 + 0.2 is not 0.3). The engine rounds to whole cents at the edges and adds integers, so the parts always sum exactly to the total:

```ts
export function toCents(euros: number): number {
  return Math.round(euros * CENTS_PER_EURO);
}
```

### Allocating a limited resource between consumers

Solar energy is limited and must not be counted twice. Demands are served in a fixed priority order and each takes only what is left:

```ts
const cooling = takeFrom(producedKwh, demands.coolingKwh);
const idling = takeFrom(cooling.remaining, demands.idlingKwh);
const auxiliary = takeFrom(idling.remaining, demands.auxiliaryKwh);
```

### Property-based invariants

Instead of only checking single examples, generate many inputs and assert rules that must always hold, such as "energy allocated never exceeds energy produced" or "pessimistic payback is never shorter than optimistic":

```ts
expect(paybackOrInfinity(PESSIMISTIC)).toBeGreaterThanOrEqual(
  paybackOrInfinity(REALISTIC),
);
```

### Formula versioning

When the formula changes, old results must still be explainable. The engine carries its own version next to the assumption set version, and both are stored with every result:

```ts
export const FORMULA_VERSION = "1.0.0";
```

### Additive migrations on existing data

A migration that adds a `NOT NULL` column fails when the table already has rows. The fix is to add the column with a default, let the rows take it, then drop the default. Old scenarios became `REALISTIC` this way:

```sql
ALTER TABLE "CalculationScenario" ADD COLUMN "kind" "ScenarioKind" NOT NULL DEFAULT 'REALISTIC';
ALTER TABLE "CalculationScenario" ALTER COLUMN "kind" DROP DEFAULT;
```

### One-to-one to one-to-many

Removing `@unique` from `calculationId` lets a calculation own many scenarios. A composite `@@unique([calculationId, kind])` keeps it to one per kind, so the database itself refuses a duplicate.

### `Decimal` for money

`Float` cannot hold 0.1 exactly, and money is compared and summed. The engine works in integer cents, and the database stores `Decimal(12, 2)`. The seed converts once at the boundary:

```ts
function centsToAmount(cents: number) {
  return (cents / CENTS_PER_EURO).toFixed(2);
}
```

### Enums that must agree across layers

The database enum, the engine list and the API schema all name the same values. Prisma is the source; the API schema derives from it with `Object.values`, and a test fails if the engine's list drifts:

```ts
expect([...SCENARIO_KINDS].sort()).toEqual(Object.values(ScenarioKind).sort());
```

### Server-side recomputation as a trust boundary

A client can send any JSON, so it is never trusted to supply results. The route accepts only a vehicle id and notes, and the server recomputes everything from the stored vehicle. Unknown fields are stripped:

```ts
export const calculationInputSchema = z
  .object({
    vehicleId: z.string().min(1),
    notes: z.string().min(1).optional(),
  })
  .strip();
```

### Immutable input snapshots

Prices and assumptions change, so each scenario stores the exact resolved input and where each value came from. Reopening an old calculation then shows what was actually computed:

```ts
vehicleSpec: {
  input: scenarioResult.resolvedInput,
  inputSources: output.inputSources,
},
```

### Atomic multi-row writes

A calculation is one calculation, three scenarios, three snapshots, three results and an audit event. They are written inside one transaction, so a failure anywhere leaves nothing behind:

```ts
const calculation = await prisma.$transaction((tx) =>
  createCalculationForVehicle(tx, {
    fleetId,
    vehicle,
    requestedByUserId,
    notes,
  }),
);
```

### Onboarding as a transaction

Creating a workspace touches several tables: the user's name, the fleet, the owner membership and an audit event. If any write fails, none of them should stay. One transaction wraps them all:

```ts
const fleet = await prisma.$transaction(async (tx) => {
  if (userName) {
    await tx.user.updateMany({
      where: { id: userId, name: null },
      data: { name: userName },
    });
  }

  return createFleetWithOwner(tx, { name: companyName, userId });
});
```

### Unique slug generation

A slug is a readable, URL-safe name that must be unique. The service tries the plain slug first, then `-2`, `-3` and so on, shortening the base so the result never exceeds the length limit:

```ts
for (let number = FIRST_DUPLICATE_SUFFIX_NUMBER; ; number += 1) {
  const suffix = `-${number}`;
  const candidate =
    truncateSlug(baseSlug, MAX_FLEET_SLUG_LENGTH - suffix.length) + suffix;
  if (await isSlugAvailable(transaction, candidate)) return candidate;
}
```

The database unique constraint stays the final guard if two requests pick the same slug at the same moment.

### Reserved route names

`/en/[fleetSlug]` is a dynamic route, so a fleet called "login" would fight with the real `/en/login` page. Fixed page names are never handed out as slugs, and a test reads the folders under `app/[locale]/` so a new page cannot be forgotten:

```ts
if (RESERVED_FLEET_SLUGS.includes(slug)) return false;
```

### Post-login routing hubs

Every sign-in method sends the user to one neutral page, `/[locale]/workspace`, which decides where they belong: no session means login, no fleet means onboarding, otherwise their first fleet.

```ts
if (!firstMembership) {
  redirect(onboardingPath(locale));
}

redirect(`/${locale}/${firstMembership.fleet.slug}`);
```

### Pending invitations

An owner can type the email of someone who has never signed in. There is no user row to attach a membership to yet, so the system stores a `FleetInvitation` (fleet, lowercase email, role) instead. Inviting the same email again updates the role instead of failing:

```ts
const invitation = await transaction.fleetInvitation.upsert({
  where: { fleetId_email: { fleetId, email: normalizedEmail } },
  create: {
    fleetId,
    email: normalizedEmail,
    role,
    invitedByUserId: actorUserId,
  },
  update: { role, invitedByUserId: actorUserId },
});
```

### Claiming an invitation on first sign-in

When someone signs in, the `signIn` event looks for invitations that match their email, turns each into a real membership, deletes it and writes an `INVITATION_CLAIMED` audit event, all in one transaction. Because it runs on every sign-in method, the person lands directly in the fleet instead of on onboarding:

```ts
const membership = await transaction.fleetMembership.upsert({
  where: { fleetId_userId: { fleetId: invitation.fleetId, userId } },
  create: { fleetId: invitation.fleetId, userId, role: invitation.role },
  update: {},
});
await transaction.fleetInvitation.deleteMany({ where: { id: invitation.id } });
```

### Email as an identity key

The email address is what links an invitation to a person, so whoever controls that email gets the access. That is only safe if the provider proved ownership: an email-link click does, and Google does when `email_verified` is true. Anything else never claims an invitation:

```ts
if (account?.provider === EMAIL_LINK_PROVIDER_ID) return true;
if (account?.provider === GOOGLE_PROVIDER_ID) {
  return profile?.email_verified === true;
}
return false;
```

Emails are also lowercased before they are stored or compared, so `Kim@Example.com` and `kim@example.com` are the same person.

### Idempotent membership creation

Claiming must be safe to repeat, for example if a sign-in event fires twice or the person was added as a member in the meantime. `upsert` with an empty `update` creates the membership once and never overwrites an existing role:

```ts
update: {},
```

### Never trusting client-computed values

The browser can show a result, but it can never be the source of one. The quick-check API accepts only the answers, validates them with the shared schema (zod drops unknown keys, so a forged `paybackPeriodMonths` is discarded) and runs the engine on the server:

```ts
const answers = quickCheckSchema.parse(await request.json());
...
return createCalculationForVehicle(tx, {
  fleetId,
  vehicle,
  requestedByUserId: membership.userId,
  input: quickCheckToCalculationInput(answers, ASSUMPTION_SET_V1),
});
```

Values the user never answered stay `undefined` in that input, so the stored snapshot marks them `PRESET` instead of pretending the user provided them.

### Idempotent save actions

Signing in can be repeated (a refresh, a double click, a second tab), and it must not create duplicate vehicles. The answers are hashed in canonical form (keys sorted, so key order never matters) and the hash is unique per fleet:

```ts
export function hashQuickCheck(answers: QuickCheckAnswers) {
  return createHash("sha256")
    .update(JSON.stringify(sortKeysDeep(answers)))
    .digest("hex");
}
```

The first save returns 201; the same answers again return 200 with the same calculation and write nothing.

### Carrying intent across a login redirect

An anonymous visitor's answers must survive the sign-in round trip, which leaves and re-enters the site. They wait in `sessionStorage`, and `/workspace` (the page every sign-in lands on) saves them to the first fleet. Every storage call is wrapped, because storage can be blocked in private windows:

```ts
export function readPendingQuickCheck(): QuickCheckAnswers | null {
  try {
    const stored = sessionStorage.getItem(PENDING_QUICK_CHECK_STORAGE_KEY);
    if (stored === null) return null;
    const parsed = quickCheckSchema.safeParse(JSON.parse(stored));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
```

Stored data is validated again on read, so a tampered value is treated as no value.

## Daylight UI Redesign

### Design tokens

A design token is a named design decision (a colour, a radius, a shadow, an easing curve) stored once and used everywhere. Components never write `#B6F065`; they write `bg-lime`. Changing the brand colour is then a one-line edit in `app/globals.css`:

```css
:root {
  --ground: #f6f4ee;
  --surface: #ffffff;
  --ink: #16231b;
  --lime: #b6f065;
  --on-lime: #16231b;
}
```

A test (`app/design-tokens.test.ts`) keeps the list honest: every name in `DESIGN_TOKEN_NAMES` must exist in both the light and the dark block.

### Semantic vs. raw colours

A raw name says what a colour looks like (`green-900`, `white`). A semantic name says what it is for (`ink` = text, `surface` = cards, `on-lime` = text placed on lime). Semantic names survive a theme change: `surface` is white in light mode and dark green in dark mode, and the component using `bg-surface` does not need to know.

```tsx
<div className="rounded-lg border border-line-strong bg-surface p-6 text-center sm:p-8">
```

The old variables mixed both ideas (`--text-white`, `--card`), which is why the dark theme needed special cases.

### Tailwind v4 `@theme inline`

Tailwind v4 is configured in CSS. `@theme` registers a variable as a utility: `--color-surface` creates `bg-surface`, `text-surface`, `border-surface`. The `inline` keyword makes the utility point at our own variable instead of copying its value at build time, so the utility follows the variable when the theme changes at runtime:

```css
@theme inline {
  --color-surface: var(--surface);
  --font-display: var(--font-bricolage);
  --radius-lg: 20px;
  --shadow-hover: 0 12px 28px rgb(22 35 27 / 0.1);
  --animate-rise: rise 0.7s var(--ease-out-soft) both;
}
```

### Theming with `data-theme`

`next-themes` writes `data-theme="dark"` on `<html>`. The dark block has a more specific selector than `:root`, so it overrides the same variable names, and every utility built on them switches at once with no component code:

```css
:root[data-theme="dark"] {
  --ground: #0f1712;
  --surface: #17231b;
  --ink: #eef1ea;
}
```

### `prefers-reduced-motion`

Some people get dizzy or distracted by movement and switch on "reduce motion" in their operating system. The browser reports it through a media query. One rule, nested inside its selector as `CLAUDE.md` requires, turns off every keyframe animation and keeps only colour transitions, so progress bars simply appear at their final size:

```css
*,
*::before,
*::after {
  box-sizing: border-box;

  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    transition-property:
      color, background-color, border-color, outline-color,
      text-decoration-color, fill, stroke !important;
  }
}
```

### Font subsetting

A full font file contains thousands of characters most pages never show. A subset is a smaller file with one group of characters. `next/font` downloads only the subsets and weights listed, hosts them with the app (no request to Google at runtime) and exposes each family as a CSS variable. `latin-ext` is needed for German umlauts and Spanish accents:

```ts
const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700", "800"],
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});
```

The values must be written literally in the call: `next/font` reads them at build time and rejects variables.

### Component variant APIs

Instead of one component per look, a component takes a small, closed set of named options. The names are listed once in a constant, the type is derived from that list, and a `Record` keyed by the type forces every variant to have styles. Adding a variant without styling it is a compile error:

```ts
export const BUTTON_VARIANTS = [
  "primary",
  "dark",
  "secondary",
  "ghost",
  "danger",
] as const;

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-lime text-on-lime hover:-translate-y-px hover:brightness-95",
  dark: "border-transparent bg-ink text-ground hover:border-ink hover:opacity-90",
  secondary: "border-line-strong bg-surface text-ink hover:border-ink",
  ghost: "border-transparent bg-transparent text-ink hover:border-ink",
  danger: "border-transparent bg-danger text-white hover:border-ink",
};
```

The same list drives the showcase page and the tests (`it.each(BUTTON_VARIANTS)`), so nothing is typed twice.

### `<a>` vs `<button>` semantics

A link goes somewhere; a button does something. Browsers and screen readers treat them differently: a link can be opened in a new tab and is announced as "link", a button reacts to the space bar and is announced as "button". They can look identical, so `Button` and `ButtonLink` share one style function but render different elements:

```tsx
export default function ButtonLink({
  variant = DEFAULT_BUTTON_VARIANT,
  size = DEFAULT_BUTTON_SIZE,
  icon,
  fullWidth = false,
  className = "",
  children,
  ...linkProps
}: ButtonLinkProps) {
  return (
    <Link
      {...linkProps}
      className={buildButtonClassName({
        variant,
        size,
        fullWidth,
        inactive: false,
        className,
      })}
    >
      {children}
      {icon}
    </Link>
  );
}
```

### Focus-visible styling

Keyboard users need to see which element has focus; mouse users do not want a ring after every click. The `:focus-visible` pseudo-class matches only when the browser decides a ring is useful (keyboard navigation). One constant holds the ring so every interactive component gets the same one:

```ts
export const FOCUS_RING_CLASSES =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
```

### Accessible names

Every control needs a name that assistive technology can read out. The name comes from visible text, a linked `<label>`, `aria-label` or `aria-labelledby`. Extra help text is linked with `aria-describedby`. The input builds these links from one generated id:

```tsx
const generatedId = useId();
const inputId = id ?? generatedId;
const hintId = `${inputId}-hint`;
const errorId = `${inputId}-error`;
const describedBy =
  [externalDescriptionId, hint ? hintId : "", error ? errorId : ""]
    .filter(Boolean)
    .join(" ") || undefined;
```

Tests query by role and name (`getByRole("textbox", { name: "City" })`), so a component without an accessible name fails its test.

### Testing components with real translations

Mocking `useTranslations` to return the key hides missing or misspelt keys. Rendering with the real English messages catches them, and the test reads like what a user sees:

```tsx
export function renderWithIntl(component: ReactElement) {
  return render(
    <NextIntlClientProvider locale={TEST_LOCALE} messages={englishMessages}>
      {component}
    </NextIntlClientProvider>,
  );
}
```

`messages/messages.test.ts` then guarantees that German and Spanish have exactly the same keys as English and no empty values.

### The native `<dialog>` element for menus

`<dialog>` is the browser's built-in modal. Calling `showModal()` puts it in the top layer (above everything, no `z-index` fights), draws a `::backdrop`, makes the rest of the page inert and closes on Escape. The mobile menu is a dialog styled as a full-height sheet on the right:

```tsx
const openMenu = () => {
  dialogRef.current?.showModal();
  setIsOpen(true);
};

const closeMenu = () => {
  dialogRef.current?.close();
};
```

Every way of closing (close button, link click, Escape) ends in `close()`, and the dialog's `close` event is the single place where state is updated.

### Focus trapping

While a modal is open, Tab must stay inside it; otherwise keyboard users wander into the page hidden behind the backdrop. `showModal()` does this natively by making everything outside the dialog inert, so no focus-trap library or key listener is needed. A plain `<div>` overlay or `dialog.show()` (non-modal) would not trap focus.

### Returning focus to the trigger

When a menu closes, focus must go back to the control that opened it. Without that, focus resets to the top of the page and a keyboard user loses their place. The `close` event handler does both jobs:

```tsx
const handleDialogClosed = () => {
  setIsOpen(false);
  openButtonRef.current?.focus();
};
```

### `aria-expanded`

A button that shows and hides something tells assistive technology its state with `aria-expanded`, and which element it controls with `aria-controls`. A screen reader then announces "Open menu, collapsed, button" instead of just "button":

```tsx
<button
  ref={openButtonRef}
  type="button"
  aria-label={t("openMenu")}
  aria-expanded={isOpen}
  aria-controls={dialogId}
  onClick={openMenu}
  className={`lg:hidden ${ICON_BUTTON_CLASSES}`}
>
  <LuMenu aria-hidden="true" className="size-5" />
</button>
```

The icon is `aria-hidden`, so the accessible name comes only from `aria-label`.

### Honest marketing numbers (computed example vs. invented values)

A landing page that shows "pays off in 1.5 years" is making a claim. If someone typed that number by hand, it goes stale the day an assumption changes, and nobody can say where it came from. Here the example is a real input, run through the same engine as every user calculation, and labelled "Sample" so nobody mistakes it for their own result:

```ts
export const HOME_EXAMPLE_QUICK_CHECK: QuickCheckAnswers = {
  vehicleType: "VAN",
  quantity: 10,
  cargoType: "REGULAR",
  distanceBand: "REGIONAL",
  idlingFrequency: "SOMETIMES",
  cityLabel: "Berlin",
  countryCode: "DE",
  latitude: 52.52,
  longitude: 13.405,
  parkingType: "DEPOT",
  solarPanelPlacement: "ROOF",
};
```

The page test recomputes the payback with the engine and compares it with the text on screen, so the headline cannot drift away from the model.

### Staggered entrance animation within the motion budget

A stagger plays the same animation on several elements with a growing delay, which leads the eye from top to bottom. The guidelines cap it at three steps of 120 ms so the whole entrance stays under 800 ms and never delays reading:

```ts
export const RISE_STAGGER_CLASSES = [
  "animate-rise",
  "animate-rise [animation-delay:120ms]",
  "animate-rise [animation-delay:240ms]",
] as const;
```

The `rise` keyframes use `both` as fill mode, so a delayed element stays invisible until its turn instead of flashing in and then animating. Under "reduce motion" the global rule from step 3.1 switches every animation off and the content is simply there.

### Server components calling pure functions

The home page is a server component: it runs on the server and sends finished HTML. The engine is a pure function (same input, same output, no network, no database), so the page can call it directly, with no API route, no loading state and no JavaScript shipped to the browser for it:

```ts
export function calculateHomeExample(): HomeExampleResult {
  const realisticScenario = calculate(
    quickCheckToCalculationInput(HOME_EXAMPLE_QUICK_CHECK, ASSUMPTION_SET_V1),
    ASSUMPTION_SET_V1,
  ).scenarios.REALISTIC;

  return {
    paybackYears:
      realisticScenario.paybackMonths === null
        ? null
        : realisticScenario.paybackMonths / MONTHS_PER_YEAR,
    annualSavingsEuros: realisticScenario.annualSavingsCents / CENTS_PER_EURO,
    co2AvoidedTonnesPerYear:
      realisticScenario.co2AvoidedKgPerYear / KILOGRAMS_PER_TONNE,
    yearlySolarEnergyKwh: realisticScenario.yearlySolarEnergyKwh,
  };
}
```

The same purity is what lets the engine run in the browser for anonymous visitors and in a Jest test without any setup.

### Building pages from reusable components

A page that repeats `<h2 className="font-display text-[30px] …">` in five places has five places to fix when the type scale changes. The type scale lives once, in `Heading` and `Text`, and sections are small components, so the page file reads as a table of contents:

```tsx
export default function Home() {
  return (
    <div className="flex flex-col gap-10 py-8 md:gap-14 md:py-12 lg:gap-[72px] lg:py-16">
      <HomeHero />
      <HowItWorks />
      <BuiltFor />
    </div>
  );
}
```

`Heading` separates meaning from looks: `level` picks the tag (`h1`–`h4`, which matters for screen readers and search engines) and `size` picks the visual style, so a small `h2` or a large `h3` needs no new CSS.

### Native radio groups and keyboard behaviour

Radio buttons that share a `name` form one group, and the browser gives that group its keyboard behaviour for free: Tab enters the group once (on the checked radio), the arrow keys move and select, and Tab leaves. A choice card keeps all of that by putting a real, visually hidden radio inside a `<label>`; the card is only styling around it:

```tsx
export default function VisuallyHiddenRadio({
  name,
  value,
  checked,
  disabled = false,
  onSelect,
}: VisuallyHiddenRadioProps) {
  return (
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={onSelect}
      className="sr-only"
    />
  );
}
```

`sr-only` hides the input visually but keeps it focusable. The card reacts to the hidden input with Tailwind's `has-[:checked]:` and `has-[:focus-visible]:` variants, so no JavaScript is needed for the selected or focused look.

### `role="radiogroup"`

Screen readers need to know which radios belong together and what the question is. The wrapper gets `role="radiogroup"` and a name, either its own (`aria-label`) or the visible question (`aria-labelledby`). A screen reader then announces "What kind of vehicles do you have?, radio group, Van, 1 of 4":

```tsx
<div
  role="radiogroup"
  aria-label={label}
  aria-labelledby={labelledBy}
  className={`grid gap-3 md:gap-4 ${CHOICE_CARD_GROUP_LAYOUT_CLASSES[layout]}`}
>
```

### Controlled inputs

A controlled input has no state of its own: the parent passes the `value` and an `onChange`, and what is on screen is always what the parent holds. The number stepper is controlled for its number, but keeps a private `draft` string so the user can type "1000" or clear the field without the parent ever seeing an invalid number:

```tsx
const handleTyping = (typedText: string) => {
  setDraft(typedText);
  if (WHOLE_NUMBER_PATTERN.test(typedText)) {
    const typedNumber = Number(typedText);
    if (isWithinRange(typedNumber)) {
      setCommittedValue(typedNumber);
      onChange(typedNumber);
    }
  }
};
```

### react-hook-form `Controller`

react-hook-form normally reads native inputs through `register`. A custom component such as a choice-card group has no single native input to register, so `Controller` is the adapter: it hands the component a `value` and an `onChange` and keeps the form state in sync. The group's props were shaped to fit it directly:

```tsx
<Controller
  control={control}
  name="vehicle"
  render={({ field }) => (
    <ChoiceCardGroup
      name={field.name}
      label={GROUP_LABEL}
      options={VEHICLE_OPTIONS}
      value={field.value}
      onChange={field.onChange}
    />
  )}
/>
```

### Server-side API proxies that hide keys

The browser must never see a paid API key: anything sent to the browser can be read and reused by anyone. The calculator therefore calls our own route, `/api/geocode`, and only the server adds the key and talks to Mapbox. The browser gets back a small, fixed shape and never the Mapbox response itself:

```ts
function buildMapboxUrl(query: string, locale: Locale, accessToken: string) {
  const url = new URL(MAPBOX_FORWARD_GEOCODING_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("types", MAPBOX_PLACE_TYPE);
  url.searchParams.set("country", EU_COUNTRY_CODES.join(",").toLowerCase());
  url.searchParams.set("language", locale);
  url.searchParams.set("limit", String(MAX_CITY_RESULTS));
  url.searchParams.set("access_token", accessToken);
  return url;
}
```

When Mapbox fails, the route answers 503 with a plain error key. The upstream message is logged on the server but never forwarded, because it can contain details about our account.

### Input allowlists

An allowlist states what is accepted and rejects everything else, which is safer than trying to list what is dangerous. The query must be 2–80 characters, the locale must be one we support (anything else quietly becomes the default), and a result is kept only if its country is in the EU list:

```ts
export const citySearchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(MIN_CITY_QUERY_LENGTH)
    .max(MAX_CITY_QUERY_LENGTH)
    .refine((query) => !query.includes(FORBIDDEN_QUERY_CHARACTER))
    .refine((query) => query.split(/\s+/).length <= MAX_CITY_QUERY_WORDS),
  locale: z.enum(locales).catch(defaultLocale),
});
```

The same idea is applied to the answer: each Mapbox feature is parsed with a zod schema and dropped if it does not match, so a changed or malformed upstream response cannot leak odd data into the app.

### Rate limiting

Every call to our proxy costs a call to a paid service, so one visitor (or one script) must not be able to make thousands. The middleware counts requests per route and IP address in a time window and answers 429 when the limit is passed. Each route now carries its own limit, because typing in a search box legitimately sends more requests than creating a fleet:

```ts
export const CITY_SEARCH_RATE_LIMIT: RateLimitConfig = {
  windowMs: 10_000,
  maxRequests: 30,
};
```

### Mocking `fetch` in tests

Tests must not call the real Mapbox: it would be slow, cost money, need a secret in CI and fail whenever the network does. Replacing `global.fetch` with a Jest mock lets a test decide what "Mapbox" answers and then inspect the request the route tried to send:

```ts
function mapboxReplies(features: unknown[], status = 200) {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ type: "FeatureCollection", features }), {
      status,
    }),
  );
}
```

That is how the tests prove that all 27 country codes are sent, that a Mapbox 500 becomes a 503 without Mapbox details, and that the key never appears in a response.

### Multi-step form state

A wizard shows one question at a time, but it is still one form. All four steps share a single react-hook-form instance through `FormProvider`, so going back never loses an answer and the last step can submit everything at once. Each step only declares which fields belong to it, and Continue validates just those:

```ts
const continueOrFinish = async () => {
  const isStepValid = await form.trigger(CALCULATOR_STEP_FIELDS[stepKey]);
  if (!isStepValid) {
    revealFirstInvalidField();
    return;
  }

  if (stepIndex === LOCATION_STEP_INDEX && form.getValues("city") === null) {
    rejectMissingCity();
    return;
  }

  if (stepIndex < LAST_STEP_INDEX) {
    goToStep(stepIndex + 1);
    return;
  }

  const quickCheckAnswers = toQuickCheckAnswers(form.getValues());
  if (quickCheckAnswers === null) {
    goToStep(LOCATION_STEP_INDEX);
    return;
  }
  router.push(resultsPath(locale, encodeQuickCheck(quickCheckAnswers)));
};
```

The answers are also written to `sessionStorage` on every change and read back on load, so a refresh keeps them. Stored data is validated with the same zod schema before use.

### Optional fields filled from presets

Most people do not know their vehicle's energy use per 100 km, so the form must work without it. Every technical field is optional; an empty field becomes `undefined`, and the engine fills it from the assumption set. Only what the user really typed is sent on:

```ts
function parseOptionalNumber(typedValue: unknown) {
  const trimmedText = String(typedValue ?? "")
    .trim()
    .replace(",", ".");
  return trimmedText === "" ? undefined : Number(trimmedText);
}
```

Because `undefined` means "use the preset" and a number means "the user told us", the accuracy meter can count how many inputs are real and move from Rough to Precise.

### Focus management on step change

When the question changes, a sighted user sees new content, but a keyboard or screen-reader user is still on the Continue button of a screen that no longer exists. After each step change the wizard moves focus to the new question. A heading is not focusable by default, so it gets `tabIndex={-1}`: focusable from code, but not a stop in the Tab order.

```tsx
<Heading
  ref={questionRef}
  level={1}
  size="display-m"
  id={CALCULATOR_QUESTION_ID}
  tabIndex={-1}
  className="focus:outline-none"
>
  {t(`stepContent.${stepKey}.title`)}
</Heading>
```

The same idea handles errors: Continue without a city moves focus to the city field, next to the message.

### `aria-live` announcements

A live region is an element whose text changes are read out by a screen reader without moving focus. `polite` waits until the user is idle. The wizard keeps one visually hidden region and writes the new position into it on every step change:

```tsx
<p aria-live="polite" className="sr-only">
  {announcement}
</p>
```

The region must already be in the page before its text changes; an element that is inserted together with its text is often not announced. The city field uses the same technique for "Searching…" and "No city found".

### Validation on blur

Validating on every keystroke shouts "invalid" while someone is still typing "1" on the way to "12". Validating only on submit hides the problem until the end. On blur is the middle: the field is checked when the user leaves it, and again when they press Continue.

```ts
const form = useForm<CalculatorFormValues>({
  resolver: zodResolver(calculatorFormSchema),
  defaultValues: CALCULATOR_DEFAULT_VALUES,
  mode: "onBlur",
});
```

If Continue finds an invalid number inside the closed "I know the exact numbers" section, the wizard opens the section and moves focus to that field, so the error is never hidden.

### Humanising durations

The engine reports payback as a number of months, sometimes with decimals ("52.3"). People think in years and months, so the number is rounded and split into parts first, and only then turned into words by the translation file, which knows the plural rules of each language:

```ts
export function humaniseDuration(totalMonths: number): DurationParts {
  const wholeMonths = Math.max(
    MINIMUM_DURATION_MONTHS,
    Math.round(totalMonths),
  );
  return {
    years: Math.floor(wholeMonths / MONTHS_PER_YEAR),
    months: wholeMonths % MONTHS_PER_YEAR,
  };
}
```

The English message is `{years, plural, one {# year} other {# years}} {months, plural, one {# month} other {# months}}`, so 52 months becomes "4 years 4 months" and 13 months becomes "1 year 1 month". German uses the dative forms ("4 Jahren 4 Monaten") because the duration always follows "nach" or "zwischen".

### Locale-aware number, currency and unit formatting

"€4,200" in English is "4.200 €" in German and "4200 €" in Spanish: the symbol's position, the thousands separator and the spacing all change. Gluing a "€" onto a number by hand is therefore always wrong for someone. The `Intl` formatter, reached through next-intl's `useFormatter`, does it per locale:

```ts
const money = (euros: number) =>
  format.number(euros, {
    style: "currency",
    currency: RESULTS_CURRENCY,
    maximumSignificantDigits: MONEY_SIGNIFICANT_DIGITS,
  });
```

Three significant digits also rounds to what matters ("€168,000", not "€168,368.19"). Units that `Intl` does not know, such as tonnes, go through a translated message (`"{value} t"`) with the number formatted separately.

### Accessible charts (figcaption and hidden table)

A chart is a picture: a screen reader cannot read lines, and anyone can misread them. Two additions make it usable for everybody. The `<figcaption>` says the conclusion in words, and a visually hidden table carries the exact numbers of all three lines:

```tsx
<figcaption>
  <Text size="small" tone="muted">
    {caption}
  </Text>
</figcaption>
<table className="sr-only">
  <caption>{t("tableCaption")}</caption>
```

The drawn chart itself is marked `aria-hidden`, so assistive technology reads the caption and the table instead of hundreds of SVG shapes. The three lines also differ by thickness and dash pattern, never by colour alone.

### View models shared by several pages

The engine returns raw data: cents, months, three scenarios. The page needs decisions: which verdict sentence, which tiles, which chart points. A view model is one pure function that makes all those decisions, so components only display what they are given:

```ts
export function verdictVariantFor(
  paybackMonths: number | null,
): VerdictVariant {
  if (paybackMonths === null) return "UNLIKELY";
  return paysOffWithinSeries(paybackMonths) ? "PAYS_OFF" : "SLOWLY";
}
```

Because it has no React and no translations inside, it is easy to test with plain values, and the saved fleet result page can feed it stored data and get exactly the same screen as the public page.

---

_Next up in the plan: Step 2.8 (PII inventory), 2.9 (authorization/audit
tests), 2.10 (security/ADR docs) — see [`detailed-plan.md`](./detailed-plan.md)._

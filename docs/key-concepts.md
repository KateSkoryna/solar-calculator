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

---

_Next up in the plan: Step 2.8 (PII inventory), 2.9 (authorization/audit
tests), 2.10 (security/ADR docs) — see [`detailed-plan.md`](./detailed-plan.md)._

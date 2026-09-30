# Security model

What is enforced today. Related: [`privacy-and-pii.md`](./privacy-and-pii.md), [`security-cookies-csrf.md`](./security-cookies-csrf.md), [`threat-model.md`](./threat-model.md).

## Authentication

- Auth.js with JWT sessions (30 days), configured in `auth.ts`. No passwords.
- Sign in with Google or a one-time email link (valid 15 minutes, single use, stored hashed).
- Links are sent through `sendEmail` in `lib/email/send-email.ts`. Only `lib/email/smtp-sender.ts` talks to Gmail over SMTP, so another provider means one new file.
- The token carries the user id and `isSuperAdmin`, read once at sign-in from a membership in the fleet named by `ADMIN_FLEET_ID`.

## Tenancy and roles

- The fleet is the tenant. Every fleet route calls `requireFleetRole` from `lib/fleet-auth.ts` first and every query is scoped by `fleetId`. A foreign id returns 404.
- Roles are per fleet: `OWNER`, `MANAGER`, `VIEWER`. A super admin gets owner access to every other fleet.

| Role      | Can do                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------- |
| `VIEWER`  | Read vehicles, calculations and members                                                           |
| `MANAGER` | Everything a viewer can, plus create and update vehicles, create calculations, read the audit log |
| `OWNER`   | Everything a manager can, plus delete vehicles and manage members                                 |

The rules are tested in `app/api/fleets/__tests__/authorization.api.test.ts`.

## Audit log

`recordAuditEvent` in `lib/audit.ts` writes an event for every change, in the same transaction, and for every refused request (`ACCESS_DENIED`). Rows are never updated by the app.

## Rate limiting

`proxy.ts` allows 5 requests per 10 seconds per IP on email sign-in and calculation creation. `lib/sign-in-link-limits.ts` allows 3 links per address per 15 minutes and 400 per day. Counters live in server memory.

## Validation, errors and logs

Bodies are parsed with Zod, errors become fixed responses (`lib/api-errors.ts`), and logs are redacted (`lib/logger.ts`). Stored personal data is listed in [`privacy-and-pii.md`](./privacy-and-pii.md).

## Not yet implemented

- Session revocation. `isSuperAdmin` can be up to 30 days out of date.
- A guard against removing the last `OWNER`.
- The calculation engine. Calculations are designed to store their versions and a frozen copy of the inputs (see `docs/data-model.md`), but the API creates only the `Calculation` row today.
- Audit events for sign-in and sign-out.
- A shared rate-limit store.
- Security headers.

# Threat model

STRIDE review of the current code. See [`security-model.md`](./security-model.md).

| Threat                     | Example                   | Mitigation                       | File                | Residual risk                   |
| -------------------------- | ------------------------- | -------------------------------- | ------------------- | ------------------------------- |
| **S**poofing               | Reusing an email link     | Single use, 15 minutes, hashed   | `auth.ts`           | Mailbox access                  |
| **T**ampering              | Foreign fleet id in a URL | Membership check, scoped queries | `lib/fleet-auth.ts` | A new route may skip the check  |
| **T**ampering              | Edited audit rows         | App only inserts                 | `lib/audit.ts`      | Database does not block updates |
| **R**epudiation            | "I did not delete it"     | Audit event with actor           | `lib/audit.ts`      | Sign-in is not audited          |
| **I**nformation disclosure | Reading another fleet     | 403 or 404                       | `lib/fleet-auth.ts` | None known                      |
| **I**nformation disclosure | Email in a log            | Redaction                        | `lib/redact-pii.ts` | Unlisted key names              |
| **D**enial of service      | Request flood             | Rate limit, then 429             | `proxy.ts`          | Counters per instance           |
| **E**levation of privilege | Viewer creates a vehicle  | Role check, tested               | `lib/fleet-auth.ts` | Stale `isSuperAdmin` flag       |

## Not yet implemented

- Session revocation.
- A last-owner guard.
- Sign-in audit events.
- A shared rate-limit store.

# Session cookies and CSRF protection

## Cookie settings

`auth.ts` sets `useSecureCookies: process.env.VERCEL === "1"` on the NextAuth
config. Auth.js derives every cookie it issues (session, CSRF, callback URL,
PKCE, state, nonce) from that single flag, so this one setting controls all
of them consistently:

| Context                           | Session cookie name             | `Secure` | `HttpOnly` | `SameSite` |
| --------------------------------- | ------------------------------- | -------- | ---------- | ---------- |
| local (`next dev` / `next start`) | `authjs.session-token`          | no       | yes        | `Lax`      |
| Vercel (preview & production)     | `__Secure-authjs.session-token` | yes      | yes        | `Lax`      |

The CSRF cookie gets the stricter `__Host-` prefix on Vercel
(`__Host-authjs.csrf-token`), which additionally forbids a `Domain` attribute
and requires `Path=/`.

Before this change, the `Secure` flag was derived implicitly from the
request's own protocol/host (`url.protocol === "https:"`). Behind a reverse
proxy that terminates TLS before forwarding the request internally over HTTP,
that detection can be wrong and silently issue non-`Secure` cookies in
production.

`NODE_ENV === "production"` was considered and rejected as the signal: `next
build && next start` also sets `NODE_ENV=production` for a local production
build, which is normally served over plain `http://localhost`. A `Secure`
cookie is refused by the browser over HTTP, so that check would silently
break login during local production-build testing. `VERCEL` is set by
Vercel's platform on every real deployment (both `production` and `preview`,
both always served over HTTPS) and is never set locally, so it distinguishes
"really deployed" from "NODE_ENV happens to say production" without that
failure mode.

**Verified**: confirmed in a local dev server that the session cookie is set
with `HttpOnly; SameSite=Lax` (no `Secure`, expected over `http://localhost`).
The `Secure` flag itself can only be observed once actually deployed to
Vercel, where `VERCEL=1` forces it on.

## CSRF protection

**`/api/auth/*` routes (login, OAuth callback, etc.)**: handled entirely by
Auth.js's built-in double-submit cookie check (`csrfToken` cookie compared
against a token in the request body), unchanged by this step other than now
being transmitted with the hardened cookie settings above.

**Custom mutating routes** (`/api/auth/register`, `/api/auth/forgot-password`,
`/api/auth/reset-password`, and every fleet-scoped `POST`/`PATCH`/`DELETE`
route under `/api/fleets/[fleetId]/...`): none of these implement an
Auth.js-style CSRF token. Every one of them shares the first property below;
the routes that accept a body also get the second:

1. The session cookie is `SameSite=Lax`, so browsers omit it on cross-site
   `fetch`/`XHR` requests (Lax only attaches cookies to top-level, same-site,
   or safe cross-site navigations — not to subresource requests from another
   origin). A cross-site script cannot ride the victim's session. This alone
   covers the `DELETE` routes (`members/[userId]`, `vehicles/[vehicleId]`),
   which take no request body.
2. Routes that take a body (`register`, `forgot-password`, `reset-password`,
   the `POST`/`PATCH` routes) parse it with `request.json()`. An HTML
   `<form>` cannot produce a `Content-Type: application/json` request, so a
   classic form-based CSRF submission fails to parse before it reaches any
   authorization or business logic.

`register` and `forgot-password` are pre-session (no cookie to steal in the
first place); their abuse surface is unauthenticated spam/enumeration, which
is covered by the rate limiting added in step 2.6, not CSRF.

## Session fixation

Sessions use the JWT strategy (`session.strategy: "jwt"`), not a
database-backed session id. Auth.js issues a freshly signed JWT cookie on
every successful sign-in; there is no pre-existing session identifier for an
attacker to plant on a victim before login, so fixation does not apply here.

---
name: implement-step
description: Implement a single numbered step from a plan document in docs/ (e.g. "detailed-plan.md step 1.2"), then verify and code-review the result in parallel via subagents. Does not commit. Use when the user asks to implement/do/build a specific plan step by document name and step number.
argument-hint: <plan-document> <step-number>
user-invocable: true
---

# Implement Plan Step

## Usage

```
/implement-step detailed-plan.md 1.2
```

Args: `<plan-document> <step-number>`. If the document is given as a bare filename (no `/`), resolve it under `docs/`.

## Workflow

### 1. Locate and read the step

- Read the plan document. Find the section for the given step (in this repo's plan docs, steps are markdown headers like `### Step 1.2 — <title>`, each with **Purpose**, **Technology**, **Main concepts to learn**, **Goal**, and **Visible result**).
- If the document or the step number doesn't exist in it, stop and say so — do not guess at a step or substitute a different one.
- Note the **Goal** and **Visible result** verbatim; they define "done" for this task.

### 2. Implement the step

- Implement exactly what the step's **Goal** describes — nothing from later steps in the same milestone, even if related.
- Follow this repo's `CLAUDE.md` conventions (no code comments, Tailwind utility classes not inline styles, nested media queries, descriptive naming).
- Touch whatever's actually needed for this step: schema, migrations, code, config, or docs — match what the step calls for.

### 3. Do not commit

- Leave changes in the working tree, staged or not. Never run `git commit`. Don't create a branch unless the step or the user explicitly asks for one. The user runs `/commit` themselves afterward.
- Don't create extra markdown files summarizing what you did (process docs, branch-rename notes, etc.) — only the files the step's Goal actually calls for. The summary at the end goes in chat, not a file.

### 4. Run deterministic checks yourself first

`/verify` only drives behavior end-to-end — by design it does not typecheck or lint. `/code-review` is judgment-based, not a compiler. Neither is guaranteed to catch what `git`/CI would reject. Run these directly (not via a subagent) before spending time on step 5, based on what you actually touched:

| You touched | Run |
|---|---|
| any `.ts`/`.tsx` file | `npx tsc --noEmit` and `npm run lint` |
| `prisma/schema.prisma` | `npx prisma validate` |
| `prisma/migrations/**` | the migration must actually apply — run it against local Postgres per the step's own instructions, don't just eyeball the SQL |
| anything under `app/`, `components/`, or other build-relevant source | `npm run build` |
| a `*.test.ts(x)` file, new or changed | `npm test -- <path>` scoped to it |

Fix everything these report before moving on — they're pass/fail, not advisory. If a check can't run (e.g. no local Postgres for a migration), say so explicitly in the final report rather than skipping it silently.

Finish this step with `git status --short` and read it — confirm nothing unexpected got created (stray build artifacts, `.env` changes, files outside what the step called for) before handing off.

### 5. Verify and review in parallel

Once the deterministic checks pass, launch two subagents in parallel — a single message with two Agent tool calls:

- One runs `/verify` against the change.
- One runs `/code-review` against the current diff (default effort).

Give each subagent the step's **Goal** and **Visible result** as the definition of correct behavior, plus the list of files you touched. Don't tell them what you believe is already correct — let them check independently.

Wait for both to finish, then:
- Fix anything either surfaces that's a real correctness bug or would fail the **Visible result** check.
- Skip cosmetic or low-confidence findings unless they're trivial to fix.
- If you make a fix because of a finding, re-run step 4's checks plus whichever of verify/code-review caught it — not both blindly.

If the **Visible result** requires infrastructure that isn't running locally (a database, Temporal, etc.), say so explicitly instead of silently skipping that part of verification.

### 6. Report

Reply in chat with a short summary, not a document:
- What changed, file by file.
- Why (tie it back to the step's **Purpose**).
- Any non-obvious decisions you made that the plan didn't spell out (naming, cardinality, defaults, etc.).
- Results of the deterministic checks (step 4), and what verify/code-review found and what you did about it.
- The final `git status --short` output, so the user can see exactly what's about to be committed.

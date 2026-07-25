---
name: implement-step
description: Implement a single numbered step from a plan document in docs/ (e.g. "detailed-plan.md step <N>"), then verify and code-review the result in parallel via subagents. Does not commit. Use when the user asks to implement/do/build a specific plan step by document name and step number.
argument-hint: <plan-document> <step-number>
user-invocable: true
---

# Implement Plan Step

## Usage

```
/implement-step detailed-plan.md <step-number>
```

Args: `<plan-document> <step-number>`. If the document is given as a bare filename (no `/`), resolve it under `docs/`.

## Workflow

### Sync `main` and create a branch

- Check `git status --short` first. If the working tree isn't clean, stop and ask the user how to proceed rather than silently stashing or discarding anything.
- `git checkout main && git pull origin main`.
- Create a new branch off the updated `main`: `git checkout -b <name>`.
- The branch name must be descriptive and self-explanatory of what the step actually does — e.g. `add-fleet-seed-script`, not `step-seed` or `add-seed-step`. Never include the plan's step number (or any other number) in the branch name; a reader with no access to the plan doc should be able to tell what the branch does from its name alone.

### Locate and read the step

- Read the plan document. Find the section for the given step (in this repo's plan docs, steps are markdown headers like `### Step <step-number> — <title>`, each with **Purpose**, **Technology**, **Main concepts to learn**, **Goal**, and **Visible result**).
- If the document or the step number doesn't exist in it, stop and say so — do not guess at a step or substitute a different one.
- Note the **Goal** and **Visible result** verbatim; they define "done" for this task.

### Implement the step

- Implement exactly what the step's **Goal** describes — nothing from later steps in the same milestone, even if related.
- Follow this repo's `CLAUDE.md` conventions (no code comments, Tailwind utility classes not inline styles, nested media queries, descriptive naming).
- Touch whatever's actually needed for this step: schema, migrations, code, config, or docs — match what the step calls for.

### Do not commit

- Leave changes in the working tree, staged or not. Never run `git commit`. The branch was already created in the sync step above — the user runs `/commit` themselves afterward.
- Don't create extra markdown files summarizing what you did (process docs, branch-rename notes, etc.) — only the files the step's Goal actually calls for. The summary at the end goes in chat, not a file.

### Run deterministic checks yourself first

`/verify` only drives behavior end-to-end — by design it does not typecheck or lint. `/code-review` is judgment-based, not a compiler. Neither is guaranteed to catch what `git`/CI would reject. Run these directly (not via a subagent) before spending time on the verify-and-review step below, based on what you actually touched:

| You touched                                                          | Run                                                                                                                           |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| any `.ts`/`.tsx` file                                                | `npx tsc --noEmit` and `npm run lint`                                                                                         |
| `prisma/schema.prisma`                                               | `npx prisma validate`                                                                                                         |
| `prisma/migrations/**`                                               | the migration must actually apply — run it against local Postgres per the step's own instructions, don't just eyeball the SQL |
| anything under `app/`, `components/`, or other build-relevant source | `npm run build`                                                                                                               |
| a `*.test.ts(x)` file, new or changed                                | `npm test -- <path>` scoped to it                                                                                             |

Fix everything these report before moving on — they're pass/fail, not advisory. If a check can't run (e.g. no local Postgres for a migration), say so explicitly in the final report rather than skipping it silently.

Finish this step with `git status --short` and read it — confirm nothing unexpected got created (stray build artifacts, `.env` changes, files outside what the step called for) before handing off.

### Verify and review in parallel

Once the deterministic checks pass, launch two subagents in parallel — a single message with two Agent tool calls:

- One runs `/verify` against the change.
- One runs `/code-review` against the current diff (default effort).

Give each subagent the step's **Goal** and **Visible result** as the definition of correct behavior, plus the list of files you touched. Don't tell them what you believe is already correct — let them check independently.

Wait for both to finish, then:

- Fix anything either surfaces that's a real correctness bug or would fail the **Visible result** check.
- Skip cosmetic or low-confidence findings unless they're trivial to fix.
- If you make a fix because of a finding, re-run the deterministic checks above plus whichever of verify/code-review caught it — not both blindly.

If the **Visible result** requires infrastructure that isn't running locally (a database, Temporal, etc.), say so explicitly instead of silently skipping that part of verification.

### Report

Reply in chat with a short summary, not a document:

- What changed, file by file.
- Why (tie it back to the step's **Purpose**).
- Any non-obvious decisions you made that the plan didn't spell out (naming, cardinality, defaults, etc.).
- Results of the deterministic checks, and what verify/code-review found and what you did about it.
- The final `git status --short` output, so the user can see exactly what's about to be committed.

# Accessibility audit (lab branch)

This branch holds an automated axe audit that is deliberately not part of `main`. It is one commit on top of `main`: the `jest-axe` dev dependency, `test-support/axe.ts` and `app/accessibility.test.tsx` (one test per page component).

The audit covers what a machine can judge in jsdom: labels, accessible names, ARIA validity, list and heading structure. It cannot judge colour contrast, keyboard order, zoom or screen-reader behaviour; those stay on the "Please check in the browser" list in `docs/design-guidelines.md` section 10.

## Rerun the audit

1. Move the audit commit onto the latest `main`:

   ```bash
   git fetch origin
   git switch lab-accessibility-audit
   git rebase --onto origin/main HEAD~1
   ```

   `HEAD~1` keeps only the single audit commit, so this also works after `main` was squash-merged. If `package-lock.json` conflicts, take `main`'s version and run `npm install` to re-add `jest-axe`.

2. Install and run only the audit:

   ```bash
   npm install
   npm run test:a11y
   ```

3. Zero failures means nothing to do. Do not merge this branch.

## When there are violations

1. Branch from `main`, not from the lab branch: `git switch -c fix-<what-axe-reported> origin/main`.
2. Fix the components. Check the fix by cherry-picking the audit commit onto the fix branch locally (`git cherry-pick lab-accessibility-audit`), running the audit, then dropping that commit (`git reset --hard HEAD~1`) before opening the pull request.
3. Merge the fix branch into `main` as usual, then rebase the lab branch again (step 1).

## When a new page is added

Add one test for it in `app/accessibility.test.tsx`, following the existing pattern: render the component, add a heading above it if the real page has one, and call `expectNoAxeViolations`.

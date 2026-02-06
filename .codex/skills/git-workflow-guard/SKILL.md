---
name: "git-workflow-guard"
description: "Use when the task involves branch creation, commits, push, pull requests, merge, or versioning workflow; enforce feature-branch policy, Conventional Commits, pnpm quality checks, and PR-first delivery."
---

# Git Workflow Guard

Use this skill for any request related to git versioning flow: branch, commit, push, PR, merge, rebase, pull, release, or hotfix.

## Mandatory policy
1. Never commit directly to `main`.
2. If current branch is `main`, create a working branch before any code change.
3. Use branch names as `tipo/slug-curto` where tipo is one of:
   - `feat`, `fix`, `chore`, `docs`, `refactor`, `hotfix`
4. Use Conventional Commits:
   - Subject (EN): `tipo(escopo-opcional): english summary`
   - Allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`.
   - Example: `feat(menu): add sticky category tabs`
   - Commit body must be bilingual in blocks:
     1) full English block
     2) separator `---`
     3) full pt-BR block
5. Staging must be granular by explicit file paths.
6. Do not use `git add -A` or `git add .` in normal workflow.
7. Run quality gates before commit/push:
   - `pnpm lint`
   - `pnpm build`
8. Deliver changes via PR to `main`.
9. Merge strategy for PR is `squash`.
10. Never perform local merge to `main` as default workflow.

## Standard execution flow
1. Check branch and working tree (`git branch --show-current`, `git status --short`).
2. If on `main`, create branch: `git checkout -b <tipo/slug-curto>`.
3. Review changed files and group by coherent scope.
4. Stage each group explicitly (`git add fileA fileB`).
5. Commit each group with bilingual blocks (EN first, then `---`, then pt-BR).
6. Run quality gates (`pnpm lint`, `pnpm build`).
7. Push branch with upstream (`git push -u origin <branch>`).
8. Open PR with short template:
   - Context/problem
   - What changed
   - Validation evidence (`pnpm lint`, `pnpm build`)
   - Risk and rollback
9. Request review and wait approval/checks.
10. Merge via squash after approval.

## PR template (short)
- Context:
- Changes:
- Validation:
  - [ ] `pnpm lint`
  - [ ] `pnpm build`
- Risk:
- Rollback:

---

- Contexto:
- Alteracoes:
- Validacao:
  - [ ] `pnpm lint`
  - [ ] `pnpm build`
- Risco:
- Rollback:

## Hotfix rule
- `hotfix/*` is only for production incidents.
- Still requires PR to `main` and squash merge.

## Fallback guidance
- If remote branch protection is not configured, report it and provide exact steps.
- Do not bypass policy by pushing directly to `main`.

---
name: "git-workflow-guard"
description: "Use when the user asks for branch, commit, push, PR, merge, or versioning actions in this repository; enforce branch safety, granular commits, and PR-first workflow."
metadata:
  short-description: "Enforce safe Git workflow"
---

# Git Workflow Guard

## When to use
- Any request involving `branch`, `commit`, `push`, `PR`, `merge`, `release`, or `versionamento`.

## Inputs expected
- Task scope.
- Branch type (`feat|fix|chore|docs|refactor|hotfix`) and short slug.

## Required policy
1. Never commit directly on `main`.
2. Stage changes with explicit paths only.
3. Do not use `git add -A` or `git add .` in normal flow.
4. Use Conventional Commits with bilingual body (EN block, `---`, PT-BR block).
5. Run `pnpm lint` and `pnpm build` before push/PR.
6. Merge to `main` only via PR, using squash.

## Workflow
1. Check branch and status.
2. If on `main`, create branch `tipo/slug-curto`.
3. Group files by technical objective.
4. Stage one group at a time (`git add file1 file2`).
5. Commit each group with proper message format.
6. Run quality checks.
7. Push branch and open PR with context, validation, risk, rollback (EN + PT-BR).

## Output checklist
- Branch name
- Commit list (granular)
- Validation evidence (`pnpm lint`, `pnpm build`)
- PR URL

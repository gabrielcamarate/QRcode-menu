# Git Workflow (Projeto)

## Objetivo
Padronizar versionamento com qualidade e evitar trabalho direto na `main`.

## Regras principais
1. Nao trabalhar na `main`.
2. Toda tarefa deve iniciar em branch propria.
3. Todo merge para `main` deve ser via Pull Request.
4. Merge padrao: **Squash merge**.
5. Commits devem seguir Conventional Commits.
6. Validacoes minimas antes de abrir PR:
   - `pnpm lint`
   - `pnpm build`

## Padrao de branch
Formato: `tipo/slug-curto`

Tipos permitidos:
- `feat/`
- `fix/`
- `chore/`
- `docs/`
- `refactor/`
- `hotfix/` (apenas incidente critico)

Exemplos:
- `feat/menu-publico`
- `fix/login-admin`
- `chore/ajuste-rls`

## Convencao de commit
Formato do subject: `tipo(escopo-opcional): english summary`

Tipos permitidos:
- `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`

Exemplos:
- `feat(menu): add category sections`
- `fix(auth): fix admin login redirect`
- `chore(ci): adjust build pipeline`

### Estrutura obrigatoria do commit (bilingue em blocos)
1. Subject em ingles (Conventional Commit).
2. Body completo em ingles:
   - Context
   - Changes
   - Validation
   - Risk
   - Rollback
3. Separador: `---`
4. Body completo em pt-BR:
   - Contexto
   - Alteracoes
   - Validacao
   - Risco
   - Rollback

Exemplo resumido:
```txt
feat(menu): add category sections

Context:
- Improve menu navigation.

Changes:
- Add category section anchors.

Validation:
- pnpm lint
- pnpm build

Risk:
- Low.

Rollback:
- Revert this commit.

---

Contexto:
- Melhora navegacao do menu.

Alteracoes:
- Adiciona ancoras de secoes de categoria.

Validacao:
- pnpm lint
- pnpm build

Risco:
- Baixo.

Rollback:
- Reverter este commit.
```

## Fluxo recomendado
1. Criar branch a partir da `main` atualizada.
2. Implementar alteracoes.
3. Rodar `pnpm lint` e `pnpm build`.
4. Commitar com Conventional Commit.
5. Push da branch.
6. Abrir PR para `main` com resumo, evidencias e risco.
7. Aguardar review e checks.
8. Merge por squash.

## Gate minimo de PR
- 1 aprovacao obrigatoria.
- Checks obrigatorios: `lint` e `build`.
- Push direto em `main`: bloqueado.

## Configuracao recomendada no GitHub
Em `Settings > Branches > Branch protection rules` para `main`:
1. Require a pull request before merging.
2. Require approvals: 1.
3. Require status checks to pass: `lint`, `build`.
4. Restrict who can push to matching branches.

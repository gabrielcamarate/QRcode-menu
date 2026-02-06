# Playbook de Agent Skills no Dia a Dia (Codex)

## Objetivo

Usar skills com consistencia, acionando a skill certa no momento certo, com baixo atrito e previsibilidade no resultado.

## Estrategia Operacional

1. Disparar skill por intencao clara na mensagem.
2. Confirmar pre-requisitos minimos antes do fluxo da skill.
3. Trabalhar com prompts curtos e orientados a resultado.
4. Padronizar um loop diario de execucao e revisao.

## Como Skills Funcionam (Pratica)

1. O Codex escolhe skill por nome citado ou intencao da tarefa.
2. Quando ativa, le o `SKILL.md` e segue o workflow definido.
3. Carrega referencias extras apenas quando necessario.
4. Skill acelera tarefas especificas, mas nao substitui contexto do projeto.

## Interface de Ativacao e Saida Esperada

### Ativacao recomendada

- `use a skill playwright para validar checkout mobile`
- `use gh-fix-ci para analisar checks do PR 123`
- `use vercel-deploy e me passe o preview URL`

### Saida esperada por skill

- `gh-fix-ci`: diagnostico + plano + implementacao apenas apos aprovacao explicita.
- `playwright`: automacao CLI com snapshot/refs (`e1`, `e2`...).
- `vercel-deploy`: preview por padrao; producao apenas se solicitado.

## Mapeamento Rapido (Quando Usar)

1. `gh-fix-ci`: PR com check quebrado no GitHub Actions.
2. `playwright`: fluxo real de browser, bugs de UI, screenshots, extracao.
3. `vercel-deploy`: deploy e retorno de link de preview.
4. `skill-installer`: instalar novas skills.
5. `skill-creator`: criar/atualizar skill interna do time.

## Workflow Diario Recomendado

1. Comece tarefa com intencao + skill no mesmo prompt.
2. Defina sucesso no mesmo prompt (criterio de aceite objetivo).
3. Execute e revise saida (resultado e evidencias).
4. Se tarefa repetir 3+ vezes, transforme em skill interna.
5. Se faltar capability, instale skill e reinicie o Codex.

## Templates de Prompt

### Debug UI (Playwright)

```txt
use playwright; abra <url>; reproduza <bug>; salve screenshot; me diga passo exato
Sucesso = bug reproduzido + evidencia + causa provavel
```

### CI (gh-fix-ci)

```txt
use gh-fix-ci no PR <n>; resuma falha; proponha plano; espere aprovacao para aplicar
Sucesso = checks mapeados + trecho de log + plano acionavel
```

### Deploy (vercel-deploy)

```txt
use vercel-deploy no diretorio <path>; faca preview; retorne URL
Sucesso = URL de preview entregue
```

## Anti-padroes a Evitar

1. Prompt generico sem objetivo.
2. Pedir varias skills sem ordem numa tarefa complexa.
3. Nao declarar criterio de sucesso.
4. Esperar deploy de producao sem solicitar `--prod`.

## Cenarios de Validacao

### Cenario 1: CI quebrado

- Entrada: PR com check falhando.
- Esperado: check + log + snippet + plano antes de codar.

### Cenario 2: Fluxo UI

- Entrada: URL e acao desejada.
- Esperado: snapshot -> interacao -> evidencia (screenshot/trace).

### Cenario 3: Deploy

- Entrada: projeto web.
- Esperado: URL de preview sem promover para producao.

## Defaults Operacionais

1. Deploy default: preview, nao producao.
2. Browser automacao default: `playwright` (sem gerar `@playwright/test` sem pedido explicito).
3. CI default: `gh-fix-ci` para GitHub Actions.
4. Supabase e frequente no seu fluxo: manter MCP Supabase ativo por padrao.

## Checklist de Qualidade por Task

Antes de encerrar uma task com skill, validar:

1. Skill correta foi acionada para a intencao.
2. Criterio de sucesso foi declarado no prompt.
3. Evidencias foram produzidas (logs, screenshot, URL, etc).
4. Resultado final bate com o esperado do workflow da skill.

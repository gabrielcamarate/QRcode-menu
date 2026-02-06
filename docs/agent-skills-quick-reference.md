# Agent Skills Quick Reference

## Formula de Prompt (copiar e usar)

```txt
use <skill>; contexto: <problema>; objetivo: <resultado>;
sucesso = <criterio objetivo>; saida esperada = <artefato final>
```

## Skill -> Quando usar

- `playwright`: reproduzir bug UI, validar fluxo web, capturar screenshot.
- `gh-fix-ci`: investigar falha de check em PR (GitHub Actions).
- `vercel-deploy`: publicar preview e retornar URL.
- `skill-installer`: listar/instalar skills novas.
- `skill-creator`: transformar tarefas repetidas em skill interna.

## Templates prontos

### UI

```txt
use playwright; abra <url>; reproduza <bug>;
sucesso = reproduzir + screenshot + causa provavel
```

### CI

```txt
use gh-fix-ci no PR <n>;
sucesso = resumo da falha + trecho de log + plano antes de implementar
```

### Deploy

```txt
use vercel-deploy em <path>;
sucesso = URL de preview entregue
```

## Regras praticas

1. Sempre nomeie a skill no prompt.
2. Sempre defina sucesso no mesmo prompt.
3. Em tarefa grande, uma skill por vez e em ordem.
4. Deploy de producao apenas com pedido explicito.

# Logos de clientes co-branded

Salve aqui o logo de cada cliente que tem link exclusivo.

Formato: PNG transparente, idealmente 400×120px (proporção horizontal).

## Arquivos esperados

- `powerpic-logo.png` — logo PowerPic (LED Technology + spark)

## Como adicionar um novo cliente

1. Salvar logo em `public/clients/<slug>-logo.png`
2. Editar `public/app.html` → função `applyClientBranding` → adicionar case no switch
3. Acesso via `/<slug>` (ex: `/powerpic`)

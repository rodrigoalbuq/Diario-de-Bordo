# Diário de Bordo

Aplicação web (PWA) simples para registrar entradas de um diário, com suporte a funcionamento offline via Service Worker e instalação como app.

## Visão Geral

- Página principal: `index.html`
- Estilos: `style.css`
- Lógica: `script.js`
- PWA: `manifest.json` e `service-worker.js`
- Ícones: pasta `icons/` e script `generate-icons.js` (usa Sharp)
- Screenshots: pasta `screenshots/`

## Requisitos

- Node.js 16+ (apenas para gerar ícones com Sharp)
- VS Code (opcional) com Live Server ou qualquer servidor estático

## Instalação

```bash
npm install
```

npm run generate:icons

````

Observação: ajuste o script conforme necessário para sua imagem base de ícone (por exemplo, caminho do arquivo de origem e tamanhos desejados).

## Executar Localmente

- Opção 1 (VS Code): instale a extensão Live Server e abra `index.html`.
- Opção 2 (via npx):


Padrões do projeto:
- Origem padrão: `icons/icon-512.svg`
- Saídas geradas: `icons/icon-192.png` e `icons/icon-512.png`
```bash
npx http-server . -p 5500
````

Então acesse: http://localhost:5500/

## Funcionalidades PWA

Padrões do projeto:

- Saídas geradas: `screenshots/desktop-wide-1280x720.png` e `screenshots/mobile-narrow-720x1280.png`
- `manifest.json`: define nome, cores e ícones para instalação.
- `service-worker.js`: habilita cache e funcionamento offline. Ao servir o site via HTTP(s), o service worker será registrado e a app pode ser instalada.

## Screenshots recomendadas (PWA)

generate-screenshots.js

- Desktop (wide): 1280x720 (arquivo: `screenshots/desktop-wide-1280x720.png`)
- Mobile (narrow): 720x1280 (arquivo: `screenshots/mobile-narrow-720x1280.png`)

### Gerar automaticamente

```bash
npm run generate:screenshots
```

## Persistência de dados

- As entradas do diário são salvas no `localStorage` do navegador.
- Limpar dados do navegador ou usar modo privado pode remover as entradas.
- Não há backend; os dados ficam 100% no seu dispositivo.
  O script usa estritamente a imagem de origem `screenshots/diario-de-bordo-2025-12-19.png`. Se não existir, a execução falha com instruções para criar/renomear a imagem. O `manifest.json` referencia os arquivos gerados com `form_factor` adequado.

## Estrutura

### Notas sobre cache

- Evite nomes de arquivos com espaços. O service worker deliberadamente ignora recursos cujo caminho contenha espaços para evitar problemas de cache.
  generate-icons.js
  index.html
  manifest.json
  package.json
  script.js
  service-worker.js
  style.css
  icons/
  screenshots/

```

## Deploy

Por ser um site estático, pode ser publicado em:

- GitHub Pages
- Netlify
- Vercel

Exemplo (GitHub Pages):

1. Faça commit e push do repositório.
2. Ative Pages no repositório (branch `main` ou pasta `docs`).
3. Acesse a URL gerada e verifique a instalação PWA.

## Licença

Este projeto usa a licença ISC (ver `package.json`).
```

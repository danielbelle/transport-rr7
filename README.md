# TAPP — Editor e Envio de Comprovantes (Viadutos‑RS) — v2.0

Aplicação em React + TypeScript (Vite) que preenche a “Requisição de Auxílio
Transporte” a partir de um template PDF, captura assinatura, mostra prévia em
imagem A4, gera o PDF final e envia por e‑mail via SMTP. Construída com React
Router 7 (RR7) com SSR.

- Stack: React 19, React Router 7 (SSR), Vite 7, Tailwind 4, pdf-lib, Zod,
  Zustand, Nodemailer
- Fluxo: preencher → assinar → visualizar (imagem A4) → gerar PDF → enviar por
  e‑mail
- Arquitetura: frontend-first com utilitários de PDF no cliente; envio de e‑mail
  por ação server-side (RR7)

---

## Visão geral da arquitetura

- Roteamento (RR7 + SSR)

  - Arquivo de rotas: [app/routes.ts](app/routes.ts)
  - SSR: [react-router.config.ts](react-router.config.ts)
  - Rotas principais:
    - GET / → tela de boas-vindas que limpa estados persistidos
      ([app/routes/welcome/route.tsx](app/routes/welcome/route.tsx))
    - GET /edit → editor (formulário + assinatura + pré‑visualização)
      ([app/routes/editor/route.tsx](app/routes/editor/route.tsx))
    - POST /api/send-email → envio SMTP
      ([app/routes/api.send-email/route.ts](app/routes/api.send-email/route.ts)
      – ação [`action`](app/routes/api.send-email/route.ts))
    - Catch‑all → redireciona para “/” (e ignora uma rota do Chrome DevTools)
      ([app/routes/catch-all/route.tsx](app/routes/catch-all/route.tsx))

- Geração de PDF (cliente)

  - Template esperado: public/samples/sample.pdf
  - Função principal:
    [`generateHomeFormPdf`](app/routes/editor/utils/pdf-utils.ts)
  - Posicionamento de campos:
    [`homeFieldConfig`](app/routes/editor/utils/home-field-config.ts)
  - Pré‑visualização: canvas com sobreposição de textos/assinatura
    ([app/routes/editor/components/HomeLiveImage.tsx](app/routes/editor/components/HomeLiveImage.tsx))

- Envio de e‑mail (server)

  - Ação server RR7 com Nodemailer:
    [`action`](app/routes/api.send-email/route.ts)
  - Validações com Zod: [`validateEmailData`](app/lib/validation.ts)
  - Config SMTP via env: [`smtpConfig`](app/lib/env.ts)

- Estado e validação

  - Store global (persistência seletiva):
    [`useDocumentStore`](app/lib/stores.ts)
  - Validações Zod ligadas por flag de ambiente:
    [`isValidationEnabled`](app/lib/env.ts),
    [`validateFormData`](app/lib/validation.ts)
  - Notificações globais:
    [app/lib/notification-context.tsx](app/lib/notification-context.tsx)

- Utilitários de PDF
  - Merge de PDFs (formulário + anexo do usuário):
    [`PdfMergeUtils.mergePdfs`](app/lib/utils/pdf-merge.ts)
  - Compressão (limite total do e‑mail 15MB):
    [`PdfCompressUtils.needsCompression`](app/lib/utils/pdf-compress.ts),
    [`PdfCompressUtils.compressPdf`](app/lib/utils/pdf-compress.ts)

---

## Principais funcionalidades

- Preenchimento de campos e transformações (ex.: mês “1” → “janeiro”; semestre
  “1” → “1°”)
  - Fábrica e transformadores:
    [`FieldFactories`](app/lib/utils/field-config-factory.ts),
    [`ValueTransformers`](app/lib/utils/field-config-factory.ts)
- Captura de assinatura digital (canvas) e injeção no PDF
  - Componente:
    [app/components/ui/FormSignature.tsx](app/components/ui/FormSignature.tsx)
  - Inserção no PDF:
    [`addSignatureToPdf` interno](app/routes/editor/utils/pdf-utils.ts)
- Pré‑visualização em tempo real (imagem A4 com overlays)
  - Canvas:
    [app/components/ui/CanvasPreview.tsx](app/components/ui/CanvasPreview.tsx)
  - Overlays gerados a partir do estado do formulário:
    [app/routes/editor/components/HomeLiveImage.tsx](app/routes/editor/components/HomeLiveImage.tsx)
- Envio por e‑mail (SMTP) com anexo PDF
  - Ação server: [`action`](app/routes/api.send-email/route.ts)
  - Template de e‑mail com CPF/RG mascarados:
    [`HomeEmailTemplates.formEmail`](app/routes/editor/utils/email-utils.ts)
- Upload de PDF adicional e merge com o documento gerado
  - Upload: [app/components/ui/FileUpload.tsx](app/components/ui/FileUpload.tsx)
  - Merge: [`PdfMergeUtils.mergePdfs`](app/lib/utils/pdf-merge.ts)
- Compressão automática caso necessário (alvo 15MB total do e‑mail)
  - [`PdfCompressUtils.compressPdf`](app/lib/utils/pdf-compress.ts)

---

## Decisões técnicas

- React Router 7 com SSR

  - SSR habilitado em [`react-router.config.ts`](react-router.config.ts) para
    melhor SEO e entrega inicial
  - Ações (server) para envio SMTP sem backend extra

- Frontend‑first para edição/preview de PDF

  - `pdf-lib` no cliente para desenhar textos/assinaturas diretamente sobre o
    template
  - Lazy import de `pdf-lib` (ver
    [`LazyPDFDocument`](app/components/lazy/LazyComponents.tsx)) para reduzir
    custo inicial

- Tipagem e validação

  - TypeScript estrito em todo o app
  - Zod desabilitável por ambiente: [`VALIDATION_ENABLED`](app/lib/env.ts)
    controla [`validateWithZod`](app/lib/validation.ts)

- Estado

  - `zustand` com persistência controlada (apenas `currentStep` e
    `uploadedFile`) em `localStorage` ([`useDocumentStore`](app/lib/stores.ts))

- UX
  - Notificações globais simples
    ([app/components/ui/Notification.tsx](app/components/ui/Notification.tsx))
  - Máscara de dados sensíveis no corpo do e‑mail (CPF/RG)
    ([`HomeEmailTemplates`](app/routes/editor/utils/email-utils.ts))

---

## Estrutura relevante

```
app/
  routes/
    editor/
      route.tsx
      components/
        HomeEmailSender.tsx
        HomeLiveImage.tsx
      utils/
        pdf-utils.ts
        home-field-config.ts
        email-utils.ts
    api.send-email/
      route.ts
    catch-all/
      route.tsx
    welcome/
      route.tsx
  lib/
    env.ts
    validation.ts
    stores.ts
    utils/
      pdf-merge.ts
      pdf-compress.ts
      field-config-factory.ts
      logger.ts
  components/
    ui/ (Button, Form*, FileUpload, CanvasPreview, Modal, Loading, Notification)
    layout/ (header, footer, logo)
```

Arquivos de destaque:

- Rotas: [app/routes.ts](app/routes.ts)
- Envio SMTP: [`action`](app/routes/api.send-email/route.ts)
- PDF (geração): [`generateHomeFormPdf`](app/routes/editor/utils/pdf-utils.ts)
- PDF (merge): [`PdfMergeUtils.mergePdfs`](app/lib/utils/pdf-merge.ts)
- PDF (compressão):
  [`PdfCompressUtils.compressPdf`](app/lib/utils/pdf-compress.ts)
- Env/config:
  [`getEnv`, `smtpConfig`, `isValidationEnabled`, `emailPrefeitura`](app/lib/env.ts)

---

## Como clonar e rodar localmente

Pré‑requisitos: Node 20+

1. Clonar e instalar

```sh
git clone <seu-fork-ou-este-repo>.git
cd tapp
npm ci
```

2. Criar o arquivo .env (raiz do projeto)

```sh
# SMTP (server)
SMTP_HOST=smtp.seuprovedor.com
SMTP_PORT=587
SMTP_USER=usuario@seuprovedor.com
SMTP_PASS=senha
SMTP_FROM="Viadutos <noreply@viadutos.rs.gov.br>"

# E-mail de destino da prefeitura (server e client)
EMAIL_PREFERITO=protocolo@viadutos.rs.gov.br
VITE_EMAIL_PREFERITO=protocolo@viadutos.rs.gov.br

# Validação Zod (client e server)
VALIDATION_ENABLED=true
VITE_VALIDATION_ENABLED=true

# Ambiente
NODE_ENV=development
```

3. Adicionar o template PDF

- Coloque o arquivo do modelo em: `public/samples/sample.pdf`
- A prévia usa `public/samples/sample.png` e a geração usa
  `public/samples/sample.pdf`
  ([`loadPdfTemplate`](app/routes/editor/utils/pdf-utils.ts))

4. Rodar em desenvolvimento

```sh
npm run dev
```

5. Build e modo produção local

```sh
npm run build
npm run start
# servidor em: react-router-serve ./build/server/index.js
```

Dica: para testes SMTP use um provedor sandbox (ex.: Mailtrap). Erros de conexão
são reportados na verificação do transporter.

---

## Variáveis de ambiente

- Server (Node): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,
  `SMTP_FROM`, `EMAIL_PREFERITO`, `NODE_ENV`, `VALIDATION_ENABLED`
- Client (Vite): `VITE_EMAIL_PREFERITO`, `VITE_VALIDATION_ENABLED`
  - São injetadas via [`vite.config.ts`](vite.config.ts) com `define` e lidas em
    [`env.ts`](app/lib/env.ts)

---

## Fluxo técnico

1. Formulário e assinatura

   - Campos definidos em
     [`homeFieldConfig`](app/routes/editor/utils/home-field-config.ts)
   - Validação por [`validateFormData`](app/lib/validation.ts)
   - Assinatura capturada em base64 (PNG/JPEG)
     ([FormSignature](app/components/ui/FormSignature.tsx))

2. Pré‑visualização

   - Canvas desenha imagem base e overlays (texto/assinatura)
     ([CanvasPreview](app/components/ui/CanvasPreview.tsx))

3. Geração de PDF

   - [`generateHomeFormPdf`](app/routes/editor/utils/pdf-utils.ts) aplica textos
     e assinatura no template A4

4. Merge opcional com PDF anexado

   - [`PdfMergeUtils.mergePdfs`](app/lib/utils/pdf-merge.ts)

5. Compressão se necessário (limite total ~15MB)

   - [`PdfCompressUtils.needsCompression`](app/lib/utils/pdf-compress.ts)
   - [`PdfCompressUtils.compressPdf`](app/lib/utils/pdf-compress.ts)

6. Envio por e‑mail (server)
   - Ação [`action`](app/routes/api.send-email/route.ts) com Nodemailer usando
     [`smtpConfig`](app/lib/env.ts)

---

## RR7 (React Router 7) no projeto

- SSR ativado em [`react-router.config.ts`](react-router.config.ts) com
  `ssr: true`
- Rotas organizadas via arquivo de configuração ([app/routes.ts](app/routes.ts))
- Ações server simplificam o backend (ex.: POST `/api/send-email` centralizado
  na rota)

---

## Segurança e privacidade

- Dados sensíveis mascarados no e‑mail (CPF/RG) via
  [`HomeEmailTemplates`](app/routes/editor/utils/email-utils.ts)
- Persistência local mínima (apenas passo atual e arquivo anexado) em
  [`useDocumentStore`](app/lib/stores.ts)
- Validação de anexos (tipo/tamanho) via Zod
  ([`validatePdfFile`](app/lib/validation.ts))

---

## Docker (opcional)

- Build multi‑stage com Node 20 Alpine ([Dockerfile](Dockerfile))
- Produção roda `react-router-serve` sobre a build gerada

```sh
docker build -t tapp .
docker run -p 3000:3000 --env-file .env tapp
```

---

## Roadmap curto

- Preview PDF nativo (embed) além da imagem A4
- Assinatura digital avançada (PAdES) e validações
- Testes automatizados para PDF e e‑mail

---

## v2.0 — Destaques e melhorias vs v1.0

- Migração para React Router 7 com SSR e ações server
- Novo fluxo “bem‑vindo” que limpa estados/resíduos
  ([welcome](app/routes/welcome/route.tsx))
- Pré‑visualização mais leve via Canvas (imagem A4) em tempo real
- Camada de validação com Zod, ativável por ambiente
  ([`isValidationEnabled`](app/lib/env.ts))
- Store global simplificada e persistência seletiva com Zustand
- Utilitários desacoplados para merge e compressão de PDF
- Template de e‑mail mais seguro (mascaramento de CPF/RG)

---

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção (RR7)
- `npm run start` — serve de produção com `react-router-serve`
- `npm run typecheck` — typegen do RR7 + `tsc`

---

## Créditos

- UI/Dev: ver rodapé do app (link para o GitHub do autor)
- Bibliotecas: React, React Router, Vite, Tailwind, Zod, Zustand, pdf-lib,
  Nodemailer

# VERSÃO CORRIGIDA PARA VERCEL FUNCTIONS

Esta versão usa `export default async function handler(request)` em todos os arquivos da pasta `/api`.
Substitua os arquivos antigos do repositório `server-draw` por estes e faça um novo deploy.

# AirDraw Photo Server — Vercel

Servidor de fotos para o AirDraw, feito especificamente para hospedar na Vercel.

## Arquitetura

- Vercel Functions recebem as imagens em `POST /api/captures`.
- Vercel Blob **Private** guarda as imagens persistentemente.
- `/admin` possui login e acessa as imagens privadas através de Functions autenticadas.
- O endpoint é compatível com o AirDraw que envia `FormData` contendo:
  - `photo`
  - `sessionId`
  - `source` (opcional)

## 1. Criar repositório

Suba **todo o conteúdo desta pasta** para um repositório GitHub separado.

Exemplo:

```text
Draw_VR_Server/
├── api/
├── lib/
├── admin.html
├── admin.js
├── admin.css
├── index.html
├── package.json
└── vercel.json
```

## 2. Importar na Vercel

Na Vercel:

1. Add New → Project.
2. Importe o repositório `Draw_VR_Server`.
3. Framework Preset: Other.
4. Deploy.

Arquivos dentro de `/api` são publicados como Vercel Functions.

## 3. Criar Vercel Blob PRIVADO

No projeto do servidor na Vercel:

1. Abra **Storage**.
2. Escolha **Create Database**.
3. Selecione **Blob**.
4. Escolha **Private**.
5. Conecte o Blob ao projeto.
6. A Vercel adicionará a credencial de leitura/escrita ao projeto.

Depois faça um Redeploy se a Vercel solicitar.

## 4. Variáveis de ambiente

Em:

Settings → Environment Variables

crie:

```env
ALLOWED_ORIGINS=https://draw-vr.vercel.app
ADMIN_PASSWORD=SUA_SENHA_FORTE
SESSION_SECRET=UMA_CHAVE_LONGA_E_ALEATORIA
```

Não coloque espaços ao redor do `=`.

Se também usar um domínio próprio, você pode informar várias origens:

```env
ALLOWED_ORIGINS=https://draw-vr.vercel.app,https://draw.seudominio.com
```

Depois faça Redeploy.

## 5. Testar

Abra:

```text
https://SEU-SERVIDOR.vercel.app/api/health
```

A resposta deve se parecer com:

```json
{
  "ok": true,
  "service": "AirDraw Photo Server Vercel",
  "storage": "Vercel Blob"
}
```

Painel:

```text
https://SEU-SERVIDOR.vercel.app/admin
```

## 6. Ligar ao AirDraw

No `config.js` do AirDraw:

```js
window.AIRDRAW_CONFIG = {
  PHOTO_SERVER_URL: "https://SEU-SERVIDOR.vercel.app",
  CAPTURE_INTERVAL_MS: 3000,
  CAPTURE_QUALITY: 0.78,
  CAPTURE_MAX_WIDTH: 960
};
```

Faça commit no projeto AirDraw. A Vercel fará um novo deploy.

## Qualquer rede

Não importa se o visitante está usando Wi-Fi, 4G, 5G ou outra rede. O navegador
do visitante envia diretamente para a URL pública HTTPS do servidor.

`ALLOWED_ORIGINS` controla **qual site** pode iniciar os uploads pelo navegador,
não a rede/IP do visitante.

## Privacidade

Este backend foi feito para ser usado com um frontend que peça permissão de câmera
e informe claramente que capturas periódicas estão sendo enviadas.

As imagens são configuradas para Vercel Blob **Private** e o painel exige autenticação.

## Atenção ao volume

Uma captura a cada 3 segundos equivale a até 1.200 capturas por hora por usuário
enquanto a página permanecer aberta. Com vários usuários, armazenamento e operações
podem crescer rapidamente. Acompanhe o uso do Blob na Vercel.

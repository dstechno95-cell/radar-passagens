# Radar Passagens ✈️

Plataforma de busca e rastreamento de passagens aéreas promocionais no Brasil e internacional.

> Agrega oportunidades de voo em tempo real — **não vende passagens diretamente**.

## Stack

- **Frontend:** Next.js 14 (App Router) + TailwindCSS + TypeScript
- **Backend:** Next.js API Routes (Node.js)
- **Banco:** PostgreSQL (Neon / Supabase)
- **Deploy:** Vercel

## Rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo de ambiente (DB é opcional em dev — mock já funciona)
cp .env.example .env.local

# 3. Iniciar servidor de desenvolvimento
npm run dev
# Acesse http://localhost:3000
```

## Deploy no Vercel (passo a passo)

### 1. Banco de dados — Neon (gratuito)

1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto: `radar-passagens`
3. Copie a **Connection String** (formato pooled para serverless)
4. No painel Neon → **SQL Editor**, execute o conteúdo de `database/schema.sql`

### 2. GitHub

```bash
# Na raiz do projeto:
git init   # já feito
git add .
git commit -m "feat: radar passagens MVP"

# Criar repositório no GitHub (via gh CLI ou manualmente)
gh repo create radar-passagens --public --source=. --push
```

### 3. Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório `radar-passagens` do GitHub
3. Framework: **Next.js** (detectado automaticamente)
4. Adicione as variáveis de ambiente:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | Connection string do Neon (pooled) |
| `NODE_ENV` | `production` |

5. Clique em **Deploy** ✅

### 4. Domínio (opcional)

No painel do projeto no Vercel → **Settings → Domains** → adicione seu domínio.

## Estrutura de providers

Para integrar APIs reais de passagens, edite `src/providers/index.ts`:

```typescript
// Descomente os providers desejados após configurar as API keys:
export const providers: FlightProvider[] = [
  mockProvider,        // dados mock (ativo por padrão)
  // skyscannerProvider, // SKYSCANNER_API_KEY
  // amadeusProvider,    // AMADEUS_CLIENT_ID + AMADEUS_CLIENT_SECRET
  // kiwiProvider,       // KIWI_API_KEY
];
```

## Score de oportunidade

| Badge | Critério |
|---|---|
| 🔥 Promoção | ≥ 30% abaixo da média |
| ✅ Bom preço | 15–30% abaixo da média |
| ⚠️ Preço normal | Na média histórica |
| ❌ Preço alto | Acima da média |

## API

```
GET /api/flights/search
  ?origin=GRU
  &destination=SDU
  &departure=2026-06-15
  &return=2026-06-22      (opcional — ida e volta)
  &adults=1               (opcional, padrão: 1)

GET /api/health
```

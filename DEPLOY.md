# Deploy do ProAtleta para produção

Stack:
- **Backend** (Spring Boot) → [Railway](https://railway.com) (Docker build do `backend/Dockerfile`)
- **Banco** PostgreSQL → addon do Railway
- **Frontend** (Vite + React) → [Vercel](https://vercel.com) (já existe)

---

## Passo 1 — Backend + banco no Railway

### 1.1. Criar a conta
1. Vá em https://railway.com → **Login** → escolha **GitHub** (mais rápido)
2. Autorize a Railway a ver seus repositórios

### 1.2. Criar o projeto a partir do repositório
1. **+ New** → **Deploy from GitHub repo**
2. Selecione `Lucasimoes6/ProAtleta`
3. Em "Choose a project" deixe **"Empty project"** OU crie já com o repo
4. Railway vai começar a tentar buildar. **Pause aqui** — precisa apontar a raiz pra `backend/` primeiro

### 1.3. Configurar a raiz do build
1. Clique no serviço criado → aba **Settings**
2. Em **Source / Root Directory** coloque: `backend`
3. Em **Build** deve detectar automaticamente o `Dockerfile`. Se aparecer "Nixpacks", troque para **Dockerfile**

### 1.4. Adicionar o PostgreSQL
1. No projeto, clique **+ New** → **Database** → **Add PostgreSQL**
2. Vai criar um serviço chamado `Postgres` com variáveis prontas: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

### 1.5. Conectar o backend ao banco
1. Clique no serviço do backend → aba **Variables**
2. Clique **+ New Variable** → **Add Reference** e selecione as 5 variáveis do Postgres:
   - `PGHOST` ← `${{Postgres.PGHOST}}`
   - `PGPORT` ← `${{Postgres.PGPORT}}`
   - `PGDATABASE` ← `${{Postgres.PGDATABASE}}`
   - `PGUSER` ← `${{Postgres.PGUSER}}`
   - `PGPASSWORD` ← `${{Postgres.PGPASSWORD}}`

### 1.6. Outras variáveis obrigatórias
Adicione manualmente (ainda na aba **Variables**):

| Nome | Valor | Por quê |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | Ativa o perfil de produção que usa PostgreSQL |
| `JWT_SECRET` | uma string aleatória de **pelo menos 32 caracteres** (use `https://generate-secret.vercel.app/32`) | Assina o JWT — se alguém souber, pode forjar tokens |
| `CORS_ALLOWED_ORIGINS` | `https://pro-atleta.vercel.app` (sem barra no fim) | Permite que o frontend no Vercel chame esta API |

### 1.7. Expor a URL pública
1. Aba **Settings** do serviço backend → role até **Networking**
2. Clique **Generate Domain** → vai aparecer algo como `proatleta-production-xxxx.up.railway.app`
3. **Copie essa URL** — você vai usar no próximo passo

### 1.8. Acompanhar o deploy
- Aba **Deployments** → clique no deploy ativo → veja os logs
- Sucesso: `Started AthleteApplication in X seconds`
- Falha comum: variável de ambiente faltando — veja o erro e adicione

---

## Passo 2 — Apontar o frontend pro backend

### 2.1. Setar a variável no Vercel
1. https://vercel.com → seu projeto `pro-atleta` → **Settings** → **Environment Variables**
2. Adicione:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://SUA-URL.up.railway.app/api` (a URL do passo 1.7, **com `/api` no fim**)
   - **Environments:** marque os 3 (Production, Preview, Development)
3. Salve

### 2.2. Redeployar o frontend
1. Aba **Deployments** → clique nos `⋯` do último deploy → **Redeploy**
2. **Desmarque** "Use existing Build Cache" → **Redeploy**
3. Aguarde ~1 minuto

### 2.3. Testar
1. Abra https://pro-atleta.vercel.app
2. Clique em **Cadastre-se** → crie uma conta nova (o banco PostgreSQL está vazio)
3. Deveria fazer login automaticamente e cair em `/profile`

---

## Troubleshooting

**Cadastro retorna "Email ou senha inválidos"**
- Abra **F12 → Network**, tente cadastrar, veja a request `POST /api/auth/register`
- Se status **404 ou retorna HTML**: VITE_API_URL está errado ou não foi redeployado. Confira passo 2.1 e 2.2.
- Se status **CORS error / Network error**: `CORS_ALLOWED_ORIGINS` no Railway não bate. A origem precisa ser exatamente igual (sem barra no fim).
- Se status **500**: veja os logs do Railway. Provável env var faltando ou banco não acessível.

**Backend não sobe no Railway**
- Logs mostram `JWT secret must be at least 256 bits`: o `JWT_SECRET` tem menos de 32 caracteres. Gere um novo.
- Logs mostram erro de conexão Postgres: revise as 5 variáveis PG\* — verifique que foram criadas como **References** (não copiadas como string).

**Frontend funciona mas dados não persistem após redeploy**
- Não tem como — Postgres do Railway é persistente. Se isso acontecer, você está acessando uma instância diferente. Confira que o backend Railway está apontando pro Postgres correto via `PGHOST`.

---

## Custos esperados (plano grátis)

- **Railway free tier:** $5 de crédito gratuito por mês. Esse projeto consome ~$3-4/mês se ficar 24/7 no ar.
  - Para zerar custo: pare o serviço quando não estiver demonstrando (botão Stop) — só liga quando precisar
- **Vercel free tier:** ilimitado pra projetos pessoais
- **Total:** R$ 0/mês se você gerenciar o on/off do Railway

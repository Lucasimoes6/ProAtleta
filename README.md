# Athlete Platform

Plataforma inteligente para gestão e desenvolvimento de atletas. Personaliza o
treinamento com base em perfil, anamnese e objetivos esportivos, gerando
periodização automática de 12 semanas e protocolos de reabilitação por região
e gravidade da lesão.

## Stack

| Camada    | Tecnologias |
|-----------|-------------|
| Frontend  | React 18, TypeScript, Vite, Zustand, React Router, Axios, Recharts |
| Backend   | Java 17, Spring Boot 3.3, Spring Security, JPA/Hibernate, JJWT |
| Banco     | H2 em memória (dev) · PostgreSQL (prod) |
| Auth      | JWT + BCrypt |

## Estrutura

```
Health/
├── backend/                  Spring Boot API REST
│   ├── pom.xml
│   └── src/main/java/com/health/athlete/
│       ├── auth/             JWT, login/registro, UserDetails
│       ├── athlete/          Perfil do atleta
│       ├── anamnesis/        Questionário + AnamnesisEvaluator
│       ├── training/         Plano + PeriodizationEngine
│       ├── injury/           Lesões + RehabProtocols
│       ├── config/           Spring Security, CORS
│       └── common/           Exceções globais
└── frontend/                 React + TypeScript
    └── src/
        ├── api/              Axios client + endpoints
        ├── store/            Zustand (auth)
        ├── pages/            Login, Register, Dashboard, Profile, Anamnesis, Training, Injuries
        ├── components/       Layout
        ├── styles/           CSS global (tema dark)
        └── types/            Tipos do domínio
```

## Como rodar

### Pré-requisitos
- Java 17+
- Maven 3.9+
- Node.js 18+

### Backend

```bash
cd backend
mvn spring-boot:run
```

API disponível em `http://localhost:8080`. O console do H2 fica em
`http://localhost:8080/h2-console` (jdbc url: `jdbc:h2:mem:athlete`).

Para usar PostgreSQL em produção, defina:

```bash
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://host:5432/athlete
DATABASE_USER=...
DATABASE_PASSWORD=...
JWT_SECRET=<256+ bits>
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App disponível em `http://localhost:5173`. O Vite proxy aponta para
`http://localhost:8080` em `/api/*`.

## Endpoints principais

| Método | Rota                                         | Descrição |
|--------|----------------------------------------------|-----------|
| POST   | `/api/auth/register`                         | Cadastro (atleta/treinador) |
| POST   | `/api/auth/login`                            | Login → retorna JWT |
| GET    | `/api/athletes/me`                           | Perfil do atleta logado |
| PUT    | `/api/athletes/me`                           | Cria/atualiza perfil |
| POST   | `/api/anamnesis`                             | Cria anamnese + relatório auto |
| GET    | `/api/anamnesis/me/latest`                   | Última anamnese |
| POST   | `/api/training/plans/generate`               | Gera plano de 12 semanas |
| GET    | `/api/training/plans/me/current`             | Plano ativo |
| PATCH  | `/api/training/sessions/{id}/complete`       | Marca sessão concluída |
| POST   | `/api/injuries`                              | Registra lesão + gera protocolo |
| GET    | `/api/injuries/me`                           | Histórico de lesões |
| PATCH  | `/api/injuries/{id}/resolve`                 | Marca lesão como recuperada |

Todas as rotas (exceto `/api/auth/**`) exigem header
`Authorization: Bearer <token>`.

## Funcionalidades implementadas

- Autenticação JWT com roles ATHLETE / COACH / ADMIN
- Cadastro de perfil com esporte, nível, objetivo, biometria
- Anamnese completa com:
  - Avaliação heurística automática (`AnamnesisEvaluator`)
  - Alertas de risco (FC alta, sono curto, estresse, dor ativa)
  - Recomendações por nível de condicionamento e objetivo
  - Sugestão de valências por esporte
- Periodização linear de 12 semanas (`PeriodizationEngine`):
  - 4 fases (BASE → INTENSIDADE → PICO → RECUPERAÇÃO)
  - Volume e intensidade modulados por fase e nível
  - Templates de sessão por esporte (corrida, força, CrossFit, esportes coletivos)
  - Distribuição de dias da semana conforme frequência declarada
- Reabilitação:
  - Protocolos em 4 fases por região (joelho, ombro, lombar, tornozelo, etc.)
  - Avisos especiais para gravidade GRAVE
- Dashboard com:
  - Métricas (plano atual, taxa de conclusão, lesões ativas)
  - Gráfico de carga (Area chart) e periodização (Line chart)
  - Distribuição semanal de duração (Bar chart)

## Pontos de extensão

- **IA**: o `AnamnesisEvaluator` e o `PeriodizationEngine` são heurísticos —
  podem ser substituídos por chamadas a um modelo (LLM ou regressão treinada
  em histórico de atletas).
- **Wearables**: criar endpoint `POST /api/wearables/sync` que recebe FC,
  HRV, passos e injeta nas métricas do `Anamnesis` e ajusta o plano.
- **Notificações**: spring-boot-starter-mail + WebPush para lembretes diários
  da sessão e alertas de overtraining (FC repouso ↑ 7 dias seguidos).
- **Área do treinador**: o role `COACH` já existe — falta UI para listar atletas
  vinculados, comentar planos e ajustar manualmente as sessões.
- **Multi-tenant**: adicionar `coach_id` no atleta para isolamento de carteira.

## Decisões técnicas

- **H2 em dev** elimina dependência de Docker para subir o projeto.
- **JPA `ddl-auto: update`** permite evolução de schema sem migration tool —
  trocar para Flyway/Liquibase antes de produção.
- **JWT stateless**: sem sessão no servidor, ideal para scale horizontal.
- **`@AuthenticationPrincipal User`**: o controller recebe o usuário direto
  graças ao `User implements UserDetails`.
- **Lombok**: reduz boilerplate em entidades — `@Builder`, `@Getter`, `@Setter`.

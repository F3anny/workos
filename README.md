# WorkOS API

A production-grade backend system built with a microservices architecture. 
Designed to demonstrate real-world backend engineering patterns used in 
modern SaaS platforms.

## Architecture
                    CLIENT
                       │
                ┌──────▼──────┐
                │ API Gateway  │  :3000
                └──────┬──────┘
                       │
      ┌────────────────┼────────────────┐
      ▼                ▼                ▼                ▼
┌────────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────┐
│    Auth    │  │  Workspace   │  │   Tasks    │  │ Notification │
│  Service   │  │   Service    │  │  Service   │  │   Service    │
│   :3001    │  │    :3002     │  │   :3003    │  │    :3004     │
└─────┬──────┘  └──────┬───────┘  └─────┬──────┘  └──────┬───────┘
▼                ▼                ▼                  ▼
PostgreSQL        PostgreSQL       PostgreSQL        RabbitMQ
(auth_db)      (workspace_db)    (tasks_db)         consumer

## Services

| Service | Port | Responsibility |
|---|---|---|
| API Gateway | 3000 | Token verification, request routing, Redis caching |
| Auth Service | 3001 | Registration, login, JWT access + refresh tokens |
| Workspace Service | 3002 | Workspaces, members, role-based access control |
| Tasks Service | 3003 | Projects, tasks, assignments |
| Notification Service | 3004 | Email delivery via RabbitMQ event consumption |

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache | Redis |
| Message Broker | RabbitMQ |
| Validation | Zod |
| Auth | JWT (access + refresh token rotation) |
| Containers | Docker + Docker Compose |

## Key Patterns

- **Microservices architecture** — each service is independently deployable with its own database
- **JWT refresh token rotation** — refresh tokens are single-use, revoked after each use
- **Service isolation** — no shared databases between services, communication via HTTP or RabbitMQ
- **Centralized auth** — API Gateway verifies tokens once, injects user context into downstream requests
- **Async messaging** — RabbitMQ decouples services, ensures reliable event delivery with no data loss
- **Global error handling** — consistent error responses across all services
- **Zod validation** — all inputs validated and typed before reaching business logic

## Getting Started

### Prerequisites
- Node.js 18+
- Docker Desktop

### Run infrastructure

```bash
docker-compose up -d
```

### Install dependencies (each service)

```bash
cd auth-service && npm install
cd ../workspace-service && npm install
cd ../tasks-service && npm install
cd ../notification-service && npm install
cd ../api-gateway && npm install
```

### Run Auth Service

```bash
cd auth-service
cp .env.example .env
npx prisma migrate dev
npm run dev
```

## API Endpoints

### Auth Service — :3001

| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login, returns access + refresh tokens |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Revoke refresh token |

## Environment Variables

Create a `.env` file in each service. See `.env.example` for required variables.

## Project Structure
workos/
├── docker-compose.yml
├── api-gateway/
├── auth-service/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── schemas/
│       ├── services/
│       ├── types/
│       └── utils/
├── workspace-service/
├── tasks-service/
└── notification-service/

## Status

🚧 **In active development**

- [x] Project setup + Docker infrastructure
- [x] Auth Service — JWT authentication with refresh token rotation
- [ ] API Gateway — token verification + routing
- [ ] Workspace Service — multi-tenant workspaces
- [ ] Tasks Service — projects and tasks
- [ ] Notification Service — async email delivery

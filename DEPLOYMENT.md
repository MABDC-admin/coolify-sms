# School Compass Production Deployment

## Stack

- Bun runtime
- TanStack Start SSR app
- PostgreSQL 16
- Docker Compose

## First Deploy

```bash
cp .env.example .env
# Set POSTGRES_PASSWORD to a strong value.
docker compose build
docker compose up -d postgres
docker compose run --rm app bun run db:setup
docker compose up -d app
curl http://127.0.0.1:8089/api/health
```

## Runtime URLs

- App: `http://<host>:8089`
- Health: `http://<host>:8089/api/health`

## Database

Migrations live in `database/migrations`.
Seed data lives in `database/seeds`.

Run migrations after schema changes:

```bash
docker compose run --rm app bun run db:migrate
```

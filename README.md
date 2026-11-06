# Manual of Operations with an AI Assistant

## Requirements
- Node 20+, pnpm 9, Docker

## First time setup
```bash
cp .env.example .env        # fill in GOOGLE_GENERATIVE_AI_API_KEY
pnpm install
pnpm infra:up               # PostgreSQL with pgvector and Redis
pnpm --filter shared build
pnpm --filter api migrate:dev
pnpm dev:api                # http://localhost:3001/api/health  ·  /api/docs
pnpm dev:web                # http://localhost:3000
```

## Branch workflow
- `main`: production. Only code from `develop` gets merged here.
- `develop`: integration. Feature branches are created from here.
- `feature/HU<nn>-<short-description>`: one branch per user story, PR to `develop`, review from another team, and green CI.
# Scope - Interview Task

A template-based report generation system.

## Getting Started

```bash
pnpm install
pnpm dev
```

- **Frontend:** http://localhost:3000 (Next.js)
- **Backend:** http://localhost:3001 (NestJS)

## Project Structure

```
apps/
  web/src/           # Frontend (Next.js App Router)
  backend/src/       # Backend (NestJS)
    data/            # JSON file storage (templates & reports)
packages/
  shared/src/        # Shared TypeScript types used by both apps
```


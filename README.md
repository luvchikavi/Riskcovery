# Riscovery

Insurance Advisory Management System

## Tech Stack

- **Frontend**: Next.js 14, React 18, Material UI
- **Backend**: Fastify, Node.js 20
- **Database**: PostgreSQL (Supabase), Redis (Upstash)
- **ORM**: Prisma
- **Package Manager**: pnpm with Turborepo

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+
- Redis 7+

## Getting Started

1. **Install dependencies**

```bash
pnpm install
```

2. **Setup environment variables**

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Setup database**

```bash
pnpm db:generate
pnpm db:push
```

4. **Run development servers**

```bash
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:3001

## Project Structure

```
riscovery/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Fastify backend
├── packages/
│   ├── eslint-config/    # Shared ESLint config
│   ├── typescript-config/ # Shared TypeScript config
│   └── types/            # Shared TypeScript types
├── docs/             # Documentation
└── Riskcovery_docs/  # Project specifications
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers |
| `pnpm build` | Build all packages |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm test` | Run tests |
| `pnpm db:studio` | Open Prisma Studio |

## License

Private - LHD Insurance Consulting

# Project: Crypto Wallet Transaction Reporter

## Overview
Веб-приложение для генерации CSV-отчётов о транзакциях криптокошельков. Адрес → определение сети (Ethereum, Bitcoin, Tron, Arbitrum) → запрос транзакций через API сканеров → CSV.

**Users:** Криптоинвесторы (налоги), бухгалтеры (стандартизированные данные)
**Problem:** Нет единого инструмента для CSV-отчёта по кошельку в нескольких сетях

## Tech Stack
- **Frontend:** React 18 + Tailwind CSS
- **Backend:** Next.js 14+ App Router (API Routes)
- **Language:** TypeScript 5.x strict
- **Validation:** Zod
- **Encryption:** Web Crypto API (native) + IndexedDB (idb)
- **Container:** Docker → Coolify (VPS)
- **Testing:** Vitest + Playwright + MSW

## Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Main: address input, dates, generate
│   ├── settings/integrations/ # API keys UI
│   └── api/                # Route handlers
│       ├── detect-network/ # POST — validate + detect
│       ├── generate-report/# POST — fetch tx + CSV
│       ├── validate-key/   # POST — test API key
│       └── download/[id]/  # GET — stream CSV
├── components/             # React components
├── services/               # Business logic
│   ├── network-detection.ts
│   ├── report-generator.ts
│   ├── rate-limiter.ts
│   └── adapters/           # Per-network scanners
│       ├── types.ts        # BlockchainAdapter interface
│       ├── factory.ts      # AdapterFactory
│       ├── etherscan-v2.ts # ETH + Arbitrum (chainid)
│       ├── blockstream.ts  # Bitcoin UTXO
│       └── tronscan.ts     # Tron
├── lib/                    # Utilities
│   ├── encrypted-storage.ts# AES-GCM + IndexedDB
│   ├── csv-generator.ts
│   └── address-validators.ts
└── types/                  # TypeScript types
```

## Commands
```bash
npm run dev          # localhost:3000
npm run test         # Vitest
npm run test:e2e     # Playwright
npm run lint && npm run type-check && npm run test  # Pre-commit
npm run build        # Production
```

## Coding Conventions
- camelCase (vars), PascalCase (components/types), kebab-case (files)
- Named exports only (no default except pages)
- Zod schemas for ALL API inputs
- Result pattern for error handling, never unhandled throws

## Critical Rules
- **NEVER** store API keys on server or env vars — client-side encrypted only
- **NEVER** log API keys or sensitive data
- **ALWAYS** use Etherscan API v2 (v1 deprecated Aug 2025) with chainid
- **ALWAYS** rate limit with exponential backoff for scanner APIs
- **ALWAYS** handle Bitcoin UTXO model separately from account-based chains

## Key Patterns
1. **Adapter Pattern** — BlockchainAdapter interface: fetchPage(), normalize(), getNextCursor()
2. **Client-Side Encryption** — PBKDF2 → AES-GCM → IndexedDB. Decrypt in memory only.
3. **Pagination + Early Termination** — Stop when oldest tx < dateFrom
4. **Factory Pattern** — AdapterFactory.create(network) → correct adapter

## Parallel Execution Strategy
- Use `Task` tool for independent subtasks
- Run lint + type-check + test in parallel
- Adapters for different networks: develop in parallel
- For complex features: @planner breakdown → parallel agent implementation

## Agents
| Agent | Purpose | Trigger |
|-------|---------|---------|
| @planner | Feature decomposition | New features, complex tasks |
| @code-reviewer | Quality + security review | Before merge, security code |
| @tdd-guide | Test-driven development | Writing tests, coverage |

## Skills
- **project-context/** — Domain: networks, scanners, CSV format, encryption
- **coding-standards/** — Next.js + TS patterns
- **security-patterns/** — Client-side encryption patterns

## External Integrations
| Service | API | Key Storage |
|---------|-----|-------------|
| Etherscan v2 | REST (chainid=1,42161) | Client encrypted |
| Blockstream Esplora | REST | Optional |
| TronScan | REST | Client encrypted |

## Deployment
- Coolify on VPS, Docker multi-stage, port 3000
- Auto-deploy: push main → webhook → build → deploy
- Health: GET /api/health
- No server-side API keys

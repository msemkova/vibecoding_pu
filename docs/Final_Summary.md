# Crypto Wallet Transaction Reporter — Executive Summary

## Overview
Веб-приложение для генерации CSV-отчётов о транзакциях криптокошелька. Пользователь вводит адрес, система определяет сеть (Ethereum, Bitcoin, Tron, Arbitrum), запрашивает данные через API блокчейн-сканеров и формирует скачиваемый файл. Без регистрации, API ключи пользователя хранятся зашифрованными в его браузере.

## Problem & Solution
**Problem:** Получение отчёта о транзакциях требует ручной работы с разными сканерами в разных форматах.
**Solution:** Единый интерфейс: адрес → сеть → даты → CSV. Client-side encrypted хранение API ключей для безопасности.

## Target Users
- **Primary:** Криптоинвесторы (налоговая отчётность)
- **Secondary:** Бухгалтеры/аудиторы (стандартизированные данные)

## Key Features (MVP)
1. **Auto Network Detection** — определение сети по формату адреса
2. **Multi-Network Support** — Ethereum, Bitcoin, Tron, Arbitrum через единый интерфейс
3. **CSV Report** — унифицированный формат из 10 колонок
4. **Client-Side Encrypted Keys** — AES-GCM 256-bit, ключи никогда не покидают браузер
5. **Settings > Integrations** — удобное управление API ключами

## Technical Approach
- **Architecture:** Distributed Monolith (Next.js fullstack) в Monorepo
- **Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, Web Crypto API, Docker
- **Infrastructure:** VPS + Coolify (self-hosted PaaS)
- **Key Pattern:** Adapter pattern для сканеров, Strategy для нормализации

## Research Highlights
1. Etherscan v2 — единый API для ETH + Arbitrum через chainid параметр
2. Blockstream Esplora — open-source, пагинация по 25 tx, опциональный API key
3. Web Crypto API + IndexedDB — зрелый паттерн для client-side encryption
4. Coolify нативно поддерживает Next.js через Nixpacks или Dockerfile

## Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Report generation (< 5000 tx) | < 30 sec | MVP |
| Success rate | > 95% | MVP |
| Downloads / day | > 50 | Month 1 |
| Returning users | > 30% | Month 3 |

## Timeline & Phases

| Phase | Features | Timeline |
|-------|----------|----------|
| MVP | 4 сети, CSV, encrypted keys | 2–3 недели |
| v1.1 | +Polygon, BSC, Solana, Excel export | +2 недели |
| v2.0 | Auth, history, multi-address | +4 недели |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| API rate limits | Client keys + backoff + queue |
| Bitcoin UTXO complexity | Dedicated adapter + comprehensive tests |
| Browser storage cleared | Export/import backup, onboarding hints |

## Immediate Next Steps
1. Инициализировать monorepo: `npx create-next-app@latest crypto-reporter --typescript`
2. Имплементировать NetworkDetectionService + address validators
3. Создать EtherscanV2Adapter как первый адаптер
4. Реализовать EncryptedStorageService (Web Crypto + IndexedDB)
5. Собрать Docker образ и задеплоить на Coolify

## Documentation Package
| Document | Purpose |
|----------|---------|
| PRD.md | Product Requirements |
| Solution_Strategy.md | Problem Analysis (SCQA + TRIZ) |
| Specification.md | User Stories + API Contracts |
| Pseudocode.md | Algorithms + Data Flow |
| Architecture.md | System Design + Stack |
| Refinement.md | Edge Cases + Testing |
| Completion.md | Deployment + CI/CD |
| Research_Findings.md | Market & Tech Research |
| CLAUDE.md | AI Integration Guide |

---

*Generated with SPARC PRD Mini*

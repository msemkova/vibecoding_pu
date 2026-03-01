# Research Findings

## Executive Summary
Etherscan API v2 — единый endpoint для Ethereum и Arbitrum (chainid). V1 deprecated с августа 2025. Blockstream Esplora — open-source REST API для Bitcoin, пагинация по 25 tx, опционально платные планы. TronScan — REST API с документацией на docs.tronscan.org. Client-side encryption через Web Crypto API (AES-GCM + PBKDF2 + IndexedDB) — зрелый и проверенный паттерн. Next.js + Coolify — нативная поддержка деплоя через Nixpacks или Dockerfile.

## Research Objective
Определить оптимальный стек, API интеграции и паттерны безопасности для Crypto Wallet Transaction Reporter с учётом distributed monolith + Docker + Coolify.

---

## Technology Assessment

### Etherscan API v2
- **Status:** V1 полностью deprecated 15 августа 2025, только v2
- **Ключевое изменение:** Единый API key + `chainid` параметр для 60+ сетей
- **Rate limits (free):** ~5 calls/sec, 100K calls/day
- **Для Arbitrum:** Тот же endpoint, `chainid=42161`
- **Best practices:** Exponential backoff при 429, кэширование metadata, batch запросы
- **Reliability:** 5/5 (official documentation)

### Blockstream Esplora API
- **Endpoint:** `https://blockstream.info/api/`
- **Пагинация:** 25 tx per page, через `last_seen_txid`
- **Не требует API key** для базового использования
- **Платные планы:** Basic $40/mo (500K calls), Advanced $100-$2K/mo
- **Self-hostable:** Docker образ `blockstream/esplora`
- **Особенность Bitcoin:** UTXO модель — нужна специальная логика для IN/OUT
- **Reliability:** 5/5 (primary source)

### TronScan API
- **Docs:** `https://docs.tronscan.org/api-endpoints/transactions-and-transfers`
- **Endpoint:** REST API для списка транзакций
- **Rate limits:** Не жёсткие для бесплатного, но рекомендуются ключи
- **Reliability:** 4/5 (official docs)

### Next.js как fullstack решение
- **Обоснование:** API Routes заменяют отдельный backend, единый TypeScript, SSR не критичен
- **Coolify:** Нативная поддержка через Nixpacks или Dockerfile
- **Monorepo деплой:** Один ресурс в Coolify (fullstack), или два с разными Base Directory
- **Confidence:** High

### Client-Side Encryption Pattern
- **Web Crypto API:** AES-GCM 256-bit — стандарт, поддержка всех современных браузеров
- **PBKDF2:** 100K+ iterations для key derivation из пароля пользователя
- **IndexedDB:** Хранение зашифрованных blobs, master key только в памяти
- **Reference lib:** `@webcrypto/storage` — PBKDF2 + AES-GCM + IndexedDB, проверенная
- **Auto-lock:** Таймаут неактивности → очистка key из памяти
- **Reliability:** 5/5 (MDN, Web Crypto spec)

### Coolify Deployment
- **Next.js:** Поддержка через Nixpacks (auto-detect) или custom Dockerfile
- **Monorepo:** Base Directory + Watch Paths для selective redeploy
- **Auto-deploy:** GitHub webhook, preview deployments для PR
- **SSL:** Автоматический через Let's Encrypt
- **Confidence:** High

---

## Competitive Landscape

| Competitor | Strengths | Weaknesses | Differentiation |
|------------|-----------|------------|-----------------|
| Koinly | Полный PnL, налоговые отчёты | Платный ($49+/yr), сложный | Мы: бесплатный, простой CSV |
| CoinTracking | 13+ сетей, автоимпорт | Перегружен функциями | Мы: 1 задача, 0 регистрации |
| Etherscan Export | Точные данные | Только 1 сеть за раз | Мы: мультисеть в 1 отчёт |
| Blockchain.com Explorer | Bitcoin данные | Только Bitcoin | Мы: 4 сети |

---

## Confidence Assessment

**High confidence:**
- Etherscan v2 — единственный актуальный API (3+ sources, official docs)
- AES-GCM + PBKDF2 + IndexedDB — проверенный паттерн (MDN, npm libs, security articles)
- Coolify + Next.js работает из коробки (official docs + community guides)

**Medium confidence:**
- TronScan rate limits — документация менее детальная
- Blockstream pricing для high-volume — недавно обновили

**Low confidence:**
- Долгосрочная стабильность бесплатных тарифов Etherscan

---

## Sources

1. Etherscan API v2 Docs — https://docs.etherscan.io (Reliability: 5)
2. Etherscan V1 Deprecation Notice — https://info.etherscan.com (Reliability: 5)
3. Blockstream Esplora API — https://github.com/Blockstream/esplora/blob/master/API.md (Reliability: 5)
4. Blockstream Explorer API Blog — https://blog.blockstream.com (Reliability: 5)
5. TronScan API Docs — https://docs.tronscan.org (Reliability: 4)
6. MDN SubtleCrypto — https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto (Reliability: 5)
7. @webcrypto/storage npm — https://www.npmjs.com/package/@webcrypto/storage (Reliability: 3)
8. Coolify Next.js Docs — https://coolify.io/docs/applications/nextjs (Reliability: 5)
9. Coolify Monorepo Guide — https://coolify.io/docs/applications/ (Reliability: 5)

---

*Generated with GOAP Research (standard mode)*

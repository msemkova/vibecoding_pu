# Solution Strategy

## Problem Statement (SCQA)

- **Situation:** Владельцы криптовалют обязаны декларировать транзакции. Блокчейн-сканеры предоставляют данные, но каждый в своём формате.
- **Complication:** Нет единого инструмента, который бы дал CSV-отчёт по адресу кошелька в нескольких сетях. Существующие решения (Koinly, CoinTracking) избыточны и платны.
- **Question:** Как дать пользователю унифицированный отчёт без регистрации, серверного хранения ключей и сложной настройки?
- **Answer:** SPA с client-side encrypted хранением API ключей, Next.js API Routes как прокси к сканерам, генерация CSV на лету.

---

## First Principles Analysis

Фундаментальные истины:
1. Блокчейн — публичный реестр. Транзакции доступны по адресу через API.
2. Каждая сеть имеет свой формат адреса и API. Но формат конечен и детерминирован.
3. CSV — универсальный формат для бухгалтерии. Достаточно 10 колонок.
4. API ключи — единственный секрет. Его безопасность = безопасность приложения.

Вывод: Задача сводится к **маршрутизации** (адрес → нужный API) + **нормализации** (разные форматы → единый CSV) + **безопасности** (клиентское шифрование ключей).

---

## Root Cause Analysis (5 Whys)

1. **Почему** пользователи тратят время на отчёты? → Нужно работать с каждым сканером отдельно.
2. **Почему** с каждым отдельно? → Каждая сеть имеет свой сканер и формат данных.
3. **Почему** нет единого решения? → Существующие слишком сложные (PnL, портфели).
4. **Почему** они сложные? → Пытаются решить все проблемы сразу, а не одну.
5. **Root cause:** Отсутствие простого одноцелевого инструмента "адрес → CSV".

---

## Game Theory Analysis

| Player | Interest | Strategy |
|--------|----------|----------|
| User | Быстрый бесплатный отчёт | Использует наш сервис |
| Сканеры (Etherscan) | Монетизация API | Rate limits, платные планы |
| Конкуренты (Koinly) | Удержание платных пользователей | Добавляют фичи, усложняют |
| Налоговые органы | Прозрачность | Требуют отчёты |

**Nash equilibrium:** Мы предоставляем бесплатный инструмент с опцией пользовательских API ключей → пользователь получает value, сканеры получают трафик через пользовательские ключи, мы не несём расходов на API.

---

## Second-Order Effects

1. Пользователи с большим объёмом tx → добавят свои ключи → снижение нагрузки на наши rate limits
2. Бухгалтеры начнут рекомендовать сервис клиентам → органический рост
3. Формат CSV станет де-факто стандартом → возможность расширения на другие инструменты
4. Client-side encryption → пользователи доверяют больше → готовы вводить ключи → лучшая производительность API

---

## Contradictions Resolved (TRIZ)

| Contradiction | TRIZ Principle | Resolution |
|---------------|----------------|------------|
| Нужны API ключи для скорости, но хранить на сервере небезопасно | **Taking out** — извлечь серверное хранение | Client-side encryption: ключи только в браузере |
| Нужна поддержка 4 сетей, но каждая имеет свой формат | **Universality** — единый интерфейс | Adapter pattern: NetworkAdapter → normalize() |
| Отчёт должен быть быстрым, но API медленные | **Partial action** + **Dynamics** | Streaming pagination + progress bar |
| Бесплатный сервис, но API платные | **Self-service** — объект обслуживает себя | Пользователь приносит свои ключи |

---

## Recommended Approach

### Архитектурный подход: Distributed Monolith в Monorepo

**Next.js fullstack** с чёткими service boundaries:
- `NetworkDetectionService` — валидация и определение сети
- `BlockchainAdapterService` — адаптеры для каждого сканера (Strategy pattern)
- `ReportGeneratorService` — нормализация + CSV генерация
- `EncryptedStorageService` — client-side Web Crypto API

**Каждый сервис может быть извлечён** в отдельный контейнер при масштабировании → distributed monolith.

### Ключевые решения:
1. **Etherscan v2** с chainid для Ethereum + Arbitrum (один ключ!)
2. **Blockstream Esplora** для Bitcoin (без ключа для MVP)
3. **Client-side encryption** для всех API ключей (AES-GCM + PBKDF2)
4. **Docker + Coolify** для деплоя на VPS

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Etherscan rate limit exceeded | High | High | Client keys + exponential backoff + queue |
| Bitcoin UTXO parsing complexity | Med | Med | Dedicated Bitcoin adapter, comprehensive tests |
| Browser IndexedDB cleared | Low | Med | Export/import функция, onboarding hint |
| Etherscan v2 schema changes | Low | High | Integration tests, schema validation |
| Large reports (100k+ tx) timeout | Med | Med | Chunked processing, progress streaming |

---

*Generated with SPARC Problem Solver (9 modules + TRIZ)*

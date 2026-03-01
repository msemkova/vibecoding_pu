# Product Requirements Document

**Product:** Crypto Wallet Transaction Reporter  
**Version:** 1.0  
**Last Updated:** 2026-03-01  
**Status:** Approved

---

## 1. Executive Summary

### 1.1 Purpose
Веб-приложение для генерации CSV-отчётов о движении средств по адресу криптокошелька. Пользователь вводит адрес, система определяет блокчейн-сеть, запрашивает транзакции за указанный период и формирует скачиваемый файл.

### 1.2 Scope

**In Scope (MVP):**
- Поддержка сетей: Ethereum, Bitcoin, Tron, Arbitrum
- Автоопределение сети по формату адреса
- Получение транзакций через публичные API сканеров
- Фильтрация по диапазону дат
- Генерация и скачивание CSV-отчёта
- Client-side encrypted хранение API ключей сканеров
- Settings > Integrations UI для управления ключами

**Out of Scope (MVP):**
- NFT, DeFi-позиции, PnL
- Авторизация и история отчётов
- Приватные ноды

### 1.3 Definitions

| Term | Definition |
|------|------------|
| EVM | Ethereum Virtual Machine — совместимые сети |
| CSV | Comma-Separated Values — формат отчёта |
| UTXO | Unspent Transaction Output — модель Bitcoin |

---

## 2. Product Vision

### 2.1 Vision Statement
> Самый быстрый способ получить унифицированный отчёт о транзакциях криптокошелька для налогов, бухгалтерии и аудита — без регистрации.

### 2.2 Problem Statement
**Problem:** Получение отчёта о транзакциях требует работы с разными сканерами, понимания форматов данных и ручной обработки.
**Impact:** Часы ручного труда, ошибки, пропущенные транзакции.
**Current Solutions:** Etherscan/TronScan вручную; Koinly/CoinTracking (избыточно для простого отчёта).

### 2.3 Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Время генерации (< 5000 tx) | < 30 сек | MVP |
| Успешные генерации | > 95% | MVP |
| Скачиваний / день | > 50 | Месяц 1 |
| Повторные пользователи | > 30% | Месяц 3 |

---

## 3. Target Users

### 3.1 Primary: Crypto Holder
| Attribute | Description |
|-----------|-------------|
| Role | Физлицо, владеющее криптовалютой |
| Goals | Быстро получить отчёт для налоговой |
| Pain Points | Разные форматы сканеров |
| Tech Level | Medium |

### 3.2 Secondary: Accountant / Auditor
| Attribute | Description |
|-----------|-------------|
| Role | Бухгалтер, обрабатывающий крипто-операции |
| Goals | Стандартизированный CSV для импорта |
| Tech Level | Low-Medium |

---

## 4. Functional Requirements

### 4.1 Address Validation & Network Detection

```gherkin
Feature: Address Validation

  Scenario: Valid Ethereum address
    Given user enters "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18"
    When system validates the address
    Then network is detected as "Ethereum"

  Scenario: Valid Bitcoin address (Bech32)
    Given user enters "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4"
    When system validates the address
    Then network is detected as "Bitcoin"

  Scenario: Invalid address
    Given user enters "invalid_address"
    When system validates
    Then error "Неверный формат адреса" is shown

  Scenario: Unsupported network
    Given user enters a Solana address
    When system validates
    Then error "Сеть не поддерживается" is shown
```

### 4.2 Report Generation

```gherkin
Feature: Report Generation

  Scenario: Successful generation
    Given validated Ethereum address and date range "2025-01-01" to "2025-06-01"
    When user clicks "Сформировать отчёт"
    Then system fetches transactions, filters by dates, generates CSV

  Scenario: No transactions
    Given valid address with no tx in range
    When report generates
    Then message "Транзакции не найдены" shown

  Scenario: Date range > 1 year
    Given date range exceeds 1 year
    When user selects dates
    Then warning about possible delay shown
```

### 4.3 API Keys Management (Client-Side Encrypted)

```gherkin
Feature: API Key Management

  Scenario: Add API key
    Given user opens Settings > Integrations
    When enters Etherscan API key and clicks "Проверить"
    Then key validated, encrypted AES-GCM 256-bit, stored in IndexedDB

  Scenario: Use stored key
    Given saved Etherscan key exists
    When generating Ethereum report
    Then key decrypted in memory, used for API, never sent to backend
```

### 4.4 CSV Structure

| Column | Format | Example |
|--------|--------|---------|
| Date | ISO 8601 UTC | 2025-01-15T14:30:00Z |
| Tx Hash | String | 0xabc... |
| Direction | IN / OUT | IN |
| From | Address | 0x123... |
| To | Address | 0x456... |
| Amount | Decimal | 1.5 |
| Token | Symbol | ETH |
| Network | String | Ethereum |
| Fee | Decimal (native) | 0.002 |
| Tx URL | URL | https://etherscan.io/tx/... |

---

## 5. Non-Functional Requirements

### Performance
| Metric | Requirement |
|--------|-------------|
| Report generation (< 5000 tx) | < 30 sec |
| Page load | < 2 sec |
| Network detection | < 500ms |

### Security
| Requirement | Implementation |
|-------------|----------------|
| API key encryption | AES-GCM 256-bit, Web Crypto API |
| Key derivation | PBKDF2 100k+ iterations |
| Storage | IndexedDB encrypted blobs only |
| Server-side keys | NEVER — keys stay in browser |

---

## 6. Integration Requirements

| Scanner | API | Key Required | Rate Limit (free) |
|---------|-----|---|---|
| Etherscan v2 | REST, chainid param | Yes | 5 req/sec |
| Arbiscan (via Etherscan v2) | REST, chainid=42161 | Yes (same key) | 5 req/sec |
| Blockstream Esplora | REST | No (optional) | 25 tx/page |
| TronScan | REST | Optional | Varies |

---

## 7. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API rate limits | High | High | Client keys, queue, retry with backoff |
| Etherscan v2 breaking changes | Low | High | Version pinning, integration tests |
| 100k+ tx timeout | Med | Med | Pagination, streaming, progress bar |
| User loses encryption password | Med | Med | Export/import backup |

---

*Generated with SPARC PRD Mini*

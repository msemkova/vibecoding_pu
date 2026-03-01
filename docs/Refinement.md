# Refinement

## Edge Cases Matrix

| Scenario | Input | Expected | Handling |
|----------|-------|----------|----------|
| Empty address | "" | Validation error | "Введите адрес кошелька" |
| Address with spaces | " 0x742d... " | Trim and validate | Auto-trim |
| Mixed case EVM | "0x742D35CC..." | Valid, case-insensitive | toLowerCase before compare |
| Bitcoin legacy + Bech32 | "1A1zP1..." / "bc1q..." | Both supported | Regex covers both |
| Tron address starting with T | "T9yD14..." | Valid Tron | Regex /^T[a-zA-Z0-9]{33}$/ |
| EVM address on multiple networks | "0x742d..." exists on ETH and Arbitrum | Detect primary (ETH first) | Sequential check, first hit wins |
| Address with 0 transactions | Valid but empty | "Транзакции не найдены" | Friendly message |
| 100k+ transactions | Valid with many tx | Paginated fetch with progress | Chunked processing + timeout guard |
| Date range inverted | from > to | Validation error | "Дата начала должна быть раньше" |
| Same start and end date | from === to | Single day query | Filter within UTC day |
| Future date | dateTo > today | Validation error | "Дата не может быть в будущем" |
| Date range > 1 year | 366+ days | Warning + proceed | Warning banner, allow generation |
| Scanner API timeout | Network issue | Retry with backoff | 3 retries, then error message |
| Rate limit hit (429) | Too many requests | Queue + retry | Exponential backoff, suggest own key |
| Invalid API key | Wrong key format | Validation error | "Недействительный API ключ" |
| Expired API key | Previously valid | API error | Prompt to update in Settings |
| Browser clears IndexedDB | Storage wiped | Keys lost | Prompt to re-enter, suggest backup |
| Concurrent report requests | User spams button | Single request limit | Disable button during generation |
| Transaction with 0 value | Smart contract call | Include with amount "0" | Show in report |
| Token transfer (ERC-20) | Not native ETH | Different API endpoint | EtherscanV2 `tokentx` action |
| Bitcoin self-transfer | Same address in+out | Both IN and OUT shown | Separate rows for clarity |

---

## Testing Strategy

### Unit Tests (Target: 90% coverage of services)

| Module | Test Focus | Tools |
|--------|-----------|-------|
| Address validators | All formats, edge cases | Vitest |
| Network detection | Regex matching, API fallback | Vitest + MSW |
| Blockchain adapters | Normalize, pagination, UTXO | Vitest + MSW |
| CSV generator | Headers, escaping, encoding | Vitest |
| Encrypted storage | Encrypt/decrypt cycle, error handling | Vitest + fake IndexedDB |
| Rate limiter | Queue, backoff, concurrency | Vitest |

### Integration Tests

| Flow | What to Test |
|------|-------------|
| Detect → Generate → Download | Full happy path with mocked scanner |
| Rate limit recovery | 429 → retry → success |
| Multi-page pagination | 3+ pages of transactions |
| Bitcoin UTXO direction | Correct IN/OUT detection |

### E2E Tests (Playwright)

```gherkin
Feature: Full Report Generation

  Scenario: Happy path — Ethereum report
    Given user is on main page
    When user enters valid Ethereum address
    And clicks "Определить сеть"
    Then "Ethereum" badge appears
    When user selects date range "2025-01-01" to "2025-06-01"
    And clicks "Сформировать отчёт"
    Then progress bar appears
    And CSV download becomes available
    When user clicks download
    Then file is downloaded with correct headers

  Scenario: Settings — Add API key
    Given user navigates to Settings > Integrations
    When user selects "Etherscan"
    And enters API key
    And enters encryption password
    And clicks "Сохранить"
    Then success message shown
    And key is masked (••••)

  Scenario: Error — Invalid address
    Given user is on main page
    When user enters "not_an_address"
    And clicks "Определить сеть"
    Then error message "Неверный формат адреса" shown
```

### Performance Tests

| Test | Threshold | Tool |
|------|-----------|------|
| Page load (LCP) | < 2s | Lighthouse CI |
| Report generation (1000 tx) | < 15s | Custom benchmark |
| Report generation (5000 tx) | < 30s | Custom benchmark |
| Encryption/decryption cycle | < 200ms | Vitest |
| CSV generation (10k rows) | < 500ms | Vitest benchmark |

---

## Performance Optimizations

### 1. Parallel Adapter Queries (future)
Для мультисетевых отчётов — параллельные запросы к разным сканерам.

### 2. Early Date Termination
Прекращение pagination когда все оставшиеся транзакции старше dateFrom.

### 3. Streaming CSV
Генерация CSV по мере получения страниц, без ожидания всех данных.

### 4. Client-Side Caching
Кэш результатов сети для адреса (5 мин TTL) чтобы избежать повторных API вызовов при корректировке дат.

### 5. Rate Limiter with Token Bucket
```
Etherscan: 5 tokens/sec, burst 5
Blockstream: no limit (but respect server)
TronScan: 3 tokens/sec, burst 3
```

---

## Security Hardening

### Input Validation
- Все входные данные валидируются через Zod schemas
- Address: strict regex per network
- Dates: ISO format, max range check
- API keys: format check per scanner

### CSP Headers
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  connect-src 'self' https://api.etherscan.io https://blockstream.info https://apilist.tronscanapi.com;
  style-src 'self' 'unsafe-inline';
```

### Rate Limiting (Server-Side)
- 10 report generations per IP per minute
- 30 network detections per IP per minute

### Dependency Security
- `npm audit` в CI pipeline
- Dependabot alerts
- Минимум зависимостей (Web Crypto native, no crypto libs)

---

## Accessibility (a11y)

- WCAG 2.1 Level AA
- Keyboard navigation для всех форм
- Screen reader labels для input полей
- Progress bar с `aria-valuenow`
- Error messages связаны с полями через `aria-describedby`
- Color contrast ratio > 4.5:1

---

## Technical Debt Items

| Item | Severity | When to Address |
|------|----------|----------------|
| ERC-20 token transfers not in MVP | Med | v1.1 |
| No caching layer | Low | v1.1 (Redis) |
| Single file temp storage | Med | v2.0 (object storage) |
| No retry UI (auto only) | Low | v1.1 |
| No multi-language support | Low | v2.0 |

---

*Generated with SPARC Refinement phase*

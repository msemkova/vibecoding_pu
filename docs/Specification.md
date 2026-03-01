# Specification

## User Stories

### Epic: Address Input & Network Detection

| ID | As a... | I want to... | So that... | Priority | Effort |
|----|---------|--------------|------------|----------|--------|
| US-001 | User | Ввести адрес кошелька | Система определит сеть | Must | S |
| US-002 | User | Видеть ошибку при неверном формате | Исправлю адрес | Must | S |
| US-003 | User | Видеть название определённой сети | Подтвержу правильность | Must | S |

### Epic: Report Generation

| ID | As a... | I want to... | So that... | Priority | Effort |
|----|---------|--------------|------------|----------|--------|
| US-004 | User | Выбрать диапазон дат | Получу отчёт за период | Must | S |
| US-005 | User | Нажать "Сформировать отчёт" | Система создаст CSV | Must | L |
| US-006 | User | Видеть прогресс генерации | Знал сколько ждать | Should | M |
| US-007 | User | Получить предупреждение при > 1 год | Знал о задержке | Should | S |

### Epic: File Download

| ID | As a... | I want to... | So that... | Priority | Effort |
|----|---------|--------------|------------|----------|--------|
| US-008 | User | Скачать CSV по клику на иконку | Получил файл | Must | S |
| US-009 | User | Видеть имя и размер файла | Знал что скачиваю | Must | S |

### Epic: API Keys Management

| ID | As a... | I want to... | So that... | Priority | Effort |
|----|---------|--------------|------------|----------|--------|
| US-010 | User | Ввести свой API ключ Etherscan | Обойду rate limits | Must | M |
| US-011 | User | Видеть маску ключа (••••) | Мой ключ защищён | Must | S |
| US-012 | User | Проверить работоспособность ключа | Знал что валиден | Should | M |
| US-013 | User | Удалить/обновить ключ | Управлял интеграциями | Should | S |
| US-014 | User | Экспортировать/импортировать ключи | Backup при смене браузера | Could | M |

---

## Feature Matrix

| Feature | MVP | v1.1 | v2.0 |
|---------|-----|------|------|
| Ethereum support | ✅ | ✅ | ✅ |
| Bitcoin support | ✅ | ✅ | ✅ |
| Tron support | ✅ | ✅ | ✅ |
| Arbitrum support | ✅ | ✅ | ✅ |
| Network detection | ✅ | ✅ | ✅ |
| CSV generation | ✅ | ✅ | ✅ |
| Client-side encrypted keys | ✅ | ✅ | ✅ |
| Progress indicator | ✅ | ✅ | ✅ |
| Polygon, BSC, Solana | ❌ | ✅ | ✅ |
| Excel export | ❌ | ✅ | ✅ |
| Multi-address report | ❌ | ❌ | ✅ |
| User auth + history | ❌ | ❌ | ✅ |
| NFT transactions | ❌ | ❌ | ✅ |

---

## Non-Functional Requirements

### Performance
| Metric | Requirement | Measurement |
|--------|-------------|-------------|
| Report generation (< 5000 tx) | < 30 sec | End-to-end timer |
| Page load (LCP) | < 2 sec | Lighthouse |
| Network detection | < 500ms | API response time |
| CSV download start | < 1 sec after generation | User-perceived |

### Availability
| Metric | Requirement |
|--------|-------------|
| Uptime | 99.5% |
| RTO | 1 hour |
| RPO | N/A (no stored data) |

### Security
| Requirement | Implementation |
|-------------|----------------|
| API key encryption | AES-GCM 256-bit |
| Key derivation | PBKDF2 100k+ iterations |
| Key storage | IndexedDB (encrypted only) |
| Master key | In memory only, auto-lock on timeout |
| Input sanitization | Zod schema validation |
| XSS prevention | React DOM escaping + CSP headers |
| No server-side secrets | API keys never leave browser |

### Browser Support
| Browser | Min Version |
|---------|-------------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Edge | 90+ |

---

## API Contracts

### POST /api/detect-network
```
Request: { address: string }
Response (200): { network: "ethereum" | "bitcoin" | "tron" | "arbitrum", valid: true }
Response (400): { error: "INVALID_FORMAT", message: "Неверный формат адреса" }
Response (400): { error: "UNSUPPORTED_NETWORK", message: "Сеть не поддерживается" }
```

### POST /api/generate-report
```
Request: {
  address: string,
  network: "ethereum" | "bitcoin" | "tron" | "arbitrum",
  dateFrom: "YYYY-MM-DD",
  dateTo: "YYYY-MM-DD",
  apiKey?: string  // encrypted, decrypted client-side before sending
}
Response (200): {
  fileUrl: "/api/download/{id}",
  fileName: "report_0x742d_2025-01-01_2025-06-01.csv",
  fileSize: "1.2MB",
  txCount: 1234
}
Response (429): { error: "RATE_LIMIT", message: "Превышен лимит API" }
Response (404): { error: "NO_TRANSACTIONS", message: "Транзакции не найдены" }
```

### GET /api/download/{id}
```
Response: CSV file stream
Headers: Content-Disposition: attachment; filename="report_...csv"
```

### POST /api/validate-key
```
Request: { network: string, apiKey: string }
Response (200): { valid: true, plan: "free" }
Response (401): { valid: false, message: "Invalid API key" }
```

---

*Generated with SPARC Specification phase*

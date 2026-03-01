# Development Guide: Crypto Wallet Transaction Reporter

## Обзор инструментов

| Инструмент | Тип | Назначение |
|------------|-----|------------|
| CLAUDE.md | Context | Главный контекст проекта для Claude Code |
| planner.md | Agent | Планирование и декомпозиция фич |
| code-reviewer.md | Agent | Ревью кода и безопасности |
| tdd-guide.md | Agent | TDD workflow и тестирование |
| project-context/ | Skill | Домен: сети, сканеры, CSV, шифрование |
| coding-standards/ | Skill | Next.js + TypeScript паттерны |
| security-patterns/ | Skill | Client-side encryption реализация |
| /plan | Command | Планирование фичи |
| /test | Command | Запуск тестов |
| /deploy | Command | Деплой на Coolify |
| git-workflow.md | Rule | Коммит конвенции |
| security.md | Rule | Правила безопасности |
| coding-style.md | Rule | Стиль кода |
| testing.md | Rule | Правила тестирования |
| secrets-management.md | Rule | Управление API ключами |
| .mcp.json | MCP | GitHub интеграция |

---

## Этапы разработки и какие инструменты использовать

### 🚀 Этап 1: Старт проекта

1. Инициализируй проект:
   ```bash
   npx create-next-app@latest crypto-reporter --typescript --tailwind --app --src-dir
   cd crypto-reporter
   ```

2. Распакуй оба архива в корень:
   ```bash
   unzip crypto-reporter-docs.zip -d ./docs
   unzip crypto-reporter-cc-toolkit.zip -d ./
   ```

3. Первый коммит:
   ```bash
   git init
   git add .
   git commit -m "chore: initial project setup with SPARC docs and CC toolkit"
   ```

4. Изучи CLAUDE.md — это главный контекст для Claude Code.

5. Установи зависимости:
   ```bash
   npm install zod idb
   npm install -D vitest @testing-library/react msw playwright
   ```

6. Коммит:
   ```bash
   git add .
   git commit -m "chore: add project dependencies"
   ```

---

### 🏗️ Этап 2: Планирование фичи

**Команды:** `/plan [feature]`
**Agents:** `@planner`
**Когда:** Перед началом каждой новой фичи

Пример:
```
/plan address-validation-and-network-detection
```

Planner выдаст:
- Список атомарных задач с оценкой сложности
- Зависимости между задачами
- Возможности для параллельного выполнения
- План коммитов

**Рекомендуемый порядок фич для MVP:**
1. Address validators + Network detection service
2. EtherscanV2 adapter (ETH + Arbitrum)
3. Blockstream adapter (Bitcoin UTXO)
4. TronScan adapter
5. Report generator + CSV
6. Frontend: main page (AddressInput, DateRangePicker, GenerateButton)
7. Encrypted storage service (Web Crypto + IndexedDB)
8. Settings > Integrations UI
9. Docker + Coolify deployment

---

### 💻 Этап 3: Реализация

**Agents:** `@planner` (декомпозиция), `@tdd-guide` (тесты)
**Skills:** `project-context/`, `coding-standards/`, `security-patterns/`
**Rules:** `coding-style.md`, `security.md`

Практики:

- **Используй Task tool для параллельных подзадач:**
  - Адаптеры для разных сетей — независимы, пиши параллельно
  - Тесты и реализация одного модуля — можно параллельно
  - lint + type-check + test — запускай одновременно

- **Коммить после каждого логического изменения:**
  ```bash
  git commit -m "feat(adapter): add EtherscanV2 adapter with chainid support"
  git commit -m "feat(adapter): add Blockstream adapter for Bitcoin UTXO"
  git commit -m "feat(report): implement CSV generator with escaping"
  ```

- **Для security-sensitive кода (encryption, keys):**
  - Сначала прочитай `security-patterns/SKILL.md`
  - После реализации — обязательно `@code-reviewer` для ревью

---

### 🧪 Этап 4: Тестирование

**Команды:** `/test [scope]`
**Agents:** `@tdd-guide`
**Rules:** `testing.md`

Практики:

- Запускай тесты параллельно с линтингом:
  ```bash
  npm run lint & npm run type-check & npm run test
  ```

- Коммить тесты отдельно:
  ```bash
  git commit -m "test(adapter): add unit tests for EtherscanV2 normalize"
  git commit -m "test(crypto): add encryption/decryption cycle tests"
  git commit -m "test(csv): add escaping tests for special characters"
  ```

- Приоритетные тесты:
  1. Address validators — все форматы
  2. Blockchain adapters — normalize, pagination, Bitcoin UTXO direction
  3. CSV generator — escaping, unicode, empty data
  4. Encrypted storage — cycle, wrong password, corruption
  5. Rate limiter — queue, backoff timing

---

### 🔍 Этап 5: Code Review

**Agents:** `@code-reviewer`
**Когда:** Перед мержем / завершением фичи

```
@code-reviewer review src/services/adapters/
@code-reviewer check security for encryption module
```

Reviewer проверит:
- Security: нет ли утечки ключей, правильное шифрование
- Correctness: Bitcoin UTXO, CSV format, date filtering
- Code Quality: TypeScript strict, Zod validation, naming
- Tests: покрытие, edge cases

---

### 🚢 Этап 6: Деплой

**Команды:** `/deploy [env]`
**MCP:** GitHub (через .mcp.json)

Практики:

1. **Dev → Staging → Prod:**
   ```bash
   git push origin develop     # → staging auto-deploy
   git push origin main        # → production auto-deploy
   ```

2. **Pre-deploy checklist** (автоматизирован в /deploy):
   - lint ✅
   - type-check ✅
   - tests ✅
   - docker build ✅

3. **Тегируй релизы:**
   ```bash
   git tag v1.0.0
   git push --tags
   ```

4. **Coolify настройка:**
   - Build Pack: Dockerfile
   - Port: 3000
   - Health Check: /api/health
   - Auto Deploy: enabled
   - Environment: NODE_ENV=production

---

### 🔐 Этап 7: Настройка интеграций (для end-users)

**Где:** Settings > Integrations в UI приложения
**Когда:** При первом использовании фичи или заранее в Settings
**Skills:** `security-patterns/`
**Rules:** `secrets-management.md`

**UX Flow для пользователя:**

1. Открыть Settings > Integrations
2. Выбрать нужный сервис (Etherscan, Blockstream, TronScan)
3. Ввести API ключ (поле с маской)
4. Задать пароль шифрования
5. Нажать "Проверить" для валидации
6. Сохранить (ключ зашифруется автоматически)

**Безопасность:**
- Ключи хранятся только в браузере пользователя
- Зашифрованы AES-GCM 256-bit
- Никогда не отправляются на сервер для хранения
- Auto-lock после 15 мин неактивности

---

## Swarm Agents: когда использовать

| Сценарий | Agents | Параллелизм |
|----------|--------|-------------|
| Новый адаптер для сети | @planner → @tdd-guide + implementation | Да (тесты + код) |
| Большая фича (Settings UI) | @planner → 2-3 implementation tasks | Да |
| Security review | @code-reviewer | Нет |
| Рефакторинг адаптеров | @code-reviewer + parallel refactor | Да |
| Баг-фикс одного адаптера | 1 agent | Нет |

---

## Git Workflow

```
feat(scope): description   — новая функциональность
fix(scope): description    — баг-фикс
refactor(scope): desc      — рефакторинг
test(scope): description   — тесты
docs(scope): description   — документация
chore(scope): description  — инфраструктура
```

**Scopes:** network, adapter, report, crypto, ui, api, infra

**Правило:** 1 логическое изменение = 1 коммит

---

## Чеклист перед завершением сессии

- [ ] Все тесты проходят (`npm run test`)
- [ ] Линтинг чист (`npm run lint`)
- [ ] Типы проверены (`npm run type-check`)
- [ ] Code review пройден (`@code-reviewer`)
- [ ] Изменения закоммичены с правильными сообщениями
- [ ] README обновлён (если нужно)
- [ ] Settings > Integrations UI реализован (если есть внешние API)
- [ ] Encrypted storage для ключей работает и протестирован

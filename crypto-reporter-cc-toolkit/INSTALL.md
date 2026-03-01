# Installation Guide

## Quick Start

1. **Распакуй архив** в корень проекта:
   ```bash
   unzip crypto-reporter-cc-toolkit.zip -d ./
   ```

2. **Проверь структуру:**
   ```
   your-project/
   ├── CLAUDE.md              # Главный контекст для Claude Code
   ├── .claude/
   │   ├── agents/
   │   │   ├── planner.md
   │   │   ├── code-reviewer.md
   │   │   └── tdd-guide.md
   │   ├── skills/
   │   │   ├── project-context/SKILL.md
   │   │   ├── coding-standards/SKILL.md
   │   │   └── security-patterns/SKILL.md
   │   ├── commands/
   │   │   ├── plan.md
   │   │   ├── test.md
   │   │   └── deploy.md
   │   └── rules/
   │       ├── git-workflow.md
   │       ├── security.md
   │       ├── coding-style.md
   │       ├── testing.md
   │       └── secrets-management.md
   └── .mcp.json              # MCP конфигурация (GitHub)
   ```

3. **Настрой MCP (опционально):**
   - Добавь GitHub token в `.mcp.json`

4. **Первый коммит:**
   ```bash
   git init
   git add .
   git commit -m "chore: initial project setup with Claude Code toolkit"
   ```

5. **Начни работу:**
   ```
   /plan address-validation      # Планирование фичи
   @planner implement CSV generator  # Декомпозиция задачи
   @code-reviewer check security  # Ревью безопасности
   ```

## Инструменты

| Тип | Файл | Назначение |
|-----|------|------------|
| Agent | planner.md | Планирование и декомпозиция фич |
| Agent | code-reviewer.md | Ревью кода и безопасности |
| Agent | tdd-guide.md | TDD workflow |
| Skill | project-context/ | Доменные знания проекта |
| Skill | coding-standards/ | Стандарты кода Next.js + TS |
| Skill | security-patterns/ | Паттерны шифрования |
| Command | /plan | Планирование фичи |
| Command | /test | Запуск тестов |
| Command | /deploy | Деплой чеклист |
| Rule | git-workflow.md | Git конвенции |
| Rule | security.md | Правила безопасности |
| Rule | coding-style.md | Стиль кода |
| Rule | testing.md | Правила тестирования |
| Rule | secrets-management.md | Управление ключами |
| MCP | .mcp.json | GitHub интеграция |

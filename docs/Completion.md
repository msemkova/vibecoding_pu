# Completion

## Deployment Plan

### Pre-Deployment Checklist
- [ ] All tests passing (unit, integration, e2e)
- [ ] Lighthouse score > 90 (performance)
- [ ] Security headers configured (CSP, HSTS)
- [ ] Docker build succeeds locally
- [ ] Environment variables set in Coolify
- [ ] Domain configured with SSL
- [ ] Health check endpoint responds

### Deployment Sequence

1. **Push to GitHub** → `main` branch
2. **Coolify webhook** triggers auto-build
3. **Nixpacks/Dockerfile** builds image
4. **Health check** passes → traffic switched
5. **Smoke test** — manual generation of test report

### Rollback Procedure
1. Coolify UI → Application → Deployments
2. Click "Rollback" on previous successful deployment
3. Verify health check passes
4. Notify team

---

## CI/CD Configuration

### GitHub Actions (pre-Coolify build)
```yaml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### Coolify Auto-Deploy
- **Trigger:** Push to `main` branch
- **Build:** Dockerfile
- **Port:** 3000
- **Health Check:** `GET /api/health` → 200

---

## Monitoring & Alerting

### Key Metrics

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Response time p99 | > 1000ms | Warning |
| Report generation time p99 | > 45s | Critical |
| Error rate (5xx) | > 2% | Critical |
| Uptime | < 99.5% | Critical |
| Memory usage | > 80% | Warning |
| Disk usage (/tmp/reports) | > 70% | Warning |

### Health Check Endpoint
```typescript
// /api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  })
}
```

### Logging Strategy

| Level | When | Example |
|-------|------|---------|
| INFO | Successful operations | "Report generated: 1234 tx, 15s" |
| WARN | Recoverable issues | "Rate limit hit, retrying in 2s" |
| ERROR | Failed operations | "Etherscan API error: 502" |
| DEBUG | Development only | "Fetching page 3 for 0x742d..." |

**Format:** JSON structured logs
```json
{
  "level": "info",
  "timestamp": "2026-03-01T12:00:00Z",
  "message": "Report generated",
  "meta": {
    "network": "ethereum",
    "txCount": 1234,
    "duration": 15000,
    "address": "0x742d...bD18"
  }
}
```

**Retention:** 30 days (stdout → Coolify logs)

---

## Temporary File Cleanup

```typescript
// Cron-like cleanup every 10 minutes
setInterval(() => {
  const tmpDir = '/tmp/reports'
  const files = fs.readdirSync(tmpDir)
  const now = Date.now()
  files.forEach(file => {
    const stat = fs.statSync(path.join(tmpDir, file))
    if (now - stat.mtimeMs > 10 * 60 * 1000) { // 10 min TTL
      fs.unlinkSync(path.join(tmpDir, file))
    }
  })
}, 10 * 60 * 1000)
```

---

## Handoff Checklists

### For Development Team
- [ ] Clone monorepo
- [ ] `npm install`
- [ ] `npm run dev` starts at localhost:3000
- [ ] Read CLAUDE.md for project context
- [ ] Review Architecture.md for component map
- [ ] Set up test Etherscan API key

### For QA Team
- [ ] Access staging deployment URL
- [ ] Test addresses for each network (ETH, BTC, TRX, ARB)
- [ ] Test edge cases from Refinement.md
- [ ] Test Settings > Integrations flow

### For Operations
- [ ] Coolify admin access
- [ ] VPS SSH access for emergency
- [ ] Understand rollback process
- [ ] Monitor /api/health endpoint

---

*Generated with SPARC Completion phase*

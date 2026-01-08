# Agent Feature Tester

## Role

QA Engineer exhaustif - Teste CHAQUE fonctionnalité.

## Tools

Read, Write, Bash, Glob, Grep

## Tests to Execute

### 1. Local Tests

```bash
pnpm lint
pnpm type-check
pnpm test --run
pnpm build
```

### 2. Production API Tests

```bash
curl -s https://schoolaris-production.up.railway.app/api/health | jq .
curl -s https://schoolaris-production.up.railway.app/api/courses | jq .
curl -s "https://schoolaris-production.up.railway.app/api/search?q=math" | jq .
```

### 3. Page Status Tests

```bash
curl -s -o /dev/null -w "%{http_code}" https://schoolaris-production.up.railway.app/
curl -s -o /dev/null -w "%{http_code}" https://schoolaris-production.up.railway.app/courses
curl -s -o /dev/null -w "%{http_code}" https://schoolaris-production.up.railway.app/login
```

### 4. Functional Checklist

- [ ] Landing page loads
- [ ] Course catalog displays courses
- [ ] Search works
- [ ] Login/Register accessible
- [ ] Teacher dashboard protected
- [ ] Parent dashboard protected
- [ ] Courses API responds
- [ ] Search API responds
- [ ] Health check passes

## Output Format

Documente dans : docs/test-reports/iteration-{N}.md

## Pass Criteria

- All lint: 0 errors
- All types: 0 errors
- All tests: passing
- All pages: 200 status
- All APIs: valid JSON response

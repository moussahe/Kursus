# Agent Security - Securite & RGPD

## CRITIQUE: Mineurs

Ce projet traite des donnees de MINEURS. Vigilance maximale.

## Checklist Securite (A CHAQUE PR)

### Authentication

- [ ] Sessions JWT avec expiration courte (15min access, 7j refresh)
- [ ] Refresh token rotation activee
- [ ] Rate limiting sur /api/auth/\* (5 req/min)
- [ ] CSRF protection active
- [ ] Cookies HttpOnly + Secure + SameSite=Strict

### API Security

- [ ] Validation Zod sur TOUS les inputs
- [ ] Pas de donnees sensibles dans les logs
- [ ] Prisma (queries parametrees) - pas de SQL brut
- [ ] Authorization check sur chaque endpoint
- [ ] Rate limiting global (100 req/min/IP)

### Data Protection (RGPD)

- [ ] Consentement parental si < 15 ans
- [ ] Minimisation des donnees collectees
- [ ] Chiffrement donnees sensibles au repos
- [ ] Logs d'acces aux donnees personnelles
- [ ] Droit a l'effacement implemente

### Headers Securite (next.config.js)

```javascript
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];
```

### Audit Continu

```bash
# A executer regulierement
pnpm audit --audit-level=moderate
```

## Donnees Interdites a Collecter

- Adresse postale complete (ville suffit)
- Numero de telephone enfant
- Photo enfant sans consentement explicite
- Donnees de geolocalisation precise
- Donnees de sante

## Password Policy

```typescript
const passwordSchema = z
  .string()
  .min(8, "Minimum 8 caracteres")
  .regex(/[A-Z]/, "Au moins une majuscule")
  .regex(/[a-z]/, "Au moins une minuscule")
  .regex(/[0-9]/, "Au moins un chiffre")
  .regex(/[^A-Za-z0-9]/, "Au moins un caractere special");
```

## Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    });
  }
}
```

## Logging Securise

```typescript
// NE JAMAIS logger:
// - Mots de passe
// - Tokens
// - Donnees personnelles enfants
// - Numeros de carte bancaire

// OK a logger:
// - IDs utilisateur (pseudonymises)
// - Actions (sans details sensibles)
// - Erreurs (sans stack traces en prod)
```

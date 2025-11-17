# Security Documentation

## OWASP Top 10 (2021) Mitigation Checklist

This document outlines how this NestJS application addresses each of the OWASP Top 10 security risks.

### ✅ A01:2021 - Broken Access Control

**Mitigations Implemented:**
- ✅ JWT-based authentication with secure token generation
- ✅ Role-Based Access Control (RBAC) using guards (`RolesGuard`, `PermissionsGuard`)
- ✅ Request validation at controller level
- ✅ User session management with refresh tokens
- ✅ Token revocation via blacklist (refresh token stored in DB)
- ✅ Proper authorization checks in service layer
- ✅ Rate limiting on sensitive endpoints (login, password reset)

**Code References:**
- `src/auth/common/guards/roles.guard.ts`
- `src/auth/common/guards/permissions.guard.ts`
- `src/auth/strategy/jwt.strategy.ts`

---

### ✅ A02:2021 - Cryptographic Failures

**Mitigations Implemented:**
- ✅ Passwords hashed with bcrypt (cost factor: 12)
- ✅ JWT tokens with secure signing algorithms (HS256)
- ✅ Sensitive data encrypted at rest (database-level encryption recommended)
- ✅ HTTPS enforcement in production (Helmet + secure cookies)
- ✅ Environment variables for secrets (never hardcoded)
- ✅ Secrets validation on application startup

**Code References:**
- `src/auth/auth.service.ts` (bcrypt hashing)
- `src/config/env.config.ts` (secret validation)
- `src/main.ts` (Helmet security headers)

**Recommendations:**
- Use AWS Secrets Manager or HashiCorp Vault for production secrets
- Enable TLS 1.3 on load balancer/reverse proxy
- Implement database-level encryption for PII data

---

### ✅ A03:2021 - Injection

**Mitigations Implemented:**
- ✅ Prisma ORM (parameterized queries by default)
- ✅ Input validation using `class-validator` with DTOs
- ✅ Global ValidationPipe with `whitelist` and `forbidNonWhitelisted`
- ✅ Zod schemas for additional validation layers
- ✅ No raw SQL queries (all via Prisma)
- ✅ Command injection prevention (no shell execution of user input)

**Code References:**
- `src/main.ts` (Global ValidationPipe configuration)
- `src/auth/dto/*.dto.ts` (DTO validation)
- `src/prisma/prisma.service.ts` (Prisma client)

**Best Practices:**
- Always use DTOs with validation decorators
- Never concatenate user input into queries
- Validate and sanitize file uploads

---

### ✅ A04:2021 - Insecure Design

**Mitigations Implemented:**
- ✅ Rate limiting on all endpoints (global throttler)
- ✅ Brute-force protection on auth endpoints (failed login tracking)
- ✅ Account lockout after multiple failed attempts
- ✅ Email verification before account activation
- ✅ Two-factor authentication (2FA) support
- ✅ Secure password reset flow with OTP
- ✅ Password complexity requirements
- ✅ Health checks for monitoring and alerting

**Code References:**
- `src/app.module.ts` (ThrottlerModule)
- `src/auth/auth.service.ts` (brute-force protection)
- `src/health/health.controller.ts` (health checks)

---

### ✅ A05:2021 - Security Misconfiguration

**Mitigations Implemented:**
- ✅ Helmet.js for security headers
- ✅ CORS properly configured (origin whitelist)
- ✅ Error messages sanitized in production
- ✅ No stack traces exposed to clients
- ✅ Dependencies regularly updated (Dependabot)
- ✅ Security scanning in CI/CD (Snyk, Trivy)
- ✅ Non-root Docker user
- ✅ Read-only filesystem in container (where applicable)

**Code References:**
- `src/main.ts` (Helmet, CORS, error handling)
- `Dockerfile` (security best practices)
- `.github/workflows/ci.yml` (security scanning)

**Production Checklist:**
- [ ] Disable Swagger in production
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets (min 32 characters)
- [ ] Enable HTTPS only
- [ ] Configure proper CORS origins

---

### ✅ A06:2021 - Vulnerable and Outdated Components

**Mitigations Implemented:**
- ✅ Dependabot for automated dependency updates
- ✅ `pnpm audit` in CI/CD pipeline
- ✅ Snyk security scanning
- ✅ Trivy container image scanning
- ✅ Regular dependency updates (weekly schedule)
- ✅ Lock file (`pnpm-lock.yaml`) committed
- ✅ Only necessary dependencies installed

**Code References:**
- `.github/dependabot.yml`
- `.github/workflows/ci.yml`

**Maintenance:**
```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities automatically
pnpm audit --fix

# Update dependencies
pnpm update
```

---

### ✅ A07:2021 - Identification and Authentication Failures

**Mitigations Implemented:**
- ✅ Strong password requirements (min 8 chars, complexity)
- ✅ Multi-factor authentication (2FA via OTP)
- ✅ Session management with JWT + refresh tokens
- ✅ Secure password reset with time-limited OTPs
- ✅ Account lockout after failed attempts
- ✅ Login attempt logging with IP/user-agent
- ✅ HttpOnly and Secure cookies for tokens
- ✅ OAuth integration (Google, Facebook)

**Code References:**
- `src/auth/auth.service.ts` (authentication logic)
- `src/auth/dto/register.user.dto.ts` (password validation)

**Security Features:**
- Password hashing with bcrypt (cost factor: 12)
- OTP expiration (10 minutes)
- Refresh token rotation
- JWT expiration (access: 1 day, refresh: 7 days)

---

### ✅ A08:2021 - Software and Data Integrity Failures

**Mitigations Implemented:**
- ✅ Lock file for reproducible builds
- ✅ Docker image signed and scanned
- ✅ CI/CD pipeline integrity (GitHub Actions)
- ✅ Database migrations tracked in version control
- ✅ Environment variable validation on startup
- ✅ No auto-deserialization of untrusted data
- ✅ Audit logging for critical actions

**Code References:**
- `prisma/migrations/` (migration history)
- `src/config/env.config.ts` (environment validation)
- `src/auth/common/services/audit.service.ts` (audit logging)

---

### ✅ A09:2021 - Security Logging and Monitoring Failures

**Mitigations Implemented:**
- ✅ Structured logging with Pino
- ✅ Request/response logging with correlation IDs
- ✅ Sensitive data redaction in logs
- ✅ Sentry for error tracking
- ✅ Health check endpoints for monitoring
- ✅ Login attempt tracking
- ✅ Audit trail for sensitive operations
- ✅ Prometheus metrics (recommended)

**Code References:**
- `src/app.module.ts` (Pino logger configuration)
- `src/main.ts` (Sentry integration)
- `src/health/health.controller.ts` (health checks)

**Recommended Integrations:**
- [ ] Prometheus + Grafana for metrics
- [ ] ELK Stack for log aggregation
- [ ] PagerDuty/Opsgenie for alerting

---

### ✅ A10:2021 - Server-Side Request Forgery (SSRF)

**Mitigations Implemented:**
- ✅ No server-side URL fetching based on user input
- ✅ Whitelist approach for external API calls
- ✅ OAuth callbacks validated against allowed URLs
- ✅ Network segmentation in Docker/K8s
- ✅ Egress filtering recommended in production

**Code References:**
- `src/auth/strategy/google.strategy.ts` (OAuth with verified providers)
- `src/config/env.config.ts` (URL validation)

**Best Practices:**
- Never allow user input in server-side HTTP requests
- Use allowlists for external APIs
- Validate and sanitize redirect URLs
- Implement network-level egress filtering

---

## Additional Security Measures

### Content Security Policy (CSP)
- Helmet.js configured with CSP headers
- CSP disabled in development for ease of use
- Production CSP should be customized based on frontend needs

### Rate Limiting
- Global rate limit: 100 requests per 60 seconds
- Auth endpoint limit: 5 requests per 15 minutes (login, register)
- Configurable via environment variables

### Session Security
- HttpOnly cookies prevent XSS attacks
- Secure flag ensures HTTPS-only transmission
- SameSite attribute prevents CSRF
- Token rotation on refresh

### Database Security
- Prisma prevents SQL injection by default
- Connection pooling configured
- Prepared statements used exclusively
- Least-privilege database user recommended

---

## Security Incident Response

### Suspected Breach
1. Immediately rotate all secrets (JWT, API keys, database passwords)
2. Review audit logs for suspicious activity
3. Force logout all users (invalidate tokens)
4. Investigate and patch vulnerability
5. Notify affected users if PII compromised

### Reporting Security Issues
Please report security vulnerabilities to: security@yourdomain.com

**Do not** open public GitHub issues for security vulnerabilities.

---

## Security Checklist for Production Deployment

- [ ] All environment variables set and validated
- [ ] Strong JWT secret (min 32 random characters)
- [ ] Database user has least privileges
- [ ] Sentry DSN configured for error tracking
- [ ] HTTPS enforced (no HTTP allowed)
- [ ] CORS origins restricted to known domains
- [ ] Rate limiting enabled and tested
- [ ] Swagger disabled (`NODE_ENV=production`)
- [ ] Dependencies audited and up-to-date
- [ ] Secrets stored in vault (not in code or env files)
- [ ] Logging configured and monitored
- [ ] Backup and disaster recovery plan in place
- [ ] Security headers verified (use securityheaders.com)
- [ ] Container image scanned for vulnerabilities
- [ ] Kubernetes security context configured (non-root)
- [ ] Network policies applied (restrict egress)

---

## Regular Security Maintenance

### Weekly
- Review Dependabot PRs and merge updates
- Check for new CVEs affecting dependencies
- Review failed login attempts

### Monthly
- Conduct security dependency audit
- Review and update access control lists
- Test backup restoration process
- Review Sentry error reports

### Quarterly
- Penetration testing (internal or third-party)
- Security training for development team
- Review and update security policies
- Conduct threat modeling exercise

---

**Last Updated:** 2025-01-29  
**Next Review:** 2025-04-29

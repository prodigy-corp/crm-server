# NestJS Production-Ready Starter Kit

A battle-tested, production-ready NestJS starter kit with authentication, authorization, observability, and deployment configurations following industry best practices.

## 🚀 Features

### Core Features
- ✅ **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - OAuth integration (Google, Facebook, Apple)
  - Two-factor authentication (2FA)
  - Role-based access control (RBAC)
  - Permission-based authorization
  
- ✅ **Security**
  - Helmet.js for security headers
  - CORS configuration
  - Rate limiting (global + endpoint-specific)
  - Brute-force protection
  - Input validation with class-validator
  - SQL injection prevention (Prisma ORM)
  - XSS protection
  - OWASP Top 10 mitigation

- ✅ **Observability**
  - Structured logging with Pino
  - Error tracking with Sentry
  - Health checks (liveness/readiness)
  - Request correlation IDs
  - Audit logging

- ✅ **Database**
  - Prisma ORM with PostgreSQL
  - Database migrations
  - Connection pooling
  - Seed data support

- ✅ **Caching**
  - Redis integration
  - Cache invalidation strategies

- ✅ **API Documentation**
  - OpenAPI/Swagger documentation
  - API versioning (v1, v2, etc.)
  - DTO validation examples

- ✅ **DevOps**
  - Production-ready Dockerfile (multi-stage)
  - Docker Compose for local development
  - Kubernetes manifests (Deployment, Service, HPA, ConfigMap, Secret)
  - CI/CD pipeline (GitHub Actions)
  - Automated security scanning
  - Dependency updates (Dependabot)

---

## 📋 Prerequisites

- Node.js 20+ 
- pnpm 9+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (for containerized setup)

---

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/nestjs-starter-kit.git
cd nestjs-starter-kit
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

**Critical Environment Variables:**

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT Secrets (MUST be changed in production)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-min-32-characters-long

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Application
NODE_ENV=development
PORT=8000
APP_CLIENT_URL=http://localhost:3000
```

### 4. Database Setup

```bash
# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database (optional)
pnpm prisma:seed
```

---

## 🚀 Running the Application

### Development Mode

```bash
pnpm start:dev
```

The application will be available at:
- API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/api/docs`
- Health Check: `http://localhost:8000/api/health`

### Production Mode

```bash
# Build
pnpm build

# Start
pnpm start:prod
```

### Docker Compose (Recommended for Local Development)

```bash
# Start all services (app, postgres, redis)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov

# Watch mode
pnpm test:watch
```

---

## 📝 Code Quality

```bash
# Linting
pnpm lint

# Lint check (without fixing)
pnpm lint:check

# Format code
pnpm format

# Type checking
pnpm typecheck
```

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t nestjs-app:latest .
```

### Run Container

```bash
docker run -d \
  --name nestjs-app \
  -p 8000:8000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:password@host:5432/db \
  -e JWT_SECRET=your-secret \
  nestjs-app:latest
```

---

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (v1.27+)
- kubectl configured
- Container registry access

### Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace nestjs-app

# Apply configurations
kubectl apply -f k8s/configmap.yaml -n nestjs-app
kubectl apply -f k8s/secret.yaml -n nestjs-app
kubectl apply -f k8s/deployment.yaml -n nestjs-app
kubectl apply -f k8s/service.yaml -n nestjs-app
kubectl apply -f k8s/hpa.yaml -n nestjs-app

# Check deployment status
kubectl get pods -n nestjs-app
kubectl logs -f deployment/nestjs-app -n nestjs-app
```

### Update Secrets

```bash
# Create secret from env file
kubectl create secret generic nestjs-secrets \
  --from-literal=database-url=postgresql://user:password@host:5432/db \
  --from-literal=jwt-secret=your-jwt-secret \
  --from-literal=refresh-token-secret=your-refresh-secret \
  -n nestjs-app
```

---

## 📊 Database Migrations

### Create Migration

```bash
pnpm prisma migrate dev --name your_migration_name
```

### Deploy Migrations (Production)

```bash
pnpm prisma:migrate:deploy
```

### Reset Database (Development Only)

```bash
pnpm prisma migrate reset
```

### Prisma Studio (Database GUI)

```bash
pnpm prisma:studio
```

---

## 📖 API Documentation

### Accessing Swagger

In development mode, Swagger UI is available at:
```
http://localhost:8000/api/docs
```

### Export OpenAPI Spec

The OpenAPI specification is automatically generated. To export:

```bash
# Start the application and visit
curl http://localhost:8000/api/docs-json > openapi.json
```

### API Versioning

The API uses URI versioning:
- v1 endpoints: `/api/v1/*`
- Default version: `v1`

---

## 🔒 Security

### Production Security Checklist

Before deploying to production, ensure:

- [ ] All secrets are rotated (never use example values)
- [ ] JWT_SECRET is at least 32 random characters
- [ ] HTTPS is enforced
- [ ] CORS origins are restricted
- [ ] Rate limiting is enabled
- [ ] Swagger is disabled (`NODE_ENV=production`)
- [ ] Database user has least privileges
- [ ] Environment variables are validated
- [ ] Sentry DSN is configured
- [ ] Security headers are verified
- [ ] Container runs as non-root user

See [SECURITY.md](./SECURITY.md) for complete OWASP Top 10 mitigation details.

---

## 📈 Monitoring & Observability

### Health Checks

- **Liveness Probe:** `/api/health/liveness`
- **Readiness Probe:** `/api/health/readiness`
- **Full Health Check:** `/api/health`

### Logging

Structured JSON logs are written to stdout. In development, logs are pretty-printed.

**Log Levels:** `error`, `warn`, `info`, `debug`

Configure via `LOG_LEVEL` environment variable.

### Error Tracking

Sentry integration for error tracking:

```bash
# Set in .env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Metrics (Recommended)

Integrate Prometheus for metrics:
- Request rate
- Response time
- Error rate
- Database connection pool status

---

## 🔧 Configuration

### Environment Variables

All configuration is managed through environment variables. See `.env.example` for all available options.

**Required Variables:**
- `DATABASE_URL`
- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`

**Optional but Recommended:**
- `SENTRY_DSN`
- `REDIS_HOST`
- `CORS_ORIGIN`

### Validation

Environment variables are validated on startup using Zod schemas. Invalid configuration will prevent the application from starting.

---

## 🚦 CI/CD Pipeline

### GitHub Actions

The CI/CD pipeline runs on every push and PR:

1. **Lint & Format Check**
2. **Unit & E2E Tests**
3. **Security Scanning** (npm audit, Snyk)
4. **Build & Push Docker Image**
5. **Container Vulnerability Scan** (Trivy)

### Required Secrets

Configure these in GitHub repository settings:

```
REGISTRY_URL          # Container registry URL
REGISTRY_USERNAME     # Registry username
REGISTRY_PASSWORD     # Registry password
SNYK_TOKEN           # Snyk API token (optional)
```

---

## 📦 Dependency Management

### Update Dependencies

```bash
# Check for updates
pnpm outdated

# Update dependencies
pnpm update

# Update specific package
pnpm update @nestjs/core
```

### Security Audit

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit --fix
```

### Automated Updates

Dependabot is configured to:
- Check for updates weekly
- Create PRs for dependency updates
- Group related updates (e.g., @nestjs/*)

---

## 🏗️ Project Structure

```
nestjs-starter-kit/
├── .github/
│   ├── workflows/
│   │   └── ci.yml              # CI/CD pipeline
│   └── dependabot.yml          # Dependency updates config
├── k8s/
│   ├── deployment.yaml         # K8s deployment
│   ├── service.yaml            # K8s service
│   ├── configmap.yaml          # K8s config
│   ├── secret.yaml.example     # K8s secrets (example)
│   └── hpa.yaml                # Horizontal Pod Autoscaler
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Seed data
├── src/
│   ├── auth/                   # Authentication module
│   ├── config/                 # Configuration
│   ├── health/                 # Health checks
│   ├── prisma/                 # Prisma service
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Application entry point
├── test/                       # E2E tests
├── .env.example                # Environment variables template
├── .dockerignore               # Docker ignore rules
├── docker-compose.yml          # Docker Compose config
├── Dockerfile                  # Production Dockerfile
├── package.json                # Dependencies & scripts
├── SECURITY.md                 # Security documentation
└── README.md                   # This file
```

---

## 🤝 Contributing

### Development Workflow

1. Create a feature branch
2. Make changes
3. Run tests and linting
4. Commit with conventional commits
5. Push and create PR

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation update
chore: maintenance task
test: add/update tests
refactor: code refactoring
```

### Pre-commit Hooks

Husky runs linting and formatting before each commit:
- ESLint (auto-fix)
- Prettier (auto-format)

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

#### Prisma Client Not Generated
```bash
pnpm prisma:generate
```

#### Database Connection Error
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check network connectivity

#### Redis Connection Error
- Verify Redis is running
- Check REDIS_HOST and REDIS_PORT

---

## 📞 Support

- **Documentation:** [docs/](./docs/)
- **Issues:** [GitHub Issues](https://github.com/your-org/nestjs-starter-kit/issues)
- **Security:** security@yourdomain.com
- **Discussions:** [GitHub Discussions](https://github.com/your-org/nestjs-starter-kit/discussions)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Pino](https://getpino.io/) - Fast logging
- [Helmet](https://helmetjs.github.io/) - Security headers

---

**Built with ❤️ by Your Team**

**Last Updated:** 2025-01-29

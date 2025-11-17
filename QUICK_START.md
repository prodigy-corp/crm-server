# 🚀 Quick Start Guide

Get your NestJS production-ready application running in 5 minutes!

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+ (or use Docker Compose)
- Redis 7+ (or use Docker Compose)

---

## Option 1: Docker Compose (Recommended)

### 1. Setup Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your preferred editor
# At minimum, set strong JWT secrets
```

### 2. Start All Services

```bash
# Start app, postgres, and redis
docker-compose up -d

# View logs
docker-compose logs -f app

# Check status
docker-compose ps
```

### 3. Access the Application

- **API:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/api/docs
- **Health Check:** http://localhost:8000/api/health

### 4. Stop Services

```bash
docker-compose down

# Remove volumes (cleans database)
docker-compose down -v
```

---

## Option 2: Local Development

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment

```bash
# Copy example env file
cp .env.example .env
```

### 3. Configure Database

Edit `.env` and set your PostgreSQL connection:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nestjs_dev?schema=public
```

Or start PostgreSQL with Docker:

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nestjs_dev \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. Configure Redis

Start Redis with Docker:

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

Or install locally and ensure it's running.

### 5. Generate Prisma Client & Run Migrations

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate:deploy

# Seed database (optional)
pnpm prisma:seed
```

### 6. Start Development Server

```bash
pnpm start:dev
```

### 7. Access the Application

- **API:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/api/docs
- **Health Check:** http://localhost:8000/api/health

---

## 🔑 Default Credentials (After Seeding)

**Admin User:**
- Email: `admin@example.com`
- Password: `Admin@123456`

**Test User:**
- Email: `user@example.com`
- Password: `Test@123456`

⚠️ **IMPORTANT:** Change these passwords in production!

---

## 🧪 Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

---

## 📝 Common Commands

```bash
# Development
pnpm start:dev          # Start with hot reload
pnpm start:debug        # Start with debug mode

# Building
pnpm build              # Build for production
pnpm start:prod         # Start production build

# Code Quality
pnpm lint               # Lint and fix
pnpm lint:check         # Lint without fixing
pnpm format             # Format with Prettier
pnpm typecheck          # TypeScript type checking

# Database
pnpm prisma:generate    # Generate Prisma client
pnpm prisma:migrate     # Create and run migration
pnpm prisma:migrate:deploy  # Run migrations (prod)
pnpm prisma:studio      # Open Prisma Studio GUI
pnpm prisma:seed        # Seed database

# Testing
pnpm test               # Run unit tests
pnpm test:watch         # Run tests in watch mode
pnpm test:cov           # Run tests with coverage
pnpm test:e2e           # Run E2E tests
```

---

## 🔧 Environment Variables (Required)

Minimum required variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT Secrets (GENERATE NEW ONES!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-min-32-characters-long

# Application
NODE_ENV=development
PORT=8000
APP_CLIENT_URL=http://localhost:3000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Generate Secure Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate refresh token secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Prisma Client Not Found

```bash
pnpm prisma:generate
```

### Database Connection Error

1. Ensure PostgreSQL is running
2. Verify `DATABASE_URL` in `.env`
3. Check network connectivity

```bash
# Test PostgreSQL connection
docker exec -it postgres psql -U postgres -d nestjs_dev
```

### Redis Connection Error

1. Ensure Redis is running
2. Verify `REDIS_HOST` and `REDIS_PORT` in `.env`

```bash
# Test Redis connection
docker exec -it redis redis-cli ping
# Should respond: PONG
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📖 Next Steps

1. **Explore API:** Visit http://localhost:8000/api/docs
2. **Review Security:** Read `SECURITY.md`
3. **Check Production Guide:** Read `README.production.md`
4. **Review Audit Report:** Read `PRODUCTION_READINESS_REPORT.md`
5. **Write Tests:** Add tests for your modules
6. **Configure CI/CD:** Set up GitHub Actions secrets

---

## 🤝 Getting Help

- **Documentation:** Check `README.production.md`
- **Security:** Read `SECURITY.md`
- **Issues:** Review `PRODUCTION_READINESS_REPORT.md`

---

**Happy Coding! 🎉**

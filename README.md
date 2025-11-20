# 🚀 NestJS Production-Ready Starter Kit

A comprehensive, production-ready NestJS backend with authentication, authorization, real-time features, and enterprise-grade best practices.

## ✨ Key Features

- 🔐 **Complete Authentication System** - JWT, OAuth (Google/Facebook/Apple), 2FA, Email Verification
- 🛡️ **Advanced Security** - Rate limiting, CORS, Helmet, input validation, SQL injection protection
- 📧 **Email & Notifications** - Nodemailer, BullMQ queues, WebSocket real-time updates
- 🗄️ **Database Ready** - Prisma ORM with PostgreSQL, migrations, seeding, soft deletes
- 👥 **RBAC System** - Role-based and permission-based access control
- ⏰ **Automated Cronjobs** - Attendance tracking, salary generation, reports (10 scheduled tasks)
- 📊 **Analytics & Tracking** - Google Analytics 4, Facebook Pixel, server-side event tracking
- 📈 **Monitoring** - Pino logger, Sentry error tracking, health checks
- 🐳 **DevOps Ready** - Docker, Kubernetes configs, CI/CD workflows
- 🧪 **Testing Setup** - Jest, E2E tests, code coverage
- 📚 **Auto-Generated API Docs** - Swagger/OpenAPI integration

## 📖 Description

Enterprise-grade [NestJS](https://github.com/nestjs/nest) starter kit with all the essentials for building scalable, secure, and maintainable applications.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.x
- PostgreSQL >= 14.x
- Redis (optional, for caching/queues)

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed  # Optional: seed with sample data
```

### Run the Application

```bash
# Development (with hot reload)
pnpm start:dev

# Production
pnpm build
pnpm start:prod

# Debug mode
pnpm start:debug
```

**Access Points:**

- API: `http://localhost:8000/api`
- Swagger Docs: `http://localhost:8000/api/docs`
- Health Check: `http://localhost:8000/api/health`

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

## 🐳 Docker Deployment

```bash
# Build Docker image
docker build -t nestjs-app .

# Run container
docker run -p 8000:8000 --env-file .env nestjs-app

# Using Docker Compose (includes PostgreSQL & Redis)
docker-compose up -d
```

## ☸️ Kubernetes

```bash
# Apply Kubernetes configs
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl logs -f deployment/nestjs-app
```

## 📚 Documentation

- **Detailed Guide**: See [README.DEV.md](./README.DEV.md) for comprehensive documentation
- **Analytics Setup**: See [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md) for tracking configuration
- **Cronjob Documentation**: See [CRONJOB_DOCUMENTATION.md](./CRONJOB_DOCUMENTATION.md) for automated tasks
- **Cronjob Summary**: See [CRONJOB_SUMMARY.md](./CRONJOB_SUMMARY.md) for quick reference
- **API Documentation**: Available at `/api/docs` when running in development
- **NestJS Docs**: [https://docs.nestjs.com](https://docs.nestjs.com)
- **Prisma Docs**: [https://www.prisma.io/docs](https://www.prisma.io/docs)

## 🏗️ Project Structure

```
src/
├── analytics/         # Analytics & tracking (GA4, Facebook Pixel)
├── auth/              # Authentication & authorization
├── common/            # Shared utilities, guards, interceptors
├── config/            # Environment configuration
├── cron/              # Automated scheduled tasks (cronjobs)
├── email/             # Email service with templates
├── health/            # Health check endpoints
├── notification/      # WebSocket notifications
├── prisma/            # Database ORM setup
└── main.ts           # Application entry point
```

## 🔐 Environment Variables

Required variables (see `.env.example` for all options):

```env
# Core
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key-minimum-32-characters
NODE_ENV=development

# Optional but recommended
REDIS_HOST=localhost
REDIS_PORT=6379
COOKIE_DOMAIN=yourdomain.com  # For production
SENTRY_DSN=your-sentry-dsn     # For error tracking
```

## 📦 Available Scripts

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `pnpm start:dev`      | Start development server with hot reload |
| `pnpm build`          | Build for production                     |
| `pnpm start:prod`     | Run production build                     |
| `pnpm lint`           | Lint code with ESLint                    |
| `pnpm format`         | Format code with Prettier                |
| `pnpm test`           | Run unit tests                           |
| `pnpm test:e2e`       | Run end-to-end tests                     |
| `pnpm prisma:studio`  | Open Prisma Studio (DB GUI)              |
| `pnpm prisma:migrate` | Run database migrations                  |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is MIT licensed.

## 🙏 Acknowledgments

Built with [NestJS](https://nestjs.com) - A progressive Node.js framework

---

**⭐ If you find this starter kit helpful, please consider giving it a star!**

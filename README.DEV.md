# NestJS Production-Ready Starter Kit 🚀

A fully-featured, production-ready NestJS starter kit with authentication, authorization, database integration, and best practices built-in.

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT Authentication** with access and refresh tokens
- **OAuth Integration** (Google, Facebook, Apple)
- **Email Verification** with OTP
- **Two-Factor Authentication (2FA)**
- **Password Reset** functionality
- **Role-Based Access Control (RBAC)**
- **Permission-Based Authorization**

### 🗄️ Database & ORM
- **Prisma ORM** with PostgreSQL
- **Global PrismaService** with connection pooling
- **Database migrations** and seeding
- **Soft deletes** support
- **Audit logging** for tracking changes

### 🛡️ Security
- **Helmet** for security headers
- **Rate Limiting** with Redis-backed throttling
- **CORS** configuration
- **Cookie security** (httpOnly, secure, sameSite)
- **Input validation** with class-validator and Zod
- **SQL injection protection** via Prisma
- **XSS protection**

### 📧 Email & Notifications
- **Nodemailer** integration for emails
- **BullMQ** for background job processing
- **Email templates** for OTP, password reset, etc.
- **WebSocket notifications** with Socket.IO
- **Real-time updates** via Redis Pub/Sub

### 📊 Monitoring & Logging
- **Pino Logger** for structured logging
- **Sentry** integration for error tracking
- **Health checks** (liveness, readiness)
- **Request/Response logging**
- **Performance monitoring**

### 🚀 DevOps Ready
- **Docker** multi-stage builds
- **Kubernetes** deployment configs
- **GitHub Actions** CI/CD workflows
- **Environment validation** with Zod
- **Production optimizations**

### 🧪 Testing & Quality
- **Jest** for unit and integration tests
- **E2E tests** with Supertest
- **Code coverage** reports
- **ESLint** configuration
- **Prettier** formatting
- **Husky** pre-commit hooks
- **TypeScript strict mode**

## 📋 Prerequisites

- **Node.js** >= 20.x
- **pnpm** >= 9.x
- **PostgreSQL** >= 14.x
- **Redis** >= 6.x (optional, for caching and queues)
- **Docker** (optional, for containerization)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd nestjs-starter-kit

# Install dependencies
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - DATABASE_URL
# - JWT_SECRET
# - REDIS_HOST (if using Redis features)
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database (optional)
pnpm prisma:seed
```

### 4. Run the Application

```bash
# Development mode with hot reload
pnpm start:dev

# Production mode
pnpm build
pnpm start:prod
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

Swagger documentation is automatically available in development mode:

- **Swagger UI**: `http://localhost:8000/api/docs`
- **Health Check**: `http://localhost:8000/api/health`

## 🔧 Configuration

### Environment Variables

All environment variables are validated using Zod schema. See `.env.example` for all available options.

#### Required Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
```

#### Optional Features
```env
# Redis (for caching, queues, rate limiting)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (for OTP, notifications)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@yourapp.com

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

# Cookie Domain (for production)
COOKIE_DOMAIN=yourdomain.com

# Sentry (error tracking)
SENTRY_DSN=your-sentry-dsn
```

## 🏗️ Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── dto/               # Data transfer objects
│   ├── guards/            # Auth guards
│   ├── strategy/          # Passport strategies
│   └── types/             # TypeScript types
├── common/                # Shared utilities
│   ├── decorators/        # Custom decorators
│   ├── dto/               # Common DTOs
│   ├── exceptions/        # Exception filters
│   ├── guards/            # Authorization guards
│   ├── interceptors/      # Response interceptors
│   ├── middleware/        # Custom middleware
│   ├── pipes/             # Validation pipes
│   └── services/          # Common services
├── config/                # Configuration files
├── email/                 # Email module
├── health/                # Health check module
├── notification/          # Notification module
├── prisma/                # Prisma ORM setup
└── main.ts               # Application entry point
```

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

### Build and Run

```bash
# Build image
docker build -t nestjs-app .

# Run container
docker run -p 8000:8000 --env-file .env nestjs-app
```

### Docker Compose

```bash
# Start all services (app + postgres + redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☸️ Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/nestjs-app
```

## 📦 Scripts

```bash
# Development
pnpm start:dev          # Start with hot reload
pnpm start:debug        # Start with debug mode

# Production
pnpm build              # Build the application
pnpm start:prod         # Start production build

# Database
pnpm prisma:generate    # Generate Prisma client
pnpm prisma:migrate     # Run migrations
pnpm prisma:studio      # Open Prisma Studio
pnpm prisma:seed        # Seed database

# Code Quality
pnpm lint               # Run ESLint
pnpm format             # Format with Prettier
pnpm typecheck          # TypeScript type checking

# Testing
pnpm test               # Run unit tests
pnpm test:e2e           # Run E2E tests
pnpm test:cov           # Generate coverage report
```

## 🔐 Authentication Flow

### Registration
1. User registers with email/password
2. System sends OTP to email
3. User verifies email with OTP
4. Account activated

### Login
1. User logs in with credentials
2. If 2FA enabled, OTP sent to email
3. User verifies OTP
4. Access and refresh tokens issued

### OAuth Flow
1. User clicks "Login with Google/Facebook"
2. OAuth provider authenticates
3. System creates/finds user
4. Tokens issued automatically

## 🛡️ Security Best Practices

### Implemented
- ✅ JWT tokens with expiration
- ✅ Refresh token rotation
- ✅ Rate limiting per endpoint
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ Password hashing with bcrypt
- ✅ Secure cookie configuration
- ✅ Environment variable validation

### Recommendations
- Use strong JWT secrets (32+ characters)
- Enable HTTPS in production
- Configure COOKIE_DOMAIN in production
- Set up proper CORS origins
- Regular dependency updates
- Monitor error logs with Sentry
- Regular security audits

## 📈 Performance Optimizations

- **Database Connection Pooling** via Prisma
- **Response Caching** with Redis
- **Compression** middleware
- **Lazy Loading** modules
- **Database Indexing** on frequently queried fields
- **Query Optimization** with Prisma select
- **Multi-stage Docker Build** for smaller images

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is [MIT licensed](LICENSE).

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🎯 Roadmap

- [ ] GraphQL support
- [ ] File upload with AWS S3
- [ ] Payment integration (Stripe)
- [ ] Multi-tenancy support
- [ ] Advanced RBAC with dynamic permissions
- [ ] Real-time chat module
- [ ] Notification preferences
- [ ] API versioning strategy

## ⚡ Performance Tips

1. **Database Queries**: Always use `select` to fetch only needed fields
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Indexing**: Add database indexes for searchable fields
4. **Pagination**: Always paginate large result sets
5. **Async Operations**: Use queues for heavy operations
6. **Connection Pooling**: Configure appropriate pool size in Prisma

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check DATABASE_URL format
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# Test connection
pnpm prisma db push
```

### Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping

# Verify REDIS_HOST and REDIS_PORT
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=3001
```

---

**Built with ❤️ using NestJS**

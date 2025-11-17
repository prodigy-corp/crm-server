# 🏗️ Analytics Architecture

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Your NestJS Application                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Auth       │  │   Blog       │  │   Orders     │          │
│  │   Service    │  │   Service    │  │   Service    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                  │
│                            │                                      │
│                            ▼                                      │
│                   ┌─────────────────┐                           │
│                   │  Analytics      │                           │
│                   │  Service        │                           │
│                   └────────┬────────┘                           │
│                            │                                      │
│                            ▼                                      │
│                   ┌─────────────────┐                           │
│                   │  BullMQ Queue   │                           │
│                   │  (ANALYTICS)    │                           │
│                   └────────┬────────┘                           │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     Redis       │
                    │  (Job Storage)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Analytics     │
                    │   Processor     │
                    │   (Worker)      │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
       ┌─────────────────┐      ┌─────────────────┐
       │  Google         │      │  Facebook       │
       │  Analytics 4    │      │  Pixel (CAPI)   │
       │  (Measurement   │      │  (Conversions   │
       │   Protocol)     │      │   API)          │
       └─────────────────┘      └─────────────────┘
```

---

## 🔄 Event Flow

### 1. Event Creation

```
User Action (e.g., signup)
         │
         ▼
Your Service (e.g., AuthService)
         │
         ▼
analytics.trackSignup(userId, email)
         │
         ▼
AnalyticsService.trackSignup()
```

### 2. Event Queuing

```
AnalyticsService
         │
         ▼
Create Job Object
         │
         ▼
Add to BullMQ Queue
         │
         ▼
Store in Redis
         │
         ▼
Return immediately (non-blocking)
```

### 3. Event Processing

```
BullMQ Worker picks up job
         │
         ▼
AnalyticsProcessor.process()
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   GA4 enabled?    FB Pixel enabled?   Custom?
         │                 │                 │
         ▼                 ▼                 ▼
   Send to GA4      Send to Facebook    Custom handler
         │                 │                 │
         └─────────────────┴─────────────────┘
                           │
                           ▼
                    Job completed
```

---

## 🎯 Integration Methods

### Method 1: Service Injection (Recommended)

```typescript
┌─────────────────────────────────────────┐
│  Your Service                            │
│  ┌────────────────────────────────────┐ │
│  │ constructor(                        │ │
│  │   private analytics: AnalyticsService│ │
│  │ ) {}                                │ │
│  │                                     │ │
│  │ async myMethod() {                  │ │
│  │   await this.analytics.trackEvent({ │ │
│  │     eventName: 'action',            │ │
│  │     userId: user.id                 │ │
│  │   });                               │ │
│  │ }                                   │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Method 2: Decorator (Controller Level)

```typescript
┌─────────────────────────────────────────┐
│  Your Controller                         │
│  ┌────────────────────────────────────┐ │
│  │ @Post()                             │ │
│  │ @TrackEvent('post_created')         │ │
│  │ async createPost() {                │ │
│  │   // Event tracked automatically    │ │
│  │   return this.service.create();     │ │
│  │ }                                   │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Method 3: Middleware (Automatic)

```typescript
┌─────────────────────────────────────────┐
│  HTTP Request                            │
│         │                                │
│         ▼                                │
│  AnalyticsMiddleware                     │
│         │                                │
│         ├─── Track: endpoint, method     │
│         │           status, duration     │
│         │                                │
│         ▼                                │
│  Your Controller/Route                   │
│         │                                │
│         ▼                                │
│  HTTP Response                           │
└─────────────────────────────────────────┘
```

### Method 4: REST API (External)

```typescript
┌─────────────────────────────────────────┐
│  External Client (Frontend/Mobile)       │
│         │                                │
│         ▼                                │
│  POST /api/v1/analytics/track/event     │
│         │                                │
│         ▼                                │
│  AnalyticsController                     │
│         │                                │
│         ▼                                │
│  AnalyticsService                        │
└─────────────────────────────────────────┘
```

---

## 📦 Module Structure

```
src/analytics/
│
├── Core Components
│   ├── analytics.module.ts          # Module definition
│   ├── analytics.service.ts         # Main service (tracking methods)
│   ├── analytics.controller.ts      # REST API endpoints
│   └── analytics.processor.ts       # Queue worker (sends to GA4/FB)
│
├── Data Transfer Objects (DTOs)
│   └── dto/
│       └── track-event.dto.ts       # Validation schemas
│
├── Type Definitions
│   └── interfaces/
│       └── analytics.interface.ts   # TypeScript interfaces
│
├── Integration Tools
│   ├── middleware/
│   │   └── analytics.middleware.ts  # Auto-track API calls
│   ├── interceptors/
│   │   └── analytics.interceptor.ts # Decorator support
│   └── decorators/
│       └── track-event.decorator.ts # @TrackEvent() decorator
│
├── Documentation & Examples
│   ├── examples/
│   │   ├── auth-integration.example.ts
│   │   └── ecommerce-integration.example.ts
│   └── README.md
│
└── Configuration (in other modules)
    ├── src/config/env.config.ts     # Environment variables
    ├── src/queues/queue.constants.ts # Queue constants
    └── src/app.module.ts            # Module registration
```

---

## 🔌 Data Flow Diagram

### Tracking a User Signup

```
1. User submits signup form
         │
         ▼
2. AuthController.register()
         │
         ▼
3. AuthService.register()
         │
         ├─── Create user in database
         │
         └─── analytics.trackSignup(user.id, user.email)
                      │
                      ▼
4. AnalyticsService.trackSignup()
         │
         ├─── Check if analytics enabled
         │
         └─── Create event object:
              {
                eventName: 'user_signup',
                userId: 'user-123',
                userEmail: 'user@example.com',
                properties: { provider: 'email' }
              }
                      │
                      ▼
5. Add to BullMQ Queue
         │
         ├─── Serialize event
         │
         └─── Store in Redis
                      │
                      ▼
6. Return to AuthService (non-blocking)
         │
         ▼
7. Return response to user
         │
         ▼
8. [Async] AnalyticsProcessor picks up job
         │
         ├─── If GA4 enabled:
         │    └─── POST to Google Analytics API
         │         └─── Event: user_signup
         │
         └─── If Facebook enabled:
              └─── POST to Facebook Conversions API
                   └─── Event: CompleteRegistration
                            │
                            ▼
9. Job marked as completed
         │
         ▼
10. Event appears in GA4/Facebook
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────┐
│  Environment Variables (.env)                        │
│  ┌────────────────────────────────────────────────┐ │
│  │ ANALYTICS_ENABLED=true                          │ │
│  │ GA_MEASUREMENT_ID=G-XXXXXXXXXX                  │ │
│  │ GA_API_SECRET=secret123                         │ │
│  │ FB_PIXEL_ID=123456789                           │ │
│  │ FB_PIXEL_ACCESS_TOKEN=token123                  │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  ConfigService │ (NestJS)
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │ AnalyticsService│
         │ AnalyticsProcessor│
         └────────┬───────┘
                  │
                  ├─────────────────┬─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │  User Data   │  │  Event Data  │  │  Properties  │
         │  (Hashed for │  │  (Sanitized) │  │  (Filtered)  │
         │  Facebook)   │  │              │  │              │
         └──────────────┘  └──────────────┘  └──────────────┘
                  │                 │                 │
                  └─────────────────┴─────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │  External APIs   │
                          │  (HTTPS only)    │
                          └──────────────────┘
```

---

## 🎨 Component Responsibilities

### AnalyticsService

**Purpose**: Main interface for tracking events

- ✅ Validate analytics is enabled
- ✅ Create event objects
- ✅ Queue events for processing
- ✅ Provide convenience methods (trackSignup, trackLogin, etc.)

### AnalyticsProcessor

**Purpose**: Process queued events

- ✅ Pick up jobs from BullMQ queue
- ✅ Send events to Google Analytics 4
- ✅ Send events to Facebook Pixel
- ✅ Handle errors and retries
- ✅ Log processing status

### AnalyticsController

**Purpose**: Provide REST API endpoints

- ✅ Accept external tracking requests
- ✅ Validate request data
- ✅ Forward to AnalyticsService
- ✅ Return status responses

### AnalyticsMiddleware

**Purpose**: Automatic API tracking

- ✅ Intercept all HTTP requests
- ✅ Track endpoint, method, status
- ✅ Measure response time
- ✅ Extract user ID from request

### AnalyticsInterceptor

**Purpose**: Support decorator-based tracking

- ✅ Read @TrackEvent() metadata
- ✅ Track events after successful execution
- ✅ Include request context
- ✅ Handle errors gracefully

---

## 🔄 Queue Architecture

```
┌─────────────────────────────────────────────────────┐
│  BullMQ Queue System                                 │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  ANALYTICS Queue                                │ │
│  │  ┌──────────────────────────────────────────┐  │ │
│  │  │  Job 1: track-event                       │  │ │
│  │  │  Job 2: track-pageview                    │  │ │
│  │  │  Job 3: track-conversion                  │  │ │
│  │  │  Job 4: track-event                       │  │ │
│  │  │  ...                                       │  │ │
│  │  └──────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Features:                                           │
│  ✅ Async processing (non-blocking)                 │
│  ✅ Automatic retries on failure                    │
│  ✅ Job persistence (Redis)                         │
│  ✅ Concurrency control                             │
│  ✅ Priority queuing                                │
│  ✅ Rate limiting                                   │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Event Processing Pipeline

```
Event Created
     │
     ▼
┌─────────────────┐
│  Validation     │ ← Check required fields
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Enrichment     │ ← Add timestamp, session ID
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Serialization  │ ← Convert to JSON
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Queue          │ ← Add to BullMQ
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Storage        │ ← Store in Redis
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Processing     │ ← Worker picks up job
└────────┬────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  GA4 API    │   │  FB API     │   │  Custom     │
└─────────────┘   └─────────────┘   └─────────────┘
         │                 │                 │
         └─────────────────┴─────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Job Complete   │
                  └─────────────────┘
```

---

## 🌐 External API Integration

### Google Analytics 4 Measurement Protocol

```
POST https://www.google-analytics.com/mp/collect
     ?measurement_id=G-XXXXXXXXXX
     &api_secret=your-secret

Headers:
  Content-Type: application/json

Body:
{
  "client_id": "user-123",
  "user_id": "user-123",
  "events": [{
    "name": "user_signup",
    "params": {
      "provider": "email",
      "source": "web"
    }
  }]
}
```

### Facebook Conversions API

```
POST https://graph.facebook.com/v18.0/{pixel-id}/events
     ?access_token=your-token

Headers:
  Content-Type: application/json

Body:
{
  "data": [{
    "event_name": "CompleteRegistration",
    "event_time": 1234567890,
    "action_source": "website",
    "user_data": {
      "em": "hashed-email",
      "external_id": "hashed-user-id"
    },
    "custom_data": {
      "provider": "email"
    }
  }]
}
```

---

## 🎯 Performance Characteristics

### Response Time Impact

```
Without Analytics:
Request → Service → Database → Response
100ms     50ms      30ms       = 180ms total

With Analytics (Async):
Request → Service → Database → Queue → Response
100ms     50ms      30ms       1ms     = 181ms total
                                ↓
                          (Async processing)
                          Queue → Worker → External API
                          1ms     50ms     200ms
                          (doesn't block response)
```

### Scalability

- ✅ **Horizontal**: Add more worker processes
- ✅ **Vertical**: Increase Redis memory
- ✅ **Queue**: BullMQ handles millions of jobs
- ✅ **Non-blocking**: No impact on API response time

---

## 🔧 Configuration Layers

```
1. Environment Variables (.env)
         │
         ▼
2. Zod Validation (env.config.ts)
         │
         ▼
3. ConfigService (NestJS)
         │
         ▼
4. AnalyticsService (Runtime)
         │
         ▼
5. AnalyticsProcessor (Worker)
```

---

## 📈 Monitoring Points

```
Application Logs
     │
     ├─── AnalyticsService
     │    ├─── Event queued
     │    └─── Errors
     │
     ├─── AnalyticsProcessor
     │    ├─── Event processed
     │    ├─── GA4 sent
     │    ├─── Facebook sent
     │    └─── Errors
     │
     └─── BullMQ
          ├─── Queue length
          ├─── Job completion rate
          └─── Failed jobs
```

---

## 🎓 Best Practices

### 1. Event Naming

```
✅ Good: user_signup, post_created, payment_completed
❌ Bad: event1, click, action
```

### 2. Error Handling

```typescript
try {
  await this.analytics.trackEvent(...);
} catch (error) {
  // Log but don't break application flow
  this.logger.error('Analytics error:', error);
}
```

### 3. Performance

```typescript
// ✅ Good: Async (non-blocking)
await this.analytics.trackEvent(...);

// ❌ Bad: Synchronous external API call
await fetch('https://analytics.com/track');
```

### 4. Privacy

```typescript
// ✅ Good: No sensitive data
properties: {
  category: 'technology';
}

// ❌ Bad: Sensitive data
properties: {
  password: 'secret123';
}
```

---

**📚 For more details, see:**

- [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md) - Complete setup guide
- [ANALYTICS_QUICK_REFERENCE.md](./ANALYTICS_QUICK_REFERENCE.md) - Quick reference
- [WHAT_WAS_ADDED.md](./WHAT_WAS_ADDED.md) - Implementation summary

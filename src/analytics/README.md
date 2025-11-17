# Analytics Module

Server-side analytics integration for NestJS with support for Google Analytics 4 and Facebook Pixel.

## 📁 Module Structure

```
analytics/
├── analytics.module.ts           # Module definition
├── analytics.service.ts          # Main service for tracking
├── analytics.controller.ts       # REST API endpoints
├── analytics.processor.ts        # Queue worker for async processing
├── dto/
│   └── track-event.dto.ts       # DTOs for API validation
├── interfaces/
│   └── analytics.interface.ts   # TypeScript interfaces
├── middleware/
│   └── analytics.middleware.ts  # Auto-track API calls
├── interceptors/
│   └── analytics.interceptor.ts # Track with decorators
├── decorators/
│   └── track-event.decorator.ts # @TrackEvent() decorator
├── examples/
│   ├── auth-integration.example.ts
│   └── ecommerce-integration.example.ts
└── README.md                     # This file
```

## 🚀 Quick Usage

### 1. Inject the Service

```typescript
import { AnalyticsService } from 'src/analytics/analytics.service';

@Injectable()
export class YourService {
  constructor(private readonly analytics: AnalyticsService) {}
}
```

### 2. Track Events

```typescript
// Simple event
await this.analytics.trackEvent({
  eventName: 'button_clicked',
  userId: user.id,
  properties: { buttonName: 'subscribe' },
});

// Conversion
await this.analytics.trackConversion({
  conversionName: 'purchase',
  value: 99.99,
  currency: 'USD',
  userId: user.id,
  userEmail: user.email,
});
```

### 3. Use Decorators

```typescript
import { TrackEvent } from 'src/analytics/decorators/track-event.decorator';

@Post()
@TrackEvent('post_created', { category: 'content' })
async createPost(@Body() dto: CreatePostDto) {
  // Event tracked automatically after success
}
```

## 📖 Full Documentation

See [ANALYTICS_SETUP.md](../../ANALYTICS_SETUP.md) in the root directory for:

- Complete setup instructions
- Configuration guide
- API reference
- Best practices
- Troubleshooting

## 🔧 Configuration

Set in `.env`:

```env
ANALYTICS_ENABLED=true
GA_ENABLED=true
GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_API_SECRET=your-secret
FB_PIXEL_ENABLED=true
FB_PIXEL_ID=123456789
FB_PIXEL_ACCESS_TOKEN=your-token
```

## 🎯 Key Features

- ✅ Async queue-based processing (non-blocking)
- ✅ Google Analytics 4 Measurement Protocol
- ✅ Facebook Conversions API
- ✅ Automatic API endpoint tracking
- ✅ Decorator-based tracking
- ✅ Privacy-compliant (server-side, hashed data)
- ✅ TypeScript support
- ✅ Comprehensive error handling

## 📊 Tracked Events

### Automatic

- API calls (endpoint, method, status, duration)
- Errors and exceptions

### Manual (via service)

- User signup/login
- Custom events
- Page views
- Conversions
- Any business event

## 🧪 Testing

```typescript
import { Test } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AnalyticsService],
    }).compile();

    service = module.get(AnalyticsService);
  });

  it('should track event', async () => {
    await service.trackEvent({
      eventName: 'test',
      properties: { test: true },
    });
  });
});
```

## 🔗 Related Files

- [Main Setup Guide](../../ANALYTICS_SETUP.md)
- [Environment Config](../config/env.config.ts)
- [Queue Constants](../queues/queue.constants.ts)

## 📝 Notes

- Events are processed asynchronously via BullMQ
- Requires Redis for queue management
- User data is hashed before sending to Facebook
- GA4 events may take 24-48 hours to appear
- Check logs for processing errors

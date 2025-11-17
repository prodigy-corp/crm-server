# ✅ Analytics Setup Checklist

Use this checklist to ensure your analytics integration is properly configured and working.

## 📋 Pre-Setup Checklist

### Google Analytics 4 Setup

- [ ] Create Google Analytics 4 property at [analytics.google.com](https://analytics.google.com)
- [ ] Get Measurement ID (format: `G-XXXXXXXXXX`)
- [ ] Generate API Secret (Admin → Data Streams → Measurement Protocol API secrets)
- [ ] Save credentials securely

### Facebook Pixel Setup

- [ ] Create Facebook Pixel at [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
- [ ] Get Pixel ID (15-digit number)
- [ ] Create System User in Business Settings
- [ ] Generate Access Token with `ads_management` and `business_management` permissions
- [ ] Save credentials securely

### Infrastructure

- [ ] Redis is installed and running (`redis-cli ping` returns `PONG`)
- [ ] PostgreSQL is running
- [ ] Node.js dependencies are installed (`npm install` or `pnpm install`)

---

## 🔧 Configuration Checklist

### Environment Variables

- [ ] Copy `.env.example` to `.env` if not already done
- [ ] Set `ANALYTICS_ENABLED=true`
- [ ] Set `GA_ENABLED=true` (if using Google Analytics)
- [ ] Set `GA_MEASUREMENT_ID=G-XXXXXXXXXX`
- [ ] Set `GA_API_SECRET=your-api-secret`
- [ ] Set `FB_PIXEL_ENABLED=true` (if using Facebook Pixel)
- [ ] Set `FB_PIXEL_ID=123456789012345`
- [ ] Set `FB_PIXEL_ACCESS_TOKEN=your-access-token`

### Module Integration

- [ ] AnalyticsModule is imported in `app.module.ts`
- [ ] ANALYTICS queue is registered in BullMQ
- [ ] No TypeScript compilation errors
- [ ] Application starts successfully

---

## 🧪 Testing Checklist

### Basic Functionality

- [ ] Application starts without errors
- [ ] Check analytics config endpoint:
  ```bash
  curl http://localhost:8000/api/v1/analytics/config
  ```
- [ ] Response shows analytics is enabled
- [ ] Response shows correct providers enabled (GA4/Facebook)

### Event Tracking

- [ ] Send test event via API:
  ```bash
  curl -X POST http://localhost:8000/api/v1/analytics/track/event \
    -H "Content-Type: application/json" \
    -d '{"eventName": "test_event", "properties": {"test": true}}'
  ```
- [ ] Check logs for event processing:
  ```bash
  grep "AnalyticsProcessor" logs/app.log
  ```
- [ ] No errors in logs

### Queue Processing

- [ ] Redis is processing jobs
- [ ] Check BullMQ queue status (if using Bull Board)
- [ ] Events are being processed asynchronously

---

## 🔗 Integration Checklist

### Auth Module Integration

- [ ] AnalyticsService injected in AuthService
- [ ] Signup tracking added
- [ ] Login tracking added
- [ ] OAuth login tracking added (if applicable)
- [ ] Password reset tracking added (if applicable)
- [ ] Email verification tracking added (if applicable)

### Other Modules (Optional)

- [ ] Blog/Content module tracking
- [ ] E-commerce/Order tracking
- [ ] Payment/Subscription tracking
- [ ] Custom business event tracking

---

## 📊 Verification Checklist

### Google Analytics 4

- [ ] Open GA4 property
- [ ] Navigate to Reports → Realtime
- [ ] Perform test actions (signup, login)
- [ ] Events appear in Realtime view within seconds
- [ ] Check DebugView for detailed event data (if debug mode enabled)
- [ ] Events appear in standard reports (wait 24-48 hours)

### Facebook Pixel

- [ ] Open Facebook Events Manager
- [ ] Navigate to Test Events
- [ ] Enter test event code (if using)
- [ ] Perform test actions
- [ ] Events appear in Test Events tool
- [ ] Check Events tab for production data

### Application Logs

- [ ] No analytics-related errors in logs
- [ ] Events are being queued successfully
- [ ] Events are being processed successfully
- [ ] Check for patterns:
  ```bash
  grep "📊 Event queued" logs/app.log
  grep "✅ Event tracked" logs/app.log
  grep "❌" logs/app.log | grep -i analytics
  ```

---

## 🔒 Security & Privacy Checklist

### Data Protection

- [ ] API secrets stored in environment variables (not in code)
- [ ] `.env` file is in `.gitignore`
- [ ] No sensitive data (passwords, credit cards) in event properties
- [ ] User data is hashed before sending to Facebook (automatic)

### Compliance

- [ ] Privacy policy updated to mention analytics
- [ ] User consent mechanism implemented (if required by GDPR/CCPA)
- [ ] Data retention policies configured in GA4 and Facebook
- [ ] Analytics can be disabled per user if needed

---

## 📈 Monitoring Checklist

### Daily Checks (First Week)

- [ ] Check application logs for errors
- [ ] Verify events in GA4 Realtime
- [ ] Verify events in Facebook Events Manager
- [ ] Monitor Redis memory usage
- [ ] Check BullMQ queue length

### Weekly Checks

- [ ] Review tracked events in GA4 reports
- [ ] Review conversion data in Facebook
- [ ] Check for failed jobs in BullMQ
- [ ] Review error logs
- [ ] Optimize event tracking based on data

---

## 🐛 Troubleshooting Checklist

### If Events Not Appearing in GA4

- [ ] Verify `GA_MEASUREMENT_ID` is correct
- [ ] Verify `GA_API_SECRET` is correct
- [ ] Check logs for API errors
- [ ] Wait 24-48 hours for data to appear in reports
- [ ] Use DebugView for real-time debugging
- [ ] Check GA4 data filters (Admin → Data Settings → Data Filters)

### If Events Not Appearing in Facebook

- [ ] Verify `FB_PIXEL_ID` is correct
- [ ] Verify `FB_PIXEL_ACCESS_TOKEN` is correct
- [ ] Check token permissions (needs `ads_management`)
- [ ] Use Test Events tool for debugging
- [ ] Check event names match Facebook standards
- [ ] Verify Pixel is not in restricted mode

### If Queue Not Processing

- [ ] Check Redis connection: `redis-cli ping`
- [ ] Check Redis memory: `redis-cli info memory`
- [ ] Restart Redis if needed
- [ ] Check BullMQ configuration
- [ ] Review application logs for queue errors

### If Application Won't Start

- [ ] Check for TypeScript compilation errors
- [ ] Verify all dependencies installed
- [ ] Check environment variables are set
- [ ] Review application startup logs
- [ ] Try disabling analytics temporarily: `ANALYTICS_ENABLED=false`

---

## 📚 Documentation Checklist

### Read Documentation

- [ ] [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md) - Complete setup guide
- [ ] [ANALYTICS_QUICK_REFERENCE.md](./ANALYTICS_QUICK_REFERENCE.md) - Quick reference
- [ ] [ANALYTICS_AUTH_INTEGRATION_GUIDE.md](./ANALYTICS_AUTH_INTEGRATION_GUIDE.md) - Auth integration
- [ ] [src/analytics/README.md](./src/analytics/README.md) - Module documentation

### Review Examples

- [ ] [auth-integration.example.ts](./src/analytics/examples/auth-integration.example.ts)
- [ ] [ecommerce-integration.example.ts](./src/analytics/examples/ecommerce-integration.example.ts)

---

## 🎯 Post-Setup Tasks

### Immediate (Day 1)

- [ ] Test all tracking in development
- [ ] Verify events in GA4 Realtime
- [ ] Verify events in Facebook Test Events
- [ ] Document custom events being tracked
- [ ] Share setup with team

### Short-term (Week 1)

- [ ] Monitor for errors daily
- [ ] Verify data accuracy
- [ ] Add tracking to additional modules
- [ ] Set up GA4 custom reports/dashboards
- [ ] Configure Facebook conversion events

### Long-term (Month 1)

- [ ] Review analytics data weekly
- [ ] Optimize based on insights
- [ ] Add more custom events as needed
- [ ] Train team on analytics usage
- [ ] Document learnings and best practices

---

## ✨ Success Criteria

Your analytics integration is successful when:

- ✅ Application runs without analytics-related errors
- ✅ Events appear in GA4 Realtime within seconds
- ✅ Events appear in Facebook Events Manager
- ✅ Queue is processing events asynchronously
- ✅ No impact on application performance
- ✅ Team can track custom events easily
- ✅ Data is accurate and useful for decision-making

---

## 🆘 Need Help?

If you're stuck on any step:

1. **Check the logs**: `grep -i analytics logs/app.log`
2. **Review documentation**: See [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md)
3. **Test configuration**: `curl http://localhost:8000/api/v1/analytics/config`
4. **Verify environment**: Check all env vars are set correctly
5. **Check external services**: Verify GA4 and Facebook credentials

---

## 📝 Notes

Use this space to track your progress:

```
Setup Date: _______________
GA4 Measurement ID: G-_______________
Facebook Pixel ID: _______________
Issues Encountered:
_______________________________________________
_______________________________________________

Resolution:
_______________________________________________
_______________________________________________
```

---

**🎉 Congratulations!** Once all items are checked, your analytics integration is complete and ready for production!

**Next Step**: Start tracking events and use the data to improve your application.

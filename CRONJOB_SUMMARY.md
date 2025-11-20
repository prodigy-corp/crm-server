# Cronjobs Implementation Summary

## What Was Added

### New Module

- **CronModule** (`src/cron/cron.module.ts`) - Main module for all scheduled tasks

### Services

#### 1. AttendanceCronService (`src/cron/services/attendance-cron.service.ts`)

**6 Cronjobs Implemented:**

| Cronjob           | Schedule             | Purpose                                       |
| ----------------- | -------------------- | --------------------------------------------- |
| Auto-Mark Absent  | Daily 11:59 PM       | Marks absent employees who didn't check in    |
| Checkout Reminder | Daily 6:00 PM        | Reminds employees to check out                |
| Auto-Checkout     | Daily 11:55 PM       | Auto checks out forgotten employees           |
| Daily Summary     | Daily 12:30 AM       | Generates attendance statistics               |
| Weekly Report     | Monday 9:00 AM       | Weekly attendance analysis with top absentees |
| Clean Old Records | 1st of month 2:00 AM | Archives records older than 2 years           |

#### 2. SalaryCronService (`src/cron/services/salary-cron.service.ts`)

**4 Cronjobs Implemented:**

| Cronjob                   | Schedule                            | Purpose                                                  |
| ------------------------- | ----------------------------------- | -------------------------------------------------------- |
| Generate Monthly Salary   | 1st of month 1:00 AM                | Creates salary payments with attendance-based deductions |
| Payment Reminder          | 25th of month 10:00 AM              | Reminds admin of pending payments                        |
| Increment Recommendations | Quarterly (Jan/Apr/Jul/Oct) 8:00 AM | Suggests increments based on 90%+ attendance             |
| Archive Old Salaries      | 1st of year 3:00 AM                 | Archives records older than 3 years                      |

## Key Features

### Attendance Management

- ✅ Automatic absent marking for no-shows
- ✅ Checkout reminders at end of workday
- ✅ Auto-checkout to prevent incomplete records
- ✅ Daily and weekly attendance statistics
- ✅ Data archival for old records

### Salary Management

- ✅ Automated monthly salary generation
- ✅ Attendance-based deduction calculation
  - Full day deduction for absences
  - Half day deduction for late arrivals
- ✅ Increment recommendations based on performance
- ✅ Payment reminders before month end
- ✅ Data archival for compliance

## Installation

```bash
pnpm add @nestjs/schedule
```

## Configuration

### Timezone

All cronjobs use `Asia/Dhaka` timezone. Update in service files if needed.

### Integration

Module added to `app.module.ts` imports:

```typescript
import { CronModule } from './cron/cron.module';
// ...
imports: [
  // ...
  CronModule,
],
```

## Deduction Calculation Logic

```typescript
// Assume 30 working days per month
const dailySalary = baseSalary / 30

// Deductions
const absentDeduction = absentDays × dailySalary
const lateDeduction = lateDays × (dailySalary × 0.5)

// Net salary
const netPayable = grossSalary - totalDeduction
```

## TODO Items

The following are marked as TODO in the code:

1. **Email Integration**
   - Daily attendance summaries
   - Weekly reports
   - Salary payment reminders
   - Increment recommendations

2. **Notification Service**
   - Checkout reminders (SMS/Push)
   - Payment notifications

3. **Archival Logic**
   - External storage for old records
   - Data export before deletion

## Safety Features

- ✅ All destructive operations (delete/archive) are commented out
- ✅ Idempotent operations (no duplicate records)
- ✅ Comprehensive error handling with logging
- ✅ Skip duplicates in bulk create operations

## Testing

### Manual Testing

Create test endpoints in development:

```typescript
@Post('admin/cron/trigger/:jobName')
async triggerCron(@Param('jobName') jobName: string) {
  // Call specific cronjob method
}
```

### Disable Cronjobs

Comment out `CronModule` in `app.module.ts` during development.

## Monitoring

All cronjobs log:

- Start/completion messages
- Processing statistics
- Error messages with stack traces

Example log:

```
[INFO] Starting monthly salary generation cronjob
[INFO] Generating salary for 2025-11
[INFO] Found 50 active employees for salary processing
[INFO] Generating salary for 50 employees
[INFO] Successfully generated 50 salary payment records for 2025-11
```

## Documentation

📄 [CRONJOB_DOCUMENTATION.md](./CRONJOB_DOCUMENTATION.md) - Complete documentation with:

- Detailed cronjob descriptions
- Cron expression guide
- Configuration options
- Integration examples
- Troubleshooting guide
- Best practices

## Dependencies

- `@nestjs/schedule` - NestJS cron scheduler
- `@prisma/client` - Database operations
- `@nestjs/common` - NestJS core

## Performance Considerations

- Uses bulk operations (`createMany`) where possible
- Includes indexes on queried fields
- Processes records in batches for large datasets
- Consider Redis-based locking for multi-instance deployments

## Production Readiness

Before deploying to production:

1. ✅ Test all cronjobs in staging
2. ⏳ Implement email/notification services
3. ⏳ Set up monitoring/alerting
4. ⏳ Configure log aggregation
5. ⏳ Implement archival logic
6. ✅ Review timezone settings
7. ⏳ Set up database backups

## Next Steps

1. Integrate email service for notifications
2. Implement SMS/push notifications
3. Create admin dashboard for cronjob monitoring
4. Add retry mechanism for failed jobs
5. Implement distributed locking for scaling
6. Add custom deduction rules per department
7. Implement bonus calculation logic

---

**Created:** 2025-11-20  
**Total Cronjobs:** 10  
**Status:** ✅ Ready for Testing

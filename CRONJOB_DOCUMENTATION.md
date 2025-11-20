# CRM Cronjob Documentation

This document describes all scheduled cronjobs implemented in the CRM system for attendance and salary management.

## Overview

The cronjob system uses `@nestjs/schedule` to run automated tasks at specified intervals. All cronjobs are configured with `Asia/Dhaka` timezone.

## Architecture

```
src/cron/
├── cron.module.ts                        # Main cron module
├── services/
│   ├── attendance-cron.service.ts       # Attendance-related cronjobs
│   └── salary-cron.service.ts           # Salary-related cronjobs
```

---

## Attendance Cronjobs

### 1. Auto-Mark Absent Employees

**Schedule:** Every day at 11:59 PM  
**Cron Expression:** `59 23 * * *`  
**Method:** `autoMarkAbsentEmployees()`

**Purpose:**  
Automatically marks all active employees who haven't checked in for the day as ABSENT.

**Process:**

1. Gets all active employees
2. Checks which employees have attendance records for today
3. Creates ABSENT records for employees without attendance
4. Logs the number of employees marked as absent

**Use Case:**  
Ensures complete attendance records for all employees, even if they didn't check in.

---

### 2. Checkout Reminder

**Schedule:** Every day at 6:00 PM  
**Cron Expression:** `0 18 * * *`  
**Method:** `sendCheckoutReminders()`

**Purpose:**  
Reminds employees who checked in but haven't checked out yet.

**Process:**

1. Finds employees who checked in but haven't checked out
2. Logs the list of employees needing reminders
3. Can be extended to send email/SMS/push notifications

**Use Case:**  
Reduces forgotten checkouts and ensures accurate working hours tracking.

---

### 3. Auto-Checkout Employees

**Schedule:** Every day at 11:55 PM  
**Cron Expression:** `55 23 * * *`  
**Method:** `autoCheckoutEmployees()`

**Purpose:**  
Automatically checks out employees who forgot to check out.

**Process:**

1. Finds employees who checked in but haven't checked out
2. Calculates working hours from check-in time to current time
3. Updates attendance record with checkout time and working hours

**Use Case:**  
Prevents incomplete attendance records and ensures working hours are recorded.

---

### 4. Daily Attendance Summary

**Schedule:** Every day at 12:30 AM  
**Cron Expression:** `30 0 * * *`  
**Method:** `generateDailyAttendanceSummary()`

**Purpose:**  
Generates daily attendance statistics for the previous day.

**Process:**

1. Aggregates attendance records by status (PRESENT, ABSENT, LATE, ON_LEAVE)
2. Logs the summary
3. Can be extended to send email report to admin

**Sample Output:**

```json
{
  "date": "2025-11-20",
  "statistics": {
    "PRESENT": 45,
    "ABSENT": 3,
    "LATE": 2,
    "ON_LEAVE": 1
  }
}
```

---

### 5. Weekly Attendance Report

**Schedule:** Every Monday at 9:00 AM  
**Cron Expression:** `0 9 * * 1`  
**Method:** `generateWeeklyAttendanceReport()`

**Purpose:**  
Generates comprehensive weekly attendance report.

**Process:**

1. Aggregates attendance for the previous week (Monday to Sunday)
2. Identifies top 5 employees with most absences
3. Logs the report
4. Can be extended to send detailed report to admin

**Sample Output:**

```json
{
  "weekStart": "2025-11-13",
  "weekEnd": "2025-11-19",
  "statistics": {
    "PRESENT": 315,
    "ABSENT": 18,
    "LATE": 12,
    "ON_LEAVE": 7
  },
  "topAbsenteeIds": [
    { "employeeId": "emp123", "absentCount": 3 },
    { "employeeId": "emp456", "absentCount": 2 }
  ]
}
```

---

### 6. Clean Old Attendance Records

**Schedule:** 1st day of every month at 2:00 AM  
**Cron Expression:** `0 2 1 * *`  
**Method:** `cleanOldAttendanceRecords()`

**Purpose:**  
Archives or cleans attendance records older than 2 years.

**Process:**

1. Counts attendance records older than 2 years
2. Logs the count (archival logic is commented for safety)
3. Can be extended to archive to external storage before deletion

**Note:** Actual deletion is commented out for safety. Uncomment after implementing archival logic.

---

## Salary Cronjobs

### 1. Generate Monthly Salary

**Schedule:** 1st day of every month at 1:00 AM  
**Cron Expression:** `0 1 1 * *`  
**Method:** `generateMonthlySalary()`

**Purpose:**  
Automatically generates salary payment records for all active employees for the previous month.

**Process:**

1. Gets all active employees
2. Retrieves current salary (considering latest increments)
3. Fetches attendance data for the previous month
4. Calculates deductions based on absences and late arrivals
5. Computes net payable amount
6. Creates salary payment records with PENDING status

**Calculation Logic:**

- **Basic Salary:** Employee's base salary or latest incremented salary
- **Gross Salary:** Basic salary (bonuses can be added)
- **Deductions:**
  - Full day salary for each ABSENT day
  - Half day salary for each LATE day
- **Net Payable:** Gross Salary - Total Deductions

**Example:**

- Basic Salary: 50,000
- Absent Days: 2
- Late Days: 1
- Daily Salary: 50,000 / 30 = 1,666.67
- Absent Deduction: 2 × 1,666.67 = 3,333.34
- Late Deduction: 1 × (1,666.67 × 0.5) = 833.34
- Total Deduction: 4,166.68
- Net Payable: 45,833.32

---

### 2. Salary Payment Reminder

**Schedule:** 25th day of every month at 10:00 AM  
**Cron Expression:** `0 10 25 * *`  
**Method:** `sendSalaryPaymentReminders()`

**Purpose:**  
Reminds admin to process pending salary payments before month end.

**Process:**

1. Finds all salary payments with PENDING status for current month
2. Calculates total amount pending
3. Logs the summary
4. Can be extended to send email notification to admin

**Sample Output:**

```
Found 50 pending salary payments totaling 2,450,000.00
```

---

### 3. Salary Increment Recommendations

**Schedule:** 1st day of every quarter at 8:00 AM (Jan, Apr, Jul, Oct)  
**Cron Expression:** `0 8 1 1,4,7,10 *`  
**Method:** `generateSalaryIncrementRecommendations()`

**Purpose:**  
Analyzes employee performance and suggests salary increments based on attendance.

**Process:**

1. Gets employees who haven't received increments in last 6 months
2. Calculates attendance score for last 3 months
3. Recommends 10% increment for employees with >90% attendance
4. Logs recommendations
5. Can be extended to send recommendations to admin

**Criteria:**

- No increment received in last 6 months
- Attendance score > 90% in last 3 months
- Recommended increment: 10% of current salary

**Sample Output:**

```json
[
  {
    "employeeId": "emp123",
    "employeeName": "John Doe",
    "currentSalary": 50000,
    "recommendedIncrement": 5000,
    "newSalary": 55000,
    "attendanceScore": "95.65",
    "reason": "Excellent attendance (95.65%) over the last 3 months"
  }
]
```

---

### 4. Archive Old Salary Payments

**Schedule:** 1st day of every year at 3:00 AM  
**Cron Expression:** `0 3 1 1 *`  
**Method:** `archiveOldSalaryPayments()`

**Purpose:**  
Archives salary payment records older than 3 years.

**Process:**

1. Counts salary payment records older than 3 years
2. Logs the count (archival logic is commented for safety)
3. Can be extended to archive to external storage before deletion

**Note:** Actual deletion is commented out for safety. Uncomment after implementing archival logic.

---

## Configuration

### Timezone

All cronjobs use `Asia/Dhaka` timezone. To change the timezone:

```typescript
@Cron('0 1 1 * *', {
  name: 'cronjob-name',
  timeZone: 'Asia/Dhaka', // Change this to your timezone
})
```

### Cron Expression Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of Week (0-7, 0 and 7 = Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of Month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Common Cron Patterns

- `0 0 * * *` - Every day at midnight
- `0 9 * * 1` - Every Monday at 9 AM
- `0 8 1 1,4,7,10 *` - 1st day of Jan, Apr, Jul, Oct at 8 AM
- `0 3 1 1 *` - 1st day of every year at 3 AM

---

## Environment Variables

No additional environment variables required. The cronjobs use:

- Database connection from Prisma
- Timezone: `Asia/Dhaka` (hardcoded, can be made configurable)

---

## Integration Points

### Email Service (TODO)

To send email notifications, inject the EmailService:

```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly emailService: EmailService,
) {}
```

Then uncomment and implement the email logic in each cronjob.

### Notification Service (TODO)

For push notifications or SMS:

```typescript
await this.notificationService.send({
  to: employee.mobileNumber,
  message: 'Please remember to check out',
});
```

---

## Monitoring

### Logs

All cronjobs log their execution:

- Start message
- Process details
- Completion message
- Error messages (with stack trace)

### Log Levels

- `INFO`: Normal operation logs
- `ERROR`: Error messages with stack traces

### Sample Logs

```
[INFO] Starting auto-mark absent employees cronjob
[INFO] Found 50 active employees to process
[INFO] Marking 3 employees as ABSENT
[INFO] Successfully marked 3 employees as ABSENT
```

---

## Testing

### Manual Trigger (Development)

To manually trigger a cronjob for testing:

1. Create a controller endpoint:

```typescript
@Controller('admin/cron')
export class CronTestController {
  constructor(private readonly attendanceCronService: AttendanceCronService) {}

  @Post('trigger/auto-mark-absent')
  triggerAutoMarkAbsent() {
    return this.attendanceCronService.autoMarkAbsentEmployees();
  }
}
```

2. Call the endpoint using Postman or curl

### Disable Cronjobs

To temporarily disable all cronjobs, comment out the `CronModule` import in `app.module.ts`:

```typescript
// CronModule, // Disabled for testing
```

---

## Best Practices

1. **Error Handling:** All cronjobs have try-catch blocks to prevent crashes
2. **Idempotency:** Cronjobs check for existing data to prevent duplicates
3. **Logging:** Comprehensive logging for debugging and monitoring
4. **Performance:** Uses bulk operations where possible (e.g., `createMany`)
5. **Safety:** Destructive operations are commented out by default

---

## Deployment Notes

### Production Checklist

- [ ] Verify timezone settings
- [ ] Test all cronjobs in staging environment
- [ ] Set up monitoring/alerting for cronjob failures
- [ ] Implement email/notification services
- [ ] Configure log aggregation (e.g., CloudWatch, ELK)
- [ ] Review and uncomment archival/deletion logic
- [ ] Set up database backups before running destructive operations

### Scaling Considerations

For multiple server instances:

- Use Redis-based locking to prevent duplicate executions
- Consider using a dedicated cronjob server
- Implement distributed locking with `@nestjs/bull` or similar

---

## Troubleshooting

### Cronjob Not Running

1. Check if `CronModule` is imported in `app.module.ts`
2. Verify `@nestjs/schedule` is installed
3. Check application logs for errors
4. Verify cron expression is correct

### Timezone Issues

- Ensure server timezone matches cronjob timezone
- Use `TZ` environment variable if needed
- Verify with `date` command on server

### Performance Issues

- Add indexes to frequently queried fields
- Use pagination for large datasets
- Consider splitting large cronjobs into smaller tasks
- Use BullMQ for queue-based processing

---

## Future Enhancements

1. **Email Notifications:** Integrate with email service for reports
2. **SMS Reminders:** Send SMS for checkout reminders
3. **Dashboard:** Create admin dashboard to view cronjob execution history
4. **Custom Schedules:** Allow admin to configure cronjob schedules via UI
5. **Retry Mechanism:** Implement retry logic for failed cronjobs
6. **Metrics:** Track cronjob execution time and success rate
7. **Dynamic Rules:** Allow configurable deduction rules per department
8. **Bonus Calculation:** Add bonus calculation logic in salary generation

---

## Support

For issues or questions:

- Check application logs
- Review this documentation
- Contact the development team

---

**Last Updated:** 2025-11-20  
**Version:** 1.0.0

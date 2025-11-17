# Admin Employee API

This document describes the **Admin Employee** backend APIs exposed by `AdminEmployeeController` for integrating the admin frontend.

- Base path: `/admin/employees`
- Auth: JWT (Bearer token)
- Roles: `ADMIN` or `SUPER_ADMIN`
- Default content type: `application/json`

---

## 1. List Employees

**Endpoint**

- `GET /admin/employees`

**Query Parameters (AdminEmployeeQueryDto)**

- `page?: number` – page number (default: `1`)
- `limit?: number` – items per page (default: `10`)
- `search?: string` – search by name, emailAddress, mobileNumber, employeeCode
- `status?: 'ACTIVE' | 'INACTIVE' | 'RESIGNED'`
- `sortBy?: string` – default: `createdAt`
- `sortOrder?: 'asc' | 'desc'` – default: `desc`

**Response (200)**

```json
{
  "data": [
    {
      "id": "emp-id",
      "employeeCode": "EMP-001",
      "name": "John Doe",
      "designation": "Software Engineer",
      "mobileNumber": "+88017...",
      "emailAddress": "employee@example.com",
      "joiningDate": "2024-01-01T00:00:00.000Z",
      "resignDate": null,
      "status": "ACTIVE",
      "baseSalary": 30000,
      "createdAt": "2024-01-01T..."
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## 2. Get Single Employee (With Relations)

**Endpoint**

- `GET /admin/employees/{id}`

**Path Parameters**

- `id: string` – Employee ID

**Response (200)**

Returns full employee object, including:

- `user` – linked login user (if any)
- `attendanceRecords` – recent attendance
- `salaryIncrements` – recent increments
- `salaryPayments` – recent salary payments

**Errors**

- `404 Not Found` – employee not found

---

## 3. Create Employee

**Endpoint**

- `POST /admin/employees`

**Body (CreateAdminEmployeeDto)**

All fields are JSON properties.

- Basic
  - `employeeCode?: string`
  - `name: string` (required)
  - `designation?: string`
- Personal
  - `fatherName?: string`
  - `motherName?: string`
  - `dateOfBirth?: string` – `YYYY-MM-DD`
  - `nationalId?: string`
  - `bloodGroup?: string`
- Job
  - `joiningDate: string` – `YYYY-MM-DD` (required)
  - `baseSalary: number` (required)
- Contact
  - `mobileNumber?: string`
  - `alternativeContactNumber?: string`
  - `corporateContactNumber?: string`
  - `emailAddress?: string`
  - `facebookProfileLink?: string`
- Bank
  - `bankAccountNumber?: string`
  - `branchName?: string`
  - `bankName?: string`
- Family / Emergency
  - `fatherContactNumber?: string`
  - `motherContactNumber?: string`
  - `emergencyContactNumber?: string`
- Education – SSC
  - `sscRoll?: string`
  - `sscRegistrationNumber?: string`
  - `sscPassingYear?: number`
  - `sscBoard?: string`
  - `sscResult?: string`
- Education – HSC
  - `hscRoll?: string`
  - `hscRegistrationNumber?: string`
  - `hscPassingYear?: number`
  - `hscBoard?: string`
  - `hscResult?: string`
- Education – Honors/Diploma
  - `honorsRoll?: string`
  - `honorsRegistrationNumber?: string`
  - `honorsPassingYear?: number`
  - `honorsInstitutionName?: string`
  - `honorsSubject?: string`
  - `honorsResult?: string`
- Status
  - `status?: 'ACTIVE' | 'INACTIVE' | 'RESIGNED'` (default: `ACTIVE`)

**Response (201)**

- Created employee object.

---

## 4. Update Employee

**Endpoint**

- `PUT /admin/employees/{id}`

**Path Parameters**

- `id: string` – Employee ID

**Body (UpdateAdminEmployeeDto)**

All fields are optional, same as Create DTO, plus:

- `resignDate?: string` – `YYYY-MM-DD`
- `userId?: string` – link to an existing `User` as login account

**Rules**

- If `userId` is provided:
  - User must exist.
  - That user cannot already be linked to another employee.

**Response (200)**

- Updated employee object.

**Errors**

- `404 Not Found` – employee or user not found
- `400 Bad Request` – user already linked to another employee

---

## 5. Soft Delete Employee

**Endpoint**

- `DELETE /admin/employees/{id}`

**Behavior**

- Marks employee as soft-deleted:
  - Sets `deletedAt` to current timestamp
  - Sets `status = INACTIVE`

**Response (200)**

```json
{ "message": "Employee deleted successfully" }
```

---

## 6. Mark Employee as Resigned

**Endpoint**

- `PUT /admin/employees/{id}/resign`

**Body (ResignEmployeeDto)**

- `resignDate?: string` – `YYYY-MM-DD` (optional)
  - If omitted, uses current date.

**Behavior**

- Sets `status = RESIGNED` and `resignDate` on the employee.

**Response (200)**

- Updated employee object.

---

## 7. Upload / Update Employee Photo

**Endpoint**

- `POST /admin/employees/{id}/photo`

**Content-Type**

- `multipart/form-data`

**Form Fields**

- `file: File` (required)
  - Max size: **300 KB**
  - Allowed types: `jpg, jpeg, png, webp`

**Behavior**

- Uses shared `UploadService`:
  - If `DISABLE_LOCAL_STORAGE = 'true'`: uploads to S3, returns `{ Location, Key }`.
  - Else: stores file under `storage/employees/...` and returns `{ Key: localPath }`.
- Deletes old employee photo if one exists.
- Updates `Employee.photoUrl` with the new key.

**Response (200)**

```json
{
  "id": "emp-id",
  "photoUrl": "storage/employees/... or S3 key",
  "key": "same-as-photoUrl-or-S3-key"
}
```

**Frontend Display (Local storage)**

- Use existing media endpoint:
  - `GET /media?key=<photoUrl>`

---

## 8. Get Attendance List

**Endpoint**

- `GET /admin/employees/{id}/attendance`

**Query Parameters (EmployeeAttendanceQueryDto)**

- `page?: number` – default: `1`
- `limit?: number` – default: `10`
- `fromDate?: string` – `YYYY-MM-DD`
- `toDate?: string` – `YYYY-MM-DD`
- `status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE'`

**Response (200)**

```json
{
  "data": [
    {
      "id": "att-id",
      "employeeId": "emp-id",
      "date": "2024-01-15T00:00:00.000Z",
      "checkInAt": "2024-01-15T09:00:00.000Z",
      "checkOutAt": "2024-01-15T17:30:00.000Z",
      "workingHours": 8.5,
      "status": "PRESENT",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## 9. Employee Check-In (Admin Triggered)

**Endpoint**

- `POST /admin/employees/{id}/attendance/check-in`

**Body (EmployeeAttendanceActionDto)**

- `date?: string` – `YYYY-MM-DD` (optional)
  - If omitted, uses **today**.

**Behavior**

- For the given date (or today):
  - If a record with `checkInAt` already exists, returns error.
  - Else, sets `checkInAt = now` and `status = PRESENT`.

**Response (200)**

- `EmployeeAttendance` object for that date.

**Errors**

- `400 Bad Request` – already checked in for this date.

---

## 10. Employee Check-Out

**Endpoint**

- `POST /admin/employees/{id}/attendance/check-out`

**Body (EmployeeAttendanceActionDto)**

- `date?: string` – `YYYY-MM-DD` (optional)
  - If omitted, uses **today**.

**Behavior**

- For the given date (or today):
  - Requires that `checkInAt` already exists.
  - If `checkOutAt` already set, returns error.
  - Sets `checkOutAt = now`.
  - Calculates `workingHours` in hours (2 decimal places).

**Response (200)**

- Updated `EmployeeAttendance` object.

**Errors**

- `400 Bad Request` – no check-in or already checked out.

---

## 11. Manual Attendance Upsert (Admin Management)

This endpoint is for full admin control (mark absent/leave, fix check-in/out times).

**Endpoint**

- `PUT /admin/employees/{id}/attendance`

**Body (UpsertEmployeeAttendanceDto)**

- `date: string` – `YYYY-MM-DD` (required)
- `status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE'` (required)
- `checkInAt?: string` – ISO datetime (e.g. `2024-01-15T09:00:00.000Z`)
- `checkOutAt?: string` – ISO datetime
- `workingHours?: number`
  - If omitted but both `checkInAt` and `checkOutAt` exist, it is auto-calculated.

**Use Cases**

- Mark a day as **ABSENT**:

```json
{
  "date": "2024-01-15",
  "status": "ABSENT"
}
```

- Mark a day as **ON_LEAVE**:

```json
{
  "date": "2024-01-15",
  "status": "ON_LEAVE"
}
```

- Set a **PRESENT** day with specific times:

```json
{
  "date": "2024-01-15",
  "status": "PRESENT",
  "checkInAt": "2024-01-15T09:00:00.000Z",
  "checkOutAt": "2024-01-15T17:30:00.000Z"
}
```

**Behavior**

- Uses `employeeId + date` as unique key.
- If attendance exists:
  - Updates `status`, `checkInAt`, `checkOutAt`, `workingHours`.
- If not:
  - Creates a new `EmployeeAttendance` record.

**Response (200)**

- Upserted `EmployeeAttendance` object.

---

## 12. Get Salary Payments (Per Employee)

**Endpoint**

- `GET /admin/employees/{id}/salary/payments`

**Query Parameters (EmployeeSalaryPaymentQueryDto)**

- `page?: number` – default: `1`
- `limit?: number` – default: `10`
- `month?: number` – 1–12
- `year?: number`
- `status?: 'PENDING' | 'PAID' | 'CANCELLED'`

**Response (200)**

```json
{
  "data": [
    {
      "id": "pay-id",
      "employeeId": "emp-id",
      "month": 1,
      "year": 2024,
      "basicSalary": 30000,
      "grossSalary": 32000,
      "totalDeduction": 2000,
      "netPayable": 30000,
      "paymentDate": "2024-01-31T00:00:00.000Z",
      "status": "PENDING",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## 13. Create Salary Increment

**Endpoint**

- `POST /admin/employees/{id}/salary/increments`

**Body (CreateEmployeeSalaryIncrementDto)**

- `newSalary: number` – required
- `effectiveFrom: string` – `YYYY-MM-DD`, required
- `reason?: string` – optional description

**Behavior**

- Reads `previousSalary` from `employee.baseSalary`.
- Calculates `incrementAmount = newSalary - previousSalary`.
- Creates an `EmployeeSalaryIncrement` record with:
  - `employeeId`, `previousSalary`, `newSalary`, `incrementAmount`, `effectiveFrom`, `reason`, `approvedById` (current admin user).
- Updates `employee.baseSalary = newSalary`.

**Response (201)**

- Created `EmployeeSalaryIncrement` object.

---

## 14. Create Salary Payment

**Endpoint**

- `POST /admin/employees/{id}/salary/payments`

**Body (CreateEmployeeSalaryPaymentDto)**

- `month: number` – 1–12
- `year: number`
- `basicSalary: number`
- `grossSalary: number`
- `totalDeduction: number`
- `netPayable: number`
- `paymentDate?: string` – `YYYY-MM-DD`
- `status?: 'PENDING' | 'PAID' | 'CANCELLED'` – default: `PENDING`

**Behavior**

- Ensures there is no existing payment for the same `(employeeId, month, year)`.
- Creates an `EmployeeSalaryPayment` entry.

**Response (201)**

- Created `EmployeeSalaryPayment` object.

**Errors**

- `400 Bad Request` – salary payment already exists for that month/year.

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'RESIGNED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "SalaryPaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "employeeCode" VARCHAR(50),
    "name" VARCHAR(150) NOT NULL,
    "designation" VARCHAR(100),
    "fatherName" VARCHAR(150),
    "motherName" VARCHAR(150),
    "dateOfBirth" TIMESTAMP(3),
    "nationalId" VARCHAR(100),
    "bloodGroup" VARCHAR(10),
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "resignDate" TIMESTAMP(3),
    "baseSalary" DECIMAL(10,2) NOT NULL,
    "mobileNumber" VARCHAR(20),
    "alternativeContactNumber" VARCHAR(20),
    "corporateContactNumber" VARCHAR(20),
    "emailAddress" VARCHAR(255),
    "facebookProfileLink" VARCHAR(500),
    "bankAccountNumber" VARCHAR(100),
    "branchName" VARCHAR(150),
    "bankName" VARCHAR(150),
    "fatherContactNumber" VARCHAR(20),
    "motherContactNumber" VARCHAR(20),
    "emergencyContactNumber" VARCHAR(20),
    "sscRoll" VARCHAR(50),
    "sscRegistrationNumber" VARCHAR(50),
    "sscPassingYear" INTEGER,
    "sscBoard" VARCHAR(50),
    "sscResult" VARCHAR(20),
    "hscRoll" VARCHAR(50),
    "hscRegistrationNumber" VARCHAR(50),
    "hscPassingYear" INTEGER,
    "hscBoard" VARCHAR(50),
    "hscResult" VARCHAR(20),
    "honorsRoll" VARCHAR(50),
    "honorsRegistrationNumber" VARCHAR(50),
    "honorsPassingYear" INTEGER,
    "honorsInstitutionName" VARCHAR(255),
    "honorsSubject" VARCHAR(100),
    "honorsResult" VARCHAR(20),
    "photoUrl" VARCHAR(500),
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_attendance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkInAt" TIMESTAMP(3),
    "checkOutAt" TIMESTAMP(3),
    "workingHours" DECIMAL(5,2),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salary_increments" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "previousSalary" DECIMAL(10,2) NOT NULL,
    "newSalary" DECIMAL(10,2) NOT NULL,
    "incrementAmount" DECIMAL(10,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_salary_increments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salary_payments" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "basicSalary" DECIMAL(10,2) NOT NULL,
    "grossSalary" DECIMAL(10,2) NOT NULL,
    "totalDeduction" DECIMAL(10,2) NOT NULL,
    "netPayable" DECIMAL(10,2) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "status" "SalaryPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_salary_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");

-- CreateIndex
CREATE INDEX "employees_name_idx" ON "employees"("name");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE INDEX "employees_createdAt_idx" ON "employees"("createdAt");

-- CreateIndex
CREATE INDEX "employees_deletedAt_idx" ON "employees"("deletedAt");

-- CreateIndex
CREATE INDEX "employee_attendance_employeeId_idx" ON "employee_attendance"("employeeId");

-- CreateIndex
CREATE INDEX "employee_attendance_date_idx" ON "employee_attendance"("date");

-- CreateIndex
CREATE INDEX "employee_attendance_status_idx" ON "employee_attendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "employee_attendance_employeeId_date_key" ON "employee_attendance"("employeeId", "date");

-- CreateIndex
CREATE INDEX "employee_salary_increments_employeeId_idx" ON "employee_salary_increments"("employeeId");

-- CreateIndex
CREATE INDEX "employee_salary_increments_effectiveFrom_idx" ON "employee_salary_increments"("effectiveFrom");

-- CreateIndex
CREATE INDEX "employee_salary_payments_employeeId_idx" ON "employee_salary_payments"("employeeId");

-- CreateIndex
CREATE INDEX "employee_salary_payments_status_idx" ON "employee_salary_payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "employee_salary_payments_employeeId_month_year_key" ON "employee_salary_payments"("employeeId", "month", "year");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_attendance" ADD CONSTRAINT "employee_attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_increments" ADD CONSTRAINT "employee_salary_increments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_increments" ADD CONSTRAINT "employee_salary_increments_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_payments" ADD CONSTRAINT "employee_salary_payments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

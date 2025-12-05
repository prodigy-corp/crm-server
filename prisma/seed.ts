import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'SUPER_ADMIN' },
      update: {},
      create: {
        name: 'SUPER_ADMIN',
        description: 'Super Administrator with system-level access',
      },
    }),
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: {
        name: 'ADMIN',
        description: 'Administrator with full access to content management',
      },
    }),
    prisma.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: {
        name: 'USER',
        description: 'Standard user with limited access',
      },
    }),
    prisma.role.upsert({
      where: { name: 'SELLER' },
      update: {},
      create: {
        name: 'SELLER',
        description: 'Seller with marketplace access',
      },
    }),
    prisma.role.upsert({
      where: { name: 'EMPLOYEE' },
      update: {},
      create: {
        name: 'EMPLOYEE',
        description: 'Employee with access to personal dashboard',
      },
    }),
    prisma.role.upsert({
      where: { name: 'CLIENT' },
      update: {},
      create: {
        name: 'CLIENT',
        description: 'Client with access to project dashboard',
      },
    }),
  ]);

  console.log('✅ Roles created:', roles.map((r) => r.name).join(', '));

  // Create permissions organized by modules
  const permissions = await Promise.all([
    // ==================== EMPLOYEE MODULE ====================
    // Employee Self-Service Permissions
    prisma.permission.upsert({
      where: { name: 'employee.profile.read' },
      update: {},
      create: {
        name: 'employee.profile.read',
        description: 'View own employee profile',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'employee.profile.update' },
      update: {},
      create: {
        name: 'employee.profile.update',
        description: 'Update own profile information',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'employee.attendance.read' },
      update: {},
      create: {
        name: 'employee.attendance.read',
        description: 'View own attendance records',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'employee.attendance.checkin' },
      update: {},
      create: {
        name: 'employee.attendance.checkin',
        description: 'Check in and check out',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'employee.salary.read' },
      update: {},
      create: {
        name: 'employee.salary.read',
        description: 'View own salary information',
      },
    }),

    // ==================== CLIENT MODULE ====================
    // Client Self-Service Permissions
    prisma.permission.upsert({
      where: { name: 'client.profile.read' },
      update: {},
      create: {
        name: 'client.profile.read',
        description: 'View own client profile',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'client.profile.update' },
      update: {},
      create: {
        name: 'client.profile.update',
        description: 'Update own client profile',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'client.projects.read' },
      update: {},
      create: {
        name: 'client.projects.read',
        description: 'View own projects',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'client.invoices.read' },
      update: {},
      create: {
        name: 'client.invoices.read',
        description: 'View own invoices',
      },
    }),

    // ==================== ADMIN - USER MANAGEMENT ====================
    prisma.permission.upsert({
      where: { name: 'admin.users.view' },
      update: {},
      create: {
        name: 'admin.users.view',
        description: 'View users list',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.users.create' },
      update: {},
      create: {
        name: 'admin.users.create',
        description: 'Create new users',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.users.update' },
      update: {},
      create: {
        name: 'admin.users.update',
        description: 'Update user information',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.users.delete' },
      update: {},
      create: {
        name: 'admin.users.delete',
        description: 'Delete users',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.users.block' },
      update: {},
      create: {
        name: 'admin.users.block',
        description: 'Block/unblock users',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.users.verify' },
      update: {},
      create: {
        name: 'admin.users.verify',
        description: 'Verify user emails',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.users.history' },
      update: {},
      create: {
        name: 'admin.users.history',
        description: 'View login history',
      },
    }),

    // ==================== ADMIN - EMPLOYEE MANAGEMENT ====================
    prisma.permission.upsert({
      where: { name: 'admin.employees.view' },
      update: {},
      create: {
        name: 'admin.employees.view',
        description: 'View employees list',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.employees.create' },
      update: {},
      create: {
        name: 'admin.employees.create',
        description: 'Create new employees',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.employees.update' },
      update: {},
      create: {
        name: 'admin.employees.update',
        description: 'Update employee information',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.employees.delete' },
      update: {},
      create: {
        name: 'admin.employees.delete',
        description: 'Delete employees',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.employees.manage' },
      update: {},
      create: {
        name: 'admin.employees.manage',
        description: 'Full employee management access',
      },
    }),

    // ==================== ADMIN - CLIENT MANAGEMENT ====================
    prisma.permission.upsert({
      where: { name: 'admin.clients.view' },
      update: {},
      create: {
        name: 'admin.clients.view',
        description: 'View clients list',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.clients.create' },
      update: {},
      create: {
        name: 'admin.clients.create',
        description: 'Create new clients',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.clients.update' },
      update: {},
      create: {
        name: 'admin.clients.update',
        description: 'Update client information',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.clients.delete' },
      update: {},
      create: {
        name: 'admin.clients.delete',
        description: 'Delete clients',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.clients.manage' },
      update: {},
      create: {
        name: 'admin.clients.manage',
        description: 'Full client management access',
      },
    }),

    // ==================== ADMIN - ATTENDANCE MANAGEMENT ====================
    prisma.permission.upsert({
      where: { name: 'admin.attendance.view' },
      update: {},
      create: {
        name: 'admin.attendance.view',
        description: 'View all attendance records',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.attendance.manage' },
      update: {},
      create: {
        name: 'admin.attendance.manage',
        description: 'Manage attendance (approve leaves, etc.)',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.attendance.reports' },
      update: {},
      create: {
        name: 'admin.attendance.reports',
        description: 'Generate attendance reports',
      },
    }),

    // ==================== ADMIN - DEPARTMENT MANAGEMENT ====================
    prisma.permission.upsert({
      where: { name: 'admin.departments.view' },
      update: {},
      create: {
        name: 'admin.departments.view',
        description: 'View departments list',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.departments.create' },
      update: {},
      create: {
        name: 'admin.departments.create',
        description: 'Create new departments',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.departments.update' },
      update: {},
      create: {
        name: 'admin.departments.update',
        description: 'Update department information',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.departments.delete' },
      update: {},
      create: {
        name: 'admin.departments.delete',
        description: 'Delete departments',
      },
    }),

    // ==================== ADMIN - SHIFT MANAGEMENT ====================
    prisma.permission.upsert({
      where: { name: 'admin.shifts.view' },
      update: {},
      create: {
        name: 'admin.shifts.view',
        description: 'View work shifts list',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.shifts.create' },
      update: {},
      create: {
        name: 'admin.shifts.create',
        description: 'Create new work shifts',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.shifts.update' },
      update: {},
      create: {
        name: 'admin.shifts.update',
        description: 'Update shift schedules',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.shifts.delete' },
      update: {},
      create: {
        name: 'admin.shifts.delete',
        description: 'Delete work shifts',
      },
    }),

    // ==================== ADMIN - BLOG MANAGEMENT ====================
    prisma.permission.upsert({
      where: { name: 'admin.blog.view' },
      update: {},
      create: {
        name: 'admin.blog.view',
        description: 'View blog posts in admin panel',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.blog.create' },
      update: {},
      create: {
        name: 'admin.blog.create',
        description: 'Create blog posts',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.blog.update' },
      update: {},
      create: {
        name: 'admin.blog.update',
        description: 'Update blog posts',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.blog.delete' },
      update: {},
      create: {
        name: 'admin.blog.delete',
        description: 'Delete blog posts',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.blog.publish' },
      update: {},
      create: {
        name: 'admin.blog.publish',
        description: 'Publish/unpublish posts',
      },
    }),

    // ==================== ADMIN - CMS MANAGEMENT ====================
    prisma.permission.upsert({
      where: { name: 'admin.cms.settings.view' },
      update: {},
      create: {
        name: 'admin.cms.settings.view',
        description: 'View CMS settings',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.cms.settings.update' },
      update: {},
      create: {
        name: 'admin.cms.settings.update',
        description: 'Update CMS settings',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.cms.hero.manage' },
      update: {},
      create: {
        name: 'admin.cms.hero.manage',
        description: 'Manage hero sections',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.cms.banner.manage' },
      update: {},
      create: {
        name: 'admin.cms.banner.manage',
        description: 'Manage banners',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.cms.testimonial.manage' },
      update: {},
      create: {
        name: 'admin.cms.testimonial.manage',
        description: 'Manage testimonials',
      },
    }),

    // ==================== ADMIN - ROLE & PERMISSION MANAGEMENT ====================
    prisma.permission.upsert({
      where: { name: 'admin.roles.view' },
      update: {},
      create: {
        name: 'admin.roles.view',
        description: 'View roles and permissions',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.roles.create' },
      update: {},
      create: {
        name: 'admin.roles.create',
        description: 'Create new roles',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.roles.update' },
      update: {},
      create: {
        name: 'admin.roles.update',
        description: 'Update roles',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.roles.delete' },
      update: {},
      create: {
        name: 'admin.roles.delete',
        description: 'Delete roles',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.roles.assign' },
      update: {},
      create: {
        name: 'admin.roles.assign',
        description: 'Assign roles to users',
      },
    }),

    // ==================== ADMIN - DASHBOARD & ANALYTICS ====================
    prisma.permission.upsert({
      where: { name: 'admin.dashboard.view' },
      update: {},
      create: {
        name: 'admin.dashboard.view',
        description: 'View admin dashboard',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.dashboard.stats' },
      update: {},
      create: {
        name: 'admin.dashboard.stats',
        description: 'View statistics',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.dashboard.analytics' },
      update: {},
      create: {
        name: 'admin.dashboard.analytics',
        description: 'View analytics',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.dashboard.reports' },
      update: {},
      create: {
        name: 'admin.dashboard.reports',
        description: 'Generate reports',
      },
    }),

    // ==================== SYSTEM MANAGEMENT (SUPER_ADMIN ONLY) ====================
    prisma.permission.upsert({
      where: { name: 'system.health' },
      update: {},
      create: {
        name: 'system.health',
        description: 'View system health',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'system.logs' },
      update: {},
      create: {
        name: 'system.logs',
        description: 'View system logs',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'system.audit' },
      update: {},
      create: {
        name: 'system.audit',
        description: 'View audit logs',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'system.cache' },
      update: {},
      create: {
        name: 'system.cache',
        description: 'Manage cache',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'system.database' },
      update: {},
      create: {
        name: 'system.database',
        description: 'View database stats',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'system.settings' },
      update: {},
      create: {
        name: 'system.settings',
        description: 'Manage system settings',
      },
    }),

    // ==================== LEGACY PERMISSIONS (for backward compatibility) ====================
    prisma.permission.upsert({
      where: { name: 'users:read' },
      update: {},
      create: {
        name: 'users:read',
        description: 'Legacy: Read user information',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'blogs:read' },
      update: {},
      create: {
        name: 'blogs:read',
        description: 'Legacy: Read blog posts',
      },
    }),

    // ==================== MESSAGE MODULE ====================
    prisma.permission.upsert({
      where: { name: 'message.read' },
      update: {},
      create: {
        name: 'message.read',
        description: 'View messages and conversations',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'message.send' },
      update: {},
      create: {
        name: 'message.send',
        description: 'Send messages',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'message.initiate' },
      update: {},
      create: {
        name: 'message.initiate',
        description: 'Start new conversations',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'message.delete' },
      update: {},
      create: {
        name: 'message.delete',
        description: 'Delete messages and conversations',
      },
    }),
  ]);

  console.log(
    '✅ Permissions created:',
    permissions.map((p) => p.name).join(', '),
  );

  // Assign permissions to SUPER_ADMIN role (all permissions)
  const superAdminRole = roles.find((r) => r.name === 'SUPER_ADMIN');
  if (superAdminRole) {
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      });
    }
    console.log('✅ Super Admin role permissions assigned');
  }

  // Assign permissions to ADMIN role
  const adminRole = roles.find((r) => r.name === 'ADMIN');
  const adminPermissions = permissions.filter(
    (p) =>
      p.name.startsWith('admin.') ||
      p.name.startsWith('users:') ||
      p.name.startsWith('blogs:') ||
      p.name.startsWith('blog.') ||
      p.name.startsWith('roles:') ||
      p.name.startsWith('permissions:') ||
      p.name.startsWith('dashboard:') ||
      p.name.startsWith('message.'),
  );

  if (adminRole) {
    for (const permission of adminPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
    console.log('✅ Admin role permissions assigned');
  }

  // Assign permissions to EMPLOYEE role
  const employeeRole = roles.find((r) => r.name === 'EMPLOYEE');
  const employeePermissions = permissions.filter(
    (p) => p.name.startsWith('employee.') || p.name.startsWith('message.'),
  );

  if (employeeRole) {
    for (const permission of employeePermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: employeeRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: employeeRole.id,
          permissionId: permission.id,
        },
      });
    }
    console.log('✅ Employee role permissions assigned');
  }

  // Assign permissions to CLIENT role
  const clientRole = roles.find((r) => r.name === 'CLIENT');
  const clientPermissions = permissions.filter(
    (p) => p.name.startsWith('client.') || p.name.startsWith('message.'),
  );

  if (clientRole) {
    for (const permission of clientPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: clientRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: clientRole.id,
          permissionId: permission.id,
        },
      });
    }
    console.log('✅ Client role permissions assigned');
  }

  // Create super admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      name: 'Super Admin User',
      password: hashedPassword,
      isEmailVerified: true,
      status: 'ACTIVE',
      accounts: {
        create: {
          provider: 'credentials',
          type: 'credentials',
        },
      },
      roles: {
        create: {
          roleId: superAdminRole!.id,
        },
      },
      notificationSettings: {
        create: {
          newBooking: true,
        },
      },
    },
  });

  console.log('✅ Super Admin user created:', adminUser.email);

  // Create regular admin user
  const regularAdminPassword = await bcrypt.hash('admin123', 12);
  const regularAdminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'Regular Admin User',
      password: regularAdminPassword,
      isEmailVerified: true,
      status: 'ACTIVE',
      accounts: {
        create: {
          provider: 'credentials',
          type: 'credentials',
        },
      },
      roles: {
        create: {
          roleId: adminRole!.id,
        },
      },
      notificationSettings: {
        create: {
          newBooking: true,
        },
      },
    },
  });

  console.log('✅ Regular Admin user created:', regularAdminUser.email);

  // Create test user
  const testHashedPassword = await bcrypt.hash('Test@123', 12);
  const userRole = roles.find((r) => r.name === 'USER');
  const testUser = await prisma.user.upsert({
    where: { email: 'user@gmail.com' },
    update: {},
    create: {
      email: 'user@gmail.com',
      name: 'Test User',
      password: testHashedPassword,
      isEmailVerified: true,
      status: 'ACTIVE',
      accounts: {
        create: {
          provider: 'credentials',
          type: 'credentials',
        },
      },
      roles: {
        create: {
          roleId: userRole!.id,
        },
      },
      notificationSettings: {
        create: {
          newBooking: true,
        },
      },
    },
  });

  console.log('✅ Test user created:', testUser.email);

  // ==================== CREATE SAMPLE SHIFTS ====================
  const morningShift = await prisma.shift.upsert({
    where: { name: 'Morning Shift' },
    update: {},
    create: {
      name: 'Morning Shift',
      description: 'Standard morning shift 9 AM - 5 PM, Saturday & Sunday off',
      startTime: '09:00',
      endTime: '17:00',
      lateToleranceMinutes: 15,
      earlyDepartureToleranceMinutes: 15,
      schedules: {
        create: [
          { dayOfWeek: 0, isOffDay: true, isHalfDay: false }, // Sunday - Off
          {
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '17:00',
            isOffDay: false,
            isHalfDay: false,
          }, // Monday
          {
            dayOfWeek: 2,
            startTime: '09:00',
            endTime: '17:00',
            isOffDay: false,
            isHalfDay: false,
          }, // Tuesday
          {
            dayOfWeek: 3,
            startTime: '09:00',
            endTime: '17:00',
            isOffDay: false,
            isHalfDay: false,
          }, // Wednesday
          {
            dayOfWeek: 4,
            startTime: '09:00',
            endTime: '13:00',
            isOffDay: false,
            isHalfDay: true,
          }, // Thursday - Half day
          {
            dayOfWeek: 5,
            startTime: '09:00',
            endTime: '17:00',
            isOffDay: false,
            isHalfDay: false,
          }, // Friday
          { dayOfWeek: 6, isOffDay: true, isHalfDay: false }, // Saturday - Off
        ],
      },
    },
  });

  const eveningShift = await prisma.shift.upsert({
    where: { name: 'Evening Shift' },
    update: {},
    create: {
      name: 'Evening Shift',
      description: 'Evening shift 2 PM - 10 PM, Friday off',
      startTime: '14:00',
      endTime: '22:00',
      lateToleranceMinutes: 15,
      earlyDepartureToleranceMinutes: 15,
      schedules: {
        create: [
          {
            dayOfWeek: 0,
            startTime: '14:00',
            endTime: '22:00',
            isOffDay: false,
            isHalfDay: false,
          }, // Sunday
          {
            dayOfWeek: 1,
            startTime: '14:00',
            endTime: '22:00',
            isOffDay: false,
            isHalfDay: false,
          }, // Monday
          {
            dayOfWeek: 2,
            startTime: '14:00',
            endTime: '22:00',
            isOffDay: false,
            isHalfDay: false,
          }, // Tuesday
          {
            dayOfWeek: 3,
            startTime: '14:00',
            endTime: '22:00',
            isOffDay: false,
            isHalfDay: false,
          }, // Wednesday
          {
            dayOfWeek: 4,
            startTime: '14:00',
            endTime: '22:00',
            isOffDay: false,
            isHalfDay: false,
          }, // Thursday
          { dayOfWeek: 5, isOffDay: true, isHalfDay: false }, // Friday - Off
          {
            dayOfWeek: 6,
            startTime: '14:00',
            endTime: '22:00',
            isOffDay: false,
            isHalfDay: false,
          }, // Saturday
        ],
      },
    },
  });

  console.log(
    '✅ Sample shifts created:',
    morningShift.name,
    ',',
    eveningShift.name,
  );

  // ==================== CREATE SAMPLE DEPARTMENTS ====================
  const engineeringDept = await prisma.department.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: {
      name: 'Engineering',
      description: 'Software development and technical team',
      defaultShiftId: morningShift.id,
    },
  });

  const salesDept = await prisma.department.upsert({
    where: { name: 'Sales & Marketing' },
    update: {},
    create: {
      name: 'Sales & Marketing',
      description: 'Sales and marketing team',
      defaultShiftId: morningShift.id,
    },
  });

  const supportDept = await prisma.department.upsert({
    where: { name: 'Customer Support' },
    update: {},
    create: {
      name: 'Customer Support',
      description: '24/7 customer support team',
      defaultShiftId: eveningShift.id,
    },
  });

  console.log(
    '✅ Sample departments created:',
    engineeringDept.name,
    ',',
    salesDept.name,
    ',',
    supportDept.name,
  );

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📝 Default Credentials:');
  console.log('   Super Admin: admin@gmail.com / Admin@123');
  console.log('   Regular Admin: admin@gmail.com / admin123');
  console.log('   User: user@gmail.com / Test@123');
  console.log('\n🔐 Permission Summary:');
  console.log('   Super Admin: All permissions (including system management)');
  console.log(
    '   Regular Admin: Content management permissions (users, blogs, roles, dashboard, CMS settings)',
  );
  console.log('   User: Basic user permissions');
  console.log('\n⚠️  IMPORTANT: Change these passwords in production!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

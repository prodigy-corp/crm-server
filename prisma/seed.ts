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
  ]);

  console.log('✅ Roles created:', roles.map((r) => r.name).join(', '));

  // Create permissions
  const permissions = await Promise.all([
    // User Management Permissions
    prisma.permission.upsert({
      where: { name: 'users:read' },
      update: {},
      create: {
        name: 'users:read',
        description: 'Read user information',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users:write' },
      update: {},
      create: {
        name: 'users:write',
        description: 'Create and update users',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users:delete' },
      update: {},
      create: {
        name: 'users:delete',
        description: 'Delete users',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users:block' },
      update: {},
      create: {
        name: 'users:block',
        description: 'Block and unblock users',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users:verify' },
      update: {},
      create: {
        name: 'users:verify',
        description: 'Verify user emails',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users:history' },
      update: {},
      create: {
        name: 'users:history',
        description: 'View user login history',
      },
    }),

    // Blog Management Permissions
    prisma.permission.upsert({
      where: { name: 'blog.create' },
      update: {},
      create: {
        name: 'blog.create',
        description: 'Create blog posts',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'blog.update' },
      update: {},
      create: {
        name: 'blog.update',
        description: 'Update blog posts',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'blog.delete' },
      update: {},
      create: {
        name: 'blog.delete',
        description: 'Delete blog posts',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'blog.delete.permanent' },
      update: {},
      create: {
        name: 'blog.delete.permanent',
        description: 'Permanently delete blog posts',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.blog.view' },
      update: {},
      create: {
        name: 'admin.blog.view',
        description: 'View blog posts in admin panel',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'blogs:read' },
      update: {},
      create: {
        name: 'blogs:read',
        description: 'Read blog posts (legacy)',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'blogs:write' },
      update: {},
      create: {
        name: 'blogs:write',
        description: 'Create and update blog posts (legacy)',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'blogs:delete' },
      update: {},
      create: {
        name: 'blogs:delete',
        description: 'Delete blog posts (legacy)',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'blogs:status' },
      update: {},
      create: {
        name: 'blogs:status',
        description: 'Update blog post status',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'blogs:analytics' },
      update: {},
      create: {
        name: 'blogs:analytics',
        description: 'View blog analytics',
      },
    }),

    // Role Management Permissions
    prisma.permission.upsert({
      where: { name: 'roles:read' },
      update: {},
      create: {
        name: 'roles:read',
        description: 'Read roles and permissions',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles:write' },
      update: {},
      create: {
        name: 'roles:write',
        description: 'Create and update roles',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles:delete' },
      update: {},
      create: {
        name: 'roles:delete',
        description: 'Delete roles',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permissions:read' },
      update: {},
      create: {
        name: 'permissions:read',
        description: 'Read all permissions',
      },
    }),

    // Dashboard Permissions
    prisma.permission.upsert({
      where: { name: 'dashboard:read' },
      update: {},
      create: {
        name: 'dashboard:read',
        description: 'Access admin dashboard',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'dashboard:stats' },
      update: {},
      create: {
        name: 'dashboard:stats',
        description: 'View dashboard statistics',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'dashboard:activities' },
      update: {},
      create: {
        name: 'dashboard:activities',
        description: 'View recent activities',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'dashboard:analytics' },
      update: {},
      create: {
        name: 'dashboard:analytics',
        description: 'View dashboard analytics',
      },
    }),

    // CMS Settings Permissions
    prisma.permission.upsert({
      where: { name: 'admin.settings.view' },
      update: {},
      create: {
        name: 'admin.settings.view',
        description: 'View CMS settings (site settings and SEO settings)',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'admin.settings.update' },
      update: {},
      create: {
        name: 'admin.settings.update',
        description: 'Update CMS settings (site settings and SEO settings)',
      },
    }),

    // SEO Management Permissions
    prisma.permission.upsert({
      where: { name: 'admin.seo.view' },
      update: {},
      create: {
        name: 'admin.seo.view',
        description: 'View SEO analytics and recommendations',
      },
    }),

    // Dashboard CMS Permissions
    prisma.permission.upsert({
      where: { name: 'admin.dashboard.view' },
      update: {},
      create: {
        name: 'admin.dashboard.view',
        description: 'View CMS dashboard statistics',
      },
    }),

    // System Management Permissions (SUPER_ADMIN only)
    prisma.permission.upsert({
      where: { name: 'system:health' },
      update: {},
      create: {
        name: 'system:health',
        description: 'View system health status',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'system:logs' },
      update: {},
      create: {
        name: 'system:logs',
        description: 'View system logs',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'system:audit' },
      update: {},
      create: {
        name: 'system:audit',
        description: 'View audit logs',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'system:cache' },
      update: {},
      create: {
        name: 'system:cache',
        description: 'Clear system cache',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'system:database' },
      update: {},
      create: {
        name: 'system:database',
        description: 'View database statistics',
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

  // Assign permissions to ADMIN role (content management permissions)
  const adminRole = roles.find((r) => r.name === 'ADMIN');
  const adminPermissions = permissions.filter(
    (p) =>
      p.name.startsWith('users:') ||
      p.name.startsWith('blogs:') ||
      p.name.startsWith('blog.') ||
      p.name.startsWith('admin.blog.') ||
      p.name.startsWith('admin.settings.') ||
      p.name.startsWith('admin.seo.') ||
      p.name.startsWith('admin.dashboard.') ||
      p.name.startsWith('roles:') ||
      p.name.startsWith('permissions:') ||
      p.name.startsWith('dashboard:'),
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

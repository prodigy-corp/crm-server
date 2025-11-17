import { AdminCmsHeroController } from './controllers/admin-cms-hero.controller';
import { AdminCmsBannerController } from './controllers/admin-cms-banner.controller';
import { AdminCmsSettingsController } from './controllers/admin-cms-settings.controller';
import { AdminCmsTestimonialController } from './controllers/admin-cms-testimonial.controller';
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { CmsModule } from 'src/cms/cms.module';
import { UploadModule } from 'src/upload/upload.module';
import { AdminController } from './admin.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminBlogsController } from './controllers/admin-blogs.controller';
import { AdminRolesController } from './controllers/admin-roles.controller';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminSystemController } from './controllers/admin-system.controller';
import { AdminEmployeeController } from './controllers/admin-employee.controller';
import { AdminService } from './admin.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminBlogsService } from './services/admin-blogs.service';
import { AdminRolesService } from './services/admin-roles.service';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { AdminSystemService } from './services/admin-system.service';
import { AdminEmployeeService } from './services/admin-employee.service';

@Module({
  imports: [PrismaModule, CommonModule, CmsModule, UploadModule],
  controllers: [
    AdminController,
    AdminUsersController,
    AdminBlogsController,
    AdminRolesController,
    AdminDashboardController,
    AdminSystemController,
    AdminCmsHeroController,
    AdminCmsBannerController,
    AdminCmsSettingsController,
    AdminCmsTestimonialController,
    AdminEmployeeController,
  ],
  providers: [
    AdminService,
    AdminUsersService,
    AdminBlogsService,
    AdminRolesService,
    AdminDashboardService,
    AdminSystemService,
    AdminEmployeeService,
  ],
  exports: [
    AdminService,
    AdminUsersService,
    AdminBlogsService,
    AdminRolesService,
    AdminDashboardService,
    AdminSystemService,
    AdminEmployeeService,
  ],
})
export class AdminModule {}

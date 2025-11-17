import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getAdminInfo() {
    return {
      message: 'Welcome to Admin Panel',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        '/admin/users',
        '/admin/blogs',
        '/admin/roles',
        '/admin/dashboard',
        '/admin/system',
      ],
    };
  }
}

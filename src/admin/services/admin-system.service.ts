import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../common/services/cache.service';

@Injectable()
export class AdminSystemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getSystemHealth() {
    try {
      // Test database connection and measure response time
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - dbStart;

      // Test Redis connection and measure response time
      let redisStatus = 'disconnected';
      let redisResponseTime = 0;
      try {
        const redisStart = Date.now();
        await this.cache.ping();
        redisResponseTime = Date.now() - redisStart;
        redisStatus = 'connected';
      } catch (error) {
        // Redis is optional, don't fail health check
        redisStatus = 'disconnected';
      }

      // Get system info
      const uptime = Math.floor(process.uptime()); // in seconds
      const memoryUsage = process.memoryUsage();
      const totalMemory = memoryUsage.heapTotal;
      const usedMemory = memoryUsage.heapUsed;
      const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

      // Determine overall status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (memoryPercentage > 90 || dbResponseTime > 1000) {
        status = 'critical';
      } else if (memoryPercentage > 75 || dbResponseTime > 500) {
        status = 'warning';
      }

      return {
        status,
        uptime, // in seconds
        memory: {
          used: usedMemory,
          total: totalMemory,
          percentage: memoryPercentage,
        },
        database: {
          status: 'connected',
          responseTime: dbResponseTime,
        },
        redis: {
          status: redisStatus,
          responseTime: redisResponseTime,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'critical',
        uptime: Math.floor(process.uptime()),
        memory: {
          used: 0,
          total: 0,
          percentage: 0,
        },
        database: {
          status: 'disconnected',
          responseTime: 0,
        },
        redis: {
          status: 'disconnected',
          responseTime: 0,
        },
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getSystemLogs() {
    // In a real implementation, you would read from log files or a logging service
    // For now, return sample logs
    const sampleLogs = [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        level: 'INFO',
        message: 'Application started successfully',
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        level: 'INFO',
        message: 'Database connection established',
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60).toISOString(),
        level: 'WARN',
        message: 'High memory usage detected',
      },
    ];

    return sampleLogs;
  }

  async getAuditLogs() {
    try {
      const auditLogs = await this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      // Transform to match frontend expectations
      const transformedLogs = auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        resource: log.entity,
        resourceId: log.entityId,
        userId: log.userId,
        userName: log.user?.name || 'Unknown User',
        ipAddress: log.ip || 'N/A',
        userAgent: log.userAgent || 'N/A',
        timestamp: log.createdAt.toISOString(),
        details: log.changes,
      }));

      return transformedLogs;
    } catch (error) {
      // If auditLog table doesn't exist, return empty array
      return [];
    }
  }

  async clearCache() {
    try {
      await this.cache.clear();

      return {
        status: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: false,
        message: 'Failed to clear cache',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getDatabaseStats() {
    try {
      const [userCount, blogCount, roleCount, permissionCount] =
        await Promise.all([
          this.prisma.user.count(),
          this.prisma.blog.count().catch(() => 0),
          this.prisma.role.count(),
          this.prisma.permission.count(),
        ]);

      // Get database size (PostgreSQL specific)
      let databaseSize = 'Unknown';
      try {
        const dbSize = await this.prisma.$queryRaw<Array<{ size: string }>>`
          SELECT pg_size_pretty(pg_database_size(current_database())) as size
        `;
        databaseSize = dbSize[0]?.size || 'Unknown';
      } catch (error) {
        // Ignore if not PostgreSQL
      }

      return {
        totalUsers: userCount,
        totalBlogs: blogCount,
        totalRoles: roleCount,
        totalPermissions: permissionCount,
        databaseSize,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        totalUsers: 0,
        totalBlogs: 0,
        totalRoles: 0,
        totalPermissions: 0,
        databaseSize: 'Unknown',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

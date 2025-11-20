import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { CacheService } from '../services/cache.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user as { id?: string; userId?: string } | undefined;
    const userId = user?.userId || user?.id;
    if (!userId) {
      return false;
    }

    // Get user permissions with caching
    const permissions = await this.cache.getOrSet<string[]>(
      `user:permissions:${userId}`,
      async () => {
        const userWithPermissions = await this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            roles: {
              select: {
                role: {
                  select: {
                    rolePermissions: {
                      select: {
                        permissions: {
                          select: { name: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
        if (!userWithPermissions) return [];

        const permissionNames = userWithPermissions.roles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permissions.name),
        );

        return [...new Set(permissionNames)];
      },
      60, // TTL seconds
    );

    const userPermissions = permissions;
    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }
}

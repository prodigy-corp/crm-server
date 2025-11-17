import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminRolesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRoles() {
    const roles = await this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
          },
        },
        rolePermissions: {
          select: {
            permissions: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return roles.map((role) => ({
      ...role,
      userCount: role._count.users,
      permissions: role.rolePermissions.map((rp) => rp.permissions),
    }));
  }

  async getRoleById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permissions: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      ...role,
      permissions: role.rolePermissions.map((rp) => rp.permissions),
      users: role.users.map((ur) => ur.user),
    };
  }

  async createRole(data: {
    name: string;
    description?: string;
    permissions?: string[];
  }) {
    const { name, description, permissions = [] } = data;

    // Check if role already exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const role = await this.prisma.role.create({
      data: {
        name,
        description,
        rolePermissions: {
          create: permissions.map((permissionName) => ({
            permissions: {
              connectOrCreate: {
                where: { name: permissionName },
                create: {
                  name: permissionName,
                  description: `${permissionName} permission`,
                },
              },
            },
          })),
        },
      },
      include: {
        rolePermissions: {
          include: {
            permissions: true,
          },
        },
      },
    });

    return {
      ...role,
      permissions: role.rolePermissions.map((rp) => rp.permissions),
    };
  }

  async updateRole(
    id: string,
    data: { name?: string; description?: string; permissions?: string[] },
  ) {
    const { name, description, permissions } = data;

    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    // Check for name conflicts
    if (name && name !== existingRole.name) {
      const nameExists = await this.prisma.role.findUnique({
        where: { name },
      });

      if (nameExists) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(permissions && {
          rolePermissions: {
            deleteMany: {},
            create: permissions.map((permissionName) => ({
              permissions: {
                connectOrCreate: {
                  where: { name: permissionName },
                  create: {
                    name: permissionName,
                    description: `${permissionName} permission`,
                  },
                },
              },
            })),
          },
        }),
      },
      include: {
        rolePermissions: {
          include: {
            permissions: true,
          },
        },
      },
    });

    return {
      ...updatedRole,
      permissions: updatedRole.rolePermissions.map((rp) => rp.permissions),
    };
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.users.length > 0) {
      throw new ConflictException(
        'Cannot delete role that is assigned to users',
      );
    }

    await this.prisma.role.delete({
      where: { id },
    });

    return { message: 'Role deleted successfully' };
  }

  async getAllPermissions() {
    const permissions = await this.prisma.permission.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            rolePermissions: true,
          },
        },
      },
    });

    return permissions.map((permission) => ({
      ...permission,
      roleCount: permission._count.rolePermissions,
    }));
  }
}

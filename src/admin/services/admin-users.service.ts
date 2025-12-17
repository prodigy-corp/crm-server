import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  AdminUserQueryDto,
} from '../dto/admin-user.dto';
import * as bcrypt from 'bcrypt';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(query: AdminUserQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Convert string values to numbers
    const pageNum = parseInt(page as any, 10) || 1;
    const limitNum = parseInt(limit as any, 10) || 10;

    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    // Build where clause
    const where: any = {
      deletedAt: null, // Only get non-deleted users
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (role) {
      where.roles = {
        some: {
          role: {
            name: role,
          },
        },
      };
    }

    // Get total count
    const total = await this.prisma.user.count({ where });

    // Get users with pagination
    const users = await this.prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        isEmailVerified: true,
        isTwoFactorEnabled: true,
        isSellerVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return {
      data: users,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        status: true,
        isEmailVerified: true,
        isTwoFactorEnabled: true,
        isSellerVerified: true,
        blockedUntil: true,
        lastLoginAt: true,
        emailVerifiedAt: true,
        stripeCustomerId: true,
        stripeOnboardingComplete: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        accounts: {
          select: {
            type: true,
            provider: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(createUserDto: CreateAdminUserDto) {
    const { email, password, roles = ['USER'], ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with roles
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        email,
        password: hashedPassword,
        accounts: {
          create: {
            provider: 'credentials',
            type: 'credentials',
          },
        },

        roles: {
          create: roles.map((roleName) => ({
            role: {
              connectOrCreate: {
                where: { name: roleName },
                create: { name: roleName, description: `${roleName} role` },
              },
            },
          })),
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateAdminUserDto) {
    const { roles, ...userData } = updateUserDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // If email is being updated, check for conflicts
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (emailExists) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        ...(roles && {
          roles: {
            deleteMany: {},
            create: roles.map((roleName) => ({
              role: {
                connectOrCreate: {
                  where: { name: roleName },
                  create: { name: roleName, description: `${roleName} role` },
                },
              },
            })),
          },
          accounts: {
            create: {
              provider: 'credentials',
              type: 'credentials',
            },
          },
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        isEmailVerified: true,
        isTwoFactorEnabled: true,
        updatedAt: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return updatedUser;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete
    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        email: `${user.email}_deleted_${Date.now()}`, // Prevent email conflicts
      },
    });

    return { message: 'User deleted successfully' };
  }

  async blockUser(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.BLOCKED,
        blockedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        blockedUntil: true,
      },
    });

    return updatedUser;
  }

  async unblockUser(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.ACTIVE,
        blockedUntil: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        blockedUntil: true,
      },
    });

    return updatedUser;
  }

  async verifyUserEmail(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
      },
    });

    return updatedUser;
  }

  async getUserLoginHistory(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const loginHistory = await this.prisma.loginHistory.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Last 50 login attempts
      select: {
        id: true,
        attempt: true,
        ip: true,
        userAgent: true,
        country: true,
        city: true,
        createdAt: true,
      },
    });

    return {
      userId: id,
      loginHistory,
    };
  }
}

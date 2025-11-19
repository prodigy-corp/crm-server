import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientQueryDto,
} from '../dto/admin-client.dto';
import { ClientStatus, Prisma } from '@prisma/client';

@Injectable()
export class AdminClientService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all clients with pagination and filters
   */
  async findAll(query: ClientQueryDto) {
    const {
      search,
      status,
      clientType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.ClientWhereInput = {
      deletedAt: null,
    };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { clientCode: { contains: search, mode: 'insensitive' } },
        { emailAddress: { contains: search, mode: 'insensitive' } },
        { mobileNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Client type filter
    if (clientType) {
      where.clientType = clientType;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get client by ID
   */
  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!client || client.deletedAt) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  /**
   * Create new client
   */
  async create(createClientDto: CreateClientDto) {
    // Check if client code is unique (if provided)
    if (createClientDto.clientCode) {
      const existing = await this.prisma.client.findUnique({
        where: { clientCode: createClientDto.clientCode },
      });

      if (existing) {
        throw new ConflictException('Client code already exists');
      }
    } else {
      // Auto-generate client code
      createClientDto.clientCode = await this.generateClientCode();
    }

    // Check if email is unique (if provided)
    if (createClientDto.emailAddress) {
      const existing = await this.prisma.client.findUnique({
        where: { emailAddress: createClientDto.emailAddress },
      });

      if (existing) {
        throw new ConflictException('Email address already exists');
      }
    }

    const client = await this.prisma.client.create({
      data: createClientDto as any,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return client;
  }

  /**
   * Update client
   */
  async update(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.findOne(id);

    // Check if client code is unique (if being updated)
    if (
      updateClientDto.clientCode &&
      updateClientDto.clientCode !== client.clientCode
    ) {
      const existing = await this.prisma.client.findUnique({
        where: { clientCode: updateClientDto.clientCode },
      });

      if (existing) {
        throw new ConflictException('Client code already exists');
      }
    }

    // Check if email is unique (if being updated)
    if (
      updateClientDto.emailAddress &&
      updateClientDto.emailAddress !== client.emailAddress
    ) {
      const existing = await this.prisma.client.findUnique({
        where: { emailAddress: updateClientDto.emailAddress },
      });

      if (existing) {
        throw new ConflictException('Email address already exists');
      }
    }

    const updated = await this.prisma.client.update({
      where: { id },
      data: updateClientDto as any,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Soft delete client
   */
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Client deleted successfully',
      id,
    };
  }

  /**
   * Suspend client
   */
  async suspend(id: string) {
    const client = await this.findOne(id);

    if (client.status === ClientStatus.SUSPENDED) {
      throw new BadRequestException('Client is already suspended');
    }

    const updated = await this.prisma.client.update({
      where: { id },
      data: { status: ClientStatus.SUSPENDED },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Activate client
   */
  async activate(id: string) {
    const client = await this.findOne(id);

    if (client.status === ClientStatus.ACTIVE) {
      throw new BadRequestException('Client is already active');
    }

    const updated = await this.prisma.client.update({
      where: { id },
      data: { status: ClientStatus.ACTIVE },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Get client statistics
   */
  async getStatistics() {
    const [
      totalClients,
      activeClients,
      inactiveClients,
      suspendedClients,
      individualClients,
      businessClients,
      enterpriseClients,
      outstandingSum,
    ] = await Promise.all([
      this.prisma.client.count({ where: { deletedAt: null } }),
      this.prisma.client.count({
        where: { status: ClientStatus.ACTIVE, deletedAt: null },
      }),
      this.prisma.client.count({
        where: { status: ClientStatus.INACTIVE, deletedAt: null },
      }),
      this.prisma.client.count({
        where: { status: ClientStatus.SUSPENDED, deletedAt: null },
      }),
      this.prisma.client.count({
        where: { clientType: 'INDIVIDUAL', deletedAt: null },
      }),
      this.prisma.client.count({
        where: { clientType: 'BUSINESS', deletedAt: null },
      }),
      this.prisma.client.count({
        where: { clientType: 'ENTERPRISE', deletedAt: null },
      }),
      this.prisma.client.aggregate({
        where: { deletedAt: null },
        _sum: { outstandingBalance: true },
      }),
    ]);

    return {
      totalClients,
      activeClients,
      inactiveClients,
      suspendedClients,
      individualClients,
      businessClients,
      enterpriseClients,
      totalOutstandingBalance:
        outstandingSum._sum.outstandingBalance?.toNumber() || 0,
    };
  }

  /**
   * Generate unique client code
   */
  private async generateClientCode(): Promise<string> {
    const prefix = 'CL';
    const year = new Date().getFullYear().toString().slice(-2);

    // Get the count of clients created this year
    const count = await this.prisma.client.count({
      where: {
        createdAt: {
          gte: new Date(`${new Date().getFullYear()}-01-01`),
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `${prefix}${year}${sequence}`;
  }

  /**
   * Link client to user account
   */
  async linkUserAccount(clientId: string, userId: string) {
    const client = await this.findOne(clientId);

    // Check if user is already linked to another client
    const existingClient = await this.prisma.client.findUnique({
      where: { userId },
    });

    if (existingClient && existingClient.id !== clientId) {
      throw new ConflictException('User is already linked to another client');
    }

    const updated = await this.prisma.client.update({
      where: { id: clientId },
      data: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Unlink client from user account
   */
  async unlinkUserAccount(clientId: string) {
    await this.findOne(clientId);

    const updated = await this.prisma.client.update({
      where: { id: clientId },
      data: { userId: null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }
}

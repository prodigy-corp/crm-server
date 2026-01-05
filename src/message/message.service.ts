// src/message/message.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UploadService } from 'src/upload/upload.service';
import { PrismaService } from '../prisma/prisma.service';
import { InitMessageDto } from './dto/initMessage.dto';
import { CreateMessageDto, createMessageSchema } from './dto/message.dto';
import {
  PaginationQueryDto,
  paginationQuerySchema,
} from './dto/pagination.dto';
import { SidebarQuery, SidebarQuerySchema } from './dto/sidebar.dto';
import {
  AddMembersDto,
  CreateGroupDto,
  UpdateGroupDto,
  addMembersSchema,
  createGroupSchema,
  updateGroupSchema,
} from './dto/group.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  private readonly logger = new Logger(MessageService.name);

  /**
   * Initiate a message conversation with another user (1-on-1)
   * Creates a message room if it doesn't exist, or sends a message to an existing room
   */
  async initiateMessage(body: InitMessageDto, userId: string) {
    const { receiverId, message } = body;

    // Cannot message yourself
    if (receiverId === userId) {
      throw new BadRequestException('You cannot message yourself');
    }

    // Verify receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, name: true },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    // Check if a message room already exists between these two users
    // We need to check both directions (sender-receiver and receiver-sender)
    const existingRoom = await this.prisma.messageRoom.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: receiverId },
          { senderId: receiverId, receiverId: userId },
        ],
      },
    });

    if (existingRoom) {
      // Room exists, create a new message in this room
      const newMessage = await this.prisma.message.create({
        data: {
          message: message,
          senderId: userId,
          receiverId: receiverId,
          roomId: existingRoom.id,
        },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
          receiver: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // Update room's updatedAt
      await this.prisma.messageRoom.update({
        where: { id: existingRoom.id },
        data: { updatedAt: new Date() },
      });

      return {
        status: true,
        roomId: existingRoom.id,
        data: newMessage,
        message: 'Message sent successfully.',
      };
    }

    // Create a new message room with the first message
    const newMessageRoom = await this.prisma.messageRoom.create({
      data: {
        senderId: userId,
        receiverId: receiverId,
        messages: {
          create: {
            message: message,
            senderId: userId,
            receiverId: receiverId,
          },
        },
      },
      include: {
        messages: true,
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        receiver: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return {
      status: true,
      roomId: newMessageRoom.id,
      data: newMessageRoom,
      message: 'Message room created successfully.',
    };
  }

  /**
   * Send a message in an existing room
   */
  async sendMessage(
    body: CreateMessageDto,
    userId: string,
    roomId: string,
    files: Express.Multer.File[],
  ) {
    const parsebody = createMessageSchema.safeParse(body);
    if (!parsebody.success) {
      throw new BadRequestException(parsebody.error.message);
    }

    const existMessageRoom = await this.prisma.messageRoom.findUnique({
      where: { id: roomId },
    });

    if (!existMessageRoom) {
      throw new NotFoundException('Message room not found');
    }

    // Verify user is a participant or member in this room
    if (existMessageRoom.isGroup) {
      const isMember = await this.prisma.messageRoomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: roomId,
            userId: userId,
          },
        },
      });
      if (!isMember) {
        throw new ForbiddenException('You are not a member of this group');
      }
    } else if (
      existMessageRoom.senderId !== userId &&
      existMessageRoom.receiverId !== userId
    ) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    // Determine the receiver (only for 1-on-1 rooms)
    let receiverId: string | null = null;
    if (!existMessageRoom.isGroup) {
      receiverId =
        existMessageRoom.senderId === userId
          ? existMessageRoom.receiverId
          : existMessageRoom.senderId;
    }

    if (parsebody.data.type === 'TEXT' && parsebody.data.message) {
      const newMessage = await this.prisma.message.create({
        data: {
          message: parsebody.data.message,
          senderId: userId,
          receiverId: receiverId,
          roomId: roomId,
        },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
          receiver: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // Update room's updatedAt
      await this.prisma.messageRoom.update({
        where: { id: roomId },
        data: { updatedAt: new Date() },
      });

      return {
        status: true,
        data: newMessage,
        message: 'Message sent successfully.',
      };
    }

    // Handle file uploads
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one media file is required.');
    }

    const uploadedResults = await Promise.all(
      files.map(async (file) => {
        const uploadResult = await this.uploadService.uploadFile(
          file,
          'messages',
        );
        const newMessage = await this.prisma.message.create({
          data: {
            message: '',
            attachment: uploadResult.Key,
            type: 'IMAGE',
            senderId: userId,
            receiverId: receiverId,
            roomId: roomId,
          },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true },
            },
            receiver: {
              select: { id: true, name: true, avatar: true },
            },
          },
        });
        return newMessage;
      }),
    );

    // Update room's updatedAt
    await this.prisma.messageRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return {
      status: true,
      data: uploadedResults,
      message: 'Message sent successfully.',
    };
  }

  /**
   * Get messages for a single room with pagination
   */
  async getSingleRoom(id: string, query: PaginationQueryDto, userId: string) {
    const parsebody = paginationQuerySchema.safeParse(query);

    if (!parsebody.success) {
      throw new BadRequestException(parsebody.error.message);
    }

    const limit = parsebody.data.limit ? parseInt(parsebody.data.limit) : 20;
    const cursor = parsebody.data.cursor;

    const room = await this.prisma.messageRoom.findUnique({
      where: { id: id },
      include: {
        messages: {
          take: limit,
          skip: cursor ? 1 : 0,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: {
            sentAt: 'desc',
          },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true },
            },
            receiver: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        receiver: {
          select: { id: true, name: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, email: true },
            },
          },
        },
        creator: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Message room not found');
    }

    // Verify user is a participant or member
    let isMember = false;
    if (room.isGroup) {
      isMember = room.members.some((m) => m.userId === userId);
    } else {
      isMember = room.senderId === userId || room.receiverId === userId;
    }

    if (!isMember) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    // Determine other user (only for 1-on-1 rooms)
    const otherUser = room.isGroup
      ? null
      : room.senderId === userId
        ? room.receiver
        : room.sender;

    return {
      status: true,
      data: {
        ...room,
        otherUser,
      },
      cursor:
        room.messages.length > 0
          ? room.messages[room.messages.length - 1]?.id
          : null,
      hasMore: room.messages.length === limit,
      message: 'Message room fetched successfully.',
    };
  }

  /**
   * Get sidebar (list of conversations) for a user
   */
  async getSidebar(userId: string, query: SidebarQuery) {
    const parsebody = SidebarQuerySchema.safeParse(query);

    if (!parsebody.success) {
      throw new BadRequestException(parsebody.error.message);
    }
    const { search, cursor, limit = `10` } = parsebody.data;

    // Build where clause: rooms where user is a participant (1-on-1) or member (Group)
    let where: Prisma.MessageRoomWhereInput;
    if (search && search.trim() !== '') {
      where = {
        AND: [
          {
            OR: [
              { senderId: userId },
              { receiverId: userId },
              { members: { some: { userId: userId } } },
            ],
          },
          {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              {
                AND: [
                  { senderId: userId },
                  {
                    receiver: {
                      name: { contains: search, mode: 'insensitive' },
                    },
                  },
                ],
              },
              {
                AND: [
                  { receiverId: userId },
                  {
                    sender: { name: { contains: search, mode: 'insensitive' } },
                  },
                ],
              },
            ],
          },
        ],
      };
    } else {
      where = {
        OR: [
          { senderId: userId },
          { receiverId: userId },
          { members: { some: { userId: userId } } },
        ],
      };
    }

    const rooms = await this.prisma.messageRoom.findMany({
      where,
      include: {
        receiver: {
          select: { id: true, name: true, avatar: true },
        },
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        messages: {
          select: {
            id: true,
            message: true,
            isRead: true,
            sentAt: true,
            senderId: true,
            type: true,
            attachment: true,
          },
          orderBy: {
            sentAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                receiverId: userId,
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      take: parseInt(limit),
    });

    // Transform rooms to include otherUser field for 1-on-1 and handle group display
    const transformedRooms = rooms.map((room) => {
      let otherUser: any = null;
      if (!room.isGroup) {
        otherUser = room.senderId === userId ? room.receiver : room.sender;
      }
      const lastMessage = room.messages[0] || null;
      return {
        ...room,
        otherUser,
        lastMessage,
        unreadCount: room._count.messages,
      };
    });

    // Sort by last message sentAt (descending)
    transformedRooms.sort((a, b) => {
      const dateA = a.lastMessage
        ? new Date(a.lastMessage.sentAt).getTime()
        : 0;
      const dateB = b.lastMessage
        ? new Date(b.lastMessage.sentAt).getTime()
        : 0;
      return dateB - dateA;
    });

    return {
      status: true,
      data: transformedRooms,
      cursor:
        transformedRooms.length > 0
          ? transformedRooms[transformedRooms.length - 1]?.id
          : null,
      hasMore: transformedRooms.length === parseInt(limit),
      message: 'Message rooms fetched successfully.',
    };
  }

  /**
   * Mark all messages in a room as read for the current user
   */
  async markAsRead(roomId: string, userId: string) {
    const exist = await this.prisma.messageRoom.findUnique({
      where: { id: roomId },
    });

    if (!exist) {
      throw new NotFoundException('Message room not found');
    }

    // Verify user is a participant or member
    let isMember = false;
    if (exist.isGroup) {
      const member = await this.prisma.messageRoomMember.findUnique({
        where: { roomId_userId: { roomId, userId } },
      });
      isMember = !!member;
    } else {
      isMember = exist.senderId === userId || exist.receiverId === userId;
    }

    if (!isMember) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    await this.prisma.message.updateMany({
      where: {
        roomId: roomId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    this.logger.log(
      `Messages in room ${roomId} marked as read for user ${userId}`,
    );

    return {
      status: true,
      message: 'Messages marked as read successfully.',
    };
  }

  /**
   * Delete a single message (only by sender)
   */
  async removeMessage(messageId: string, userId: string) {
    const exist = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!exist) {
      throw new NotFoundException('Message not found');
    }

    if (exist.senderId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this message.',
      );
    }

    // Delete attachment if exists
    if (exist.attachment) {
      try {
        await this.uploadService.deleteFile(exist.attachment);
      } catch (error) {
        this.logger.warn(`Failed to delete attachment: ${exist.attachment}`);
      }
    }

    const deletedMessage = await this.prisma.message.delete({
      where: { id: messageId },
    });

    return {
      status: true,
      data: deletedMessage,
      message: 'Message deleted successfully.',
    };
  }

  /**
   * Delete an entire message room (admin only or participants)
   */
  async deleteRoom(roomId: string, userId: string) {
    const exist = await this.prisma.messageRoom.findUnique({
      where: { id: roomId },
      include: {
        messages: {
          where: {
            attachment: { not: null },
          },
          select: { attachment: true },
        },
      },
    });

    if (!exist) {
      throw new NotFoundException('Message room not found');
    }

    // Verify user is a participant or group admin/creator
    let canDelete = false;
    if (exist.isGroup) {
      if (exist.creatorId === userId) {
        canDelete = true;
      } else {
        const member = await this.prisma.messageRoomMember.findUnique({
          where: { roomId_userId: { roomId, userId } },
        });
        canDelete = !!member?.isAdmin;
      }
    } else {
      canDelete = exist.senderId === userId || exist.receiverId === userId;
    }

    if (!canDelete) {
      throw new ForbiddenException(
        'You are not authorized to delete this conversation.',
      );
    }

    // Delete all attachments
    for (const msg of exist.messages) {
      if (msg.attachment) {
        try {
          await this.uploadService.deleteFile(msg.attachment);
        } catch (error) {
          this.logger.warn(`Failed to delete attachment: ${msg.attachment}`);
        }
      }
    }

    // Delete all messages first
    await this.prisma.message.deleteMany({
      where: { roomId: roomId },
    });

    // Then delete the room
    const deletedRoom = await this.prisma.messageRoom.delete({
      where: { id: roomId },
    });

    return {
      status: true,
      data: deletedRoom,
      message: 'Message room deleted successfully.',
    };
  }

  /**
   * Get list of users that can be messaged (for starting new conversations)
   */
  async getAvailableUsers(
    userId: string,
    search?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const where: Prisma.UserWhereInput = {
      id: { not: userId }, // Exclude current user
      status: 'ACTIVE',
      deletedAt: null,
    };

    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      status: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      message: 'Available users fetched successfully.',
    };
  }

  /**
   * Create a new group chat
   */
  async createGroup(body: CreateGroupDto, userId: string) {
    const parse = createGroupSchema.safeParse(body);
    if (!parse.success) {
      throw new BadRequestException(parse.error.message);
    }

    const { name, memberIds } = parse.data;

    // Filter out duplicates and the creator
    const uniqueMemberIds = [
      ...new Set(memberIds.filter((id) => id !== userId)),
    ];

    const newRoom = await this.prisma.messageRoom.create({
      data: {
        isGroup: true,
        name,
        creatorId: userId,
        members: {
          create: [
            { userId: userId, isAdmin: true },
            ...uniqueMemberIds.map((id) => ({ userId: id })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    return {
      status: true,
      data: newRoom,
      message: 'Group created successfully.',
    };
  }

  /**
   * Add members to a group
   */
  async addMembers(roomId: string, body: AddMembersDto, userId: string) {
    const parse = addMembersSchema.safeParse(body);
    if (!parse.success) {
      throw new BadRequestException(parse.error.message);
    }

    const room = await this.prisma.messageRoom.findUnique({
      where: { id: roomId, isGroup: true },
      include: { members: true },
    });

    if (!room) {
      throw new NotFoundException('Group not found');
    }

    // Check if requester is admin
    const requester = room.members.find((m) => m.userId === userId);
    if (!requester?.isAdmin && room.creatorId !== userId) {
      throw new ForbiddenException('Only admins can add members');
    }

    const { memberIds } = parse.data;
    const existingMemberIds = room.members.map((m) => m.userId);
    const newMemberIds = memberIds.filter(
      (id) => !existingMemberIds.includes(id),
    );

    if (newMemberIds.length === 0) {
      return { status: true, message: 'No new members to add.' };
    }

    await this.prisma.messageRoomMember.createMany({
      data: newMemberIds.map((id) => ({
        roomId,
        userId: id,
      })),
    });

    return {
      status: true,
      message: 'Members added successfully.',
    };
  }

  /**
   * Remove a member from a group
   */
  async removeMember(roomId: string, targetUserId: string, userId: string) {
    const room = await this.prisma.messageRoom.findUnique({
      where: { id: roomId, isGroup: true },
      include: { members: true },
    });

    if (!room) {
      throw new NotFoundException('Group not found');
    }

    // Check permissions: creator can remove anyone, admin can remove others (except creator), user can remove self
    const requester = room.members.find((m) => m.userId === userId);
    const target = room.members.find((m) => m.userId === targetUserId);

    if (!target) {
      throw new NotFoundException('Member not found in group');
    }

    const isSelf = targetUserId === userId;
    const isCreator = room.creatorId === userId;
    const isAdmin = requester?.isAdmin;
    const isTargetCreator = room.creatorId === targetUserId;

    if (!isSelf) {
      if (!isCreator && !isAdmin) {
        throw new ForbiddenException(
          'You do not have permission to remove members',
        );
      }
      if (isAdmin && !isCreator && isTargetCreator) {
        throw new ForbiddenException('Admins cannot remove the group creator');
      }
    }

    await this.prisma.messageRoomMember.delete({
      where: {
        roomId_userId: {
          roomId,
          userId: targetUserId,
        },
      },
    });

    return {
      status: true,
      message: isSelf ? 'You left the group.' : 'Member removed successfully.',
    };
  }

  /**
   * Update group details
   */
  async updateGroup(roomId: string, body: UpdateGroupDto, userId: string) {
    const parse = updateGroupSchema.safeParse(body);
    if (!parse.success) {
      throw new BadRequestException(parse.error.message);
    }

    const room = await this.prisma.messageRoom.findUnique({
      where: { id: roomId, isGroup: true },
      include: { members: true },
    });

    if (!room) {
      throw new NotFoundException('Group not found');
    }

    const requester = room.members.find((m) => m.userId === userId);
    if (!requester?.isAdmin && room.creatorId !== userId) {
      throw new ForbiddenException('Only admins can update group details');
    }

    const updatedRoom = await this.prisma.messageRoom.update({
      where: { id: roomId },
      data: parse.data,
    });

    return {
      status: true,
      data: updatedRoom,
      message: 'Group updated successfully.',
    };
  }
}

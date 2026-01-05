// src/message/message.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { ZodValidationPipe } from '../common/zodValidationPipe';
import { initMessageSchema, InitMessageDto } from './dto/initMessage.dto';
import { CreateMessageDto } from './dto/message.dto';
import { PaginationQueryDto } from './dto/pagination.dto';
import { SidebarQuery } from './dto/sidebar.dto';
import { MessageService } from './message.service';
import {
  AddMembersDto,
  CreateGroupDto,
  UpdateGroupDto,
  addMembersSchema,
  createGroupSchema,
  updateGroupSchema,
} from './dto/group.dto';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * Start a new conversation or send message to existing conversation
   */
  @Permissions('message.initiate')
  @Post('initiate')
  initiateMessage(
    @Body(new ZodValidationPipe(initMessageSchema)) body: InitMessageDto,
    @Req() req,
  ) {
    return this.messageService.initiateMessage(body, req.user.userId);
  }

  /**
   * Send a message in an existing conversation
   */
  @Permissions('message.send')
  @Post('send/:roomId')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 5 }]))
  sendMessage(
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Body() body: CreateMessageDto,
    @Req() req,
    @Param('roomId') roomId: string,
  ) {
    return this.messageService.sendMessage(
      body,
      req.user.userId,
      roomId,
      files?.files || [],
    );
  }

  /**
   * Get list of conversations (sidebar)
   */
  @Permissions('message.read')
  @Get('sidebar')
  getSidebar(@Req() req, @Query() query: SidebarQuery) {
    return this.messageService.getSidebar(req.user.userId, query);
  }

  /**
   * Get list of available users to start a conversation with
   */
  @Permissions('message.read')
  @Get('users')
  getAvailableUsers(
    @Req() req,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messageService.getAvailableUsers(
      req.user.userId,
      search,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  /**
   * Mark all messages in a room as read
   */
  @Permissions('message.read')
  @Patch(':roomId/read')
  markAsRead(@Param('roomId') roomId: string, @Req() req) {
    return this.messageService.markAsRead(roomId, req.user.userId);
  }

  /**
   * Get messages for a specific room
   */
  @Permissions('message.read')
  @Get(':roomId')
  getMessages(
    @Param('roomId') roomId: string,
    @Query() query: PaginationQueryDto,
    @Req() req,
  ) {
    return this.messageService.getSingleRoom(roomId, query, req.user.userId);
  }

  /**
   * Delete a single message
   */
  @Permissions('message.delete')
  @Delete('message/:messageId')
  removeMessage(@Param('messageId') messageId: string, @Req() req) {
    return this.messageService.removeMessage(messageId, req.user.userId);
  }

  /**
   * Delete an entire conversation
   */
  @Permissions('message.delete')
  @Delete(':roomId')
  deleteRoom(@Param('roomId') roomId: string, @Req() req) {
    return this.messageService.deleteRoom(roomId, req.user.userId);
  }

  /**
   * Create a new group conversation
   */
  @Permissions('message.initiate')
  @Post('group')
  createGroup(
    @Body(new ZodValidationPipe(createGroupSchema)) body: CreateGroupDto,
    @Req() req,
  ) {
    return this.messageService.createGroup(body, req.user.userId);
  }

  /**
   * Add members to a group
   */
  @Permissions('message.send')
  @Post(':roomId/members')
  addMembers(
    @Param('roomId') roomId: string,
    @Body(new ZodValidationPipe(addMembersSchema)) body: AddMembersDto,
    @Req() req,
  ) {
    return this.messageService.addMembers(roomId, body, req.user.userId);
  }

  /**
   * Remove a member from a group
   */
  @Permissions('message.delete')
  @Delete(':roomId/members/:userId')
  removeMember(
    @Param('roomId') roomId: string,
    @Param('userId') targetUserId: string,
    @Req() req,
  ) {
    return this.messageService.removeMember(
      roomId,
      targetUserId,
      req.user.userId,
    );
  }

  /**
   * Update group details
   */
  @Permissions('message.send')
  @Patch(':roomId/group')
  updateGroup(
    @Param('roomId') roomId: string,
    @Body(new ZodValidationPipe(updateGroupSchema)) body: UpdateGroupDto,
    @Req() req,
  ) {
    return this.messageService.updateGroup(roomId, body, req.user.userId);
  }
}

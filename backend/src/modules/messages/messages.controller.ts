import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards, 
  Request 
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ChatsService } from '../chats/chats.service';
import { CreateMessageDto, UpdateMessageDto, MessageQueryDto } from './dto/message.dto';
import { MongoAuthGuard } from '../auth/mongo-auth.guard';

@Controller('chats/:chatId/messages')
@UseGuards(MongoAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatsService: ChatsService,
  ) {}

  @Post()
  async sendMessage(
    @Request() req, 
    @Param('chatId') chatId: string, 
    @Body() createMessageDto: CreateMessageDto
  ) {
    const result = await this.messagesService.sendMessage(chatId, req.user.id, createMessageDto);
    return {
      success: true,
      data: result.assistantMessage, // Return only assistant message since user message is added immediately on frontend
    };
  }

  @Get()
  async getMessages(
    @Request() req, 
    @Param('chatId') chatId: string, 
    @Query() query: MessageQueryDto
  ) {
    const result = await this.messagesService.findAllByChatId(chatId, req.user.id, query);
    return {
      success: true,
      data: result.messages,
      pagination: {
        page: result.page,
        limit: parseInt(query.limit, 10),
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  @Get(':messageId')
  async getMessageById(
    @Request() req, 
    @Param('messageId') messageId: string
  ) {
    const message = await this.messagesService.findById(messageId, req.user.id);
    return {
      success: true,
      data: message,
    };
  }

  @Put(':messageId')
  async updateMessage(
    @Request() req, 
    @Param('messageId') messageId: string, 
    @Body() updateMessageDto: UpdateMessageDto
  ) {
    const message = await this.messagesService.update(messageId, req.user.id, updateMessageDto);
    return {
      success: true,
      data: message,
    };
  }

  @Delete(':messageId')
  async deleteMessage(
    @Request() req, 
    @Param('messageId') messageId: string
  ) {
    await this.messagesService.delete(messageId, req.user.id);
    return {
      success: true,
      message: 'Message deleted successfully',
    };
  }
}

// Separate controller for starting new chats
@Controller('messages')
@UseGuards(MongoAuthGuard)
export class NewChatController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatsService: ChatsService,
  ) {}

  @Post('new-chat')
  async startNewChat(
    @Request() req, 
    @Body() createMessageDto: CreateMessageDto
  ) {
    // Create a new chat with the first message
    const chat = await this.chatsService.createWithFirstMessage(req.user.id, createMessageDto.content);
    
    // Send the first message
    const result = await this.messagesService.sendMessage(chat.id, req.user.id, createMessageDto);
    
    return {
      success: true,
      data: {
        chat,
        userMessage: result.userMessage,
        assistantMessage: result.assistantMessage,
      },
    };
  }
}
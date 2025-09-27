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
import { ChatsService } from './chats.service';
import { CreateChatDto, UpdateChatDto, ChatQueryDto } from './dto/chat.dto';
import { MongoAuthGuard } from '../auth/mongo-auth.guard';

@Controller('chats')
@UseGuards(MongoAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  async createChat(@Request() req, @Body() createChatDto: CreateChatDto) {
    const chat = await this.chatsService.create(req.user.id, createChatDto);
    return {
      success: true,
      data: chat,
    };
  }

  @Get()
  async getChats(@Request() req, @Query() query: ChatQueryDto) {
    const result = await this.chatsService.findAllByUser(req.user.id, query);
    return {
      success: true,
      data: result.chats,
      pagination: {
        page: result.page,
        limit: parseInt(query.limit, 10),
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  @Get(':id')
  async getChatById(@Request() req, @Param('id') id: string) {
    const chat = await this.chatsService.findById(id, req.user.id);
    return {
      success: true,
      data: chat,
    };
  }

  @Put(':id')
  async updateChat(
    @Request() req, 
    @Param('id') id: string, 
    @Body() updateChatDto: UpdateChatDto
  ) {
    const chat = await this.chatsService.update(id, req.user.id, updateChatDto);
    return {
      success: true,
      data: chat,
    };
  }

  @Delete(':id')
  async deleteChat(@Request() req, @Param('id') id: string) {
    await this.chatsService.delete(id, req.user.id);
    return {
      success: true,
      message: 'Chat deleted successfully',
    };
  }

  @Get('stats/count')
  async getChatCount(@Request() req) {
    const count = await this.chatsService.getUserChatCount(req.user.id);
    return {
      success: true,
      data: { count },
    };
  }
}
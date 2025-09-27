import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
  Logger 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from '../../schemas/chat.schema';
import { CreateChatDto, UpdateChatDto, ChatQueryDto } from './dto/chat.dto';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);

  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private readonly llmService: LlmService,
  ) {}

  async create(userId: string, createChatDto: CreateChatDto): Promise<ChatDocument> {
    try {
      const chat = new this.chatModel({
        ...createChatDto,
        userId: new Types.ObjectId(userId),
      });

      const savedChat = await chat.save();
      this.logger.log(`Chat created: ${savedChat.id} for user: ${userId}`);
      
      return savedChat;
    } catch (error) {
      this.logger.error('Error creating chat:', error);
      throw error;
    }
  }

  async createWithFirstMessage(userId: string, firstMessage: string): Promise<ChatDocument> {
    try {
      // Generate title from first message
      const title = await this.llmService.generateTitle(firstMessage);
      
      const chat = new this.chatModel({
        title,
        userId: new Types.ObjectId(userId),
        messageCount: 0,
      });

      const savedChat = await chat.save();
      this.logger.log(`Chat created with auto-title: ${savedChat.id} for user: ${userId}`);
      
      return savedChat;
    } catch (error) {
      this.logger.error('Error creating chat with first message:', error);
      throw error;
    }
  }

  async findAllByUser(
    userId: string, 
    query: ChatQueryDto
  ): Promise<{
    chats: ChatDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = parseInt(query.page, 10);
    const limit = parseInt(query.limit, 10);
    const skip = (page - 1) * limit;

    // Build search filter
    const filter: any = { 
      userId: new Types.ObjectId(userId),
      isActive: true 
    };

    if (query.search) {
      filter.title = { $regex: query.search, $options: 'i' };
    }

    const [chats, total] = await Promise.all([
      this.chatModel
        .find(filter)
        .sort({ lastMessageAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.chatModel.countDocuments(filter),
    ]);

    return {
      chats,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId: string): Promise<ChatDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Chat not found');
    }

    const chat = await this.chatModel.findById(id).exec();

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Check ownership
    if (chat.userId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return chat;
  }

  async update(id: string, userId: string, updateChatDto: UpdateChatDto): Promise<ChatDocument> {
    const chat = await this.findById(id, userId); // This already checks ownership

    Object.assign(chat, updateChatDto);
    const updatedChat = await chat.save();

    this.logger.log(`Chat updated: ${updatedChat.id}`);
    return updatedChat;
  }

  async delete(id: string, userId: string): Promise<void> {
    const chat = await this.findById(id, userId); // This already checks ownership

    chat.isActive = false;
    await chat.save();

    this.logger.log(`Chat deleted: ${id}`);
  }

  async updateMessageCount(id: string, increment: number = 1): Promise<void> {
    await this.chatModel.findByIdAndUpdate(
      id,
      { 
        $inc: { messageCount: increment },
        lastMessageAt: new Date(),
      }
    ).exec();
  }

  async updateLastMessageTime(id: string): Promise<void> {
    await this.chatModel.findByIdAndUpdate(
      id,
      { lastMessageAt: new Date() }
    ).exec();
  }

  async getUserChatCount(userId: string): Promise<number> {
    return this.chatModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });
  }
}
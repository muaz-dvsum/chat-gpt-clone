import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
  BadRequestException,
  Logger 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument, MessageRole, MessageStatus } from '../../schemas/message.schema';
import { CreateMessageDto, UpdateMessageDto, MessageQueryDto } from './dto/message.dto';
import { ChatsService } from '../chats/chats.service';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly chatsService: ChatsService,
    private readonly llmService: LlmService,
  ) {}

  async createUserMessage(
    chatId: string, 
    userId: string, 
    createMessageDto: CreateMessageDto
  ): Promise<MessageDocument> {
    // Verify chat ownership
    await this.chatsService.findById(chatId, userId);

    const message = new this.messageModel({
      ...createMessageDto,
      chatId: new Types.ObjectId(chatId),
      userId: new Types.ObjectId(userId),
      role: MessageRole.USER,
      status: MessageStatus.COMPLETED,
    });

    const savedMessage = await message.save();

    // Update chat message count and last message time
    await this.chatsService.updateMessageCount(chatId);

    this.logger.log(`User message created: ${savedMessage.id}`);
    return savedMessage;
  }

  async createAssistantMessage(
    chatId: string, 
    userId: string, 
    userMessage: string
  ): Promise<MessageDocument> {
    try {
      // Generate AI response synchronously for better UX
      this.logger.log(`Generating AI response for message: "${userMessage.substring(0, 50)}..."`);
      const llmResponse = await this.llmService.generateResponse(userMessage);

      // Create assistant message with the generated response
      const assistantMessage = new this.messageModel({
        chatId: new Types.ObjectId(chatId),
        userId: new Types.ObjectId(userId),
        content: llmResponse.content,
        role: MessageRole.ASSISTANT,
        status: MessageStatus.COMPLETED,
        tokenCount: llmResponse.tokenCount,
        processedAt: new Date(),
        metadata: {
          processingTime: llmResponse.processingTime,
        },
      });

      const savedMessage = await assistantMessage.save();
      this.logger.log(`Assistant message created: ${savedMessage.id}`);

      // Update chat message count
      await this.chatsService.updateMessageCount(chatId);

      return savedMessage;
    } catch (error) {
      this.logger.error('Error creating assistant message:', error);
      
      // Create failed message instead of throwing
      const failedMessage = new this.messageModel({
        chatId: new Types.ObjectId(chatId),
        userId: new Types.ObjectId(userId),
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        role: MessageRole.ASSISTANT,
        status: MessageStatus.FAILED,
        processedAt: new Date(),
      });

      return await failedMessage.save();
    }
  }

  private async generateAssistantResponse(messageId: string, userMessage: string): Promise<void> {
    try {
      // Generate response using LLM service
      const llmResponse = await this.llmService.generateResponse(userMessage);

      // Update the pending message with the response
      const updatedMessage = await this.messageModel.findByIdAndUpdate(
        messageId,
        {
          content: llmResponse.content,
          status: MessageStatus.COMPLETED,
          tokenCount: llmResponse.tokenCount,
          processedAt: new Date(),
          metadata: {
            processingTime: llmResponse.processingTime,
          },
        },
        { new: true }
      );

      if (updatedMessage) {
        // Update chat message count
        await this.chatsService.updateMessageCount(updatedMessage.chatId.toString());
        this.logger.log(`Assistant message completed: ${messageId}`);
      }
    } catch (error) {
      this.logger.error(`Error generating assistant response for message ${messageId}:`, error);
      
      // Mark message as failed
      await this.messageModel.findByIdAndUpdate(messageId, {
        status: MessageStatus.FAILED,
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        processedAt: new Date(),
      });
    }
  }

  async findAllByChatId(
    chatId: string, 
    userId: string, 
    query: MessageQueryDto
  ): Promise<{
    messages: MessageDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Verify chat ownership
    await this.chatsService.findById(chatId, userId);

    const page = parseInt(query.page, 10);
    const limit = parseInt(query.limit, 10);
    const skip = (page - 1) * limit;

    const filter: any = { chatId: new Types.ObjectId(chatId) };

    if (query.role) {
      filter.role = query.role;
    }

    const [messages, total] = await Promise.all([
      this.messageModel
        .find(filter)
        .sort({ createdAt: 1 }) // Chronological order
        .skip(skip)
        .limit(limit)
        .exec(),
      this.messageModel.countDocuments(filter),
    ]);

    return {
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId: string): Promise<MessageDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Message not found');
    }

    const message = await this.messageModel.findById(id).populate('chatId').exec();

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check ownership through chat
    if (message.userId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return message;
  }

  async update(id: string, userId: string, updateMessageDto: UpdateMessageDto): Promise<MessageDocument> {
    const message = await this.findById(id, userId);

    // Only allow updating user messages
    if (message.role !== MessageRole.USER) {
      throw new BadRequestException('Can only edit user messages');
    }

    Object.assign(message, updateMessageDto);
    message.updatedAt = new Date();
    
    const updatedMessage = await message.save();
    this.logger.log(`Message updated: ${updatedMessage.id}`);
    
    return updatedMessage;
  }

  async delete(id: string, userId: string): Promise<void> {
    const message = await this.findById(id, userId);
    
    await this.messageModel.findByIdAndDelete(id);
    
    // Update chat message count
    await this.chatsService.updateMessageCount(message.chatId.toString(), -1);
    
    this.logger.log(`Message deleted: ${id}`);
  }

  async getMessagesByStatus(status: MessageStatus): Promise<MessageDocument[]> {
    return this.messageModel.find({ status }).exec();
  }

  async sendMessage(
    chatId: string, 
    userId: string, 
    createMessageDto: CreateMessageDto
  ): Promise<{ userMessage: MessageDocument; assistantMessage: MessageDocument }> {
    // Create user message
    const userMessage = await this.createUserMessage(chatId, userId, createMessageDto);
    
    // Create assistant message (this will process asynchronously)
    const assistantMessage = await this.createAssistantMessage(chatId, userId, createMessageDto.content);
    
    return { userMessage, assistantMessage };
  }
}
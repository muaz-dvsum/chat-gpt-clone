import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Chat } from './chat.schema';

export type MessageDocument = Message & Document;

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum MessageStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
  chatId: Types.ObjectId | Chat;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId | User;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ 
    type: String, 
    enum: Object.values(MessageRole), 
    required: true 
  })
  role: MessageRole;

  @Prop({ 
    type: String, 
    enum: Object.values(MessageStatus), 
    default: MessageStatus.COMPLETED 
  })
  status: MessageStatus;

  @Prop({ type: Number })
  tokenCount?: number;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Date })
  processedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes for efficient querying
MessageSchema.index({ chatId: 1, createdAt: 1 });
MessageSchema.index({ userId: 1, createdAt: -1 });
MessageSchema.index({ status: 1, createdAt: -1 });
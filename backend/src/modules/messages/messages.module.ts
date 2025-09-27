import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '../../schemas/message.schema';
import { MessagesService } from './messages.service';
import { MessagesController, NewChatController } from './messages.controller';
import { ChatsModule } from '../chats/chats.module';
import { LlmModule } from '../llm/llm.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    ChatsModule,
    LlmModule,
    AuthModule,
    UsersModule,
  ],
  providers: [MessagesService],
  controllers: [MessagesController, NewChatController],
  exports: [MessagesService],
})
export class MessagesModule {}
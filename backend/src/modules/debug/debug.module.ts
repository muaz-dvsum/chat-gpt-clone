import { Module } from '@nestjs/common';
import { DebugController } from './debug.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ChatsModule } from '../chats/chats.module';

@Module({
  imports: [AuthModule, UsersModule, ChatsModule],
  controllers: [DebugController],
})
export class DebugModule {}
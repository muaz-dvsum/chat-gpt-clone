import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MongoAuthGuard } from '../auth/mongo-auth.guard';
import { MongoAuthService } from '../auth/mongo-auth.service';
import { UsersService } from '../users/users.service';
import { ChatsService } from '../chats/chats.service';

@Controller('debug')
export class DebugController {
  constructor(
    private readonly authService: MongoAuthService,
    private readonly usersService: UsersService,
    private readonly chatsService: ChatsService,
  ) {}

  @Post('test-auth')
  async testAuth(@Body() body: { email: string; password: string }) {
    try {
      console.log('DEBUG: Testing authentication for:', body.email);
      
      // Find user
      const user = await this.usersService.findByEmail(body.email);
      console.log('DEBUG: User found:', user ? {
        id: user._id.toString(),
        email: user.email,
        hasPassword: !!user.password,
        passwordLength: user.password?.length || 0
      } : 'Not found');

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Test password validation
      if (!user.password) {
        return { success: false, message: 'User has no password set' };
      }

      // Try to validate user
      const validatedUser = await this.authService.validateUser(body.email, body.password);
      console.log('DEBUG: User validation result:', validatedUser ? 'Valid' : 'Invalid');

      if (validatedUser) {
        // Try to sign in
        const signInResult = await this.authService.signIn(body.email, body.password);
        console.log('DEBUG: Sign in successful, token generated');
        
        return {
          success: true,
          data: {
            user: signInResult.user,
            tokenLength: signInResult.session.access_token.length,
          }
        };
      } else {
        return { success: false, message: 'Invalid password' };
      }
    } catch (error) {
      console.error('DEBUG: Auth test error:', error);
      return { 
        success: false, 
        message: error.message,
        error: error.name 
      };
    }
  }

  @Get('user-info')
  @UseGuards(MongoAuthGuard)
  async getUserInfo(@Request() req) {
    try {
      console.log('DEBUG: Auth guard passed, user info:', {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name
      });

      // Get user's chats
      const chatsResult = await this.chatsService.findAllByUser(req.user.id, { 
        page: '1', 
        limit: '10' 
      });

      console.log('DEBUG: User chats found:', chatsResult.chats.length);

      return {
        success: true,
        data: {
          user: req.user,
          chatCount: chatsResult.total,
          chats: chatsResult.chats.map(chat => ({
            id: chat._id.toString(),
            title: chat.title,
            userId: chat.userId.toString(),
            belongsToUser: chat.userId.toString() === req.user.id
          }))
        }
      };
    } catch (error) {
      console.error('DEBUG: User info error:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  }

  @Post('reset-user-password')
  async resetUserPassword(@Body() body: { email: string; newPassword: string }) {
    try {
      const user = await this.usersService.findByEmail(body.email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Hash the new password
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(body.newPassword, 10);

      // Update user password
      await this.usersService.update(user._id.toString(), { 
        password: hashedPassword 
      });

      console.log('DEBUG: Password reset for user:', body.email);

      return { 
        success: true, 
        message: 'Password reset successfully' 
      };
    } catch (error) {
      console.error('DEBUG: Password reset error:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  }
}
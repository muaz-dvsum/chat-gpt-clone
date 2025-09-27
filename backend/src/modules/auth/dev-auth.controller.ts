import { Controller, Post, Body, Get, Headers } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('dev-auth')
export class DevAuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signin')
  async devSignIn(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Simple development authentication - any password works
    const userId = 'dev-user-' + Buffer.from(email).toString('base64').substring(0, 10);
    
    // Find or create user
    let dbUser = await this.usersService.findByEmail(email);
    
    if (!dbUser) {
      dbUser = await this.usersService.create({
        email,
        name: email.split('@')[0],
        supabaseId: userId,
      });
    }

    return {
      success: true,
      data: {
        user: {
          id: userId,
          email,
          user_metadata: { name: dbUser.name },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          dbId: dbUser._id.toString(),
          name: dbUser.name,
        },
        session: {
          access_token: 'dev-token-' + userId + '-' + Date.now(),
          refresh_token: 'dev-refresh-' + userId + '-' + Date.now(),
          expires_in: 3600,
        },
      },
    };
  }

  @Post('signup')
  async devSignUp(@Body() body: { email: string; password: string; name?: string }) {
    // For development, signup and signin do the same thing
    return this.devSignIn(body);
  }

  @Post('logout')
  async devLogout() {
    // In development mode, logout is just a success response
    // The client handles clearing tokens
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Get('me')
  async devGetProfile(@Headers('authorization') authorization: string) {
    // Simple development profile endpoint
    // In development mode, just return a success response
    // The frontend will handle maintaining user state from login
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new Error('Authorization token required');
    }

    // For development, return a basic user profile
    return {
      success: true,
      data: {
        user: {
          id: 'dev-user-profile',
          email: 'dev@example.com',
          user_metadata: { name: 'Dev User' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      },
    };
  }
}
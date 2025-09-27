import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { AuthGuard } from './auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
  ) {}

  @Post('signup')
  async signUp(@Body() body: { email: string; password: string; name?: string }) {
    const { email, password, name } = body;
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // First, handle auth with Supabase (or mock)
    const authResult = await this.supabaseService.signUp(email, password, { name });
    
    // Then create user in our database
    try {
      const dbUser = await this.usersService.create({
        email,
        name: name || email.split('@')[0],
        supabaseId: authResult.user.id,
        avatar: (authResult.user.user_metadata as any)?.avatar_url,
      });

      return {
        success: true,
        data: {
          ...authResult,
          user: {
            ...authResult.user,
            dbId: dbUser._id.toString(),
          },
        },
      };
    } catch (error) {
      // If user already exists in DB, just return the auth result
      if (error.message?.includes('already exists')) {
        return {
          success: true,
          data: authResult,
        };
      }
      throw error;
    }
  }

  @Post('signin')
  async signIn(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Handle auth with Supabase (or mock)
    const authResult = await this.supabaseService.signIn(email, password);
    
    // Find or create user in our database
    let dbUser = await this.usersService.findBySupabaseId(authResult.user.id);
    if (!dbUser) {
      dbUser = await this.usersService.create({
        email: authResult.user.email,
        name: (authResult.user.user_metadata as any)?.name || email.split('@')[0],
        supabaseId: authResult.user.id,
        avatar: (authResult.user.user_metadata as any)?.avatar_url,
      });
    }

    return {
      success: true,
      data: {
        ...authResult,
        user: {
          ...authResult.user,
          dbId: dbUser._id.toString(),
        },
      },
    };
  }

  @Post('google')
  async signInWithGoogle() {
    const result = await this.supabaseService.signInWithGoogle();
    return {
      success: true,
      data: result,
    };
  }

  @Post('refresh')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    const tokens = await this.supabaseService.refreshToken(refreshToken);
    return {
      success: true,
      data: tokens,
    };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return {
      success: true,
      data: {
        user: req.user,
      },
    };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout() {
    // In a real implementation, you might want to invalidate the token
    // For now, we'll just return success since Supabase handles token lifecycle
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
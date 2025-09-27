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
    
    // Find or create user in our database
    let dbUser = await this.usersService.findBySupabaseId(authResult.user.id);
    
    if (!dbUser) {
      // Create new user
      try {
        dbUser = await this.usersService.create({
          email,
          name: name || email.split('@')[0],
          supabaseId: authResult.user.id,
          avatar: (authResult.user.user_metadata as any)?.avatar_url,
        });
      } catch (error) {
        // If race condition occurred, try to find the user again
        if (error.message?.includes('already exists')) {
          dbUser = await this.usersService.findBySupabaseId(authResult.user.id);
          if (!dbUser) {
            throw new Error('Failed to create or find user');
          }
        } else {
          throw error;
        }
      }
    }

    return {
      success: true,
      data: {
        ...authResult,
        user: {
          ...authResult.user,
          dbId: dbUser._id.toString(),
          name: dbUser.name,
        },
      },
    };
  }

  @Post('signin')
  async signIn(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Handle auth with Supabase (or mock)
    const authResult = await this.supabaseService.signIn(email, password);
    
    // Find existing user in our database (try by supabaseId first, then by email)
    let dbUser = await this.usersService.findBySupabaseId(authResult.user.id);
    
    if (!dbUser) {
      // Try finding by email (for development mode consistency)
      dbUser = await this.usersService.findByEmail(email);
    }
    
    if (!dbUser) {
      // In development mode, auto-create user on signin
      const isDevelopmentMode = authResult.user.id.startsWith('dev-user-');
      
      if (isDevelopmentMode) {
        try {
          dbUser = await this.usersService.create({
            email: authResult.user.email,
            name: (authResult.user.user_metadata as any)?.name || email.split('@')[0],
            supabaseId: authResult.user.id,
            avatar: (authResult.user.user_metadata as any)?.avatar_url,
          });
        } catch (error) {
          // If user creation fails, try finding again (race condition)
          if (error.message?.includes('already exists')) {
            dbUser = await this.usersService.findByEmail(email);
            if (!dbUser) {
              throw new Error('Failed to create or find user');
            }
          } else {
            throw error;
          }
        }
      } else {
        // Production mode - user must exist
        throw new Error('User not found. Please sign up first.');
      }
    }

    return {
      success: true,
      data: {
        ...authResult,
        user: {
          ...authResult.user,
          dbId: dbUser._id.toString(),
          name: dbUser.name,
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
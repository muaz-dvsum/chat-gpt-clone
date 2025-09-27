import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly supabaseService: SupabaseService) {}

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
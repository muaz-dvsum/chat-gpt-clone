import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { MongoAuthService } from './mongo-auth.service';
import { MongoAuthGuard } from './mongo-auth.guard';

@Controller('auth')
export class MongoAuthController {
  constructor(private readonly authService: MongoAuthService) {}

  @Post('signup')
  async signUp(@Body() body: { email: string; password: string; name?: string }) {
    try {
      const { email, password, name } = body;
      
      if (!email || !password) {
        return {
          success: false,
          message: 'Email and password are required',
        };
      }

      const result = await this.authService.signUp(email, password, name);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Sign up failed',
      };
    }
  }

  @Post('signin')
  async signIn(@Body() body: { email: string; password: string }) {
    try {
      const { email, password } = body;
      
      if (!email || !password) {
        return {
          success: false,
          message: 'Email and password are required',
        };
      }

      const result = await this.authService.signIn(email, password);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Sign in failed',
      };
    }
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refresh_token: string }) {
    try {
      const { refresh_token } = body;
      
      if (!refresh_token) {
        return {
          success: false,
          message: 'Refresh token is required',
        };
      }

      const result = await this.authService.refreshToken(refresh_token);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Token refresh failed',
      };
    }
  }

  @Get('me')
  @UseGuards(MongoAuthGuard)
  async getProfile(@Request() req) {
    return {
      success: true,
      data: {
        user: req.user,
      },
    };
  }

  @Post('logout')
  @UseGuards(MongoAuthGuard)
  async logout() {
    // For JWT tokens, logout is handled client-side by removing the token
    // In a production system, you might want to maintain a blacklist of revoked tokens
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
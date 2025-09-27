import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from './supabase.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token required');
    }

    try {
      // Verify token with Supabase
      const supabaseUser = await this.supabaseService.verifyToken(token);
      
      // Get or create user in our database
      let user = await this.usersService.findBySupabaseId(supabaseUser.id);
      
      if (!user) {
        // Create user if doesn't exist
        user = await this.usersService.create({
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
          supabaseId: supabaseUser.id,
          avatar: supabaseUser.user_metadata?.avatar_url,
        });
      } else {
        // Update last login
        await this.usersService.updateLastLogin(user.id);
      }

      // Attach user to request
      request['user'] = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
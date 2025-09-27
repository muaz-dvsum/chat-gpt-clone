import { 
  Injectable, 
  UnauthorizedException, 
  InternalServerErrorException,
  Logger 
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient | null;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseKey = this.configService.get<string>('supabase.serviceRoleKey');

    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url_here') {
      this.logger.warn('Supabase configuration is missing or incomplete. Auth features will be disabled.');
      this.supabase = null;
      return;
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.logger.log('Supabase client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Supabase client:', error);
      this.supabase = null;
    }
  }

  async verifyToken(token: string): Promise<SupabaseUser> {
    if (!this.supabase) {
      throw new InternalServerErrorException('Supabase is not configured');
    }

    try {
      const { data, error } = await this.supabase.auth.getUser(token);
      
      if (error) {
        this.logger.error('Token verification failed:', error.message);
        throw new UnauthorizedException('Invalid token');
      }

      if (!data.user) {
        throw new UnauthorizedException('User not found');
      }

      return data.user;
    } catch (error) {
      this.logger.error('Token verification error:', error);
      throw new UnauthorizedException('Token verification failed');
    }
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    if (!this.supabase) {
      throw new InternalServerErrorException('Supabase is not configured');
    }

    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        throw new UnauthorizedException('Token refresh failed');
      }

      return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      };
    } catch (error) {
      this.logger.error('Token refresh error:', error);
      throw new UnauthorizedException('Token refresh failed');
    }
  }
}
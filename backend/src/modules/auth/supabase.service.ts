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

    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'your_supabase_url_here' || 
        supabaseUrl.includes('mock-project')) {
      this.logger.warn('Supabase configuration is missing or using mock values. Using development mode.');
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
      // Development mode - return mock user for dev tokens
      if (token.startsWith('dev-token')) {
        this.logger.log('Development mode: Mock token verification');
        return {
          id: 'dev-user-verified',
          email: 'dev@example.com',
          user_metadata: { name: 'Dev User' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as SupabaseUser;
      }
      throw new UnauthorizedException('Invalid token format');
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

  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    if (!this.supabase) {
      // Development mode - return mock response
      this.logger.log('Development mode: Mock sign up for', email);
      return {
        user: {
          id: 'dev-user-' + Date.now(),
          email,
          user_metadata: metadata || {},
          created_at: new Date().toISOString(),
        },
        session: {
          access_token: 'dev-token-' + Date.now(),
          refresh_token: 'dev-refresh-' + Date.now(),
          expires_in: 3600,
        },
      };
    }

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        this.logger.error('Sign up error:', error.message);
        throw new UnauthorizedException(error.message);
      }

      return data;
    } catch (error) {
      this.logger.error('Sign up error:', error);
      throw new UnauthorizedException('Sign up failed');
    }
  }

  async signIn(email: string, password: string) {
    if (!this.supabase) {
      // Development mode - return mock response
      this.logger.log('Development mode: Mock sign in for', email);
      return {
        user: {
          id: 'dev-user-signin',
          email,
          user_metadata: { name: 'Dev User' },
          created_at: new Date().toISOString(),
        },
        session: {
          access_token: 'dev-token-signin-' + Date.now(),
          refresh_token: 'dev-refresh-signin-' + Date.now(),
          expires_in: 3600,
        },
      };
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.logger.error('Sign in error:', error.message);
        throw new UnauthorizedException(error.message);
      }

      return data;
    } catch (error) {
      this.logger.error('Sign in error:', error);
      throw new UnauthorizedException('Sign in failed');
    }
  }

  async signInWithGoogle() {
    if (!this.supabase) {
      // Development mode - return mock response for Google OAuth
      this.logger.log('Development mode: Mock Google sign in');
      return {
        provider: 'google',
        url: 'http://localhost:3000/dashboard', // Mock redirect
      };
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        this.logger.error('Google sign in error:', error.message);
        throw new UnauthorizedException(error.message);
      }

      return data;
    } catch (error) {
      this.logger.error('Google sign in error:', error);
      throw new UnauthorizedException('Google sign in failed');
    }
  }
}
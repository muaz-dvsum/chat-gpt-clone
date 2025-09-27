import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SupabaseService } from './supabase.service';
import { AuthGuard } from './auth.guard';
import { DevAuthController } from './dev-auth.controller';
import { MongoAuthService } from './mongo-auth.service';
import { MongoAuthGuard } from './mongo-auth.guard';
import { MongoAuthController } from './mongo-auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { 
          expiresIn: configService.get<string>('jwt.expiresIn', '1h') 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SupabaseService, AuthGuard, MongoAuthService, MongoAuthGuard],
  controllers: [DevAuthController, MongoAuthController],
  exports: [SupabaseService, AuthGuard, MongoAuthService, MongoAuthGuard],
})
export class AuthModule {}
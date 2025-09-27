import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';
import { MessageRole } from '../../../schemas/message.schema';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  content: string;

  @IsEnum(MessageRole)
  @IsOptional()
  role?: MessageRole = MessageRole.USER;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateMessageDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  content?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class MessageQueryDto {
  @IsString()
  @IsOptional()
  page?: string = '1';

  @IsString()
  @IsOptional()
  limit?: string = '50';

  @IsEnum(MessageRole)
  @IsOptional()
  role?: MessageRole;
}
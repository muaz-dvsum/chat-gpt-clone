import { 
  Controller, 
  Get, 
  Put, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  Query,
  Delete
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { MongoAuthGuard } from '../auth/mongo-auth.guard';

@Controller('users')
@UseGuards(MongoAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return {
      success: true,
      data: req.user,
    };
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(req.user.id, updateUserDto);
    return {
      success: true,
      data: updatedUser,
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }
    
    return {
      success: true,
      data: user,
    };
  }

  @Delete('profile')
  async deactivateAccount(@Request() req) {
    const user = await this.usersService.deactivate(req.user.id);
    return {
      success: true,
      message: 'Account deactivated successfully',
      data: user,
    };
  }
}
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.findOne(id);

    return {
      status: 'success',
      data: user,
      message: 'User Retrieved Successfully',
    };
  }
}

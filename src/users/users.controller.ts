import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin', 'operator', 'viewer')
  list() {
    return this.usersService.findAll();
  }

  @Roles('admin', 'operator')
  @Post()
  create(@Body() body: { email: string; password: string; role: 'admin' | 'operator' | 'viewer' }) {
    return this.usersService.create(body.email, body.password, body.role);
  }
}
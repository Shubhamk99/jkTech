import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  findAllUsersResponseExample,
  updateRoleRequestExample,
  updateRoleResponseExample,
  getMeUserResponseExample,
} from '../swagger-examples/users.examples';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/guards/permissions.guard';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    roles?: string[];
    userRoles?: { role: { name: string } }[];
  };
}

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('user:read')
  @ApiResponse({
    status: 200,
    description: 'List all users.',
    content: {
      'application/json': {
        examples: findAllUsersResponseExample,
      },
    },
  })
  async findAll() {
    return await this.usersService.findAll();
  }

  @Patch('role')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('user:updateRole')
  @ApiBody({
    description: 'Update user roles',
    type: UpdateRoleDto,
    examples: updateRoleRequestExample,
  })
  @ApiResponse({
    status: 200,
    description: 'User roles updated.',
    content: {
      'application/json': {
        examples: updateRoleResponseExample,
      },
    },
  })
  async updateRole(@Body() dto: UpdateRoleDto) {
    return await this.usersService.updateRole(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get current user info.',
    content: {
      'application/json': {
        examples: getMeUserResponseExample,
      },
    },
  })
  async getMe(@Request() req: AuthRequest) {
    if (!req.user || typeof req.user.userId !== 'string') {
      throw new Error('Invalid user object in request');
    }
    return await this.usersService.findOne(req.user.userId);
  }
}

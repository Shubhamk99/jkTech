import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiBody, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  registerRequestExample,
  registerResponseExample,
  loginRequestExample,
  loginResponseExample,
  logoutResponseExample,
  getMeResponseExample,
} from '../swagger-examples/auth.examples';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    roles?: string[];
    userRoles?: { role: { name: string } }[];
  };
}

interface User {
  userId: string;
  username: string;
  roles: string[];
  userRoles: { role: { name: string } }[];
}

@ApiTags('auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({
    description: 'Register new user',
    type: RegisterDto,
    examples: registerRequestExample,
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
    content: {
      'application/json': {
        examples: registerResponseExample,
      },
    },
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: 'User login',
    type: LoginDto,
    examples: loginRequestExample,
  })
  @ApiResponse({
    status: 200,
    description: 'JWT access token.',
    content: {
      'application/json': {
        examples: loginResponseExample,
      },
    },
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'User logged out.',
    content: {
      'application/json': {
        examples: logoutResponseExample,
      },
    },
  })
  async logout(@Request() req: AuthRequest) {
    if (!req.user || typeof req.user.userId !== 'string') {
      throw new Error('Invalid user object in request');
    }
    return this.authService.logout(req.user.userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Get current user info.',
    content: {
      'application/json': {
        examples: getMeResponseExample,
      },
    },
  })
  getMe(@Request() req: AuthRequest): User {
    if (!req.user) {
      throw new Error('User not found in request');
    }
    return {
      userId: req.user.userId,
      username: req.user.username,
      roles: req.user.roles ?? [],
      userRoles: req.user.userRoles ?? [],
    };
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

// Mock guard
class MockJwtAuthGuard {
  canActivate(context: ExecutionContext) {
    return true;
  }
}

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const mockService = {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();
    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call service.register and return result', async () => {
      const dto: RegisterDto = { username: 'a', email: 'e', password: 'pw' };
      const expected = { message: 'ok' };
      jest.spyOn(service, 'register').mockResolvedValue(expected);
      const result = await controller.register(dto);
      expect(service.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should call service.login and return result', async () => {
      const dto: LoginDto = { username: 'a', password: 'pw' };
      const expected = { accessToken: 'token' };
      jest.spyOn(service, 'login').mockResolvedValue(expected);
      const result = await controller.login(dto);
      expect(service.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('logout', () => {
    it('should call service.logout with userId from request', async () => {
      const req = { user: { userId: 'id' } } as any;
      const expected = { message: 'logged out' };
      jest.spyOn(service, 'logout').mockResolvedValue(expected);
      const result = await controller.logout(req);
      expect(service.logout).toHaveBeenCalledWith('id');
      expect(result).toEqual(expected);
    });
    it('should throw if user is missing', async () => {
      await expect(controller.logout({} as any)).rejects.toThrow('Invalid user object in request');
    });
    it('should throw if userId is not a string', async () => {
      await expect(controller.logout({ user: { userId: 123 } } as any)).rejects.toThrow('Invalid user object in request');
    });
  });

  describe('getMe', () => {
    it('should return user info from request', () => {
      const req = {
        user: {
          userId: 'id',
          username: 'bob',
          roles: ['admin'],
          userRoles: [{ role: { name: 'admin' } }],
        },
      } as any;
      const result = controller.getMe(req);
      expect(result).toEqual({
        userId: 'id',
        username: 'bob',
        roles: ['admin'],
        userRoles: [{ role: { name: 'admin' } }],
      });
    });
    it('should throw if user is missing from request', () => {
      expect(() => controller.getMe({} as any)).toThrow('User not found in request');
    });
  });
});

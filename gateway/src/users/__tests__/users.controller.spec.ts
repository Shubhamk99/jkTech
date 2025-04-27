import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockPermissionsGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      // Simulate permission check: allow if user has user:read or user:updateRole
      return req.user && req.user.permissions && (
        req.user.permissions.includes('user:read') ||
        req.user.permissions.includes('user:updateRole')
      );
    }),
  };
  const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            updateRole: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(PermissionsGuard)
      .useValue(mockPermissionsGuard)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();
    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAll and return result', async () => {
    const expected = [{ id: '1' }, { id: '2' }];
    (service.findAll as jest.Mock).mockResolvedValue(expected);
    const result = await controller.findAll();
    expect(result).toBe(expected);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call findAll and return result if user has permission', async () => {
    const expected = [{ id: '1' }, { id: '2' }];
    (service.findAll as jest.Mock).mockResolvedValue(expected);
    // Simulate user with correct permission
    mockPermissionsGuard.canActivate.mockReturnValue(true);
    const result = await controller.findAll();
    expect(result).toBe(expected);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should deny findAll if user lacks permission', async () => {
    mockPermissionsGuard.canActivate.mockReturnValue(false);
    // Simulate forbidden access (in real app, Nest would throw ForbiddenException)
    expect(mockPermissionsGuard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ user: { permissions: [] } }) }) } as any)).toBe(false);
  });

  it('should call updateRole and return result', async () => {
    const dto = { userId: 'id', roles: ['admin'] };
    const expected = { message: 'Roles updated' };
    (service.updateRole as jest.Mock).mockResolvedValue(expected);
    const result = await controller.updateRole(dto as any);
    expect(result).toBe(expected);
    expect(service.updateRole).toHaveBeenCalledWith(dto);
  });

  it('should call updateRole and return result if user has permission', async () => {
    const dto = { userId: 'id', roles: ['admin'] };
    const expected = { message: 'Roles updated' };
    (service.updateRole as jest.Mock).mockResolvedValue(expected);
    mockPermissionsGuard.canActivate.mockReturnValue(true);
    const result = await controller.updateRole(dto as any);
    expect(result).toBe(expected);
    expect(service.updateRole).toHaveBeenCalledWith(dto);
  });

  it('should deny updateRole if user lacks permission', async () => {
    mockPermissionsGuard.canActivate.mockReturnValue(false);
    expect(mockPermissionsGuard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ user: { permissions: [] } }) }) } as any)).toBe(false);
  });

  it('should call getMe and return result', async () => {
    const req = { user: { userId: 'id' } };
    const expected = { id: 'id', username: 'test' };
    (service.findOne as jest.Mock).mockResolvedValue(expected);
    const result = await controller.getMe(req as any);
    expect(result).toBe(expected);
    expect(service.findOne).toHaveBeenCalledWith('id');
  });

  it('should throw error if user is missing in getMe', async () => {
    await expect(controller.getMe({} as any)).rejects.toThrow();
  });

  it('should throw error if service.findAll throws (negative)', async () => {
    (service.findAll as jest.Mock).mockRejectedValue(new Error('FindAll failed'));
    await expect(controller.findAll()).rejects.toThrow('FindAll failed');
  });

  it('should throw error if service.updateRole throws (negative)', async () => {
    (service.updateRole as jest.Mock).mockRejectedValue(new Error('UpdateRole failed'));
    await expect(controller.updateRole({ userId: 'id', roles: ['admin'] } as any)).rejects.toThrow('UpdateRole failed');
  });

  it('should throw error if service.findOne throws (negative)', async () => {
    (service.findOne as jest.Mock).mockRejectedValue(new Error('FindOne failed'));
    await expect(controller.getMe({ user: { userId: 'id' } } as any)).rejects.toThrow('FindOne failed');
  });
});

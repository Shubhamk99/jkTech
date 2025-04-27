import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from '../ingestion.controller';
import { IngestionService } from '../ingestion.service';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('IngestionController', () => {
  let controller: IngestionController;
  let service: IngestionService;

  const mockPermissionsGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      // Simulate permission check: allow if user has ingestion:ingest
      return req.user && req.user.permissions && req.user.permissions.includes('ingestion:ingest');
    }),
  };
  const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: {
            trigger: jest.fn().mockResolvedValue('triggered'),
            status: jest.fn().mockReturnValue('status'),
            getEmbeddings: jest.fn().mockResolvedValue('embeddings'),
            list: jest.fn().mockReturnValue(['ing1', 'ing2']),
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
    controller = module.get<IngestionController>(IngestionController);
    service = module.get<IngestionService>(IngestionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should allow trigger if user has permission', async () => {
    mockPermissionsGuard.canActivate.mockReturnValue(true);
    const dto = { documentId: 'doc123' };
    (service.trigger as jest.Mock).mockResolvedValue('triggered');
    const result = await controller.trigger(dto);
    expect(result).toBe('triggered');
    expect(service.trigger).toHaveBeenCalledWith('doc123');
  });

  it('should deny trigger if user lacks permission', () => {
    mockPermissionsGuard.canActivate.mockReturnValue(false);
    expect(mockPermissionsGuard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ user: { permissions: [] } }) }) } as any)).toBe(false);
  });

  it('should allow status if user has permission', () => {
    mockPermissionsGuard.canActivate.mockReturnValue(true);
    (service.status as jest.Mock).mockReturnValue('status');
    const result = controller.status('id123');
    expect(result).toBe('status');
    expect(service.status).toHaveBeenCalledWith('id123');
  });

  it('should deny status if user lacks permission', () => {
    mockPermissionsGuard.canActivate.mockReturnValue(false);
    expect(mockPermissionsGuard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ user: { permissions: [] } }) }) } as any)).toBe(false);
  });

  it('should allow getEmbeddings if user has permission', async () => {
    mockPermissionsGuard.canActivate.mockReturnValue(true);
    (service.getEmbeddings as jest.Mock).mockResolvedValue('embeddings');
    const result = await controller.getEmbeddings('id456');
    expect(result).toBe('embeddings');
    expect(service.getEmbeddings).toHaveBeenCalledWith('id456');
  });

  it('should deny getEmbeddings if user lacks permission', () => {
    mockPermissionsGuard.canActivate.mockReturnValue(false);
    expect(mockPermissionsGuard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ user: { permissions: [] } }) }) } as any)).toBe(false);
  });

  it('should allow list if user has permission', () => {
    mockPermissionsGuard.canActivate.mockReturnValue(true);
    (service.list as jest.Mock).mockReturnValue(['ing1', 'ing2']);
    const result = controller.list();
    expect(result).toEqual(['ing1', 'ing2']);
    expect(service.list).toHaveBeenCalled();
  });

  it('should deny list if user lacks permission', () => {
    mockPermissionsGuard.canActivate.mockReturnValue(false);
    expect(mockPermissionsGuard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ user: { permissions: [] } }) }) } as any)).toBe(false);
  });
});

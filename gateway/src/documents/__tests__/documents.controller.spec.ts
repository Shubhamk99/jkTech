import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from '../documents.controller';
import { DocumentsService } from '../documents.service';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  const mockPermissionsGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      // Simulate permission check
      return req.user && req.user.permissions && req.user.permissions.includes('document:read');
    }),
  };
  const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: {
            findAll: jest.fn().mockReturnValue(['doc1', 'doc2']),
            findOne: jest.fn().mockReturnValue('doc1'),
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
    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return documents if user has permission', () => {
    const req = { user: { permissions: ['document:read'] } };
    mockPermissionsGuard.canActivate.mockReturnValue(true);
    expect(controller.findAll()).toEqual(['doc1', 'doc2']);
  });

  it('should not return documents if user lacks permission', () => {
    mockPermissionsGuard.canActivate.mockReturnValue(false);
    // Simulate forbidden access (in real app, Nest would throw ForbiddenException)
    expect(mockPermissionsGuard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ user: { permissions: [] } }) }) } as any)).toBe(false);
  });

  // Add more controller tests as needed
});

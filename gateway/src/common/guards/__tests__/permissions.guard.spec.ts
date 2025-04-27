import { PermissionsGuard, PERMISSIONS_KEY, Permissions } from '../permissions.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new PermissionsGuard(reflector);
  });

  it('should return true if no required permissions', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    const context = { getHandler: jest.fn(), getClass: jest.fn(), switchToHttp: jest.fn() } as any;
    expect(guard.canActivate(context as ExecutionContext)).toBe(true);
  });

  it('should return true if user has required permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['read']);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { permissions: ['read', 'write'] } }) })
    } as any;
    expect(guard.canActivate(context as ExecutionContext)).toBe(true);
  });

  it('should return false if user does not have required permission', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { permissions: ['read'] } }) })
    } as any;
    expect(guard.canActivate(context as ExecutionContext)).toBe(false);
  });
});

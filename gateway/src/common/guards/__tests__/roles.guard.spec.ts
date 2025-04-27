import { RolesGuard } from '../roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RolesGuard(reflector);
  });

  it('should return true if no required roles', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    const context = { getHandler: jest.fn(), getClass: jest.fn(), switchToHttp: jest.fn() } as any;
    expect(guard.canActivate(context as ExecutionContext)).toBe(true);
  });

  it('should return true if user has required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { userRoles: [{ role: { name: 'admin' } }] } }) })
    } as any;
    expect(guard.canActivate(context as ExecutionContext)).toBe(true);
  });

  it('should return false if user does not have required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { userRoles: [{ role: { name: 'user' } }] } }) })
    } as any;
    expect(guard.canActivate(context as ExecutionContext)).toBe(false);
  });
});

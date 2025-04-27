import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (...permissions: string[]) =>
  (target: any, key?: any, descriptor?: any) => {
    Reflect.defineMetadata(PERMISSIONS_KEY, permissions, descriptor.value);
  };

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    const userPermissions: string[] = Array.isArray(user?.permissions)
      ? user.permissions
      : [];
    return requiredPermissions.some((permission) => userPermissions.includes(permission));
  }
}

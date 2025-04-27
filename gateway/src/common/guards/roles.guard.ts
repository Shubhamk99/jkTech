import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    // Defensive: ensure user.userRoles is an array
    const userRoles: string[] = Array.isArray(user?.userRoles)
      ? user.userRoles
          .map((ur: any) => ur?.role?.name)
          .filter((r: any) => typeof r === 'string')
      : [];
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}

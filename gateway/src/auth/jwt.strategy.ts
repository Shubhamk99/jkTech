import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from '../common/constants';

interface JwtPayload {
  sub: string;
  username: string;
  roles: string[];
  userRoles?: { role: { name: string } }[];
  permissions?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    // Defensive: ensure payload has the required properties and types
    return {
      userId: typeof payload.sub === 'string' ? payload.sub : '',
      username: typeof payload.username === 'string' ? payload.username : '',
      roles: Array.isArray(payload.roles)
        ? payload.roles.filter((r) => typeof r === 'string')
        : [],
      userRoles: Array.isArray(payload.userRoles) ? payload.userRoles : [],
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
    };
  }
}

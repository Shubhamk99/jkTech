import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/entities/userRole.entity';
import { Role } from '../users/entities/role.entity';

/**
 * Service for handling authentication logic in the gateway.
 * Responsible for user registration, login, logout, and JWT management.
 */
function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (
    err &&
    typeof err === 'object' &&
    Object.prototype.hasOwnProperty.call(err, 'message') &&
    typeof (err as Record<string, unknown>).message === 'string'
  ) {
    return String((err as Record<string, unknown>).message);
  }
  return 'Unknown error';
}

/**
 * Service for handling authentication logic in the gateway.
 * Responsible for user registration, login, logout, and JWT management.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  /**
   * Registers a new user and assigns a default role.
   * @param dto The registration DTO.
   * @returns A promise resolving to a message on successful registration.
   */
  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing: unknown = await this.usersRepository.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });
    if (typeof existing === 'object' && existing !== null)
      throw new ConflictException('Username or email already exists');
    let hashedPassword: string = '';
    try {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    } catch (err: unknown) {
      if (typeof err === 'string') {
        throw new UnauthorizedException(`Password hashing failed: ${err}`);
      } else if (
        err &&
        typeof err === 'object' &&
        Object.prototype.hasOwnProperty.call(err, 'message') &&
        typeof (err as Record<string, unknown>).message === 'string'
      ) {
        throw new UnauthorizedException(
          `Password hashing failed: ${(err as Record<string, unknown>).message}`,
        );
      }
      throw new UnauthorizedException('Password hashing failed: Unknown error');
    }
    const user = this.usersRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
    });
    await this.usersRepository.save(user);
    // Assign default role (viewer)
    let role = await this.roleRepository.findOne({ where: { name: 'viewer' } });
    if (!role) {
      role = this.roleRepository.create({ name: 'viewer' });
      await this.roleRepository.save(role);
    }
    const userRole = this.userRoleRepository.create({ user, role });
    await this.userRoleRepository.save(userRole);
    return { message: 'Registration successful' };
  }

  /**
   * Logs in a user and returns a JWT access token.
   * @param dto The login DTO.
   * @returns A promise resolving to an object containing the access token.
   */
  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.usersRepository.findOne({
      where: { username: dto.username },
      relations: ['userRoles', 'userRoles.role'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(dto.password, user.password);
    } catch (err) {
      throw new UnauthorizedException(
        `Password comparison failed: ${getErrorMessage(err)}`,
      );
    }
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const roles = user.userRoles?.map((ur) => ur.role?.name) || [];
    // --- Permissions logic start ---
    // Fetch permissions for the user via their roles
    const permissionsSet = new Set<string>();
    for (const ur of user.userRoles) {
      const roleWithPerms = await this.roleRepository.findOne({
        where: { id: ur.role.id },
        relations: ['rolePermissions', 'rolePermissions.permission'],
      });
      if (roleWithPerms?.rolePermissions) {
        for (const rp of roleWithPerms.rolePermissions) {
          if (rp.permission?.name) permissionsSet.add(rp.permission.name);
        }
      }
    }
    const permissions = Array.from(permissionsSet);
    // --- Permissions logic end ---
    const payload = {
      username: user.username,
      sub: user.id,
      roles,
      userRoles: user.userRoles,
      permissions,
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  /**
   * Logs out a user by deleting their refresh tokens.
   * @param userId The user's ID.
   * @returns A promise resolving to a message on successful logout.
   */
  async logout(userId: string): Promise<{ message: string }> {
    if (typeof userId !== 'string') {
      throw new UnauthorizedException('Invalid user id');
    }
    await this.refreshTokenRepository.delete({ user: { id: userId } });
    return { message: 'Logged out' };
  }
}

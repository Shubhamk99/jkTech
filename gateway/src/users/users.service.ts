import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserRole } from './entities/userRole.entity';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/rolePermission.entity';

/**
 * Service for managing users, their roles, and permissions.
 * Handles user retrieval, role assignment, and related logic.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  /**
   * Retrieves all users with their roles and permissions.
   * @returns A promise resolving to an array of users.
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.rolePermissions', 'userRoles.role.rolePermissions.permission'],
    });
  }

  /**
   * Retrieves a single user by their ID with roles and permissions.
   * @param userId The user's ID.
   * @returns A promise resolving to the user or null if not found.
   */
  async findOne(userId: string): Promise<User | null> {
    if (typeof userId !== 'string') return null;
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.rolePermissions', 'userRoles.role.rolePermissions.permission'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Updates the roles for a user.
   * @param dto The DTO containing userId and new roles.
   * @returns A promise resolving to a message or null if input is invalid.
   */
  async updateRole(dto: UpdateRoleDto): Promise<{ message: string } | null> {
    if (typeof dto.userId !== 'string' || !Array.isArray(dto.roles))
      return null;
    const user = await this.usersRepository.findOne({
      where: { id: dto.userId },
      relations: ['userRoles'],
    });
    if (!user) throw new NotFoundException('User not found');
    // Remove old roles
    await this.userRoleRepository.delete({ user: { id: dto.userId } });
    // Assign new roles
    for (const roleName of dto.roles) {
      let role = await this.roleRepository.findOne({
        where: { name: roleName },
      });
      if (!role) {
        role = this.roleRepository.create({ name: roleName });
        await this.roleRepository.save(role);
      }
      const userRole = this.userRoleRepository.create({ user, role });
      await this.userRoleRepository.save(userRole);
    }
    return { message: 'Roles updated' };
  }
}

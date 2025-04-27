import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/userRole.entity';
import { Role } from '../entities/role.entity';
import { RolePermission } from '../entities/rolePermission.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: any;
  let userRoleRepository: any;
  let roleRepository: any;
  let rolePermissionRepository: any;

  beforeEach(async () => {
    usersRepository = { find: jest.fn(), findOne: jest.fn() };
    userRoleRepository = { delete: jest.fn(), create: jest.fn(), save: jest.fn() };
    roleRepository = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
    rolePermissionRepository = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: getRepositoryToken(UserRole), useValue: userRoleRepository },
        { provide: getRepositoryToken(Role), useValue: roleRepository },
        { provide: getRepositoryToken(RolePermission), useValue: rolePermissionRepository },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users with relations', async () => {
      usersRepository.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      const result = await service.findAll();
      expect(usersRepository.find).toHaveBeenCalledWith({
        relations: [
          'userRoles',
          'userRoles.role',
          'userRoles.role.rolePermissions',
          'userRoles.role.rolePermissions.permission',
        ],
      });
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('findOne', () => {
    it('should return user by id with relations', async () => {
      usersRepository.findOne.mockResolvedValue({ id: 'abc' });
      const result = await service.findOne('abc');
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'abc' },
        relations: [
          'userRoles',
          'userRoles.role',
          'userRoles.role.rolePermissions',
          'userRoles.role.rolePermissions.permission',
        ],
      });
      expect(result).toEqual({ id: 'abc' });
    });
    it('should return null if userId is not a string', async () => {
      const result = await service.findOne(undefined as any);
      expect(result).toBeNull();
    });
    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('notfound')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRole', () => {
    it('should return null if userId is not a string or roles is not array', async () => {
      expect(await service.updateRole({ userId: 123, roles: ['admin'] } as any)).toBeNull();
      expect(await service.updateRole({ userId: 'abc', roles: undefined } as any)).toBeNull();
    });
    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      await expect(service.updateRole({ userId: 'abc', roles: ['admin'] })).rejects.toThrow(NotFoundException);
    });
    it('should delete old roles, assign new roles, and return message', async () => {
      usersRepository.findOne.mockResolvedValue({ id: 'abc' });
      userRoleRepository.delete.mockResolvedValue({});
      roleRepository.findOne.mockResolvedValue({ id: 2, name: 'admin' });
      userRoleRepository.create.mockReturnValue({});
      userRoleRepository.save.mockResolvedValue({});
      const result = await service.updateRole({ userId: 'abc', roles: ['admin'] });
      expect(userRoleRepository.delete).toHaveBeenCalledWith({ user: { id: 'abc' } });
      expect(roleRepository.findOne).toHaveBeenCalledWith({ where: { name: 'admin' } });
      expect(userRoleRepository.create).toHaveBeenCalled();
      expect(userRoleRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Roles updated' });
    });
    it('should create role if not exists and assign to user', async () => {
      usersRepository.findOne.mockResolvedValue({ id: 'abc' });
      userRoleRepository.delete.mockResolvedValue({});
      roleRepository.findOne.mockResolvedValueOnce(null);
      roleRepository.create.mockReturnValue({ id: 3, name: 'newrole' });
      roleRepository.save.mockResolvedValue({ id: 3, name: 'newrole' });
      userRoleRepository.create.mockReturnValue({});
      userRoleRepository.save.mockResolvedValue({});
      const result = await service.updateRole({ userId: 'abc', roles: ['newrole'] });
      expect(roleRepository.create).toHaveBeenCalledWith({ name: 'newrole' });
      expect(roleRepository.save).toHaveBeenCalledWith({ id: 3, name: 'newrole' });
      expect(result).toEqual({ message: 'Roles updated' });
    });
  });
});

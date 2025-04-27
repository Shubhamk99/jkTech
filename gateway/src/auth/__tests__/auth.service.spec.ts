import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { UserRole } from '../../users/entities/userRole.entity';
import { Role } from '../../users/entities/role.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: any;
  let refreshTokenRepository: any;
  let userRoleRepository: any;
  let roleRepository: any;
  let jwtService: any;

  beforeEach(async () => {
    usersRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    refreshTokenRepository = {
      delete: jest.fn(),
    };
    userRoleRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    roleRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    jwtService = { sign: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: getRepositoryToken(RefreshToken), useValue: refreshTokenRepository },
        { provide: getRepositoryToken(UserRole), useValue: userRoleRepository },
        { provide: getRepositoryToken(Role), useValue: roleRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictException if username or email exists', async () => {
      usersRepository.findOne.mockResolvedValue({ id: 1 });
      await expect(service.register({ username: 'a', email: 'e', password: 'pw' })).rejects.toThrow(ConflictException);
    });
    it('should hash password, create user, assign role, and return success', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpw');
      usersRepository.create.mockReturnValue({ username: 'a', email: 'e', password: 'hashedpw' });
      usersRepository.save.mockResolvedValue({ id: 2 });
      roleRepository.findOne.mockResolvedValue({ id: 3, name: 'viewer' });
      userRoleRepository.create.mockReturnValue({});
      userRoleRepository.save.mockResolvedValue({});
      const result = await service.register({ username: 'a', email: 'e', password: 'pw' });
      expect(bcrypt.hash).toHaveBeenCalledWith('pw', 10);
      expect(usersRepository.create).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Registration successful' });
    });
    it('should create viewer role if not exists', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpw');
      usersRepository.create.mockReturnValue({ username: 'a', email: 'e', password: 'hashedpw' });
      usersRepository.save.mockResolvedValue({ id: 2 });
      roleRepository.findOne.mockResolvedValue(null);
      roleRepository.create.mockReturnValue({ id: 3, name: 'viewer' });
      roleRepository.save.mockResolvedValue({ id: 3, name: 'viewer' });
      userRoleRepository.create.mockReturnValue({});
      userRoleRepository.save.mockResolvedValue({});
      const result = await service.register({ username: 'a', email: 'e', password: 'pw' });
      expect(roleRepository.create).toHaveBeenCalledWith({ name: 'viewer' });
      expect(roleRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Registration successful' });
    });
    it('should throw UnauthorizedException if hashing fails', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('fail'));
      await expect(service.register({ username: 'a', email: 'e', password: 'pw' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      await expect(service.login({ username: 'a', password: 'pw' })).rejects.toThrow(UnauthorizedException);
    });
    it('should throw UnauthorizedException if password does not match', async () => {
      usersRepository.findOne.mockResolvedValue({ id: 1, password: 'hashed', userRoles: [] });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login({ username: 'a', password: 'pw' })).rejects.toThrow(UnauthorizedException);
    });
    it('should sign and return accessToken if credentials are valid', async () => {
      usersRepository.findOne.mockResolvedValue({ id: 1, username: 'a', password: 'hashed', userRoles: [{ role: { name: 'viewer' } }] });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('token');
      const result = await service.login({ username: 'a', password: 'pw' });
      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ username: 'a', sub: 1, roles: ['viewer'] }));
      expect(result).toEqual({ accessToken: 'token' });
    });
    it('should throw UnauthorizedException if bcrypt.compare throws', async () => {
      usersRepository.findOne.mockResolvedValue({ id: 1, password: 'hashed', userRoles: [] });
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('fail'));
      await expect(service.login({ username: 'a', password: 'pw' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should throw UnauthorizedException for invalid userId', async () => {
      await expect(service.logout(undefined as any)).rejects.toThrow(UnauthorizedException);
    });
    it('should delete refresh token and return message', async () => {
      refreshTokenRepository.delete.mockResolvedValue({});
      const result = await service.logout('user-id');
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ user: { id: 'user-id' } });
      expect(result).toEqual({ message: 'Logged out' });
    });
  });
});

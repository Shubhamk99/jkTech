import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserRole } from './entities/userRole.entity';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/rolePermission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Role, RolePermission])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

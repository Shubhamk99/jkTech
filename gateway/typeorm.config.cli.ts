import { DataSource } from 'typeorm';
import { Role } from './src/users/entities/role.entity';
import { Permission } from './src/users/entities/permission.entity';
import { RolePermission } from './src/users/entities/rolePermission.entity';
import { User } from './src/users/entities/user.entity';
import { UserRole } from './src/users/entities/userRole.entity';

export default new DataSource({
  type: 'sqlite',
  database: 'test.sqlite',
  entities: [Role, Permission, RolePermission, User, UserRole],
  migrations: ['db/migrations/*.ts'],
});

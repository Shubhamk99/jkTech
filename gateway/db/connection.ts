import { DataSource } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/users/entities/role.entity';
import { UserRole } from '../src/users/entities/userRole.entity';
import { Document } from '../src/documents/entities/document.entity';
import { RefreshToken } from '../src/auth/entities/refresh-token.entity';
import { Ingestion } from '../src/ingestion/entities/ingestion.entity';
import { Permission } from '../src/users/entities/permission.entity';
import { RolePermission } from '../src/users/entities/rolePermission.entity';
import * as dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Role, UserRole, Document, RefreshToken, Ingestion, Permission, RolePermission],
  synchronize: false, // Use migrations instead
  migrations: [__dirname + '/migrations/*.{ts,js}'],
});

export function getConfig() {
  return {
    database: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      password: process.env.DB_PASSWORD,
      user: process.env.DB_USERNAME,
      dbName: process.env.DB_NAME,
    },
  };
}

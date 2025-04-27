import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { User } from './users/entities/user.entity';
import { Document } from './documents/entities/document.entity';
import { Ingestion } from './ingestion/entities/ingestion.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { Role } from './users/entities/role.entity';
import { Permission } from './users/entities/permission.entity';
import { UserRole } from './users/entities/userRole.entity';
import { RolePermission } from './users/entities/rolePermission.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: +configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'project4'),
        entities: [
          User,
          Document,
          Ingestion,
          RefreshToken,
          Role,
          Permission,
          UserRole,
          RolePermission,
        ],
        synchronize: true, // Set to false in production!
      }),
    }),
    AuthModule,
    UsersModule,
    DocumentsModule,
    IngestionModule,
  ],
})
export class AppModule {}

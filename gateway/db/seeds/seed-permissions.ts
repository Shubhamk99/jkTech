import { AppDataSource } from '../connection';
import { Role } from '../../src/users/entities/role.entity';
import { Permission } from '../../src/users/entities/permission.entity';
import { RolePermission } from '../../src/users/entities/rolePermission.entity';
import { User } from '../../src/users/entities/user.entity';
import { UserRole } from '../../src/users/entities/userRole.entity';
import * as bcrypt from 'bcrypt';

async function seedPermissions() {
  await AppDataSource.initialize();
  const roleRepo = AppDataSource.getRepository(Role);
  const permRepo = AppDataSource.getRepository(Permission);
  const rolePermRepo = AppDataSource.getRepository(RolePermission);
  const userRepo = AppDataSource.getRepository(User);
  const userRoleRepo = AppDataSource.getRepository(UserRole);

  // 1. Seed Permissions (from all controllers, ensure by name)
  const permissions = [
    'user:read',
    'user:updateRole',
    'document:read',
    'document:create',
    'document:update',
    'document:delete',
    'ingestion:trigger',
    'ingestion:status',
    'ingestion:embeddings',
    'ingestion:list',
  ];
  const permEntities: Record<string, Permission> = {};
  for (const name of permissions) {
    let entity = await permRepo.findOne({ where: { name } });
    if (!entity) {
      entity = permRepo.create({ name }); // Let DB assign ID
      await permRepo.save(entity);
      console.log(`Created permission: ${name}`);
    } else {
      console.log(`Permission already exists: ${name}`);
    }
    permEntities[name] = entity;
  }

  // 2. Seed Roles
  const roles = ['admin', 'editor', 'viewer'];
  const roleEntities: Record<string, Role> = {};
  for (const name of roles) {
    let role = await roleRepo.findOne({ where: { name } });
    if (!role) {
      role = roleRepo.create({ name });
      await roleRepo.save(role);
      console.log(`Created role: ${name}`);
    } else {
      console.log(`Role already exists: ${name}`);
    }
    roleEntities[name] = role;
  }

  // 3. Assign Permissions to Roles (via join table)
  const rolePermMap: Record<string, string[]> = {
    admin: permissions,
    editor: [
      'document:read', 'document:create', 'document:update',
      'ingestion:trigger', 'ingestion:status', 'ingestion:embeddings', 'ingestion:list',
    ],
    viewer: ['document:read', 'ingestion:status', 'ingestion:list'],
  };
  for (const [roleName, permNames] of Object.entries(rolePermMap)) {
    const role = roleEntities[roleName];
    for (const permName of permNames) {
      const perm = permEntities[permName];
      let rolePerm = await rolePermRepo.findOne({
        where: {
          role: { id: role.id },
          permission: { id: perm.id }
        },
        relations: ['role', 'permission'],
      });
      if (!rolePerm) {
        rolePerm = rolePermRepo.create({ role, permission: perm });
        await rolePermRepo.save(rolePerm);
        console.log(`Linked ${roleName} -> ${permName}`);
      } else {
        console.log(`Role-permission already exists: ${roleName} -> ${permName}`);
      }
    }
  }

  // 4. Seed Admin User (if not exists) and assign admin role
  const adminUsername = 'admin';
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  let adminUser = await userRepo.findOne({ where: { username: adminUsername } });
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    adminUser = userRepo.create({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
    });
    await userRepo.save(adminUser);
    console.log('Created admin user.');
  } else {
    console.log('Admin user already exists.');
  }
  // Assign admin role
  let adminUserRole = await userRoleRepo.findOne({
    where: {
      user: { id: adminUser.id },
      role: { id: roleEntities['admin'].id }
    },
    relations: ['user', 'role'],
  });
  if (!adminUserRole) {
    adminUserRole = userRoleRepo.create({ user: adminUser, role: roleEntities['admin'] });
    await userRoleRepo.save(adminUserRole);
    console.log('Assigned admin role to admin user.');
  } else {
    console.log('Admin user already has admin role.');
  }

  await AppDataSource.destroy();
  console.log('Permission seeding complete.');
}

seedPermissions().catch((err) => {
  console.error('Error during permission seeding:', err);
  process.exit(1);
});

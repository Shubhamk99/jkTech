import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { getConfig } from './db/connection';

const {
  database: { host, port, password, user, dbName },
} = getConfig();

const config: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host,
  port,
  username: user,
  password,
  database: dbName,
  entities: ['src/**/*.entity.ts'],
  migrations: ['db/migrations/*.ts'],
  seeds: ['src/**/seeds/*.ts', 'db/seeds/*.ts'],
  subscribers: ['src/**/subscribers/*.ts', 'src/subscribers/*.ts'],
  synchronize: false,
};

const dataSource = new DataSource(config);

export default dataSource;

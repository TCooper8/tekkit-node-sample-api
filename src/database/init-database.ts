import { DataSource } from "typeorm";
// Import if you write normal SQL.
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import env from "../env";
import { Migration1701823176114 } from "./migrations/migration-1701823176114";
import { AccountEntity } from "./tables/entities/account-entity";
import { AccountPermissionEntity } from "./tables/entities/account-permission-entity";

/**
 * Initailizes a database datasource.
 * @param retries The max number of retries if the connection fails. Retries have a 5 second intervals.
 * @returns 
 */
export const initDatabase = async (retries: number=5): Promise<DataSource> => {
  const dbUrl = env.get('POSTGRES_URL');
  console.log('Connecting to database...');
  // Connect to the database, default to local if one is running.
  const url = new URL(dbUrl || 'postgres://postgres:postgres@localhost:5432/postgres');

  const source = new DataSource({
    type: 'postgres',
    namingStrategy: new SnakeNamingStrategy(),
    url: url.toString(),
    migrationsRun: true,
    logging: true,
    migrations: [
      Migration1701823176114,
    ],
    entities: [
      AccountEntity,
      AccountPermissionEntity,
    ],
  });
  try {
    await source.initialize();
    return source;
  }
  catch (err) {
    if (err.name === 'AlreadyHasActiveConnectionError') {
      return source;
    }

    if (retries <= 0) throw err;
    await new Promise(f => setTimeout(f, 5000));
    return await initDatabase(retries - 1);
  }
};
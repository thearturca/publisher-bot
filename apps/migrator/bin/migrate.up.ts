import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from "kysely";
import pg from "pg";
import { Database, PostgresConfigValidator } from "@repo/db";
import { promises as fs } from "fs";
import path from "path"

const { Pool } = pg;

async function up() {
      PostgresConfigValidator.parse(process.env);

      const db = new Kysely<Database>({
            dialect: new PostgresDialect({
                  pool: new Pool({
                        user: process.env.POSTGRES_USER,
                        password: process.env.POSTGRES_PASSWORD,
                        host: process.env.POSTGRES_HOST,
                        port: Number(process.env.POSTGRES_PORT),
                        database: process.env.POSTGRES_DB,
                  })
            }),
      });

      const migrator = new Migrator({
            db,
            provider: new FileMigrationProvider({
                  fs,
                  path,
                  migrationFolder: path.join(process.cwd(), "../../db/migrations/"),
            }),
      });
      const { error, results } = await migrator.migrateToLatest()

      results?.forEach((it) => {
            if (it.status === 'Success') {
                  console.log(`migration "${it.migrationName}" was executed successfully`)
            } else if (it.status === 'Error') {
                  console.error(`failed to execute migration "${it.migrationName}"`)
            }
      })

      await db.destroy();

      if (error) {
            console.error('failed to migrate')
            throw error;
      }
}

up().catch((error) => {
      console.error(error);
      process.exit(1);
});

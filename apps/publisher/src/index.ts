import pg from "pg";
import { Api } from 'grammy';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from '@repo/db';
import { ConfigValidator } from './env.validator.js';
import { PublisherService } from "./publisher.service.js";

const { Pool } = pg;

async function main() {
      const config = ConfigValidator.parse(process.env);

      const db = new Kysely<Database>({
            dialect: new PostgresDialect({
                  pool: new Pool({
                        port: Number(config.POSTGRES_PORT),
                        user: config.POSTGRES_USER,
                        password: config.POSTGRES_PASSWORD,
                        host: config.POSTGRES_HOST,
                        database: config.POSTGRES_DB,
                  }),
            }),
      });

      const token = config.TG_TOKEN_TEST || config.TG_TOKEN;
      const api = new Api(token, {
            environment: config.TG_TOKEN_TEST ? "test" : "prod",
      });

      console.log("Starting publisher service...");
      const service = new PublisherService(db, api);
      await service.start();
      console.log("Publisher service started.");

      process.once('SIGINT', async () => {
            await service.stop();
            process.exit(0);
      });

      process.once('SIGTERM', async () => {
            await service.stop();
            process.exit(0);
      });
}

main().catch((error) => {
      console.error(error);
      process.exit(1);
});

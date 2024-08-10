import Express from 'express';
import cors from 'cors';
import pg from "pg";
import { Api } from 'grammy';
import { errorHandler } from './middleware/index.js';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from '@repo/db';
import { ConfigValidator } from './env.validator.js';
import { createDefaultRouter } from './routes/default.router.js';

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
      const telegramApi = new Api(token, {
            environment: config.TG_TOKEN_TEST ? "test" : "prod",
      });

      const defaultRouter = createDefaultRouter(db, telegramApi);

      const app = Express();

      app.use(cors({
            origin: '*',
      }));
      app.use(Express.json());
      app.use(defaultRouter);
      app.use(errorHandler);

      const server = app.listen(Number(config.BACKEND_PORT), () => {
            console.log(`Listening on http://127.0.0.1:${config.BACKEND_PORT}`);
      });

      process.once('SIGINT', () => {
            server.close((err) => {
                  console.log('Server closed');
                  process.exit(err ? 1 : 0);
            });
      })

      process.once('SIGTERM', () => {
            server.close((err) => {
                  console.log('Server closed');
                  process.exit(err ? 1 : 0);
            });
      });
}

main().catch((error) => {
      console.error(error);
      process.exit(1);
});

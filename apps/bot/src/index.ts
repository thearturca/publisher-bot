import pg from "pg";
import { Bot } from 'grammy';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from '@repo/db';
import { ConfigValidator } from './env.validator.js';
import { InternalContext } from './types/context.js';
import { Commands } from "./composer/commands.composer.js";
import { UsersService } from "@repo/services";
import { registerUser } from "./middleware/registerUser.middleware.js";
import { trackChannels } from "./composer/trackChannels.composer.js";

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

      const usersService = new UsersService(db);
      const token = config.TG_TOKEN_TEST || config.TG_TOKEN;
      const bot = new Bot<InternalContext>(token, {
            client: {
                  environment: config.TG_TOKEN_TEST ? "test" : "prod",
            }
      });

      bot.use(async (ctx, next) => {
            ctx.usersService = usersService;

            await next();
      });
      bot.use(registerUser);
      bot.use(trackChannels());
      bot.use(Commands(config));

      bot.start({
            onStart(botInfo) {
                  console.log(`@${botInfo.username} started`);
            },
      })
}

main().catch((error) => {
      console.error(error);
      process.exit(1);
});

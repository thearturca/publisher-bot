import { z } from "zod";
import { PostgresConfigValidator } from "@repo/db";

const TelegramValidator = z.object({
      TG_TOKEN: z.string(),
      TG_TOKEN_TEST: z.string().optional(),
      MINI_APP_LINK: z.string(),
});

export const ConfigValidator = TelegramValidator.merge(PostgresConfigValidator);

export type Config = z.infer<typeof ConfigValidator>;

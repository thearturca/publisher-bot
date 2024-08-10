import { z } from "zod";
import { PostgresConfigValidator } from "@repo/db";

const ServerValidator = z.object({
      BACKEND_PORT: z.string(),
});

const TelegramValidator = z.object({
      TG_TOKEN: z.string(),
      TG_TOKEN_TEST: z.string().optional(),
});

export const ConfigValidator = ServerValidator.merge((TelegramValidator)).merge(PostgresConfigValidator);

export type Config = z.infer<typeof ConfigValidator>;

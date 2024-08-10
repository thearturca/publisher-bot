import { z } from "zod";

export const PostgresConfigValidator = z.object({
      POSTGRES_USER: z.string(),
      POSTGRES_PASSWORD: z.string(),
      POSTGRES_HOST: z.string(),
      POSTGRES_PORT: z.string(),
      POSTGRES_DB: z.string(),
});

export type PostgresConfig = z.infer<typeof PostgresConfigValidator>;

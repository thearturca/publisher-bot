import { PostgresConfig } from "@repo/db";

declare global {
      namespace NodeJS {
            interface ProcessEnv extends PostgresConfig { }
      }
}

export { }

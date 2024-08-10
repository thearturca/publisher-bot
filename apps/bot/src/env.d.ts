import type { Conifg } from "./env.validator.ts";

declare global {
      namespace NodeJS {
            interface ProcessEnv extends Config { }
      }
}

export { }

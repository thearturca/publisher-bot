import { Database } from "@repo/db";
import { Api } from "grammy";
import { Kysely } from "kysely";
import { Router } from "express";
import { createApiRouter } from "./api/api.router.js";

export function createDefaultRouter(db: Kysely<Database>, telegramApi: Api): Router {
      const defaultRouter = Router();

      const apiRouter = createApiRouter(db, telegramApi);
      defaultRouter.use("/api", apiRouter);

      return defaultRouter;
}

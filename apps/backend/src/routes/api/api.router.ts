import { Database } from "@repo/db";
import { Router } from "express";
import { Api } from "grammy";
import { Kysely } from "kysely";
import { postsRouter, userRouter } from "./index.js";
import { getInitData, tmaAuth } from "../../middleware/index.js";
import { UnauthorizedError } from "../../errors/index.js";
import { registerUser } from "../../middleware/register.user.js";

export function createApiRouter(db: Kysely<Database>, telegramApi: Api): Router {
      const apiRouter = Router();

      apiRouter.use(tmaAuth(telegramApi.token));

      apiRouter.use((_req, res, next) => {
            const initData = getInitData(res);

            if (!initData?.user)
                  throw new UnauthorizedError();

            return next();
      });

      apiRouter.use(registerUser(db));

      const posts = postsRouter(db, telegramApi);
      apiRouter.use("/posts", posts);

      const user = userRouter(db, telegramApi);
      apiRouter.use("/user", user);

      return apiRouter;
}

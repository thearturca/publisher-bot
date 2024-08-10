import { Router } from "express";
import asyncHandler from "express-async-handler"
import { Kysely } from "kysely";
import { Database } from "@repo/db";
import { UsersService } from "@repo/services";
import { TelegramService } from "../../services/index.js";
import { getInitData } from "../../middleware/index.js";
import { Api } from "grammy";

export function userRouter(db: Kysely<Database>, telegramApi: Api): Router {
      const user = Router();


      const usersService = new UsersService(db);
      const telegramService = new TelegramService(telegramApi);

      user.get('/groups', asyncHandler(async (_req, res) => {
            const initData = getInitData(res);
            const userId = initData!.user!.id.toString();

            const groups = await usersService.getGroups(userId);

            res.json(groups);
      }));

      return user;
}

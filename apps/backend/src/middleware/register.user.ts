import { Database } from "@repo/db";
import { RequestHandler } from "express";
import { Kysely } from "kysely";
import { UsersService } from "@repo/services";
import { getInitData } from "./tmaAuth.js";
import asyncHandler from "express-async-handler";

export const registerUser: (db: Kysely<Database>) => RequestHandler = (db) => {
      const usersService = new UsersService(db);
      return asyncHandler(async (_req, res, next) => {
            const userId = getInitData(res)?.user?.id.toString();

            if (!userId)
                  return next();

            await usersService.registerUser(userId);

            return next();
      })
}

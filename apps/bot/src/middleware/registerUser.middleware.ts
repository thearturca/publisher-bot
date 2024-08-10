import { Middleware } from "grammy";
import { InternalContext } from "../types/context.js";

export const registerUser: Middleware<InternalContext> = async (ctx, next) => {
      if (ctx.chat?.type !== "private")
            return await next();

      await ctx.usersService.registerUser(ctx.chat.id.toString());

      await next();
}

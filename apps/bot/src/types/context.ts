import { Context } from "grammy";
import { UsersService } from "@repo/services";

export interface InternalContext extends Context {
      usersService: UsersService;
}

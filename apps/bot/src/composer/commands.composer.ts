import { Composer } from "grammy";
import { Config } from "../env.validator.js";
import { InternalContext } from "../types/context.js";

export const Commands: (config: Config) => Composer<InternalContext> = (config) => {
      const commands = new Composer<InternalContext>();

      commands.command("start", async (ctx) => {
            await ctx.reply("*Publisher bot*", {
                  parse_mode: "MarkdownV2",
                  reply_markup: {
                        inline_keyboard: [[{
                              text: "Перейти в приложение",
                              web_app: {
                                    url: `${config.MINI_APP_LINK}/posts`,
                              }
                        }]]
                  }
            })
      });

      return commands;
};


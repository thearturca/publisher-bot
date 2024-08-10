import { Composer } from "grammy";
import { InternalContext } from "../types/context.js";

export const trackChannels: () => Composer<InternalContext> = () => {
      const composer = new Composer<InternalContext>();

      composer.on("my_chat_member", async (ctx) => {
            if (ctx.myChatMember.chat.type === "private")
                  return;

            const userId = ctx.myChatMember.from.id.toString();
            const chat = ctx.myChatMember.chat;

            try {
                  switch (ctx.myChatMember.new_chat_member.status) {
                        case "creator":
                        case "administrator":
                        case "member":
                              if (!["restricted", "left", "kicked"].includes(ctx.myChatMember.old_chat_member.status)) {
                                    console.log("No need to update group", chat.id);
                                    return;
                              }

                              console.log("Add group", chat.id);
                              const chatInfo = await ctx.api.getChat(chat.id);
                              await ctx.usersService.createGroup(userId, {
                                    id: chat.id,
                                    name: chat.title,
                                    photo_url: chatInfo.photo?.small_file_id ?? null,
                                    created_at: new Date().toISOString(),
                              })
                              break;

                        case "restricted":
                        case "left":
                        case "kicked":
                              console.log("Delete group", chat.id);
                              await ctx.usersService.deleteGroup(chat.id.toString());
                              break;
                  }
            } catch (err) {
                  console.error(err);
            }
      });

      return composer;
};

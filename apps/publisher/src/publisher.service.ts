import { Api, InputMediaBuilder } from "grammy";
import { AwaitedInterval } from "./utils.js";
import { Kysely } from "kysely";
import { Database } from "@repo/db";
import { PostsPublishService } from "@repo/services";

export class PublisherService {
      private loop: AwaitedInterval | null = null;
      private postsService: PostsPublishService;

      constructor(
            db: Kysely<Database>,
            private telegramApi: Api
      ) {
            this.postsService = new PostsPublishService(db);
      }

      public async start() {
            if (this.loop) {
                  await this.loop.stop();
            }

            this.loop = new AwaitedInterval(60 * 1000, async () => await this.publish());
      }

      public async stop() {
            if (this.loop) {
                  await this.loop.stop();
                  this.loop = null;
            }
      }

      private async publish(): Promise<void> {
            console.log("Fetching posts to publish...");
            const posts = await this.postsService.getPostsForPublishing();

            console.log("Publishing posts...", posts.length);
            for (const post of posts) {
                  try {
                        for (const group of post.groups) {
                              if (post.media.length > 0) {
                                    const files = post.media.map((media, i, arr) => {
                                          switch (media.type) {
                                                case "audio":
                                                      return InputMediaBuilder.audio(media.file_id, {
                                                            caption: i === arr.length - 1 ? post.content ?? undefined : undefined,
                                                            parse_mode: "HTML",
                                                      });
                                                case "video":
                                                      return InputMediaBuilder.video(media.file_id, {
                                                            caption: i === arr.length - 1 ? post.content ?? undefined : undefined,
                                                            parse_mode: "HTML",
                                                      });
                                                case "image":
                                                      return InputMediaBuilder.photo(media.file_id, {
                                                            caption: i === arr.length - 1 ? post.content ?? undefined : undefined,
                                                            parse_mode: "HTML",
                                                      });
                                          }
                                    });

                                    await this.telegramApi.sendMediaGroup(group.tg_id, files);
                              } else if (post.content) {
                                    await this.telegramApi.sendMessage(group.tg_id, post.content, {
                                          parse_mode: "HTML",
                                    });
                              } else {
                                    console.log("no content, skipping", post);
                              }
                        }

                        await this.postsService.setIsPublished(post.id, true);
                  } catch (error) {
                        console.error(error);
                  }
            }
      }
}

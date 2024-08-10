import { Database, Post, PostMedia, PostsGroup } from "@repo/db";
import { Kysely, sql } from "kysely";
import { PostForPublishing } from "@repo/types";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export type CreatePostResult = {
      post: Post,
      media: PostMedia[],
      groups: PostsGroup[]
}

export class PostsPublishService {
      constructor(
            private db: Kysely<Database>,
      ) {
      }

      public async getPostsForPublishing(): Promise<PostForPublishing[]> {
            const posts = this.db
                  .selectFrom("posts")
                  .select([
                        "posts.id",
                        "posts.title",
                        "posts.is_published",
                        sql<string>`to_char(posts.publishing_date, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`.as("publishing_date"),
                        "posts.content",
                        sql<string>`to_char(posts.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`.as("created_at"),
                  ])
                  .select((eb) => [
                        jsonArrayFrom(
                              eb.selectFrom("posts_media").select([
                                    "posts_media.id",
                                    "posts_media.type",
                                    "posts_media.file_id",
                                    sql<string>`to_char(posts_media.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`.as("created_at"),
                              ]).whereRef("posts_media.post_id", "=", "posts.id"),
                        ).as("media"),
                        jsonArrayFrom(
                              eb.selectFrom("posts_groups")
                                    .innerJoin("users_groups", "users_groups.id", "posts_groups.group_id")
                                    .select([
                                          "posts_groups.group_id as id",
                                          "users_groups.group_id as tg_id",
                                          "users_groups.group_name as name",
                                          "users_groups.group_photo_url as photo_url",
                                          sql<string>`to_char(posts_groups.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`.as("created_at"),
                                    ])
                                    .whereRef("posts_groups.post_id", "=", "posts.id"),
                        ).as("groups"),
                  ])
                  .whereRef("posts.publishing_date", "<=", sql`now()`)
                  .where("posts.is_published", "=", false)
                  .execute();


            return posts;
      }

      public async setIsPublished(postIdx: Post["id"], isPublished: boolean): Promise<void> {
            await this.db
                  .updateTable("posts")
                  .set({ is_published: isPublished })
                  .where("id", "=", postIdx)
                  .execute();
      }
}

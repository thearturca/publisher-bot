import { Database, Post, PostMedia, PostsGroup, UsersTable } from "@repo/db";
import { Kysely, sql } from "kysely";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { CreatePostDto, Post as PostDto } from "@repo/types";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export type CreatePostResult = {
      post: Post,
      media: PostMedia[],
      groups: PostsGroup[]
}

export class PostsService {
      constructor(
            private db: Kysely<Database>,
      ) {
      }

      public async getPosts(userIdx: UsersTable["id"]): Promise<PostDto[]> {
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
                                          "users_groups.group_name as name",
                                          "users_groups.group_photo_url as photo_url",
                                          sql<string>`to_char(posts_groups.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`.as("created_at"),
                                    ])
                                    .where("users_groups.user_id", "=", userIdx)
                                    .whereRef("posts_groups.post_id", "=", "posts.id"),
                        ).as("groups"),
                  ])
                  .where("posts.user_id", "=", userIdx)
                  .execute();


            return posts;
      }

      public async getPost(userIdx: UsersTable["id"], postIdx: Post["id"]): Promise<PostDto> {
            const post = await this.db.selectFrom("posts")
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
                                          "users_groups.group_name as name",
                                          "users_groups.group_photo_url as photo_url",
                                          sql<string>`to_char(posts_groups.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`.as("created_at"),
                                    ])
                                    .where("users_groups.user_id", "=", userIdx)
                                    .whereRef("posts_groups.post_id", "=", "posts.id"),
                        ).as("groups"),
                  ])
                  .where("user_id", "=", userIdx)
                  .where("id", "=", postIdx)
                  .executeTakeFirst();

            if (!post) {
                  throw new NotFoundError();
            }

            return post;
      }

      public async createPost(
            userIdx: UsersTable["id"],
            post: CreatePostDto,
      ): Promise<PostDto> {

            if (post.media.length === 0 || post.groups.length === 0)
                  throw new BadRequestError("Post must contain at least one media and one group");

            const result = await this.db.transaction().execute<PostDto>(async (trx) => {
                  const createdPost = await trx.insertInto("posts").values({
                        title: post.title,
                        user_id: userIdx,
                        content: post.content,
                        publishing_date: post.publishing_date,
                  }).returning(
                        [
                              "posts.id",
                              "posts.title",
                              "posts.is_published",
                              sql<string>`to_char(posts.publishing_date, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`.as("publishing_date"),
                              "posts.content",
                              sql<string>`to_char(posts.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`.as("created_at"),
                        ]
                  ).executeTakeFirstOrThrow();

                  const createdMedia = await trx.insertInto("posts_media")
                        .values(post.media.map(m => ({
                              type: m.type,
                              file_id: m.file_id,
                              post_id: createdPost.id
                        })))
                        .returning([
                              "posts_media.id",
                              "posts_media.type",
                              "posts_media.file_id",
                              sql<string>`to_char(posts_media.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`.as("created_at"),
                        ])
                        .execute();

                  const groups = await trx.with("inserted_groups", (eb) => eb.insertInto("posts_groups")
                        .values(post.groups.map(g => ({
                              group_id: g.id,
                              post_id: createdPost.id,
                        })))
                        .returningAll()
                  ).selectFrom("inserted_groups")
                        .innerJoin("users_groups", "users_groups.id", "inserted_groups.group_id")
                        .select([
                              "inserted_groups.group_id as id",
                              "users_groups.group_name as name",
                              "users_groups.group_photo_url as photo_url",
                              sql<string>`to_char(inserted_groups.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`.as("created_at"),
                        ])
                        .where("users_groups.user_id", "=", userIdx)
                        .whereRef("users_groups.id", "=", "inserted_groups.group_id")
                        .execute();

                  return Promise.resolve({
                        ...createdPost,
                        media: createdMedia,
                        groups,
                  });
            });

            return result;
      }

      public async deletePost(userIdx: UsersTable["id"], postIdx: Post["id"]): Promise<void> {
            await this.db.deleteFrom("posts").where("user_id", "=", userIdx).where("id", "=", postIdx).execute();
      }

      public mimeTypeToMediaType(mimeType: string): PostMedia["type"] {
            switch (mimeType) {
                  case "image/png":
                  case "image/jpeg":
                  case "image/jpg":
                  case "image/webp":
                  case "image/avif":
                        return "image";

                  case "image/gif":
                  case "video/mp4":
                        return "video";

                  case "audio/mp3":
                  case "audio/mpeg":
                  case "audio/ogg":
                  case "audio/wav":
                        return "audio";

                  default:
                        throw new BadRequestError(`Unsupported mime type: ${mimeType}`);
            }
      }
}

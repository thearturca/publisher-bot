import { z } from "zod"

export const PostMediaValidator = z.object({
      id: z.number(),
      type: z.enum(["audio", "video", "image"]),
      file_id: z.string(),
      created_at: z.string().datetime(),
});

export const PostsGroupValidator = z.object({
      id: z.number(),
      name: z.string(),
      photo_url: z.string().nullable(),
      created_at: z.string().datetime(),
});

export const PostValidator = z.object({
      id: z.number(),
      title: z.string().max(255),
      publishing_date: z.string().datetime(),
      is_published: z.boolean(),
      content: z.string().nullable(),
      created_at: z.string().datetime(),
      media: z.array(PostMediaValidator),
      groups: z.array(PostsGroupValidator),
})

export type Post = z.infer<typeof PostValidator>;

export type PostMedia = z.infer<typeof PostMediaValidator>;

export type PostsGroup = z.infer<typeof PostsGroupValidator>;

export const PostsGroupForPublishingValidator = z.object({
      id: z.number(),
      name: z.string(),
      tg_id: z.string(),
      photo_url: z.string().nullable(),
      created_at: z.string().datetime(),
});

export const PostForPublishingValidator = z.object({
      id: z.number(),
      publishing_date: z.string().datetime(),
      is_published: z.boolean(),
      content: z.string().nullable(),
      created_at: z.string().datetime(),
      media: z.array(PostMediaValidator),
      groups: z.array(PostsGroupForPublishingValidator),
});

export type PostForPublishing = z.infer<typeof PostForPublishingValidator>;
export type PostsGroupForPublishing = z.infer<typeof PostsGroupForPublishingValidator>;

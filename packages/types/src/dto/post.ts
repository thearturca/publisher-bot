import { z } from "zod";
import { PostMediaValidator, PostsGroupValidator } from "../index.js";

export const CreatePostMediaValidator = PostMediaValidator.pick({
      file_id: true,
      type: true,
}).merge(z.object({
      name: z.string().max(255).min(3),
}));

export const CreatePostGroupValidator = PostsGroupValidator.pick({
      id: true,
});

export const CreatePostValdator = z.object({
      title: z.string().max(255).min(3),
      publishing_date: z.string().datetime(),
      content: z.string().optional(),
      media: z.array(CreatePostMediaValidator).min(1),
      groups: z.array(CreatePostGroupValidator).min(1),
});

export type CreatePostDto = z.infer<typeof CreatePostValdator>;
export type CreatePostMediaDto = z.infer<typeof CreatePostMediaValidator>;
export type CreatePostGroupDto = z.infer<typeof CreatePostGroupValidator>;

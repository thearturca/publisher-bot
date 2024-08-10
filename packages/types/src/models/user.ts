import { z } from "zod";

export const GroupValidator = z.object({
      id: z.number(),
      name: z.string(),
      photo_url: z.string().nullable(),
      created_at: z.string().datetime(),
});

export type Group = z.infer<typeof GroupValidator>;

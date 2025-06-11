import { z } from "zod";

export const articleSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  mainImgUrl: z.string().url(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  author: z.object({
    fullName: z.string(),
  }),
});

export const articlesResponseSchema = z.object({
  message: z.string(),
  data: z.array(articleSchema),
  pagination: z.object({
    total: z.number().int().nonnegative(),
    skip: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    hasMore: z.boolean(),
  }),
});

export type ArticleSchema = z.infer<typeof articleSchema>;
export type ArticlesResponse = z.infer<typeof articlesResponseSchema>;
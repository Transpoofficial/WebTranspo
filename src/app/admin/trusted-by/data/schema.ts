import { z } from "zod";

// TrustedBy table schema
export const trustedBySchema = z.object({
	id: z.string(),
	name: z.string(),
	logoUrl: z.string(),
	displayOrder: z.number(),
	isActive: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type TrustedBy = z.infer<typeof trustedBySchema>;

import { z } from "zod";

// Achievement schema for data table
export const achievementSchema = z.object({
	id: z.string(),
	name: z.string(),
	logoUrl: z.string(),
	displayOrder: z.number(),
	isActive: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type Achievement = z.infer<typeof achievementSchema>;

// API Response schema
export const achievementsResponseSchema = z.object({
	message: z.string(),
	data: z.array(achievementSchema),
});

export type AchievementsResponse = z.infer<typeof achievementsResponseSchema>;

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get single achievement by ID (Admin only)
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Check authentication
		await checkAuth(req, ["ADMIN", "SUPER_ADMIN"]);

		const { id } = await params;

		const achievement = await prisma.achievement.findUnique({
			where: { id },
		});

		if (!achievement) {
			return NextResponse.json(
				{
					message: "Achievement not found",
				},
				{ status: 404 }
			);
		}

		return NextResponse.json(achievement);
	} catch (error) {
		console.error("Error fetching achievement:", error);

		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json(
				{
					message: "Unauthorized",
				},
				{ status: 401 }
			);
		}

		return NextResponse.json(
			{
				message: "Internal Server Error",
			},
			{ status: 500 }
		);
	}
}

// PUT - Update achievement (Admin only)
export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Check authentication
		await checkAuth(req, ["ADMIN", "SUPER_ADMIN"]);

		const { id } = await params;
		const formData = await req.formData();
		const name = formData.get("name") as string;
		const displayOrder = formData.get("displayOrder") as string;
		const isActive = formData.get("isActive") === "true";
		const logoFile = formData.get("logo") as File | null;

		// Find existing achievement
		const existingAchievement = await prisma.achievement.findUnique({
			where: { id },
		});

		if (!existingAchievement) {
			return NextResponse.json(
				{
					message: "Achievement not found",
				},
				{ status: 404 }
			);
		}

		let logoUrl = existingAchievement.logoUrl;

		// If new logo file is provided, upload it
		if (logoFile) {
			// Delete old logo from Supabase if it exists
			if (existingAchievement.logoUrl.includes("supabase")) {
				const oldFilePath = existingAchievement.logoUrl
					.split("/")
					.pop();
				if (oldFilePath) {
					await supabase.storage
						.from(process.env.SUPABASE_BUCKET!)
						.remove([`achievements/${oldFilePath}`]);
				}
			}

			// Upload new logo
			const fileExt = logoFile.name.split(".").pop();
			const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
			const filePath = `achievements/${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from(process.env.SUPABASE_BUCKET!)
				.upload(filePath, logoFile, {
					contentType: logoFile.type,
				});

			if (uploadError) {
				console.error("Supabase upload error:", uploadError);
				return NextResponse.json(
					{
						message: "Failed to upload logo",
					},
					{ status: 500 }
				);
			}

			// Get public URL
			const { data: urlData } = supabase.storage
				.from(process.env.SUPABASE_BUCKET!)
				.getPublicUrl(filePath);

			logoUrl = urlData.publicUrl;
		}

		// Update achievement
		const updatedAchievement = await prisma.achievement.update({
			where: { id },
			data: {
				name: name || existingAchievement.name,
				logoUrl,
				displayOrder: displayOrder
					? parseInt(displayOrder)
					: existingAchievement.displayOrder,
				isActive,
			},
		});

		return NextResponse.json({
			message: "Achievement updated successfully",
			data: updatedAchievement,
		});
	} catch (error) {
		console.error("Error updating achievement:", error);

		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json(
				{
					message: "Unauthorized",
				},
				{ status: 401 }
			);
		}

		return NextResponse.json(
			{
				message: "Internal Server Error",
			},
			{ status: 500 }
		);
	}
}

// DELETE - Delete achievement (Admin only)
export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Check authentication
		await checkAuth(req, ["ADMIN", "SUPER_ADMIN"]);

		const { id } = await params;

		// Find existing achievement
		const existingAchievement = await prisma.achievement.findUnique({
			where: { id },
		});

		if (!existingAchievement) {
			return NextResponse.json(
				{
					message: "Achievement not found",
				},
				{ status: 404 }
			);
		}

		// Delete logo from Supabase if it exists
		if (existingAchievement.logoUrl.includes("supabase")) {
			const filePath = existingAchievement.logoUrl.split("/").pop();
			if (filePath) {
				await supabase.storage
					.from(process.env.SUPABASE_BUCKET!)
					.remove([`achievements/${filePath}`]);
			}
		}

		// Delete achievement from database
		await prisma.achievement.delete({
			where: { id },
		});

		return NextResponse.json({
			message: "Achievement deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting achievement:", error);

		if (error instanceof Error && error.message === "Unauthorized") {
			return NextResponse.json(
				{
					message: "Unauthorized",
				},
				{ status: 401 }
			);
		}

		return NextResponse.json(
			{
				message: "Internal Server Error",
			},
			{ status: 500 }
		);
	}
}

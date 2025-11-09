import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get single trusted by entry by ID (Admin only)
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Check authentication
		await checkAuth(req, ["ADMIN", "SUPER_ADMIN"]);

		const { id } = await params;

		const trustedBy = await prisma.trustedBy.findUnique({
			where: { id },
		});

		if (!trustedBy) {
			return NextResponse.json(
				{
					message: "Trusted by entry not found",
				},
				{ status: 404 }
			);
		}

		return NextResponse.json(trustedBy);
	} catch (error) {
		console.error("Error fetching trusted by entry:", error);

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

// PUT - Update trusted by entry (Admin only)
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

		// Find existing trusted by entry
		const existingTrustedBy = await prisma.trustedBy.findUnique({
			where: { id },
		});

		if (!existingTrustedBy) {
			return NextResponse.json(
				{
					message: "Trusted by entry not found",
				},
				{ status: 404 }
			);
		}

		let logoUrl = existingTrustedBy.logoUrl;

		// If new logo file is provided, upload it
		if (logoFile) {
			// Delete old logo from Supabase if it exists
			if (existingTrustedBy.logoUrl.includes("supabase")) {
				const oldFilePath = existingTrustedBy.logoUrl.split("/").pop();
				if (oldFilePath) {
					await supabase.storage
						.from(process.env.SUPABASE_BUCKET!)
						.remove([`trusted-by/${oldFilePath}`]);
				}
			}

			// Upload new logo
			const fileExt = logoFile.name.split(".").pop();
			const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
			const filePath = `trusted-by/${fileName}`;

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

		// Update trusted by entry
		const updatedTrustedBy = await prisma.trustedBy.update({
			where: { id },
			data: {
				name: name || existingTrustedBy.name,
				logoUrl,
				displayOrder: displayOrder
					? parseInt(displayOrder)
					: existingTrustedBy.displayOrder,
				isActive,
			},
		});

		return NextResponse.json({
			message: "Trusted by entry updated successfully",
			data: updatedTrustedBy,
		});
	} catch (error) {
		console.error("Error updating trusted by entry:", error);

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

// DELETE - Delete trusted by entry (Admin only)
export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Check authentication
		await checkAuth(req, ["ADMIN", "SUPER_ADMIN"]);

		const { id } = await params;

		// Find existing trusted by entry
		const existingTrustedBy = await prisma.trustedBy.findUnique({
			where: { id },
		});

		if (!existingTrustedBy) {
			return NextResponse.json(
				{
					message: "Trusted by entry not found",
				},
				{ status: 404 }
			);
		}

		// Delete logo from Supabase if it exists
		if (existingTrustedBy.logoUrl.includes("supabase")) {
			const filePath = existingTrustedBy.logoUrl.split("/").pop();
			if (filePath) {
				await supabase.storage
					.from(process.env.SUPABASE_BUCKET!)
					.remove([`trusted-by/${filePath}`]);
			}
		}

		// Delete trusted by entry from database
		await prisma.trustedBy.delete({
			where: { id },
		});

		return NextResponse.json({
			message: "Trusted by entry deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting trusted by entry:", error);

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

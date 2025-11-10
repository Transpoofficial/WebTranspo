import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all trusted by entries
// Query param: ?all=true to fetch all (including inactive) for admin
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const showAll = searchParams.get("all") === "true";

		const trustedByList = await prisma.trustedBy.findMany({
			where: showAll ? {} : { isActive: true },
			orderBy: {
				displayOrder: "asc",
			},
		});

		return NextResponse.json({
			message: "Trusted by list fetched successfully",
			data: trustedByList,
		});
	} catch (error) {
		console.error("Error fetching trusted by list:", error);
		return NextResponse.json(
			{
				message: "Internal Server Error",
				data: [],
			},
			{ status: 500 }
		);
	}
}

// POST - Create new trusted by entry (Admin only)
export async function POST(req: NextRequest) {
	try {
		// Check authentication
		await checkAuth(req, ["ADMIN", "SUPER_ADMIN"]);

		const formData = await req.formData();
		const name = formData.get("name") as string;
		const displayOrder = parseInt(formData.get("displayOrder") as string);
		const logoFile = formData.get("logo") as File;

		// Validate required fields
		if (!name || !logoFile) {
			return NextResponse.json(
				{
					message: "Name and logo are required",
				},
				{ status: 400 }
			);
		}

		// Upload logo to Supabase
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

		// Create trusted by entry in database
		const trustedBy = await prisma.trustedBy.create({
			data: {
				name,
				logoUrl: urlData.publicUrl,
				displayOrder: displayOrder || 0,
				isActive: true,
			},
		});

		return NextResponse.json(
			{
				message: "Trusted by entry created successfully",
				data: trustedBy,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating trusted by entry:", error);

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

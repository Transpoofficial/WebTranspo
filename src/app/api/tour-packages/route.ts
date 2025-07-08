import { prisma } from "@/lib/prisma";
import { uploadFiles } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { getPaginationParams } from "@/utils/pagination";
import { parse } from "url";

export const GET = async (req: NextRequest) => {
  try {
    const { skip, limit } = getPaginationParams(req.url);
    const { query } = parse(req.url!, true);

<<<<<<< HEAD
    const totalCount = await prisma.tourPackage.count();

    const packages = await prisma.tourPackage.findMany({
      skip,
      take: limit,
=======
    const search = (query.search as string) || "";
    const date = query.date as string | undefined;
    const is_private_raw = query.is_private as string | undefined;

    // Konversi string ke boolean
    let is_private: boolean | undefined = undefined;
    if (is_private_raw === "true") is_private = true;
    if (is_private_raw === "false") is_private = false;

    // Ambil semua paket berdasarkan is_private dan search
    const allPackages = await prisma.tourPackage.findMany({
      where: {
        ...(is_private !== undefined && { is_private }),
        ...(search && {
          name: {
            contains: search,
          },
        }),
      },
>>>>>>> 55dcd98725c57daf37c73316c3dc5c9a02c81f52
      orderBy: {
        createdAt: "desc",
      },
    });

    function isTicketWithDate(ticket: unknown): ticket is { date: string } {
      return (
        typeof ticket === "object" &&
        ticket !== null &&
        "date" in ticket &&
        typeof (ticket as { date: unknown }).date === "string"
      );
    }

    // Filter manual berdasarkan tanggal JSON (jika ada)
    const filteredPackages = date
      ? allPackages.filter(
          (pkg) =>
            Array.isArray(pkg.tickets) &&
            pkg.tickets.some(
              (ticket) => isTicketWithDate(ticket) && ticket.date === date
            )
        )
      : allPackages;

    // Pagination manual
    const paginated = filteredPackages.slice(skip, skip + limit);

    return NextResponse.json(
      {
        message: "Packages retrieved successfully",
        data: paginated,
        pagination: {
          total: filteredPackages.length,
          skip,
          limit,
          hasMore: skip + paginated.length < filteredPackages.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/tour-packages", error);
    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const meetingPoint = formData.get("meetingPoint") as string;
    const minPersonCapacity = formData.get("minPersonCapacity") as string;
    const maxPersonCapacity = formData.get("maxPersonCapacity") as string;
    const includes = JSON.parse(formData.get("includes") as string);
    const excludes = JSON.parse(formData.get("excludes") as string);
    const itineraries = JSON.parse(formData.get("itineraries") as string);
    const requirements = JSON.parse(formData.get("requirements") as string);
    const tickets = formData.get("tickets")
      ? JSON.parse(formData.get("tickets") as string)
      : null;
    // Ubah parsing is_private agar hanya menerima 0 atau 1
    const is_private_raw = formData.get("is_private");
    let is_private = false;
    if (is_private_raw === "1") is_private = true;
    else if (is_private_raw === "0") is_private = false;
    else
      return NextResponse.json(
        { message: "is_private must be 0 or 1", data: null },
        { status: 400 }
      );

    // Validation
    if (
      !name ||
      !price ||
      !description ||
      !meetingPoint ||
      !minPersonCapacity ||
      !maxPersonCapacity ||
      !includes ||
      !excludes ||
      !itineraries ||
      !requirements
    ) {
      return NextResponse.json(
        { message: "Missing required fields", data: null },
        { status: 400 }
      );
    }

    const files = formData.getAll("photos") as File[];
    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "At least one photo is required", data: null },
        { status: 400 }
      );
    }

    const results = await uploadFiles(
      process.env.SUPABASE_BUCKET || "",
      files,
      "tourPackage"
    );

    if (results.some((result) => result.success === false)) {
      return NextResponse.json(
        { message: "One or more file uploads failed", data: null },
        { status: 500 }
      );
    }

    const photoUrl = results.map((result) => ({
      url: result.photoUrl.data.publicUrl,
    }));

    const createdPackage = await prisma.tourPackage.create({
      data: {
        name,
        photoUrl,
        price: parseFloat(price),
        description,
        meetingPoint,
        minPersonCapacity: parseInt(minPersonCapacity),
        maxPersonCapacity: parseInt(maxPersonCapacity),
        includes,
        excludes,
        itineraries,
        requirements,
        tickets,
        is_private,
      },
    });

    return NextResponse.json(
      { message: "Package created successfully", data: createdPackage },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error", data: null },
      { status: 500 }
    );
  }
};

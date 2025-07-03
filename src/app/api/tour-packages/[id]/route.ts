import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { removeFiles, uploadFiles } from "@/utils/supabase";
import { PhotoUrl } from "@/../types/tourPackage";
import { ResultUploadFiles } from "@/../types/supabase";
import { OrderStatus } from "@prisma/client";

type TicketItem = {
  date: string;
};

// GET: Get tour package by id, return all fields as in schema.prisma
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Missing required fields", data: null },
        { status: 400 }
      );
    }

    // Ambil data paket wisata (tanpa include tickets karena bukan relasi)
    const tourPackage = await prisma.tourPackage.findUnique({
      where: { id },
    });

    if (!tourPackage) {
      return NextResponse.json(
        { message: "Tour package not found", data: null },
        { status: 404 }
      );
    }

    const maxCapacity = tourPackage.maxPersonCapacity;

    // Ambil semua packageOrder yang berhubungan dan status order aktif
    const packageOrders = await prisma.packageOrder.findMany({
      where: {
        packageId: id,
         order: {
          orderStatus: {
            in: [OrderStatus.CONFIRMED],
          },
        },  
      },
      select: {
        departureDate: true,
        people: true,
      },
    });

    // Hitung total orang (atau order jika people null) untuk setiap tanggal keberangkatan
    const totalPeoplePerDate: Record<string, number> = {};

    for (const order of packageOrders) {
      const date = order.departureDate.toISOString().slice(0, 10);
      const count = order.people ?? 1; // default 1 jika null
      totalPeoplePerDate[date] = (totalPeoplePerDate[date] || 0) + count;
    }

    // Proses tiket (JSON array) untuk hitung sisa kapasitas
    const ticketAvailability = Array.isArray(tourPackage.tickets)
  ? tourPackage.tickets
      .filter((ticket): ticket is TicketItem => {
        if (
          typeof ticket === "object" &&
          ticket !== null &&
          "date" in ticket
        ) {
          const t = ticket as Record<string, unknown>;
          return typeof t.date === "string";
        }
        return false;
      })
      .map((ticket) => {
        const date = ticket.date;
        const totalBooked = totalPeoplePerDate[date] || 0;
        const remainingTickets = Math.max(0, maxCapacity - totalBooked);
        return {
          date,
          totalBooked,
          remainingTickets,
        };
      })
  : [];

    return NextResponse.json(
      {
        message: "Tour package retrieved successfully",
        data: {
          ...tourPackage,
          ticketAvailability,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching tour package:", error);
    return NextResponse.json(
      { message: "Internal Server Error", data: null },
      { status: 500 }
    );
  }
};

// PUT: Update tour package by id
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const formData = await req.formData();

    // Parse all fields as in schema.prisma
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
    const is_private_raw = formData.get("is_private");
    let is_private = false;

    if (is_private_raw === "1") is_private = true;
    else if (is_private_raw === "0") is_private = false;
    else
      return NextResponse.json(
        { message: "is_private must be 0 or 1", data: null },
        { status: 400 }
      );

    // Validate required fields
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

    // Validate numeric fields
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return NextResponse.json(
        { message: "Price must be a valid number", data: null },
        { status: 400 }
      );
    }
    if (isNaN(parseInt(minPersonCapacity)) || parseInt(minPersonCapacity) < 1) {
      return NextResponse.json(
        {
          message: "minPersonCapacity must be a valid positive number",
          data: null,
        },
        { status: 400 }
      );
    }
    if (
      isNaN(parseInt(maxPersonCapacity)) ||
      parseInt(maxPersonCapacity) < parseInt(minPersonCapacity)
    ) {
      return NextResponse.json(
        {
          message:
            "maxPersonCapacity must be greater than or equal to minPersonCapacity",
          data: null,
        },
        { status: 400 }
      );
    }

    const tourPackage = await prisma.tourPackage.findUnique({
      where: { id },
    });
    if (!tourPackage) {
      return NextResponse.json(
        { message: "Tour package not found", data: null },
        { status: 404 }
      );
    }

    // Handle photo update
    let updatedPhotoUrl: PhotoUrl = tourPackage.photoUrl
      ? (tourPackage.photoUrl as PhotoUrl)
      : [];

    // Handle photos to delete
    const photosToDeleteRaw = formData.get("photosToDelete");
    if (photosToDeleteRaw) {
      const photosToDelete: string[] = JSON.parse(photosToDeleteRaw as string);
      if (photosToDelete.length > 0) {
        console.log("Photos to delete:", photosToDelete);
        const removeResults = await removeFiles(
          process.env.SUPABASE_BUCKET || "",
          photosToDelete
        );
        if (removeResults.some((result) => result.success === false)) {
          console.error("Failed to delete photos:", removeResults);
          return NextResponse.json(
            { message: "One or more file deletions failed", data: null },
            { status: 500 }
          );
        }
        updatedPhotoUrl = updatedPhotoUrl.filter(
          (photo) => !photosToDelete.includes(photo.url)
        );
      }
    }

    // Handle new photo uploads
    const files: File[] = [];

    // Method 1: Handle photos[index] format
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("photos[")) {
        if (value instanceof File && value.size > 0) {
          files.push(value);
        }
      }
    }

    // Method 2: Handle multiple "photos" entries (fallback)
    if (files.length === 0) {
      const photoFiles = formData.getAll("photos");
      for (const file of photoFiles) {
        if (file instanceof File && file.size > 0) {
          files.push(file);
        }
      }
    }

    console.log(
      "Files to upload:",
      files.map((f) => `${f.name} (${f.size} bytes, ${f.type})`)
    );

    if (files.length > 0) {
      // Validate file types and sizes
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      for (const file of files) {
        console.log(
          `Validating file: ${file.name}, type: ${file.type}, size: ${file.size}`
        );

        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json(
            {
              message: `File ${file.name} is not a valid image type. Allowed: ${allowedTypes.join(", ")}`,
              data: null,
            },
            { status: 400 }
          );
        }
        if (file.size > maxSize) {
          return NextResponse.json(
            {
              message: `File ${file.name} exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
              data: null,
            },
            { status: 400 }
          );
        }
      }

      try {
        const results: ResultUploadFiles = await uploadFiles(
          process.env.SUPABASE_BUCKET || "",
          files,
          "tourPackage"
        );

        console.log("Upload results:", results);

        if (results.some((result) => result.success === false)) {
          console.error("Failed to upload files:", results);
          return NextResponse.json(
            { message: "One or more file uploads failed", data: null },
            { status: 500 }
          );
        }

        const newPhotoUrl: PhotoUrl = results
          .filter(
            (result) => result.success && result.photoUrl?.data?.publicUrl
          )
          .map((result) => ({
            url: result.photoUrl!.data.publicUrl,
          }));

        updatedPhotoUrl = [...updatedPhotoUrl, ...newPhotoUrl];
        console.log("Updated photo URLs:", updatedPhotoUrl);
      } catch (uploadError) {
        console.error("Error during file upload:", uploadError);
        return NextResponse.json(
          { message: "File upload failed due to server error", data: null },
          { status: 500 }
        );
      }
    }

    // Update the tour package
    const updated = await prisma.tourPackage.update({
      where: { id },
      data: {
        name,
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
        photoUrl: updatedPhotoUrl,
      },
    });

    return NextResponse.json(
      { message: "Tour package updated successfully", data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating tour package:", error);
    return NextResponse.json(
      { message: "Internal Server Error", data: null },
      { status: 500 }
    );
  }
};

// DELETE: Delete tour package by id
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { message: "Missing required fields", data: [] },
        { status: 400 }
      );
    }
    const tourPackage = await prisma.tourPackage.findFirst({
      where: { id: id },
    });
    if (!tourPackage) {
      return NextResponse.json(
        { message: "Tour package not found", data: [] },
        { status: 404 }
      );
    }
    await prisma.tourPackage.delete({
      where: { id: id },
    });
    // Delete the photo from Supabase storage if it exists
    if (tourPackage?.photoUrl) {
      const oldPhotoUrl = tourPackage.photoUrl as PhotoUrl;
      const removeResults = await removeFiles(
        process.env.SUPABASE_BUCKET || "",
        oldPhotoUrl.map((photo) => photo.url)
      );
      if (removeResults.some((result) => result.success === false)) {
        return NextResponse.json(
          { message: "One or more file deletions failed", data: [] },
          { status: 500 }
        );
      }
    }
    return NextResponse.json(
      { message: "Tour package deleted successfully", data: [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting tour package:", error);
    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};

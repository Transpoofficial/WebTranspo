import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { removeFiles, uploadFiles } from "@/utils/supabase";
import { Advantages, PhotoUrl, Services } from "@/../types/tourPackage";
import { ResultUploadFiles } from "@/../types/supabase";

export const GET = async (
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
    const tourPackage = await prisma.tourPackage.findUnique({
      where: { id: id },
      include: {
        vehicle: {
          include: {
            vehicleType: true,
          },
        },
      },
    });
    return NextResponse.json(
      { message: "Vehicle retrieved successfully", data: tourPackage },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const replacePhoto = searchParams.get("replace-photo") === "true";
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const vehicleId = formData.get("vehicleId") as string;
    const destination = formData.get("destination") as string;
    const durationDays = formData.get("durationDays") as string;
    const advantagesArray = JSON.parse(
      formData.get("advantages") as string
    ) as Advantages;
    const servicesArray = JSON.parse(
      formData.get("services") as string
    ) as Services;
    const price = formData.get("price") as string;

    // Validate required fields
    if (
      !name ||
      !vehicleId ||
      !destination ||
      durationDays === null ||
      durationDays === undefined ||
      !advantagesArray ||
      !Array.isArray(advantagesArray) ||
      advantagesArray.length === 0 ||
      !servicesArray ||
      !Array.isArray(servicesArray) ||
      servicesArray.length === 0 ||
      price === null ||
      price === undefined
    ) {
      return NextResponse.json(
        { message: "Missing or invalid required fields", data: [] },
        { status: 400 }
      );
    }

    let tourPackage = await prisma.tourPackage.findUnique({
      where: { id: id },
    });
    if (!tourPackage) {
      return NextResponse.json(
        { message: "Tour package not found", data: [] },
        { status: 404 }
      );
    }

    const files = formData.getAll("photos") as File[];
    let updatedPhotoUrl: PhotoUrl = tourPackage.photoUrl as PhotoUrl;
    if (files && files.length > 0) {
      // Upload files to Supabase storage
      const results: ResultUploadFiles = await uploadFiles(
        process.env.SUPABASE_BUCKET || "",
        files,
        "tourPackage"
      );
      if (results.some((result) => result.success === false)) {
        return NextResponse.json(
          { message: "One or more file uploads failed", data: [] },
          { status: 500 }
        );
      }

      // Storing the new URLs
      const newPhotoUrl: PhotoUrl = results.map((result) => ({
        url: result.photoUrl.data.publicUrl,
      }));
      if (replacePhoto) {
        // Remove old photos from Supabase storage
        const removeResults = await removeFiles(
          process.env.SUPABASE_BUCKET || "",
          // updatedPhotoUrl is still an array of old URLs
          updatedPhotoUrl.map((photo) => photo.url)
        );
        if (removeResults.some((result) => result.success === false)) {
          return NextResponse.json(
            { message: "One or more file deletions failed", data: [] },
            { status: 500 }
          );
        }
        updatedPhotoUrl = [...newPhotoUrl];
      } else {
        updatedPhotoUrl.push(...newPhotoUrl);
      }
    }
    tourPackage = await prisma.tourPackage.update({
      where: { id: id },
      data: {
        name,
        vehicleId,
        destination,
        durationDays: Number(durationDays),
        advantages: advantagesArray,
        services: servicesArray,
        price: Number(price),
        photoUrl: updatedPhotoUrl,
      },
    });
    return NextResponse.json(
      { message: "Tour package updated successfully", data: tourPackage },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};

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
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};

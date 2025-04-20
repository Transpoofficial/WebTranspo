import { prisma } from "@/lib/prisma";
import { uploadFiles } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { Advantages, PhotoUrl, Services } from "@/../types/tourPackage";
import { ResultUploadFiles } from "@/../types/supabase";

export const GET = async (req: NextRequest) => {
  try {
    const packages = await prisma.tourPackage.findMany({});
    return NextResponse.json(
      { message: "Packages retrieved successfully", data: packages },
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

export const POST = async (req: NextRequest) => {
  try {
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

    const files = formData.getAll("photos") as File[];
    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "At least one file is required", data: [] },
        { status: 400 }
      );
    }
    const results: ResultUploadFiles = await uploadFiles(
      "testing",
      files,
      "tourPackage"
    );
    if (results.some((result) => result.success === false)) {
      return NextResponse.json(
        { message: "One or more file uploads failed", data: [] },
        { status: 500 }
      );
    }
    const photoUrl: PhotoUrl = results.map((result) => ({
      url: result.photoUrl.data.publicUrl,
    }));
    const createdPackage = await prisma.tourPackage.create({
      data: {
        name,
        vehicleId,
        destination,
        durationDays: parseInt(durationDays),
        advantages: advantagesArray,
        services: servicesArray,
        photoUrl,
        price: parseFloat(price),
      },
    });

    return NextResponse.json(
      { message: "Package created successfully", data: createdPackage },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error", data: [] },
      { status: 500 }
    );
  }
};

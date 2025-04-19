import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

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
    const advantages = formData.get("advantages") as string;
    const services = formData.get("services") as string;
    const price = formData.get("price") as string;
    if (
      !name ||
      !vehicleId ||
      !destination ||
      durationDays === null ||
      durationDays === undefined ||
      !advantages ||
      !services ||
      price === null ||
      price === undefined
    ) {
      return NextResponse.json(
        { message: "Missing required fields", data: [] },
        { status: 400 }
      );
    }

    const file = formData.get("photo") as File;
    if (!file) {
      return NextResponse.json(
        { message: "File is required", data: [] },
        { status: 400 }
      );
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `uploads/tourPackage/${fileName}`;

    const buffer = await file.arrayBuffer();
    const { error } = await supabase.storage
      .from("testing")
      .upload(filePath, new Uint8Array(buffer), {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: "Upload failed", data: [] },
        { status: 500 }
      );
    }

    const { data } = supabase.storage.from("testing").getPublicUrl(filePath);

    const createdPackage = await prisma.tourPackage.create({
      data: {
        name,
        vehicleId,
        destination,
        durationDays: parseInt(durationDays),
        advantages,
        services,
        photoUrl: data.publicUrl,
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

import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

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

    let tourPackage = await prisma.tourPackage.findUnique({
      where: { id: id },
    });
    if (!tourPackage) {
      return NextResponse.json(
        { message: "Tour package not found", data: [] },
        { status: 404 }
      );
    }

    let filePath = null;
    let data;
    if (replacePhoto) {
      const file = formData.get("photo") as File;
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        filePath = `uploads/tourPackage/${fileName}`;
        const buffer = await file.arrayBuffer();
        const { error } = await supabase.storage
          .from("testing")
          .upload(filePath, Buffer.from(buffer), {
            contentType: file.type,
          });
        if (error) {
          console.error("Supabase upload error:", error);
          return NextResponse.json(
            { error: "Upload failed", data: [] },
            { status: 500 }
          );
        }
        const oldFileName = tourPackage.photoUrl.split("/").pop();
        if (oldFileName) {
          const { error } = await supabase.storage
            .from("testing")
            .remove([oldFileName]);
          if (error) {
            console.error("Supabase delete error:", error);
            return NextResponse.json(
              { error: "Delete failed", data: [] },
              { status: 500 }
            );
          }
        } else {
          console.error("Invalid photo URL:", tourPackage.photoUrl);
        }
        data = supabase.storage.from("testing").getPublicUrl(filePath);
      }
    }
    tourPackage = await prisma.tourPackage.update({
      where: { id: id },
      data: {
        name,
        vehicleId,
        destination,
        durationDays: Number(durationDays),
        advantages,
        services,
        price: Number(price),
        photoUrl: replacePhoto ? data?.data.publicUrl || undefined : undefined,
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
    let tourPackage = await prisma.tourPackage.findFirst({
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
      const { error } = await supabase.storage
        .from("testing")
        .remove([tourPackage.photoUrl.split("/").pop() || ""]);
      if (error) {
        console.error("Supabase delete error:", error);
        return NextResponse.json(
          { error: "Delete failed", data: [] },
          { status: 500 }
        );
      }
    }
    return NextResponse.json(
      { message: "Tour package deleted successfully", data: tourPackage },
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

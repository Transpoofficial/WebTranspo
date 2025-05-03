import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { removeFiles, uploadFiles } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { ResultUploadFiles } from "../../../../../types/supabase";
import { PhotoUrl } from "../../../../../types/tourPackage";

export const GET = async (
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: { fullName: true },
        },
      },
    });
    if (!article) {
      return NextResponse.json(
        { message: "Article not found", data: [] },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Article retrieved successfully", data: article },
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
    await checkAuth(req, ["ADMIN", "SUPER_ADMIN"]);
    const { searchParams } = new URL(req.url);
    const replacePhoto = searchParams.get("replace-photo") === "true";
    const { id } = await params;
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const mainImgUrl = formData.get("mainImgUrl") as File;

    if (!id) {
      return NextResponse.json(
        { message: "Missing required fields", data: [] },
        { status: 400 }
      );
    }
    if (
      !title ||
      typeof title !== "string" ||
      title.trim().length === 0 ||
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { message: "Title and content are required", data: [] },
        { status: 400 }
      );
    }
    if (replacePhoto && (!mainImgUrl || !(mainImgUrl instanceof File))) {
      return NextResponse.json(
        { message: "Main image is required", data: [] },
        { status: 400 }
      );
    }
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });
    if (!existingArticle) {
      return NextResponse.json(
        { message: "Article not found", data: [] },
        { status: 404 }
      );
    }

    let results: ResultUploadFiles = [];
    if (replacePhoto) {
      // Delete the existing image from Supabase if it exists
      const removeResult = await removeFiles("testing", [
        existingArticle.mainImgUrl,
      ]);
      if (removeResult.some((result) => result.success === false)) {
        return NextResponse.json(
          { message: "Failed to delete existing image", data: [] },
          { status: 500 }
        );
      }
      // Upload the new image to Supabase
      results = await uploadFiles("testing", [mainImgUrl], "articles");
      if (results.some((result) => result.success === false)) {
        return NextResponse.json(
          { message: "One or more file uploads failed", data: [] },
          { status: 500 }
        );
      }
    }
    const photoUrl: PhotoUrl = results.map((result) => ({
      url: result.photoUrl.data.publicUrl,
    }));

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        title,
        content,
        mainImgUrl: replacePhoto ? photoUrl[0].url : existingArticle.mainImgUrl,
      },
    });
    return NextResponse.json(
      { message: "Article updated successfully", data: updatedArticle },
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
    const token = await checkAuth(req, ["ADMIN", "SUPER_ADMIN"]);
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { message: "Missing required fields", data: [] },
        { status: 400 }
      );
    }
    const existingArticle = await prisma.article.findFirst({
      where: { id: id },
    });
    if (!existingArticle) {
      return NextResponse.json(
        { message: "Article not found", data: [] },
        { status: 404 }
      );
    }

    const deletedArticle = await prisma.article.delete({
      where: { id },
    });

    // Delete the photo from Supabase storage if it exists
    if (existingArticle?.mainImgUrl) {
      const oldPhotoUrl = existingArticle.mainImgUrl as string;
      const removeResults = await removeFiles("testing", [oldPhotoUrl]);
      if (removeResults.some((result) => result.success === false)) {
        return NextResponse.json(
          { message: "One or more file deletions failed", data: [] },
          { status: 500 }
        );
      }
    }
    return NextResponse.json(
      { message: "Article deleted successfully", data: deletedArticle },
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

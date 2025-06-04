import { checkAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFiles } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";
import { ResultUploadFiles } from "../../../../types/supabase";
import { PhotoUrl } from "../../../../types/tourPackage";
import { getPaginationParams } from "@/utils/pagination";

export const GET = async (req: NextRequest) => {
  try {
    const { skip, limit } = getPaginationParams(req.url);

    // Get total count
    const totalCount = await prisma.article.count();

    const articles = await prisma.article.findMany({
      skip,
      take: limit,
      include: {
        author: {
          select: { fullName: true },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Articles retrieved successfully",
        data: articles,
        pagination: {
          total: totalCount,
          skip,
          limit,
          hasMore: skip + articles.length < totalCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        data: [],
      },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const token = await checkAuth(req, ["ADMIN", "SUPER_ADMIN"]);
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const mainImgUrl = formData.get("mainImgUrl") as File;
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
    if (!mainImgUrl || !(mainImgUrl instanceof File)) {
      return NextResponse.json(
        { message: "Main image is required", data: [] },
        { status: 400 }
      );
    }

    const results: ResultUploadFiles = await uploadFiles(
      "testing",
      [mainImgUrl],
      "articles"
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
    const createdArticle = await prisma.article.create({
      data: {
        title,
        content,
        mainImgUrl: photoUrl[0].url,
        authorId: token.id,
      },
    });
    return NextResponse.json(
      {
        message: "Article created successfully",
        data: createdArticle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        data: [],
      },
      { status: 500 }
    );
  }
};

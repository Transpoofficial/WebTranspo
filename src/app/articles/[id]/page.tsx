"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { articlesService } from "../services/articles-service";
import Header from "@/components/header";

export default function ArticleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const {
    data: articleData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["article", params.id],
    queryFn: () => articlesService.getArticleById(params.id),
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error || !articleData) {
    router.push("/not-found");
    return null;
  }

  const article = articleData.data;

  return (
    <>
      <Header />

      <div className="container mx-auto px-4 py-8">
        <article>
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{article.author.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>Dipublikasikan: {formatDate(article.createdAt)}</span>
              </div>
              {article.createdAt !== article.updatedAt && (
                <Badge variant="outline" className="text-xs">
                  Diperbarui: {formatDate(article.updatedAt)}
                </Badge>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden">
              <Image
                src={article.mainImgUrl || "/placeholder.svg"}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {formatContent(article.content)}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {article.author.fullName}
                  </p>
                  <p className="text-sm text-gray-600">Penulis</p>
                </div>
              </div>

              <Link href="/articles">
                <Button variant="outline">Lihat Artikel Lainnya</Button>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatContent(content: string) {
  // Split content by double newlines to separate paragraphs properly
  return content
    .split(/\n\n|\r\n\r\n/)
    .map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      if (trimmedParagraph === "") return null;

      // Handle bold text with **text**
      const formattedParagraph = trimmedParagraph
        .replace(/\r\n|\n/g, " ") // Replace single newlines with spaces
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      return (
        <p
          key={index}
          className="mb-6 text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedParagraph }}
        />
      );
    })
    .filter(Boolean);
}

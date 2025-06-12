"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { articlesService } from "./services/articles-service";
import Header from "@/components/header";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ArticlesPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: articlesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["articles", page],
    queryFn: () =>
      articlesService.getArticles({ skip: (page - 1) * limit, limit }),
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">Error loading articles</div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Artikel Terbaru
          </h1>
          <p className="text-gray-600">
            Temukan artikel-artikel menarik dan informatif
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articlesData?.data.map((article) => (
            <Link key={article.id} href={`/articles/${article.id}`}>
              <Card className="h-full gap-0 hover:shadow-lg transition-shadow duration-300 cursor-pointer py-0 pb-6">
                <div className="relative min-h-48 h-48 w-full">
                  <Image
                    src={article.mainImgUrl || "/placeholder.svg"}
                    alt={article.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardHeader className="mt-4">
                  <h2 className="text-xl font-semibold line-clamp-2 hover:text-blue-600 transition-colors">
                    {article.title}
                  </h2>
                </CardHeader>
                <CardContent className="flex flex-col justify-between h-full pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {truncateContent(article.content)}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{article.author.fullName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {articlesData?.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Belum ada artikel yang tersedia.
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Badge variant="secondary" className="px-4 py-2">
            Total: {articlesData?.pagination.total} artikel
          </Badge>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={!articlesData?.pagination.hasMore}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function truncateContent(content: string, maxLength = 150) {
  const cleanContent = content.replace(/\r\n/g, " ").trim();
  if (cleanContent.length <= maxLength) return cleanContent;
  return cleanContent.substring(0, maxLength) + "...";
}

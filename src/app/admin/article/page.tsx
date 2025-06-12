"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { DataTable } from "./components/data-table";
import { columns } from "./components/column";
import { ArticlesResponse } from "./data/schema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const Article = () => {
  const [skip, setSkip] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);

  const { data, isLoading, error } = useQuery({
    queryKey: ["articles", skip, limit],
    queryFn: async (): Promise<ArticlesResponse> => {
      const response = await axios.get<ArticlesResponse>("/api/articles", {
        params: { skip, limit },
      });
      return response.data;
    },
  });

  if (error) {
    toast.error("Failed to fetch articles. Please try again.");
    console.error("Error fetching articles:", error);
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Artikel</h1>
      <div className="my-4">
        <Link href="/admin/article/create">
          <Button className="cursor-pointer">Tambah artikel</Button>
        </Link>
      </div>
      {isLoading ? (
        <div className="py-24 flex items-center justify-center w-full">
          <div className="border-y-2 border-black w-6 h-6 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="h-full flex-1 flex-col">
          <DataTable
            data={data?.data || []}
            columns={columns}
            total={data?.pagination.total || 0}
            skip={skip}
            limit={limit}
            setSkip={setSkip}
            setLimit={setLimit}
          />
        </div>
      )}
    </>
  );
};

export default Article;

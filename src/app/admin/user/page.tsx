"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useEffect, useState}  from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { User } from "./data/schema";
import AddUserDialog from "./components/add-user-dialog";
import { Input } from "@/components/ui/input";

interface UserResponse {
  message: string;
  data: User[];
  pagination: {
    total: number;
    skip: number;
    limit: number;
    hasMore: boolean;
  };
}

// Fetch users function with search and pagination
const fetchUsers = async (params: {
  search?: string;
  skip?: number;
  limit?: number;
}): Promise<UserResponse> => {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.append("search", params.search);
  if (params.skip !== undefined)
    searchParams.append("skip", params.skip.toString());
  if (params.limit !== undefined)
    searchParams.append("limit", params.limit.toString());

  const response = await axios.get(`/api/users?${searchParams.toString()}`);
  return response.data;
};

export default function UserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial search and pagination from URL
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [pageIndex, setPageIndex] = useState(
    Number(searchParams.get("page")) || 0
  );
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("limit")) || 10
  );
  const debouncedSearch = useDebounce(search, 1000);

  // Update URL when search or pagination changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    params.set("page", pageIndex.toString());
    params.set("limit", pageSize.toString());
    router.push(`?${params.toString()}`);
  }, [debouncedSearch, pageIndex, pageSize, router, searchParams]);

  // Query to fetch users with search and pagination
  const {
    data: userResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<UserResponse>({
    queryKey: ["users", debouncedSearch, pageIndex, pageSize],
    queryFn: () =>
      fetchUsers({
        search: debouncedSearch,
        skip: pageIndex * pageSize,
        limit: pageSize,
      }),
    enabled: !!session?.user,
  });

  // Handle page changes
  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); // Reset to first page when changing page size
  };

  if (status === "loading") {
    return (
      <div className="h-full flex-1 flex-col space-y-4">
        <div className="flex items-center justify-center h-24">
          <div className="text-sm text-muted-foreground">Loading session...</div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="h-full flex-1 flex-col space-y-4">
        <div className="flex items-center justify-center h-24">
          <div className="text-sm text-muted-foreground">
            Please log in to view users.
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center w-full">
        <div className="border-y-2 border-black w-6 h-6 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex-1 flex-col space-y-4">
        <div className="flex items-center justify-center h-24">
          <div className="text-sm text-red-600">
            Error loading users:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
          <button
            onClick={() => refetch()}
            className="ml-2 text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Pengguna</h1>

      <AddUserDialog />

      <div className="flex w-full items-center gap-2">
        <Input
          type="text"
          placeholder="Cari pengguna..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        data={userResponse?.data || []}
        columns={columns}
        pagination={{
          pageIndex,
          pageSize,
          pageCount: Math.ceil(
            (userResponse?.pagination?.total || 0) / pageSize
          ),
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />
    </div>
  );
}

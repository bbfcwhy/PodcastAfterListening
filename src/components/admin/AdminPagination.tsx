"use client";

import { useRouter, usePathname } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  /** Existing search params (e.g. status, title) to preserve when changing page */
  searchParams?: Record<string, string>;
}

export function AdminPagination({
  currentPage,
  totalPages,
  searchParams = {},
}: AdminPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const onPageChange = (page: number) => {
    const params = new URLSearchParams({ ...searchParams, page: String(page) });
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  );
}

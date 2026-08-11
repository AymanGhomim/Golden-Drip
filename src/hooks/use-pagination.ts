"use client";

import { useEffect, useMemo, useState } from "react";

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function usePagination<T>(items: T[], resetKey = "", initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => setPage(1), [resetKey]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  const setPageSize = (value: number) => {
    setPageSizeState(value);
    setPage(1);
  };

  return {
    items: paginatedItems,
    state: { page, pageSize, total, totalPages } satisfies PaginationState,
    setPage,
    setPageSize,
  };
}

'use client';

import {
  DataTableFilterField,
  DataTableMeta,
  searchParamsSchema,
} from '../ui';
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  type TableOptions,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import * as React from 'react';
import { useState } from 'react';
import { z } from 'zod';

interface UseDataTableProps<
  TData,
  TSearchParams extends typeof searchParamsSchema,
> extends Omit<
    TableOptions<TData>,
    | 'pageCount'
    | 'getCoreRowModel'
    | 'manualFiltering'
    | 'manualPagination'
    | 'manualSorting'
    | 'defaultTableFilterValues'
    | 'data'
  > {
  /**
   * Defines filter fields for the table. Supports both dynamic faceted filters and search filters.
   */
  filterFields?: DataTableFilterField<TData>[];

  /**
   * Enable notion-like column filters.
   * Advanced filters and column filters cannot be used at the same time.
   * @default false
   * @type boolean
   */
  enableAdvancedFilter?: boolean;

  /**
   * Default filter values for the table.
   * @default { page: 1, per_page: 10 }
   */
  defaultTableFilterValues?: z.infer<TSearchParams>;

  /**
   * Function to fetch filtered data.
   * @param params - The search parameters for filtering, conforming to or extending searchParamsSchema.
   * @returns A promise resolving to the filtered data.
   */
  getFilteredData: (
    unfilteredData: TData[],
    params: z.infer<TSearchParams>,
  ) => Promise<[TData[], number, number]>;

  unfilteredData: TData[];
}

export function useDataTable<
  TData,
  TSearchParams extends typeof searchParamsSchema,
>({
  filterFields = [],
  enableAdvancedFilter = false,
  defaultTableFilterValues = {
    page: 1,
    per_page: 10,
  },
  getFilteredData,
  unfilteredData,
  ...props
}: UseDataTableProps<TData, TSearchParams>) {
  const filters = React.useMemo(() => {
    return Object.fromEntries(
      Object.entries(defaultTableFilterValues).filter(
        ([key]) => !['page', 'per_page', 'sort'].includes(key),
      ),
    );
  }, [defaultTableFilterValues]);

  const pagination = React.useMemo(
    () => ({
      page: defaultTableFilterValues.page,
      perPage: defaultTableFilterValues.per_page,
    }),
    [defaultTableFilterValues],
  );

  const sorting = React.useMemo(() => {
    if (!defaultTableFilterValues.sort) return null;
    const [column, order] = defaultTableFilterValues.sort.split('.');
    return { column, order: order as 'asc' | 'desc' };
  }, [defaultTableFilterValues]);

  // Memoize computation of searchableColumns and filterableColumns
  const { searchableColumns, filterableColumns } = React.useMemo(() => {
    return {
      searchableColumns: filterFields.filter((field) => !field.options),
      filterableColumns: filterFields.filter((field) => field.options),
    };
  }, [filterFields]);

  // Initial filters for columns
  const initialColumnFilters: ColumnFiltersState = React.useMemo(() => {
    return Object.entries(filters).reduce<ColumnFiltersState>(
      (acc, [key, value]) => {
        const filterableColumn = filterableColumns.find(
          (column) => column.value === key,
        );
        const searchableColumn = searchableColumns.find(
          (column) => column.value === key,
        );

        if (filterableColumn) {
          acc.push({ id: key, value: Array.isArray(value) ? value : [value] });
        } else if (searchableColumn) {
          acc.push({ id: key, value: [value as string] });
        }
        return acc;
      },
      [],
    );
  }, [filters, filterableColumns, searchableColumns]);

  // Table states
  const [data, setData] = useState<TData[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);

  const [meta, setMeta] = useState<DataTableMeta>({ totalCount: 0 });

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(initialColumnFilters);

  // Handle server-side pagination
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: pagination.page - 1,
      pageSize: pagination.perPage,
    });

  const paginationState = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  // Handle server-side sorting
  const [sortingState, setSortingState] = React.useState<SortingState>(
    sorting ? [{ id: sorting.column, desc: sorting.order === 'desc' }] : [],
  );

  React.useEffect(() => {
    const fetchData = async () => {
      const updatedState: z.infer<TSearchParams> = {
        ...defaultTableFilterValues,
        ...Object.fromEntries(
          columnFilters.map(({ id, value }) => [id, value]),
        ),
        page: pageIndex + 1,
        per_page: pageSize,
        sort: sortingState
          .map(({ id, desc }) => `${id}.${desc ? 'desc' : 'asc'}`)
          .join(','),
      };

      try {
        const [newData, newPageCount, newTotalCount] = await getFilteredData(
          unfilteredData,
          updatedState,
        );

        setData(newData);
        setPageCount(newPageCount);
        setMeta({ totalCount: newTotalCount });
      } catch (error) {
        console.error('Error fetching filtered data:', error);
      }
    };

    fetchData().catch(console.error);
  }, [
    pageIndex,
    pageSize,
    sortingState,
    columnFilters,
    getFilteredData,
    unfilteredData,
  ]);

  const table = useReactTable({
    ...props,
    data,
    pageCount,
    state: {
      pagination: paginationState,
      sorting: sortingState,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    meta,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSortingState,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return { table, columnFilters, setColumnFilters };
}

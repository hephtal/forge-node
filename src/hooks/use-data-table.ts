'use client';

import {
  DataTableFacetedOptionCounts,
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
  type PaginationState, RowSelectionState,
  type SortingState,
  type TableOptions, TableState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import * as React from 'react';
import { useState } from 'react';
import { z } from 'zod';
import { ColumnPinningState } from '@tanstack/table-core/src/features/ColumnPinning';

function getFacetedOptionCounts<TData>(
  dataRows: TData[],
  filterableColumns: DataTableFilterField<TData>[],
): DataTableFacetedOptionCounts {
  const counts: DataTableFacetedOptionCounts = {};

  for (const filterableColumn of filterableColumns) {
    const columnKey = String(filterableColumn.value);
    const availableOptionValues = new Set(
      filterableColumn.options?.map((option) => option.value) ?? [],
    );
    const columnCounts: Record<string, number> = {};

    for (const optionValue of availableOptionValues) {
      columnCounts[optionValue] = 0;
    }

    for (const dataRow of dataRows) {
      const rowValue = (dataRow as Record<string, unknown>)[columnKey];

      if (rowValue === undefined || rowValue === null) {
        continue;
      }

      const rowValues = Array.isArray(rowValue) ? rowValue : [rowValue];
      const matchedOptionValues = new Set<string>();

      for (const rowValueItem of rowValues) {
        const optionValue = String(rowValueItem);

        if (availableOptionValues.has(optionValue)) {
          matchedOptionValues.add(optionValue);
        }
      }

      for (const matchedOptionValue of matchedOptionValues) {
        columnCounts[matchedOptionValue] =
          (columnCounts[matchedOptionValue] ?? 0) + 1;
      }
    }

    counts[columnKey] = columnCounts;
  }

  return counts;
}

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

  initialState?: Partial<TableState>;
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
  initialState,
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

  const countableFilterableColumns = React.useMemo(() => {
    return filterableColumns.filter((filterableColumn) =>
      filterableColumn.options?.some((option) => option.withCount),
    );
  }, [filterableColumns]);

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

  const [metadata, setMetadata] = useState<DataTableMeta>({
    totalCount: 0,
    facetedOptionCounts: {},
  });

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    initialState?.rowSelection ?? {},
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialState?.columnVisibility ?? {});
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(initialColumnFilters);
  const [columnPinning, setColumnPinning] =
    React.useState<ColumnPinningState>(initialState?.columnPinning ?? {});


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
        setMetadata((currentMetadata) => ({
          ...currentMetadata,
          totalCount: newTotalCount,
        }));

        const countQueryPageSize = Math.max(unfilteredData.length, 1);
        const countEntries = await Promise.all(
          countableFilterableColumns.map(async (filterableColumn) => {
            const columnKey = String(filterableColumn.value);
            const countState = {
              ...updatedState,
              page: 1,
              per_page: countQueryPageSize,
            };

            delete (countState as Record<string, unknown>)[columnKey];

            const [countData] = await getFilteredData(
              unfilteredData,
              countState,
            );
            const facetedCounts = getFacetedOptionCounts(countData, [
              filterableColumn,
            ]);

            return [columnKey, facetedCounts[columnKey] ?? {}] as const;
          }),
        );
        const facetedOptionCounts =
          Object.fromEntries(countEntries) as DataTableFacetedOptionCounts;

        setMetadata({ totalCount: newTotalCount, facetedOptionCounts });
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
    countableFilterableColumns,
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
      columnPinning,
    },
    meta: metadata,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSortingState,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
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

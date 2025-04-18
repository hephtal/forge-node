import { Checkbox } from '../../checkbox';
import { Table } from '@tanstack/react-table';
import React from 'react';

interface DataTableColumnSelectHeaderProps<TData> {
  table: Table<TData>;
}

export default function DataTableColumnSelectHeader<TData>({
  table,
}: DataTableColumnSelectHeaderProps<TData>) {
  return (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected()
          ? true
          : table.getIsSomePageRowsSelected()
            ? 'indeterminate'
            : false
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
      className="translate-y-0.5"
      checkIconClassName="w-3.5 h-3.5"
    />
  );
}

import { Checkbox } from '../../checkbox';
import { Row } from '@tanstack/react-table';
import React from 'react';

interface DataTableColumnSelectCellProps<TData> {
  row: Row<TData>;
}

export default function DataTableColumnSelectCell<TData>({
  row,
}: DataTableColumnSelectCellProps<TData>) {
  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
      className="translate-y-0.5"
      checkIconClassName="w-3.5 h-3.5"
    />
  );
}

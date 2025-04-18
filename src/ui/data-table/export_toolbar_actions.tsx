'use client';

import { Button } from '../button';
import { exportTableToCSV } from './lib/export';
import { type Table } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import React from 'react';

interface ExportToolbarActionsProps<TData> {
  table: Table<TData>;
  filename: string;
  excludeColumns: (keyof TData | 'select' | 'actions' | any)[];
}

export function ExportToolbarActions<TData>({
  table,
  filename,
  excludeColumns,
}: ExportToolbarActionsProps<TData>) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: filename,
            excludeColumns: excludeColumns,
          })
        }
      >
        <Download className="mr-2 size-4" aria-hidden="true" />
        Export
      </Button>
    </div>
  );
}

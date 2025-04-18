import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '../../tooltip';
import React from 'react';

interface DataTableColumnCellProps {
  value: string;
}

export function DataTableColumnCell({ value }: DataTableColumnCellProps) {
  return (
    <div className="flex space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="max-w-[20rem] truncate font-medium">
              <div className="line-clamp-1">{value}</div>
            </span>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent className="w-96 max-h-[60vh] overflow-y-scroll whitespace-pre-wrap">
              {value}
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

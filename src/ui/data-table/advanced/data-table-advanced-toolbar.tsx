'use client';

import type { Table } from '@tanstack/react-table';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';

import { Button } from '../../button';

import { DataTableFilterCombobox } from './data-table-filter-combobox';
import { DataTableViewOptions } from '../data-table-view-options';
import {
  DataTableFilterField,
  DataTableFilterOption,
} from '../types';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { DataTableFilterItem } from './data-table-filter-item';
import { DataTableMultiFilter } from './data-table-multi-filter';
import { cn } from "../../../lib/utils";

interface DataTableAdvancedToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  filterFields?: DataTableFilterField<TData>[];
}

export function DataTableAdvancedToolbar<TData>({
  table,
  filterFields = [],
  children,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  const searchParams = useSearchParams();

  const options = React.useMemo<DataTableFilterOption<TData>[]>(() => {
    return filterFields.map((field) => {
      return {
        id: crypto.randomUUID(),
        label: field.label,
        value: field.value,
        options: field.options ?? [],
      };
    });
  }, [filterFields]);

  const initialSelectedOptions = React.useMemo(() => {
    return options
      .filter((option) => searchParams.has(option.value as string))
      .map((option) => {
        const value = searchParams.get(String(option.value)) as string;
        const [filterValue, filterOperator] =
          value?.split('~').filter(Boolean) ?? [];

        return {
          ...option,
          filterValues: filterValue?.split('.') ?? [],
          filterOperator,
        };
      });
  }, [options, searchParams]);

  const [selectedOptions, setSelectedOptions] = React.useState<
    DataTableFilterOption<TData>[]
  >(initialSelectedOptions);
  const [openFilterBuilder, setOpenFilterBuilder] = React.useState(
    initialSelectedOptions.length > 0 || false,
  );
  const [openCombobox, setOpenCombobox] = React.useState(false);

  function onFilterComboboxItemSelect() {
    setOpenFilterBuilder(true);
    setOpenCombobox(true);
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col space-y-2.5 overflow-auto p-1',
        className,
      )}
      {...props}
    >
      <div className="ml-auto flex items-center gap-2">
        {children}
        {(options.length > 0 && selectedOptions.length > 0) ||
        openFilterBuilder ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenFilterBuilder(!openFilterBuilder)}
          >
            <SlidersHorizontal
              className="mr-2 size-4 shrink-0"
              aria-hidden="true"
            />
            Filter
          </Button>
        ) : (
          <DataTableFilterCombobox
            options={options.filter(
              (option) =>
                !selectedOptions.some(
                  (selectedOption) => selectedOption.value === option.value,
                ),
            )}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            onSelect={onFilterComboboxItemSelect}
          />
        )}
        <DataTableViewOptions table={table} />
      </div>
      <div
        className={cn(
          'flex items-center gap-2',
          !openFilterBuilder && 'hidden',
        )}
      >
        {selectedOptions
          .filter((option) => !option.isMulti)
          .map((selectedOption) => (
            <DataTableFilterItem
              key={String(selectedOption.value)}
              table={table}
              selectedOption={selectedOption}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              defaultOpen={openCombobox}
            />
          ))}
        {selectedOptions.some((option) => option.isMulti) ? (
          <DataTableMultiFilter
            table={table}
            allOptions={options}
            options={selectedOptions.filter((option) => option.isMulti)}
            setSelectedOptions={setSelectedOptions}
            defaultOpen={openCombobox}
          />
        ) : null}
        {options.length > 0 && options.length > selectedOptions.length ? (
          <DataTableFilterCombobox
            options={options}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            onSelect={onFilterComboboxItemSelect}
          >
            <Button
              variant="outline"
              size="sm"
              role="combobox"
              className="h-7 rounded-full"
              onClick={() => setOpenCombobox(true)}
            >
              <Plus className="mr-2 size-4 opacity-50" aria-hidden="true" />
              Add filter
            </Button>
          </DataTableFilterCombobox>
        ) : null}
      </div>
    </div>
  );
}

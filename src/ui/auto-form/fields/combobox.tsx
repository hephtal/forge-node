import { Button } from '../../button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../command';
import { FormControl, FormItem, FormMessage } from '../../form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../popover';
import {cn} from "../../../lib/utils";
import { Check, ChevronsUpDown } from 'lucide-react';
import * as z from 'zod';
import AutoFormLabel from '../common/label';
import AutoFormTooltip from '../common/tooltip';
import { AutoFormInputComponentProps } from '../types';
import { getBaseSchema } from '../utils';
import React from 'react';

export default function AutoFormCombobox({
  label,
  isRequired,
  field,
  zodItem,
  fieldProps,
  fieldConfigItem,
}: AutoFormInputComponentProps) {
  const baseValues = (getBaseSchema(zodItem) as unknown as z.ZodEnum<any>)._def
    .values;

  let values: string[] = [];
  if (!Array.isArray(baseValues)) {
    values = Object.entries(baseValues).map((item) => item[0]);
  } else {
    values = baseValues;
  }

  return (
    <FormItem className="flex flex-col">
      <AutoFormLabel
        label={fieldConfigItem?.label || label}
        isRequired={isRequired}
      />
      <FormControl>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                'w-full justify-between',
                !field.value && 'text-muted-foreground',
              )}
            >
              {field.value
                ? (values.find((val) => val === field.value) ?? 'Select option')
                : 'Select option'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0"
            style={{ width: 'var(--radix-popover-trigger-width)' }}
          >
            <Command>
              <CommandInput placeholder={`Search ${label}...`} />
              <CommandList>
                <CommandEmpty>No option found.</CommandEmpty>
                <CommandGroup>
                  {values.map((value) => (
                    <CommandItem
                      key={value}
                      value={value}
                      onSelect={() => {
                        field.onChange(value);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === field.value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {value}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
      <FormMessage />
    </FormItem>
  );
}

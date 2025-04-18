'use client';

import { FieldConfigItem } from '../types';
import { FormControl, FormItem, FormMessage } from '../../form';
import { MultiSelect } from '../../multi-select';
import React, { useEffect } from 'react';
import { useController, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import AutoFormLabel from '../common/label';
import AutoFormTooltip from '../common/tooltip';
import { beautifyObjectName } from '../utils';

// Define a type guard to check if the item is a Zod array with a specific string value.
function isZodArrayWithStrings(
  item: z.ZodTypeAny,
): item is z.ZodArray<z.ZodString> {
  return (
    (item instanceof z.ZodArray && item.element instanceof z.ZodString) ||
    (item instanceof z.ZodOptional &&
      item._def.innerType instanceof z.ZodArray &&
      item._def.innerType.element instanceof z.ZodString)
  );
}

export default function AutoFormMultiSelect({
  name,
  item,
  form,
  options,
  fieldConfig,
  isRequired,
}: {
  name: string;
  item: z.ZodTypeAny;
  form: ReturnType<typeof useForm>;
  options: { value: string; label: string; icon?: React.ComponentType }[];
  fieldConfig?: FieldConfigItem;
  isRequired: boolean;
}) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({
    name,
    control,
  });
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

  useEffect(() => {
    if (field.value) {
      setSelectedValues(field.value);
    }
  }, [field.value]);

  if (!isZodArrayWithStrings(item)) return null;

  const title = item._def.description ?? beautifyObjectName(name);

  return (
    <FormItem className="flex flex-col w-full">
      <AutoFormLabel label={title} isRequired={isRequired} />
      <FormControl>
        <MultiSelect
          options={options}
          selectedValues={selectedValues}
          setSelectedValues={(values: string[]) => {
            setSelectedValues(values);
            field.onChange(values);
          }}
          placeholder="Select options"
          variant="default"
          maxCount={Math.min(options.length, 4)}
          disabled={fieldConfig?.inputProps?.disabled}
        />
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfig} />
      <FormMessage>{fieldState.error?.message}</FormMessage>
    </FormItem>
  );
}

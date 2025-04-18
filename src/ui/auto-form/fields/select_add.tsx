import { SelectAdd } from '../../select-add';
import { useEffect, useState } from 'react';
import { useController, useForm, useFormContext } from 'react-hook-form';
import * as z from 'zod';
import { FormControl, FormItem, FormMessage } from '../../form';
import AutoFormLabel from '../common/label';
import AutoFormTooltip from '../common/tooltip';
import { FieldConfigItem } from '../types';
import { beautifyObjectName } from '../utils';
import React from 'react';

export default function AutoFormSelectAdd({
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
  options: string[];
  fieldConfig?: FieldConfigItem;
  isRequired: boolean;
}) {
  const [selectedValue, setSelectedValue] = useState<string>();
  const [values, setValues] = useState<string[]>(options);
  const { control } = useFormContext();

  const { field, fieldState } = useController({
    name,
    control,
  });

  useEffect(() => {
    if (field.value) {
      setSelectedValue(field.value);
    }
  }, [field.value]);

  const title = item._def.description ?? beautifyObjectName(name);

  return (
    <FormItem className="flex flex-col w-full">
      <AutoFormLabel label={title} isRequired={isRequired} />
      <FormControl>
        <SelectAdd
          values={values}
          setValues={setValues}
          selected={selectedValue}
          setSelected={field.onChange}
        />
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfig} />
      <FormMessage>{fieldState.error?.message}</FormMessage>
    </FormItem>
  );
}

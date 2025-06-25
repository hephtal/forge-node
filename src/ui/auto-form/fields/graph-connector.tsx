'use client';

import { FieldConfigItem } from '../types';
import { FormControl, FormItem, FormMessage } from '../../form';
import { useEffect } from 'react';
import { useController, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import AutoFormLabel from '../common/label';
import AutoFormTooltip from '../common/tooltip';
import { beautifyObjectName } from '../utils';
import GraphConnector from "../../molecules/graph_connector";
import React from 'react';

export default function AutoFormGraphConnector({
  name,
  item,
  form,
  fieldConfig,
  isRequired,
}: {
  name: string;
  item: z.ZodTypeAny;
  form: ReturnType<typeof useForm>;
  fieldConfig?: FieldConfigItem;
  isRequired: boolean;
}) {
  const { control } = useFormContext() || form;
  const { field, fieldState } = useController({ name, control });

  // Initialise field value if undefined
  useEffect(() => {
    if (!field.value) {
      field.onChange({ nodes: [], links: [] });
    }
  }, [field.value, field]);

  const title =
    item && item._def && item._def.description
      ? item._def.description
      : beautifyObjectName(name);

  return (
    <FormItem className="flex flex-col w-full">
      <AutoFormLabel label={title} isRequired={isRequired} />
      <FormControl>
        {field.value && (
          <GraphConnector
            graph={field.value || { nodes: [], edges: [] }}
            setGraph={(newGraph) => field.onChange(newGraph)}
            height={400}
          />
        )}
      </FormControl>
      <AutoFormTooltip fieldConfigItem={fieldConfig} />
      <FormMessage>{fieldState.error?.message}</FormMessage>
    </FormItem>
  );
}

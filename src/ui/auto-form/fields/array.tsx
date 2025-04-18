import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../accordion';
import { Button } from '../../button';
import { Separator } from '../../separator';
import { Plus, Trash } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { beautifyObjectName } from '../utils';
import AutoFormObject from './object';
import React from 'react';

function isZodArray(
  item: z.ZodArray<any> | z.ZodDefault<any> | z.ZodOptional<any>,
): item is z.ZodArray<any> {
  return item instanceof z.ZodArray;
}

function isZodOptional(
  item: z.ZodArray<any> | z.ZodDefault<any> | z.ZodOptional<any>,
): item is z.ZodOptional<any> {
  return item instanceof z.ZodOptional;
}

function isZodDefault(
  item: z.ZodArray<any> | z.ZodDefault<any> | z.ZodOptional<any>,
): item is z.ZodDefault<any> {
  return item instanceof z.ZodDefault;
}

interface FormValues {
  [key: string]: any;
}

export default function AutoFormArray({
  name,
  item,
  form,
  path = [],
  fieldConfig,
}: {
  name: string;
  item: z.ZodArray<any> | z.ZodDefault<any> | z.ZodOptional<any>;
  form: ReturnType<typeof useForm<FormValues>>;
  path?: string[];
  fieldConfig?: any;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });
  const title = item._def.description ?? beautifyObjectName(name);

  const itemDefType = isZodArray(item)
    ? item._def.type
    : isZodDefault(item)
      ? item._def.innerType._def.type
      : isZodOptional(item)
        ? item._def.innerType._def.type
        : null;

  const arrayLengthString = fields.length === 0 ? '' : ` (${fields.length})`;

  return (
    <AccordionItem value={name} className="border-none">
      <AccordionTrigger>
        {title}
        {arrayLengthString}
      </AccordionTrigger>
      <AccordionContent className="px-2">
        {fields.map((_field, index) => {
          const key = _field.id;
          return (
            <div className="mt-4 flex flex-col" key={`${key}`}>
              <AutoFormObject
                schema={itemDefType as z.ZodObject<any, any>}
                form={form}
                fieldConfig={fieldConfig}
                path={[...path, index.toString()]}
              />
              <div className="my-2 flex justify-end">
                <Button
                  variant="secondary"
                  size="icon"
                  type="button"
                  className="hover:bg-zinc-300 hover:text-black focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-white dark:text-black dark:hover:bg-zinc-300 dark:hover:text-black dark:hover:ring-0 dark:hover:ring-offset-0 dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0"
                  onClick={() => remove(index)}
                >
                  <Trash className="size-4 " />
                </Button>
              </div>

              <Separator />
            </div>
          );
        })}
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({})}
          className="mt-4 flex items-center"
        >
          <Plus className="mr-2" size={16} />
          Add
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
}



// https://www.amazon.co.uk/dp/B0F2T4JFVG?psc=1&linkCode=sl1&tag=vivianfrank-21&linkId=d71c0036b3da825d23e528569058e117&language=en_GB&ref_=as_li_ss_tl
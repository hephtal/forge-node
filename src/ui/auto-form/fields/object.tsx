import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../accordion';
import { FormField } from '../../form';
import {useForm, useFormContext, UseFormReturn} from 'react-hook-form';
import * as z from 'zod';
import { DEFAULT_ZOD_HANDLERS, INPUT_COMPONENTS } from '../config';
import resolveDependencies from '../dependencies';
import { Dependency, FieldConfig, FieldConfigItem } from '../types';
import {
  beautifyObjectName,
  getBaseSchema,
  getBaseType,
  zodToHtmlInputProps,
} from '../utils';
import AutoFormArray from './array';
import AutoFormGraphConnector from './graph-connector';
import AutoFormMultiSelect from './multi-select';
import AutoFormSelectAdd from './select_add';
import React from 'react';

function DefaultParent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface FormValues {
  [key: string]: any;
}

export default function AutoFormObject<
  SchemaType extends z.ZodObject<any, any>,
>({
  schema,
  form,
  fieldConfig,
  path = [],
  dependencies = [],
}: {
  schema: SchemaType | z.ZodEffects<SchemaType>;
  form: ReturnType<typeof useForm<FormValues>>;
  fieldConfig?: FieldConfig<z.infer<SchemaType>>;
  path?: string[];
  dependencies?: Dependency<z.infer<SchemaType>>[];
}) {
  const { watch } = useFormContext() || form;

  if (!schema) {
    return null;
  }
  const { shape } = getBaseSchema<SchemaType>(schema) || {};

  if (!shape) {
    return null;
  }

  const handleIfZodNumber = (item: z.ZodAny) => {
    const isZodNumber = (item as any)._def.typeName === 'ZodNumber';
    const isInnerZodNumber =
      (item._def as any).innerType?._def?.typeName === 'ZodNumber';

    if (isZodNumber) {
      (item as any)._def.coerce = true;
    } else if (isInnerZodNumber) {
      (item._def as any).innerType._def.coerce = true;
    }

    return item;
  };

  return (
    <Accordion type="multiple" className="space-y-5 border-none">
      {Object.keys(shape).map((name) => {
        let item = shape[name] as z.ZodAny;
        item = handleIfZodNumber(item) as z.ZodAny;
        const zodBaseType = getBaseType(item);
        const itemName = item._def.description ?? beautifyObjectName(name);
        const key = [...path, name].join('.');

        const {
          isHidden,
          isDisabled,
          isRequired: isRequiredByDependency,
          overrideOptions,
        } = resolveDependencies(dependencies, name, watch);
        if (isHidden) {
          return null;
        }

        const fieldConfigItem: FieldConfigItem = fieldConfig?.[name] ?? {};
        const zodInputProps = zodToHtmlInputProps(item);
        const isRequired =
          isRequiredByDependency ||
          zodInputProps.required ||
          fieldConfigItem.inputProps?.required ||
          false;

        // New check to render AutoFormMultiSelect instead of AutoFormArray based on the field type
        if (
          zodBaseType === 'ZodString' &&
          fieldConfigItem.fieldType === 'select_add'
        ) {
          return (
            <AutoFormSelectAdd
              key={key}
              name={name}
              item={item}
              options={fieldConfigItem.options || []} // Pass in options from the fieldConfig if available
              form={form}
              fieldConfig={fieldConfigItem}
              isRequired={isRequired}
            />
          );
        }
        if (
          zodBaseType === 'ZodObject' &&
          fieldConfigItem.fieldType === 'graph_connector'
        ) {
          return (
            <AutoFormGraphConnector
              key={key}
              name={name}
              item={item}
              form={form}
              fieldConfig={fieldConfigItem}
              isRequired={isRequired}
            />
          );
        }
        if (zodBaseType === 'ZodObject') {
          return (
            <AccordionItem value={name} key={key} className="border-none">
              <AccordionTrigger>
                <div className="flex">
                  {itemName}
                  {isRequired && <span className="text-destructive">{}*</span>}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-2">
                <AutoFormObject
                  schema={item as unknown as z.ZodObject<any, any>}
                  form={form}
                  fieldConfig={
                    (fieldConfig?.[name] ?? {}) as FieldConfig<
                      z.infer<typeof item>
                    >
                  }
                  path={[...path, name]}
                />
              </AccordionContent>
            </AccordionItem>
          );
        }

        if (
          zodBaseType === 'ZodArray' &&
          fieldConfigItem.fieldType === 'multi_select'
        ) {
          return (
            <AutoFormMultiSelect
              key={key}
              name={name}
              fieldName={key}
              item={item}
              options={fieldConfigItem.options || []} // Pass in options from the fieldConfig if available
              form={form}
              fieldConfig={fieldConfigItem}
              isRequired={isRequired}
            />
          );
        }

        if (zodBaseType === 'ZodArray') {
          return (
            <AutoFormArray
              key={key}
              name={name}
              item={item as unknown as z.ZodArray<any>}
              form={form}
              fieldConfig={fieldConfig?.[name] ?? {}}
              fieldConfigItem={fieldConfigItem}
              path={[...path, name]}
            />
          );
        }

        if (overrideOptions) {
          item = z.enum(overrideOptions) as unknown as z.ZodAny;
        }

        return (
          <FormField
            control={form.control}
            name={key}
            key={key}
            render={({ field }) => {
              const inputType =
                fieldConfigItem.fieldType ??
                DEFAULT_ZOD_HANDLERS[zodBaseType] ??
                'fallback';

              const InputComponent =
                typeof inputType === 'function'
                  ? inputType
                  : INPUT_COMPONENTS[inputType];

              const ParentElement =
                fieldConfigItem.renderParent ?? DefaultParent;

              const defaultValue = fieldConfigItem.inputProps?.defaultValue;
              const value = field.value ?? defaultValue ?? '';

              const fieldProps = {
                ...zodToHtmlInputProps(item),
                ...field,
                ...fieldConfigItem.inputProps,
                disabled: fieldConfigItem.inputProps?.disabled || isDisabled,
                ref: undefined,
                value: value,
              };

              if (InputComponent === undefined) {
                return <></>;
              }

              return (
                <ParentElement key={`${key}.parent`}>
                  <InputComponent
                    name={name}
                    fieldName={key}
                    item={item}
                    form={form}
                    zodInputProps={zodInputProps}
                    field={field}
                    fieldConfigItem={fieldConfigItem}
                    label={itemName}
                    isRequired={isRequired}
                    zodItem={item}
                    fieldProps={fieldProps}
                    options={fieldConfigItem.options}
                    className={fieldProps.className}
                  />
                </ParentElement>
              );
            }}
          />
        );
      })}
    </Accordion>
  );
}

import { FormControl, FormItem, FormMessage } from '../../form';
import { Input } from '../../input';
import {cn} from "../../../lib/utils";
import { Trash2 } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import AutoFormLabel from '../common/label';
import AutoFormTooltip from '../common/tooltip';
import { AutoFormInputComponentProps } from '../types';
import React from 'react';

export default function AutoFormFile({
  label,
  isRequired,
  fieldConfigItem,
  fieldProps,
  field,
}: AutoFormInputComponentProps) {
  const { showLabel: _showLabel, ...fieldPropsWithoutShowLabel } = fieldProps;
  const showLabel = _showLabel === undefined ? true : _showLabel;
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setFile(file);
      setFileName(file.name);
      field.onChange(file);
    }
  };

  const handleRemoveClick = () => {
    setFile(null);
  };

  return (
    <FormItem>
      {showLabel && (
        <AutoFormLabel
          label={fieldConfigItem?.label || label}
          isRequired={isRequired}
        />
      )}
      {!file && (
        <FormControl>
          <Input
            type="file"
            {...fieldPropsWithoutShowLabel}
            onChange={handleFileChange}
            value={''}
          />
        </FormControl>
      )}
      {file && (
        <div
          className={cn(
            'flex h-[40px] w-full flex-row items-center justify-between space-x-2 rounded-sm border p-2 text-black focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-white dark:text-black dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0',
            fieldPropsWithoutShowLabel?.className,
          )}
        >
          <p>{fileName}</p>
          <button onClick={handleRemoveClick} aria-label="Remove image">
            <Trash2 size={16} />
          </button>
        </div>
      )}
      <AutoFormTooltip fieldConfigItem={fieldConfigItem} />
      <FormMessage />
    </FormItem>
  );
}

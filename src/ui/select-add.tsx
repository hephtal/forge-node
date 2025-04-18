'use client';
import {cn} from "../lib/utils";
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from './credenza';
import { Input } from './input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';
import React from 'react';

export function SelectAdd({
  values,
  setValues,
  selected,
  setSelected,
  className,
}: {
  values: string[];
  setValues: (values: string[]) => void;
  selected?: string;
  setSelected: (value: string) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newValue, setNewValue] = useState('');
  const handleAdd = () => {
    if (newValue.trim()) {
      setValues([...values, newValue.trim()]);
      setNewValue('');
      setIsOpen(false);
    }
  };
  return (
    <div className={cn('relative', className)}>
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {values.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
          <SelectSeparator />

          <Credenza open={isOpen} onOpenChange={setIsOpen}>
            <CredenzaTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className=" h-6 w-full"
                type="button"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CredenzaTrigger>
            <CredenzaContent>
              <CredenzaHeader>
                <CredenzaTitle>Add New Option</CredenzaTitle>
              </CredenzaHeader>
              <CredenzaBody>
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter new value"
                />
              </CredenzaBody>
              <CredenzaFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd}>Add</Button>
              </CredenzaFooter>
            </CredenzaContent>
          </Credenza>
        </SelectContent>
      </Select>
    </div>
  );
}

// https://github.com/shadcn-ui/ui/issues/2002

'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import {cn} from "../lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsListVariants = cva(' inline-flex items-center justify-start h-9', {
  variants: {
    variant: {
      default: 'border-b rounded-none bg-background p-0',
      background: 'rounded-lg bg-muted p-1',
    },
    size: {
      default: 'h-9',
      sm: 'h-8  text-xs',
      lg: 'h-10 ',
      icon: 'h-9 w-9',
    },
    width: {
      default: 'w-full',
      fit: 'w-fit',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    width: 'default',
  },
});

const TabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-normal  transition-all disabled:pointer-events-none data-[state=active]:text-foreground px-3',
  {
    variants: {
      variant: {
        default:
          'bg-background border-b-2 border-background focus:border-primary ring-0 outline-none shadow-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary disabled:opacity-100 data-[state=active]:shadow-none rounded-none m-0 pt-1.5 pb-1 hover:bg-background-muted h-full',
        background:
          'data-[state=active]:bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:shadow disabled:opacity-50 rounded-md py-1',
      },
      size: {
        default: '',
        sm: ' text-xs',
        lg: '',
        icon: 'h-9 w-9',
      },
      width: {
        default: '',
        fit: 'w-fit',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      width: 'default',
    },
  },
);

export interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement>, // Updated to use HTMLDivElement
    VariantProps<typeof TabsListVariants> {
  asChild?: boolean;
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, size, width, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(TabsListVariants({ variant, size, width, className }))}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof TabsTriggerVariants> {
  asChild?: boolean;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, size, width, value, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    value={value as string}
    className={cn(TabsTriggerVariants({ variant, size, width, className }))}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
//     ({ className, variant, size, asChild = false, ...props }, ref) => {
//       const Comp = asChild ? Slot : "button"
//       return (
//         <Comp
//           className={cn(buttonVariants({ variant, size, className }))}
//           ref={ref}
//           {...props}
//         />
//       )
//     }
//   )
//   Button.displayName = "Button"

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'pt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };

import {cva} from "class-variance-authority";

export const rowVariants = cva(
  '',
  {
    variants: {
      variant: {
        default: '',
        clickable: 'cursor-pointer hover:bg-accent active:bg-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export const cellVariants = cva(
  'max-w-[432px] text-ellipsis',
  {
    variants: {
      variant: {
        default: 'bg-card',
        clickable: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
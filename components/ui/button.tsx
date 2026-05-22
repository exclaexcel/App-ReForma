"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 active:scale-95 disabled:pointer-events-none disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-orange-700 text-white hover:bg-orange-800 active:bg-orange-900",
        secondary: "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
        ghost: "text-stone-600 hover:bg-stone-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
        destructive: "bg-red-700 text-white hover:bg-red-800",
        outline: "border border-stone-300 bg-transparent text-stone-700 hover:bg-stone-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

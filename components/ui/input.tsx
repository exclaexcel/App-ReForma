import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition-[border-color,ring-color,box-shadow] duration-150 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:shadow-sm focus:shadow-orange-600/20 disabled:cursor-not-allowed disabled:opacity-60",
          "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500",
          "light:border-stone-300 light:bg-stone-100 light:text-stone-900 light:placeholder:text-stone-400",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

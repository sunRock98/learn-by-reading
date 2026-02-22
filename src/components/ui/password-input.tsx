"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className='relative'>
      <input
        type={visible ? "text" : "password"}
        data-slot='input'
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input shadow-xs h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-9 text-base outline-none transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
      <button
        type='button'
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className='text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 transition-colors'
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
      </button>
    </div>
  );
}

export { PasswordInput };

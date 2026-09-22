"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

const LAYOUT_CLASS_REGEX =
  /^(?:[a-z0-9_-]+:)*(w-|min-w-|max-w-|flex-|shrink|grow|basis-|col-span-|row-span-)/;

function partitionClasses(classes?: string) {
  if (!classes) return { layoutClasses: "", restClasses: "" };
  const classList = classes.split(/\s+/).filter(Boolean);
  const layout: string[] = [];
  const rest: string[] = [];

  for (const cls of classList) {
    if (LAYOUT_CLASS_REGEX.test(cls)) {
      layout.push(cls);
    } else {
      rest.push(cls);
    }
  }

  return {
    layoutClasses: layout.join(" "),
    restClasses: rest.join(" "),
  };
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, wrapperClassName, label, error, id, placeholder, ...props },
    ref
  ) => {
    const { layoutClasses, restClasses } = partitionClasses(className);

    return (
      <div className={cn("w-full space-y-2", layoutClasses, wrapperClassName)}>
        {label && (
          <label
            className="text-xs font-bold tracking-widest text-on-surface-variant uppercase"
            htmlFor={id}
          >
            {label}
          </label>
        )}
        <div className="group/textarea relative">
          <textarea
            id={id}
            ref={ref}
            placeholder={placeholder}
            className={cn(
              "w-full resize-none rounded-md border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm transition-all placeholder:font-light placeholder:text-outline-variant focus:border-primary focus:ring-0 focus:outline-none",
              error && "border-error",
              restClasses
            )}
            {...props}
          />
          <div className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 rounded-b-md bg-primary transition-all duration-500 group-focus-within/textarea:w-full" />
        </div>
        {error && (
          <p className="text-[10px] font-medium tracking-wider text-error uppercase">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

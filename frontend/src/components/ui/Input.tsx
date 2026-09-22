"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: "default" | "floating";
  icon?: React.ReactNode;
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

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      label,
      error,
      variant = "default",
      id,
      placeholder,
      icon,
      ...props
    },
    ref
  ) => {
    const { layoutClasses, restClasses } = partitionClasses(className);

    if (variant === "floating") {
      return (
        <div
          className={cn("w-full space-y-1", layoutClasses, wrapperClassName)}
        >
          <div className="group/input relative">
            {icon && (
              <div className="pointer-events-none absolute top-1/2 left-4 flex -translate-y-1/2 items-center justify-center text-on-surface-variant transition-colors peer-focus:text-primary">
                {React.isValidElement(icon)
                  ? React.cloneElement(
                      icon as React.ReactElement,
                      {
                        size: 18,
                        strokeWidth: 1.5,
                      } as Record<string, unknown>
                    )
                  : icon}
              </div>
            )}
            <input
              id={id}
              ref={ref}
              placeholder=" " // Required for peer-placeholder-shown to work
              className={cn(
                "peer w-full rounded-md border border-outline-variant/30 bg-surface-container-lowest px-4 pt-6 pb-2 text-sm transition-all focus:border-primary focus:ring-0 focus:outline-none",
                error && "border-error/50",
                icon && "pl-11",
                restClasses
              )}
              {...props}
            />
            {label && (
              <label
                htmlFor={id}
                className={cn(
                  "pointer-events-none absolute top-6 left-4 origin-left text-outline transition-all duration-300",
                  "peer-placeholder-shown:top-6 peer-placeholder-shown:text-base",
                  "peer-focus:top-6 peer-focus:-translate-y-4 peer-focus:text-xs peer-focus:text-primary",
                  // Always float if there's a value (not placeholder-shown)
                  "peer-[:not(:placeholder-shown)]:top-6 peer-[:not(:placeholder-shown)]:-translate-y-4 peer-[:not(:placeholder-shown)]:text-xs",
                  error && "text-error/70"
                )}
              >
                {label}
              </label>
            )}
            <div className="pointer-events-none absolute bottom-0 left-0 h-[1px] w-0 rounded-b-md bg-primary transition-all duration-500 group-focus-within/input:w-full" />
          </div>
          {error && (
            <p className="pt-1 text-[10px] font-medium tracking-wider text-error uppercase">
              {error}
            </p>
          )}
        </div>
      );
    }

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
        <div className="group/input relative">
          {icon && (
            <div className="pointer-events-none absolute top-1/2 left-4 flex -translate-y-1/2 items-center justify-center text-on-surface-variant transition-colors group-focus-within/input:text-primary">
              {React.isValidElement(icon)
                ? React.cloneElement(
                    icon as React.ReactElement,
                    {
                      size: 18,
                      strokeWidth: 1.5,
                    } as Record<string, unknown>
                  )
                : icon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            placeholder={placeholder}
            className={cn(
              "w-full rounded-md border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm transition-all placeholder:font-light placeholder:text-outline-variant focus:border-primary focus:ring-0 focus:outline-none",
              error && "border-error",
              icon && "pl-11",
              restClasses
            )}
            {...props}
          />
          <div className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 rounded-b-md bg-primary transition-all duration-500 group-focus-within/input:w-full" />
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

Input.displayName = "Input";

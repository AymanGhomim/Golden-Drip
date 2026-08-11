"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  label?: string;
}

export function SearchInput({ value, onChange, placeholder = "بحث...", className, inputClassName, label = "بحث" }: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={cn("h-10 ps-10 pe-10", inputClassName)}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="absolute end-1 top-1/2 h-8 w-8 -translate-y-1/2"
          onClick={() => onChange("")}
          aria-label="مسح البحث"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

"use client";

import { useId, useRef, useState } from "react";
import { ImageIcon, LoaderCircle, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  brandAssetService,
  type BrandAssetKind,
} from "@/services/brand-asset.service";

type BrandAssetUploadProps = {
  label: string;
  value?: string;
  kind: BrandAssetKind;
  onChange: (value?: string) => void;
  className?: string;
};

export function BrandAssetUpload({
  label,
  value,
  kind,
  onChange,
  className,
}: BrandAssetUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const rule = brandAssetService.getRule(kind);

  const selectFile = async (file?: File) => {
    if (!file) return;
    setError(undefined);
    setBusy(true);
    try {
      const serialized = await brandAssetService.serializeForDevelopment(
        file,
        kind,
      );
      onChange(serialized);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "تعذر تجهيز الصورة المختارة",
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = () => {
    setError(undefined);
    onChange(brandAssetService.removeAsset());
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-bold text-[#111827]">{label}</p>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={brandAssetService.getAccept(kind)}
        className="sr-only"
        disabled={busy}
        onChange={(event) => void selectFile(event.target.files?.[0])}
      />
      <div
        role="button"
        tabIndex={0}
        aria-label={`${value ? "تغيير" : "رفع"} ${label}`}
        aria-busy={busy}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget === event.target) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void selectFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "group relative flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-[#F8FAFC] p-4 text-center outline-none transition",
          "hover:border-[#6B7280] hover:bg-[#F3F4F6] focus-visible:ring-2 focus-visible:ring-[#111827] focus-visible:ring-offset-2",
          dragging && "border-[#111827] bg-[#F3F4F6]",
          error && "border-red-400",
        )}
      >
        {value ? (
          <>
            {/* Data URLs and .ico previews are intentionally rendered without image optimization. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={`معاينة ${label}`}
              className={cn(
                "h-28 w-full object-contain",
                kind === "loginBackground" && "h-36 object-cover",
              )}
            />
            <span className="mt-3 text-xs font-bold text-[#374151]">
              اضغط أو اسحب صورة جديدة للاستبدال
            </span>
          </>
        ) : (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm">
              {busy ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <ImageIcon className="h-5 w-5 text-[#374151]" />
              )}
            </span>
            <span className="mt-3 text-sm font-black text-[#111827]">
              اسحب الصورة هنا أو اضغط للاختيار
            </span>
            <span className="mt-1 text-xs text-[#667085]">
              PNG أو JPG أو WEBP · الحد الأقصى {rule.maxSizeLabel}
            </span>
          </>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-xs font-bold text-red-600">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="ml-2 h-4 w-4" />
          )}
          {value ? "تغيير الصورة" : "رفع صورة"}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={remove}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="ml-2 h-4 w-4" />
            حذف الصورة
          </Button>
        ) : null}
      </div>
    </div>
  );
}

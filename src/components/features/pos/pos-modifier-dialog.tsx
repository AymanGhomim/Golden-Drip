import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ModifierGroup } from "@/types/cafe-operations.types";
import type { Product } from "@/types/product.types";

export function PosModifierDialog({
  product,
  groups,
  selections,
  formatPrice,
  onOpenChange,
  onToggle,
  onConfirm,
}: {
  product: Product | null;
  groups: ModifierGroup[];
  selections: Record<string, string[]>;
  formatPrice: (value: number) => string;
  onOpenChange: (open: boolean) => void;
  onToggle: (group: ModifierGroup, optionId: string) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>تخصيص {product?.name}</DialogTitle>
          <DialogDescription>
            اختر الإضافات المطلوبة قبل إضافة المنتج إلى الطلب.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.id}>
              <div className="mb-2 flex justify-between">
                <b>{group.name}</b>
                <span className="text-xs text-muted-foreground">
                  {group.required ? "مطلوب" : "اختياري"} · حد أقصى{" "}
                  {group.maxSelections}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.options.map((option) => (
                  <Button
                    key={option.id}
                    type="button"
                    variant={
                      (selections[group.id] ?? []).includes(option.id)
                        ? "default"
                        : "outline"
                    }
                    disabled={!option.available}
                    onClick={() => onToggle(group, option.id)}
                    className="justify-between"
                  >
                    <span>{option.name}</span>
                    <span>
                      {option.priceAdjustment
                        ? `+${formatPrice(option.priceAdjustment)}`
                        : "بدون زيادة"}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button onClick={onConfirm}>إضافة إلى الطلب</Button>
      </DialogContent>
    </Dialog>
  );
}

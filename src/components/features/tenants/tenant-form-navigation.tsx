import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TenantFormNavigation({
  step,
  lastStep,
  submitted,
  editing,
  onPrevious,
  onNext,
  onSave,
}: {
  step: number;
  lastStep: number;
  submitted: boolean;
  editing: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-8 flex items-center justify-between border-t pt-5">
      <Button
        type="button"
        variant="outline"
        disabled={step === 0}
        onClick={onPrevious}
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        السابق
      </Button>
      {step < lastStep ? (
        <Button type="button" onClick={onNext}>
          التالي
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Button>
      ) : (
        <Button type="button" onClick={onSave} disabled={submitted}>
          <Save className="ml-2 h-4 w-4" />
          {editing ? "حفظ التعديلات" : "إنشاء الكافيه"}
        </Button>
      )}
    </div>
  );
}

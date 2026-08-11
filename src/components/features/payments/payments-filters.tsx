import { paymentMethodLabels } from "@/components/features/payments/payment-presentation";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PaymentsFilters({
  query,
  date,
  method,
  status,
  onQueryChange,
  onDateChange,
  onMethodChange,
  onStatusChange,
  onClear,
}: {
  query: string;
  date: string;
  method: string;
  status: string;
  onQueryChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onMethodChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="grid gap-2 border-b p-4 sm:grid-cols-2 lg:grid-cols-5">
      <SearchInput
        placeholder="رقم العملية أو الطلب أو العميل"
        value={query}
        onChange={onQueryChange}
      />
      <Input
        type="date"
        value={date}
        onChange={(event) => onDateChange(event.target.value)}
      />
      <select
        className="h-10 rounded-md border bg-background px-3"
        value={method}
        onChange={(event) => onMethodChange(event.target.value)}
      >
        <option value="ALL">كل طرق الدفع</option>
        {Object.entries(paymentMethodLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        className="h-10 rounded-md border bg-background px-3"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
      >
        <option value="ALL">كل الحالات</option>
        {["PENDING", "PAID", "FAILED", "PARTIALLY_REFUNDED", "REFUNDED"].map(
          (value) => (
            <option key={value}>{value}</option>
          ),
        )}
      </select>
      <Button variant="outline" onClick={onClear}>
        مسح الفلاتر
      </Button>
    </div>
  );
}

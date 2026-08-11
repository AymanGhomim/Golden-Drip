import { Printer, X } from "lucide-react";
import { Link } from "react-router-dom";

export function PrinterRequiredDialog({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="printer-dialog-title" dir="rtl" className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-950 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3"><div className="rounded-full bg-amber-100 p-2 text-amber-800"><Printer className="h-5 w-5" /></div><div><h2 id="printer-dialog-title" className="text-lg font-black">إعداد طابعة الفواتير</h2><p className="mt-1 text-sm text-slate-600">{message}</p></div></div>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold">إلغاء</button>
          <Link to="/settings" onClick={onClose} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">إعداد الطابعة</Link>
        </div>
      </section>
    </div>
  );
}

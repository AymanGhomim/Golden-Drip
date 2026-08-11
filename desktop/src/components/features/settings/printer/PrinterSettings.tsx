import { CheckCircle2, Printer, RefreshCw, Save, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PrinterListState } from "../../../../../electron/printer-contract";
import { printerErrorMessages, printerService } from "@/services/printer.service";

type Feedback = { tone: "success" | "error"; message: string } | null;

function PrinterStatus({ state }: { state: PrinterListState | null }) {
  if (!state?.selectedDeviceName)
    return <p className="flex items-center gap-2 text-sm text-amber-700"><TriangleAlert className="h-4 w-4" />لم يتم حفظ طابعة للفواتير على هذا الجهاز.</p>;
  if (!state.selectedPrinterAvailable)
    return <p className="flex items-center gap-2 text-sm font-bold text-red-700"><TriangleAlert className="h-4 w-4" />الطابعة المحفوظة غير متاحة على هذا الجهاز.</p>;
  return <p className="flex items-center gap-2 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" />الطابعة المحددة مثبتة على هذا الجهاز.</p>;
}

export function PrinterSettings() {
  const [state, setState] = useState<PrinterListState | null>(null);
  const [draftDeviceName, setDraftDeviceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const loadPrinters = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    const result = await printerService.list();
    if (result.success) {
      setState(result.data);
      setDraftDeviceName(result.data.selectedDeviceName ?? "");
    } else {
      setFeedback({ tone: "error", message: printerErrorMessages[result.code] });
    }
    setLoading(false);
  }, []);

  useEffect(() => { void loadPrinters(); }, [loadPrinters]);

  const selectedPrinter = useMemo(
    () => state?.printers.find((printer) => printer.deviceName === draftDeviceName),
    [draftDeviceName, state?.printers],
  );

  async function savePrinter() {
    if (!draftDeviceName) return;
    setSaving(true);
    setFeedback(null);
    const result = await printerService.select(draftDeviceName);
    if (result.success) {
      setState(result.data);
      setFeedback({ tone: "success", message: "تم حفظ طابعة الفواتير على هذا الجهاز." });
    } else setFeedback({ tone: "error", message: printerErrorMessages[result.code] });
    setSaving(false);
  }

  async function testPrint() {
    if (draftDeviceName !== state?.selectedDeviceName) {
      setFeedback({ tone: "error", message: "احفظ الطابعة المحددة قبل تنفيذ الطباعة التجريبية." });
      return;
    }
    setTesting(true);
    setFeedback(null);
    const result = await printerService.testPrint();
    setFeedback(result.success
      ? { tone: "success", message: "تم إرسال اختبار الطابعة بنجاح." }
      : { tone: "error", message: `${printerErrorMessages[result.code]}${result.detail ? ` (${result.detail})` : ""}` });
    setTesting(false);
  }

  return (
    <section className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-black/5 p-2"><Printer className="h-5 w-5" /></div>
        <div><h2 className="text-lg font-black">الطابعة</h2><p className="text-sm text-[var(--brand-muted)]">إعداد محلي لهذا الكمبيوتر ولا يغيّر بيانات الكافيه أو الفروع.</p></div>
      </div>

      <div className="mt-5 max-w-2xl">
        <label htmlFor="receipt-printer" className="text-sm font-bold">طابعة الفواتير</label>
        <select id="receipt-printer" className="input" value={draftDeviceName} disabled={loading || saving || testing} onChange={(event) => setDraftDeviceName(event.target.value)}>
          <option value="">اختر طابعة مثبتة على Windows</option>
          {state?.selectedDeviceName && !state.selectedPrinterAvailable ? <option value={state.selectedDeviceName} disabled>{state.selectedDeviceName} — غير متاحة</option> : null}
          {state?.printers.map((printer) => <option key={printer.deviceName} value={printer.deviceName}>{printer.displayName}{printer.isDefault ? " — الافتراضية في Windows" : ""}</option>)}
        </select>
        {selectedPrinter?.description ? <p className="mt-2 text-xs text-[var(--brand-muted)]">{selectedPrinter.description}</p> : null}
        <div className="mt-3"><PrinterStatus state={state} /></div>
        {!loading && state?.printers.length === 0 ? <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">لم يعثر Electron على طابعات مثبتة. ثبّت تعريف الطابعة في Windows ثم اضغط تحديث الطابعات.</p> : null}
        {feedback ? <p className={`mt-3 rounded-lg p-3 text-sm font-bold ${feedback.tone === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{feedback.message}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className="flex h-10 items-center gap-2 rounded-lg border border-[var(--brand-border)] px-4 text-sm font-bold disabled:opacity-50" disabled={loading || saving || testing} onClick={() => void loadPrinters()}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />تحديث الطابعات</button>
          <button type="button" className="flex h-10 items-center gap-2 rounded-lg border border-[var(--brand-border)] px-4 text-sm font-bold disabled:opacity-50" disabled={!state?.selectedPrinterAvailable || draftDeviceName !== state.selectedDeviceName || loading || saving || testing} onClick={() => void testPrint()}><Printer className="h-4 w-4" />{testing ? "جارٍ إرسال الاختبار..." : "طباعة تجريبية"}</button>
          <button type="button" className="flex h-10 items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 text-sm font-bold text-white disabled:opacity-50" disabled={!selectedPrinter || loading || saving || testing} onClick={() => void savePrinter()}><Save className="h-4 w-4" />{saving ? "جارٍ الحفظ..." : "حفظ الطابعة"}</button>
        </div>
      </div>
    </section>
  );
}

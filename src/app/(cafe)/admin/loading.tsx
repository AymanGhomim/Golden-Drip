export default function AdminLoading() {
  return (
    <section
      dir="rtl"
      aria-label="جاري تحميل الصفحة"
      className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"
    >
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </section>
  );
}

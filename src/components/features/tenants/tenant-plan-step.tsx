import { FEATURE_GROUPS, getPlanByCode, getPlans } from "@/config/plans.config";
import {
  featuresForPlan,
  tenantFeatureKeys,
  type TenantDraft,
  type UpdateTenantDraft,
} from "@/components/features/tenants/tenant-form-model";
import { Button } from "@/components/ui/button";

export function TenantPlanStep({
  draft,
  setDraft,
  update,
}: {
  draft: TenantDraft;
  setDraft: React.Dispatch<React.SetStateAction<TenantDraft>>;
  update: UpdateTenantDraft;
}) {
  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4">
          <h2 className="font-black">الباقة</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            اختر الباقة أولًا، ثم حدد هل تريد استخدام مميزاتها أو تخصيص المميزات
            يدويًا.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {getPlans()
            .filter((item) => item.active)
            .map((plan) => (
              <button
                key={plan.code}
                type="button"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    plan: plan.code,
                    enabledFeatures:
                      current.featureSelectionMode === "PLAN"
                        ? featuresForPlan(plan.code)
                        : current.enabledFeatures,
                  }))
                }
                className={`rounded-2xl border p-5 text-right ${draft.plan === plan.code ? "border-[#111111] bg-[#F3F4F6] ring-2 ring-[#111111]/20" : "bg-white"}`}
              >
                <p className="font-black">{plan.name}</p>
                <p className="mt-1 text-xs font-bold text-[#667085]">
                  {plan.code}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </button>
            ))}
        </div>
      </div>
      <div>
        <h2 className="font-black">طريقة اختيار المميزات</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              setDraft((current) => ({
                ...current,
                featureSelectionMode: "PLAN",
                enabledFeatures: featuresForPlan(current.plan),
              }))
            }
            className={`rounded-2xl border p-5 text-right transition ${draft.featureSelectionMode === "PLAN" ? "border-[#111111] bg-[#111111] text-white ring-2 ring-[#111111]/20" : "border-[#D1D5DB] bg-white"}`}
          >
            <span className="block font-black">استخدام مميزات الباقة</span>
            <span
              className={`mt-1 block text-xs leading-5 ${draft.featureSelectionMode === "PLAN" ? "text-white/70" : "text-muted-foreground"}`}
            >
              تتغير المميزات تلقائيًا عند تغيير الباقة.
            </span>
          </button>
          <button
            type="button"
            onClick={() => update("featureSelectionMode", "CUSTOM")}
            className={`rounded-2xl border p-5 text-right transition ${draft.featureSelectionMode === "CUSTOM" ? "border-[#111111] bg-[#111111] text-white ring-2 ring-[#111111]/20" : "border-[#D1D5DB] bg-white"}`}
          >
            <span className="block font-black">اختيار يدوي</span>
            <span
              className={`mt-1 block text-xs leading-5 ${draft.featureSelectionMode === "CUSTOM" ? "text-white/70" : "text-muted-foreground"}`}
            >
              فعّل أو ألغِ أي ميزة بشكل مستقل عن الباقة.
            </span>
          </button>
        </div>
      </div>
      {draft.featureSelectionMode === "CUSTOM" ? (
        <div className="rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] p-4 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-black">اختيار المميزات يدويًا</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                تم اختيار {draft.enabledFeatures.length} من{" "}
                {tenantFeatureKeys.length} ميزة.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  update("enabledFeatures", [...tenantFeatureKeys])
                }
              >
                تحديد الكل
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => update("enabledFeatures", [])}
              >
                إلغاء الكل
              </Button>
            </div>
          </div>
          <div className="mt-6 space-y-6">
            {FEATURE_GROUPS.map((group) => (
              <section key={group.title}>
                <h3 className="mb-3 text-sm font-black text-[#374151]">
                  {group.title}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((feature) => {
                    const checked = draft.enabledFeatures.includes(feature.key);
                    return (
                      <label
                        key={feature.key}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 transition ${checked ? "border-[#111111] ring-1 ring-[#111111]/10" : "border-[#E5E7EB] hover:border-[#9CA3AF]"}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            update(
                              "enabledFeatures",
                              checked
                                ? draft.enabledFeatures.filter(
                                    (key) => key !== feature.key,
                                  )
                                : [...draft.enabledFeatures, feature.key],
                            )
                          }
                          className="mt-1 h-4 w-4 accent-[#111111]"
                        />
                        <span>
                          <span className="block text-sm font-black">
                            {feature.name}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                            {feature.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] p-4 sm:p-6">
          <h2 className="font-black">
            مميزات باقة {getPlanByCode(draft.plan).name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            سيتم تفعيل {draft.enabledFeatures.length} ميزة تلقائيًا.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {FEATURE_GROUPS.flatMap((group) => group.items)
              .filter((feature) => draft.enabledFeatures.includes(feature.key))
              .map((feature) => (
                <span
                  key={feature.key}
                  className="rounded-full border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-bold"
                >
                  {feature.name}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { Monitor, ServerOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { firstAccessibleRoute } from "@/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { sessionStarted } from "@/store/auth-slice";
import { ordersReplaced } from "@/store/orders-slice";
import { developmentSnapshotLoaded } from "@/store/development-slice";
import {
  isDesktopApiConfigured,
  useCafeLoginMutation,
} from "@/store/api";

const schema = z.object({
  tenantCode: z.string().min(2),
  login: z.string().min(2),
  password: z.string().min(6),
});
type LoginValues = z.infer<typeof schema>;

function productionLoginError(error: unknown) {
  const candidate = error as {
    data?: { error?: { code?: string } };
    error?: string;
  };
  const code = candidate.data?.error?.code;
  if (code === "CLIENT_TYPE_NOT_ALLOWED")
    return "هذا الكافيه غير مصرح له باستخدام تطبيق سطح المكتب.";
  if (code === "TENANT_SUSPENDED" || code === "EMPLOYEE_SUSPENDED")
    return "الحساب موقوف. يرجى التواصل مع إدارة النظام.";
  if (code === "INVALID_CREDENTIALS")
    return "بيانات تسجيل الدخول غير صحيحة.";
  return "تعذر الاتصال بخادم النظام. تحقق من الاتصال ثم حاول مرة أخرى.";
}

export function LoginPage() {
  const session = useAppSelector((state) => state.auth.session);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [cafeLogin] = useCafeLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { tenantCode: "", login: "", password: "" },
  });

  if (session) return <Navigate to={firstAccessibleRoute(session)} replace />;

  if (!import.meta.env.DEV && !isDesktopApiConfigured)
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6" dir="rtl">
        <section className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-2xl">
          <ServerOff className="mx-auto h-14 w-14 text-slate-700" />
          <h1 className="mt-6 text-2xl font-black text-slate-900">
            لم يتم إعداد خادم النظام لهذا الإصدار
          </h1>
          <p className="mt-3 leading-7 text-slate-500">
            يلزم إعداد عنوان خادم Penta-K قبل استخدام تسجيل الدخول في نسخة الإنتاج.
          </p>
        </section>
      </main>
    );

  const submit = handleSubmit(async (values) => {
    const request = {
      ...values,
      login: values.login.trim().toLowerCase(),
      clientType: "DESKTOP" as const,
    };
    try {
      const nextSession = import.meta.env.DEV
        ? await (async () => {
            const { developmentCafeLogin } = await import("@/dev/auth-adapter");
            const result = await developmentCafeLogin(request);
            if (!result.ok) throw result;
            dispatch(developmentSnapshotLoaded(result.snapshot));
            dispatch(ordersReplaced(result.snapshot.orders));
            return result.session;
          })()
        : await cafeLogin(request).unwrap();
      setError("");
      dispatch(sessionStarted(nextSession));
      navigate(firstAccessibleRoute(nextSession), { replace: true });
    } catch (loginError) {
      if (
        import.meta.env.DEV &&
        (loginError as { code?: string }).code === "CLIENT_TYPE_NOT_ALLOWED"
      )
        setError("هذا الكافيه غير مصرح له باستخدام تطبيق سطح المكتب.");
      else setError(productionLoginError(loginError));
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6" dir="rtl">
      <section className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        <div className="hidden bg-slate-900 p-12 text-white md:flex md:flex-col md:justify-between">
          <Monitor className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-black">تطبيق إدارة الكافيه</h1>
            <p className="mt-4 leading-8 text-slate-300">
              عميل Desktop آمن لنقطة البيع والطلبات والمطبخ وتشغيل الفروع.
            </p>
          </div>
          <p className="text-xs text-slate-400">Penta-K Platform</p>
        </div>
        <form onSubmit={submit} className="p-8 md:p-12">
          <ShieldCheck className="h-10 w-10 text-slate-800" />
          <h2 className="mt-5 text-2xl font-black text-slate-900">تسجيل الدخول</h2>
          <p className="mt-2 text-sm text-slate-500">
            تظهر هوية الكافيه بعد التحقق من الحساب.
          </p>
          <label className="mt-7 block text-sm font-bold">
            رمز الكافيه
            <input {...register("tenantCode")} className="input" />
            {errors.tenantCode ? (
              <small className="text-red-600">رمز الكافيه مطلوب</small>
            ) : null}
          </label>
          <label className="mt-4 block text-sm font-bold">
            اسم المستخدم
            <input {...register("login")} className="input" />
          </label>
          <label className="mt-4 block text-sm font-bold">
            كلمة المرور
            <input type="password" {...register("password")} className="input" />
          </label>
          {error ? (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
              {error}
            </p>
          ) : null}
          <button
            disabled={isSubmitting}
            className="mt-6 w-full rounded-xl bg-slate-900 py-3 font-bold text-white disabled:opacity-50"
          >
            {isSubmitting ? "جارٍ التحقق..." : "دخول إلى التطبيق"}
          </button>
          {import.meta.env.DEV ? (
            <p className="mt-4 text-xs text-slate-400">
              وضع التطوير المحلي مفعّل. استخدم بيانات بيئة التطوير المخصصة.
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}

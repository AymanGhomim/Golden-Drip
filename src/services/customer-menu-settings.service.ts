import { customerMenuSettingsRepository } from "@/repositories/customer-menu-settings.repository";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import { tenantService } from "@/services/tenant.service";
import type { CustomerMenuSettings } from "@/types/customer-menu-settings.types";

export const customerMenuSettingsService = {
  get(tenantId = tenantService.requireActiveTenantId()) { return customerMenuSettingsRepository.get(tenantId); },
  save(value: CustomerMenuSettings, tenantId = tenantService.requireActiveTenantId()) {
    if (value.tenantId !== tenantId) throw new Error("إعدادات المنيو لا تنتمي إلى الكافيه الحالي.");
    if (!Number.isFinite(value.preparationMinutes) || value.preparationMinutes <= 0) throw new Error("مدة التحضير يجب أن تكون أكبر من صفر.");
    if (!Number.isFinite(value.minimumDeliveryOrder) || value.minimumDeliveryOrder < 0) throw new Error("الحد الأدنى للطلب غير صالح.");
    if (!Number.isFinite(value.estimatedDeliveryMinutes) || value.estimatedDeliveryMinutes <= 0) throw new Error("وقت التوصيل المتوقع غير صالح.");
    const saved = customerMenuSettingsRepository.save({ ...value, tenantId, updatedAt: new Date().toISOString() });
    cafeOperationsService.audit({ module: "menu-settings", action: "CUSTOMER_MENU_SETTINGS_UPDATED", description: "تم تحديث إعدادات المنيو الإلكتروني.", entityType: "customerMenuSettings", entityId: tenantId });
    if (typeof window !== "undefined") window.dispatchEvent(new Event("menu-settings:changed"));
    return saved;
  },
};

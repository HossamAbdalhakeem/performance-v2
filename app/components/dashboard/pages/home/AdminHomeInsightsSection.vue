<template>
  <section class="space-y-3">
    <div>
      <p class="font-bold text-white">التحليلات</p>
      <p class="mt-0.5 text-xs text-slate-400">
        توزيع المدفوعات وأفضل المنتجات
      </p>
    </div>

    <div class="grid gap-4 xl:grid-cols-2">
      <AdminHomePaymentsSkeleton v-if="paymentsLoading" />
      <PaymentMethodsReport
        v-else
        :items="paymentMethodItems"
        :title="paymentTitle"
        :total-label="paymentTotalLabel"
        :empty-message="paymentEmptyMessage"
      />

      <AdminHomeTopProductsSkeleton v-if="productsLoading" />
      <AdminHomeTopProductsCard
        v-else
        :title="productsTitle"
        :subtitle="productsSubtitle"
        :items="topProducts"
        :empty-message="productsEmptyMessage"
      />
    </div>
  </section>
</template>

<script setup>
import PaymentMethodsReport from "~/components/shared/payment-methods-report/index.vue";
import AdminHomeTopProductsCard from "./AdminHomeTopProductsCard.vue";
import AdminHomePaymentsSkeleton from "./skeletons/AdminHomePaymentsSkeleton.vue";
import AdminHomeTopProductsSkeleton from "./skeletons/AdminHomeTopProductsSkeleton.vue";

defineOptions({ name: "AdminHomeInsightsSection" });

defineProps({
  paymentMethodItems: { type: Array, default: () => [] },
  paymentsLoading: { type: Boolean, default: false },
  paymentTitle: { type: String, default: "طرق الدفع" },
  paymentTotalLabel: { type: String, default: "إجمالي المدفوعات" },
  paymentEmptyMessage: {
    type: String,
    default: "لا توجد مدفوعات بعد",
  },
  topProducts: { type: Array, default: () => [] },
  productsLoading: { type: Boolean, default: false },
  productsTitle: { type: String, default: "أكثر المنتجات مبيعًا" },
  productsSubtitle: { type: String, default: "أعلى 5 منتجات عبر النظام" },
  productsEmptyMessage: {
    type: String,
    default: "لا توجد مبيعات لعرضها بعد.",
  },
});
</script>

<template>
  <section class="space-y-3">
    <div>
      <p class="font-bold text-white">التحليلات</p>
      <p class="mt-0.5 text-xs text-slate-400">
        توزيع المدفوعات ومبيعات آخر 7 أيام وأفضل المنتجات
      </p>
    </div>

    <div class="grid gap-4 xl:grid-cols-2">
      <div
        v-if="paymentsLoading"
        class="rounded-xl border border-white/10 bg-slate-900 p-4"
      >
        <div class="mb-4 flex justify-center">
          <Skeleton width="8rem" height="1.1rem" border-radius="6px" />
        </div>
        <div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Skeleton shape="circle" size="8rem" />
          <div class="w-full max-w-xs space-y-2">
            <Skeleton
              v-for="i in 3"
              :key="`pay-skel-${i}`"
              width="100%"
              height="1rem"
              border-radius="6px"
            />
          </div>
        </div>
      </div>
      <PaymentMethodsReport
        v-else
        :items="paymentMethodItems"
        :title="paymentTitle"
        :total-label="paymentTotalLabel"
        :empty-message="paymentEmptyMessage"
      />

      <AdminHomeSalesTrendCard
        :points="salesTrendPoints"
        :branch-id="salesTrendBranchId"
        :loading="salesTrendLoading"
        @update:branch-id="$emit('update:salesTrendBranchId', $event)"
      />
    </div>

    <div
      v-if="productsLoading"
      class="rounded-2xl border border-white/10 bg-slate-900/90 p-5"
    >
      <div class="mb-4 space-y-2">
        <Skeleton width="10rem" height="1.1rem" border-radius="6px" />
        <Skeleton width="14rem" height="0.75rem" border-radius="6px" />
      </div>
      <div class="space-y-3">
        <div
          v-for="i in 5"
          :key="`prod-skel-${i}`"
          class="flex items-center justify-between gap-3"
        >
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <Skeleton width="2rem" height="2rem" border-radius="8px" />
            <Skeleton width="70%" height="0.9rem" border-radius="6px" />
          </div>
          <Skeleton width="2.5rem" height="0.9rem" border-radius="6px" />
        </div>
      </div>
    </div>
    <AdminHomeTopProductsCard
      v-else
      :title="productsTitle"
      :subtitle="productsSubtitle"
      :items="topProducts"
      :empty-message="productsEmptyMessage"
    />
  </section>
</template>

<script setup>
import PaymentMethodsReport from "~/components/shared/payment-methods-report/index.vue";
import AdminHomeTopProductsCard from "./AdminHomeTopProductsCard.vue";
import AdminHomeSalesTrendCard from "./AdminHomeSalesTrendCard.vue";

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
  salesTrendPoints: { type: Array, default: () => [] },
  salesTrendBranchId: { type: String, default: null },
  salesTrendLoading: { type: Boolean, default: false },
  topProducts: { type: Array, default: () => [] },
  productsLoading: { type: Boolean, default: false },
  productsTitle: { type: String, default: "أكثر المنتجات مبيعًا" },
  productsSubtitle: { type: String, default: "أعلى 5 منتجات عبر النظام" },
  productsEmptyMessage: {
    type: String,
    default: "لا توجد مبيعات لعرضها بعد.",
  },
});

defineEmits(["update:salesTrendBranchId"]);
</script>

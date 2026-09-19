<template>
  <div
    v-if="loading"
    class="rounded-xl border border-white/10 bg-slate-900 p-4"
  >
    <Skeleton width="8rem" height="1rem" class="mb-3" />
    <Skeleton width="100%" height="6rem" />
  </div>
  <PaymentMethodsReport
    v-else
    :items="items"
    total-label="إجمالي المدفوعات"
  />
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { reportService } from "~/services/reportService";
import { useAdminReportSection } from "~/composables/useAdminReportSection";

defineOptions({ name: "ReportsPaymentsSection" });

const PaymentMethodsReport = defineAsyncComponent(() =>
  import("~/components/shared/payment-methods-report/index.vue"),
);

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data } = useAdminReportSection(
  (params) => reportService.getAdminPayments(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
  },
);

const items = computed(() =>
  Array.isArray(data.value?.paymentsByMethod)
    ? data.value.paymentsByMethod
    : [],
);
</script>

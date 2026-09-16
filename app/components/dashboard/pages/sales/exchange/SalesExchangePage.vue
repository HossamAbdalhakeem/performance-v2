<template>
  <div class="space-y-6 text-right" dir="rtl">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">استبدال واسترداد المبيعات</span>
      </template>
      <template #content>
        <div class="mb-5">
          <SearchInput
            placeholder="رقم العملية / طالب / منتج / موبايل"
            @search="onSearch"
          />
        </div>

        <SalesExchangeTable
          :sales="sales"
          :loading="loading"
          @exchange="openExchange"
          @refund="openRefund"
        />
      </template>
    </Card>

    <SalesExchangeRefundFlow
      v-model:open="refundOpen"
      :sale="selectedSale"
      @done="onFlowDone"
      @close="onFlowClose"
    />

    <SalesExchangeExchangeFlow
      v-model:open="exchangeOpen"
      :sale="selectedSale"
      @done="onFlowDone"
      @close="onFlowClose"
    />
  </div>
</template>

<script setup>
import Card from "primevue/card";
import SalesExchangeTable from "~/components/dashboard/pages/sales/exchange/SalesExchangeTable.vue";
import SalesExchangeRefundFlow from "~/components/dashboard/pages/sales/exchange/SalesExchangeRefundFlow.vue";
import SalesExchangeExchangeFlow from "~/components/dashboard/pages/sales/exchange/SalesExchangeExchangeFlow.vue";
import SearchInput from "~/components/shared/search-input/index.vue";
import { exchangeService } from "~/services/exchangeService";
import { useAppToast } from "~/composables/useAppToast";
import { formatMoney, formatDateTime } from "~/utils/format";

defineOptions({ name: "SalesExchangePage" });

const { showError } = useAppToast();

const loading = ref(true);
const sales = ref([]);
const selectedSale = ref(null);
const refundOpen = ref(false);
const exchangeOpen = ref(false);
const filters = reactive({ search: "" });

const withDisplayLabels = (row) => ({
  ...row,
  unitPriceLabel: formatMoney(row.unitPrice),
  amountLabel: formatMoney(row.amount),
  refundAmountLabel: formatMoney(row.refundAmount ?? row.amount),
  createdAtLabel: formatDateTime(row.createdAt, { empty: "—" }),
});

const loadData = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.search?.trim()) params.search = filters.search.trim();
    const rows = await exchangeService.getEligibleSales(params);
    sales.value = (rows || []).map(withDisplayLabels);
  } catch (error) {
    showError(error?.message || "تعذر تحميل المبيعات.");
    sales.value = [];
  } finally {
    loading.value = false;
  }
};

const onSearch = (value) => {
  filters.search = value;
  loadData();
};

const openRefund = (item) => {
  selectedSale.value = item;
  exchangeOpen.value = false;
  refundOpen.value = true;
};

const openExchange = (item) => {
  selectedSale.value = item;
  refundOpen.value = false;
  exchangeOpen.value = true;
};

const onFlowDone = async () => {
  selectedSale.value = null;
  await loadData();
};

const onFlowClose = () => {
  if (!refundOpen.value && !exchangeOpen.value) {
    selectedSale.value = null;
  }
};

onMounted(loadData);
</script>

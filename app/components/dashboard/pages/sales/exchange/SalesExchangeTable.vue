<template>
  <AppDataTable
    :value="sales"
    :columns="columns"
    :loading="loading"
    paginator
    :rows="20"
    empty-message="لا توجد مبيعات قابلة للعرض."
  >
    <template #amountLabel="{ data }">
      <span
        class="rounded-md bg-sky-500/20 px-2 py-1 text-xs font-bold text-sky-300"
      >
        {{ data.amountLabel }}
      </span>
    </template>

    <template #quantity="{ data }">
      <div class="flex flex-col items-center gap-0.5">
        <span class="font-medium">{{ data.remainingQuantity }}</span>
        <span
          v-if="data.status === 'PARTIALLY_RETURNED'"
          class="text-[11px] text-amber-600"
        >
          مرتجع {{ data.returnedQuantity ?? 0 }}
        </span>
      </div>
    </template>

    <template #paymentMethod="{ data }">
      <PaymentProofThumb
        :method="data.paymentMethod"
        :method-label="data.paymentMethodLabel"
        :payment-id="data.paymentId"
        :proof-url="data.proofUrl"
        :has-proof="data.hasProof"
      />
    </template>

    <template #status="{ data }">
      <AppStatusTag
        kind="sale"
        :code="data.status"
        :label="data.statusLabel"
      />
    </template>

    <template #actions="{ data }">
      <div class="flex flex-wrap justify-center gap-1">
        <Button
          v-if="canModify(data)"
          label="استبدال منتج"
          icon="pi pi-sync"
          text
          size="small"
          severity="info"
          @click="$emit('exchange', data)"
        />
        <Button
          v-if="canModify(data)"
          label="استرداد"
          icon="pi pi-replay"
          text
          size="small"
          severity="danger"
          @click="$emit('refund', data)"
        />
        <span v-if="!canModify(data)" class="text-xs text-slate-400">—</span>
      </div>
    </template>
  </AppDataTable>
</template>

<script setup>
import Button from "primevue/button";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import AppStatusTag from "~/components/shared/app-status-tag/index.vue";
import PaymentProofThumb from "~/components/shared/payment-proof-thumb/index.vue";

defineProps({
  sales: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["exchange", "refund"]);

const columns = [
  { field: "saleNumber", header: "رقم العملية" },
  { field: "createdAtLabel", header: "تاريخ البيع" },
  { field: "studentName", header: "الطالب" },
  { field: "phone", header: "الموبايل", fallback: "—" },
  { field: "productName", header: "المنتج" },
  { field: "remainingQuantity", header: "الكمية", slot: "quantity" },
  { field: "amountLabel", header: "المبلغ", slot: "amountLabel" },
  { field: "paymentMethodLabel", header: "طريقة الدفع", slot: "paymentMethod" },
  { field: "branchName", header: "الفرع" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 14rem" },
];

const canModify = (row) => Boolean(row.canModify);
</script>

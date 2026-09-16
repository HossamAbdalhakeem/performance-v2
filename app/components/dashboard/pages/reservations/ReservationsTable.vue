<template>
  <AppDataTable
    :value="reservations"
    :columns="columns"
    :loading="loading"
    paginator
    lazy
    :rows="rows"
    :first="first"
    :total-records="totalRecords"
    empty-message="لا توجد حجوزات."
    @page="$emit('page', $event)"
  >
    <template #sellingPriceLabel="{ data }">
      <span
        class="rounded-md px-2 py-1 text-xs font-bold bg-sky-500/20 text-sky-300"
      >
        {{ data.sellingPriceLabel }}
      </span>
    </template>

    <template #paidAmountLabel="{ data }">
      <span
        class="rounded-md px-2 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300"
      >
        {{ data.paidAmountLabel }}
      </span>
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

    <template #remainingAmountLabel="{ data }">
      <span
        class="rounded-md px-2 py-1 text-xs font-bold"
        :class="
          data.remainingAmount > 0
            ? 'bg-orange-500/20 text-orange-300'
            : 'bg-emerald-500/20 text-emerald-300'
        "
      >
        {{ data.remainingAmountLabel }}
      </span>
    </template>

    <template #status="{ data }">
      <Tag :value="data.statusLabel" :severity="data.statusSeverity" />
    </template>

    <template #createdBy="{ data }">
      <div class="flex flex-col items-center gap-0.5">
        <span class="text-sm font-medium">{{ data.createdByName }}</span>
        <Tag
          v-if="data.createdByRoleLabel && data.createdByRoleLabel !== '-'"
          :value="data.createdByRoleLabel"
          severity="secondary"
        />
      </div>
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
          @click="$emit('change-product', data)"
        />
        <Button
          v-if="canModify(data)"
          label="إلغاء الحجز"
          icon="pi pi-times"
          text
          size="small"
          severity="danger"
          @click="$emit('cancel', data)"
        />
      </div>
    </template>
  </AppDataTable>
</template>

<script setup>
import Button from "primevue/button";
import Tag from "primevue/tag";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import PaymentProofThumb from "~/components/shared/payment-proof-thumb/index.vue";

defineProps({
  reservations: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rows: { type: Number, default: 20 },
  first: { type: Number, default: 0 },
  totalRecords: { type: Number, default: 0 },
});

defineEmits(["change-product", "cancel", "page"]);

const columns = [
  { field: "reservationNumber", header: "رقم الحجز" },
  { field: "createdAtLabel", header: "تاريخ الحجز" },
  { field: "studentName", header: "الطالب" },
  { field: "productName", header: "المنتج" },
  { field: "createdByName", header: "أنشئ بواسطة", slot: "createdBy" },
  { field: "sellingPriceLabel", header: "سعر البيع", slot: "sellingPriceLabel" },
  { field: "branchName", header: "الفرع" },
  { field: "quantity", header: "الكمية" },
  { field: "paidAmountLabel", header: "المقدم", slot: "paidAmountLabel" },
  { field: "paymentMethodLabel", header: "طريقة الدفع", slot: "paymentMethod" },
  { field: "remainingAmountLabel", header: "المتبقي", slot: "remainingAmountLabel" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 14rem" },
];

const canModify = (row) =>
  row.status !== "DELIVERED" && row.status !== "CANCELLED";
</script>

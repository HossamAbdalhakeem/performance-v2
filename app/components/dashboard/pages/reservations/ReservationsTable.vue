<template>
  <AppDataTable
    :value="reservations"
    :columns="columns"
    :loading="loading"
    paginator
    :rows="10"
    empty-message="لا توجد حجوزات."
  >
    <template #status="{ data }">
      <Tag :value="data.statusLabel" :severity="data.statusSeverity" />
    </template>
    <template #actions="{ data }">
      <div class="flex flex-wrap justify-center gap-1">
        <Button
          v-if="canModify(data)"
          label="تبديل منتج"
          icon="pi pi-sync"
          text
          size="small"
          severity="info"
          @click="$emit('change-product', data)"
        />
        <Button
          v-if="canModify(data)"
          label="إلغاء"
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

defineProps({
  reservations: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["change-product", "cancel"]);

const columns = [
  { field: "reservationNumber", header: "رقم الحجز" },
  { field: "studentName", header: "الطالب" },
  { field: "productName", header: "المنتج" },
  { field: "sellingPriceLabel", header: "سعر البيع" },
  { field: "branchName", header: "الفرع" },
  { field: "quantity", header: "الكمية" },
  { field: "paidAmountLabel", header: "المدفوع" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 14rem" },
];

const canModify = (row) =>
  row.status !== "DELIVERED" && row.status !== "CANCELLED";
</script>

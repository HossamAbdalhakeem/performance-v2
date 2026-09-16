<template>
  <AppDataTable
    :value="expenses"
    :columns="columns"
    :loading="loading"
    paginator
    lazy
    :rows="rows"
    :first="first"
    :total-records="totalRecords"
    empty-message="لا توجد مصروفات."
    @page="$emit('page', $event)"
  >
    <template #actions="{ data }">
      <Button
        label="تعديل"
        icon="pi pi-pencil"
        text
        size="small"
        severity="info"
        @click="$emit('edit', data)"
      />
    </template>
  </AppDataTable>
</template>

<script setup>
import Button from "primevue/button";
import AppDataTable from "~/components/shared/app-data-table/index.vue";

defineProps({
  expenses: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rows: { type: Number, default: 20 },
  first: { type: Number, default: 0 },
  totalRecords: { type: Number, default: 0 },
});

defineEmits(["edit", "page"]);

const columns = [
  { field: "categoryName", header: "التصنيف" },
  { field: "branchName", header: "الفرع" },
  { field: "amountLabel", header: "المبلغ" },
  { field: "expenseDateLabel", header: "التاريخ" },
  { field: "description", header: "الوصف", fallback: "-" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 8rem" },
];
</script>

<template>
  <AppDataTable
    :value="expenses"
    :columns="columns"
    :loading="loading"
    paginator
    :rows="10"
    empty-message="لا توجد مصروفات."
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
});

defineEmits(["edit"]);

const columns = [
  { field: "categoryName", header: "التصنيف" },
  { field: "branchName", header: "الفرع" },
  { field: "amountLabel", header: "المبلغ" },
  { field: "expenseDateLabel", header: "التاريخ" },
  { field: "description", header: "الوصف", fallback: "-" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 8rem" },
];
</script>

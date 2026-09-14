<template>
  <AppDataTable
    :value="products"
    :columns="columns"
    :loading="loading"
    paginator
    :rows="10"
    empty-message="لا توجد منتجات."
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
  products: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["edit"]);

const columns = [
  { field: "name", header: "اسم المنتج" },
  { field: "sellingPriceLabel", header: "سعر البيع" },
  { field: "teacherName", header: "المدرس" },
  { field: "studyYearName", header: "السنة الدراسية" },
  { field: "typeLabel", header: "النوع" },
  { field: "reservationLabel", header: "الحجز" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 8rem" },
];
</script>

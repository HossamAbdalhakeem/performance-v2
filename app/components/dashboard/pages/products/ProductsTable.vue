<template>
  <div>
    <div v-if="loading" class="grid gap-4">
      <Skeleton v-for="i in 5" :key="i" width="100%" height="3rem" border-radius="12px" />
    </div>

    <DataTable
      v-else
      :value="products"
      paginator
      :rows="10"
      tableStyle="min-width: 100%"
      emptyMessage="لا توجد منتجات."
    >
      <Column field="name" header="اسم المنتج" />
      <Column field="sellingPriceLabel" header="سعر البيع" />
      <Column field="teacherName" header="المدرس" />
      <Column field="studyYearName" header="السنة الدراسية" />
      <Column field="typeLabel" header="النوع" />
      <Column field="reservationLabel" header="الحجز" />
      <Column header="إجراء" style="width: 8rem">
        <template #body="{ data }">
          <Button
            label="تعديل"
            icon="pi pi-pencil"
            text
            size="small"
            severity="info"
            @click="$emit('edit', data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";

defineProps({
  products: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["edit"]);
</script>

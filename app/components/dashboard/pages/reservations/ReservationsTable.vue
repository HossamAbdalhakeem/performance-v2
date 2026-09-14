<template>
  <div>
    <div v-if="loading" class="grid gap-4">
      <Skeleton v-for="i in 5" :key="i" width="100%" height="3rem" border-radius="12px" />
    </div>
    <DataTable
      v-else
      :value="reservations"
      paginator
      :rows="10"
      tableStyle="min-width: 100%"
      emptyMessage="لا توجد حجوزات."
    >
      <Column field="reservationNumber" header="رقم الحجز" />
      <Column field="studentName" header="الطالب" />
      <Column field="productName" header="المنتج" />
      <Column field="branchName" header="الفرع" />
      <Column field="quantity" header="الكمية" />
      <Column field="paidAmountLabel" header="المدفوع" />
      <Column field="statusLabel" header="الحالة">
        <template #body="{ data }">
          <Tag :value="data.statusLabel" :severity="data.statusSeverity" />
        </template>
      </Column>
      <Column header="إجراء" style="width: 14rem">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
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
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Skeleton from "primevue/skeleton";

defineProps({
  reservations: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["change-product", "cancel"]);

const canModify = (row) =>
  row.status !== "DELIVERED" && row.status !== "CANCELLED";
</script>

<template>
  <div>
    <div v-if="loading" class="grid gap-4">
      <Skeleton v-for="i in 5" :key="i" width="100%" height="3rem" border-radius="12px" />
    </div>
    <DataTable
      v-else
      :value="expenses"
      paginator
      :rows="10"
      tableStyle="min-width: 100%"
      emptyMessage="لا توجد مصروفات."
    >
      <Column field="categoryName" header="التصنيف" />
      <Column field="branchName" header="الفرع" />
      <Column field="amountLabel" header="المبلغ" />
      <Column field="expenseDateLabel" header="التاريخ" />
      <Column field="description" header="الوصف" />
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
  expenses: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["edit"]);
</script>

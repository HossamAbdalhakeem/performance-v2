<template>
  <div>
    <div v-if="loading" class="grid gap-4">
      <Skeleton v-for="i in 5" :key="i" width="100%" height="3rem" border-radius="12px" />
    </div>
    <DataTable
      v-else
      :value="students"
      paginator
      :rows="10"
      tableStyle="min-width: 100%"
      emptyMessage="لا يوجد طلاب."
    >
      <Column field="name" header="الاسم" />
      <Column field="phone" header="الهاتف" />
      <Column field="statusLabel" header="الحالة">
        <template #body="{ data }">
          <Tag :value="data.statusLabel" :severity="data.statusSeverity" />
        </template>
      </Column>
      <Column header="إجراء" style="width: 12rem">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
            <Button
              label="تعديل"
              icon="pi pi-pencil"
              text
              size="small"
              severity="info"
              @click="$emit('edit', data)"
            />
            <Button
              label="تعطيل"
              icon="pi pi-trash"
              text
              size="small"
              severity="danger"
              @click="$emit('deactivate', data)"
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
  students: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["edit", "deactivate"]);
</script>

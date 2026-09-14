<template>
  <AppDataTable
    :value="teachers"
    :columns="columns"
    :loading="loading"
    paginator
    :rows="10"
    empty-message="لا يوجد مدرسون."
  >
    <template #status="{ data }">
      <Tag :value="data.statusLabel" :severity="data.statusSeverity" />
    </template>
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
import Tag from "primevue/tag";
import AppDataTable from "~/components/shared/app-data-table/index.vue";

defineProps({
  teachers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["edit"]);

const columns = [
  { field: "name", header: "اسم المدرس" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 8rem" },
];
</script>

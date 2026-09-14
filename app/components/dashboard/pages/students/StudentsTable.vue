<template>
  <AppDataTable
    :value="students"
    :columns="columns"
    :loading="loading"
    paginator
    :rows="10"
    empty-message="لا يوجد طلاب."
  >
    <template #status="{ data }">
      <Tag :value="data.statusLabel" :severity="data.statusSeverity" />
    </template>
    <template #actions="{ data }">
      <div class="flex flex-wrap justify-center gap-1">
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
  </AppDataTable>
</template>

<script setup>
import Button from "primevue/button";
import Tag from "primevue/tag";
import AppDataTable from "~/components/shared/app-data-table/index.vue";

defineProps({
  students: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["edit", "deactivate"]);

const columns = [
  { field: "name", header: "الاسم" },
  { field: "phone", header: "الهاتف" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 12rem" },
];
</script>

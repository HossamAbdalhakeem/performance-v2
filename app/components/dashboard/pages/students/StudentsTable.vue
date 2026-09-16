<template>
  <AppDataTable
    :value="students"
    :columns="columns"
    :loading="loading"
    paginator
    lazy
    :rows="rows"
    :first="first"
    :total-records="totalRecords"
    empty-message="لا يوجد طلاب."
    @page="$emit('page', $event)"
  >
    <template #status="{ data }">
      <Tag :value="data.statusLabel" :severity="data.statusSeverity" />
    </template>
    <template #actions="{ data }">
      <div class="flex flex-wrap justify-center gap-1">
        <span title="المعاملات" class="inline-flex">
          <Button
            icon="pi pi-list"
            text
            rounded
            size="small"
            severity="secondary"
            aria-label="المعاملات"
            @click="$emit('transactions', data)"
          />
        </span>
        <span title="تعديل" class="inline-flex">
          <Button
            icon="pi pi-pencil"
            text
            rounded
            size="small"
            severity="info"
            aria-label="تعديل"
            @click="$emit('edit', data)"
          />
        </span>
        <span title="تعطيل" class="inline-flex">
          <Button
            icon="pi pi-ban"
            text
            rounded
            size="small"
            severity="danger"
            aria-label="تعطيل"
            @click="$emit('deactivate', data)"
          />
        </span>
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
  rows: { type: Number, default: 20 },
  first: { type: Number, default: 0 },
  totalRecords: { type: Number, default: 0 },
});

defineEmits(["edit", "deactivate", "transactions", "page"]);

const columns = [
  { field: "name", header: "الاسم" },
  { field: "phone", header: "الهاتف" },
  { field: "studyYearName", header: "السنة الدراسية" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 8rem" },
];
</script>

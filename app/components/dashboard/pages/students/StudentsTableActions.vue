<template>
  <div class="flex flex-wrap justify-center gap-1">
    <span title="المعاملات" class="inline-flex">
      <Button
        icon="pi pi-list"
        text
        rounded
        size="small"
        severity="secondary"
        aria-label="المعاملات"
        @click="$emit('transactions', student)"
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
        @click="$emit('edit', student)"
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
        @click="$emit('deactivate', student)"
      />
    </span>
  </div>
</template>

<script setup>
import Button from "primevue/button";

defineOptions({ name: "StudentsTableActions" });

defineProps({
  student: { type: Object, required: true },
});

defineEmits(["edit", "deactivate", "transactions"]);
</script>

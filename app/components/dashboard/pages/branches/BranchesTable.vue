<template>
  <AppDataTable
    v-model:expandedRows="expandedRows"
    :value="branches"
    :columns="columns"
    :loading="loading"
    data-key="id"
    paginator
    :rows="10"
    empty-message="لا توجد فروع مسجلة."
  >
    <template #status="{ data }">
      <Tag :value="data.statusLabel" :severity="data.statusSeverity" />
    </template>

    <template #inventory="{ data }">
      <span v-if="!data.inventoryItems?.length" class="text-slate-400">لا توجد منتجات</span>
      <div v-else class="flex flex-col gap-1 text-right text-sm">
        <span
          v-for="item in data.inventoryItems.slice(0, 3)"
          :key="item.productId"
        >
          {{ item.productName }}:
          <strong>{{ item.physicalQuantity }}</strong>
        </span>
        <span v-if="data.inventoryItems.length > 3" class="text-xs text-slate-400">
          +{{ data.inventoryItems.length - 3 }} منتج آخر (افتح الصف)
        </span>
      </div>
    </template>

    <template #actions="{ data }">
      <div class="flex flex-wrap justify-center gap-1">
        <Button
          label="إضافة منتج"
          icon="pi pi-plus"
          text
          size="small"
          severity="info"
          @click="$emit('add-stock', data)"
        />
        <Button
          label="سحب منتج"
          icon="pi pi-minus"
          text
          size="small"
          severity="warning"
          @click="$emit('remove-stock', data)"
        />
      </div>
    </template>

    <template #expansion="{ data }">
      <div class="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <p class="mb-3 text-sm font-semibold text-slate-100">مخزون الفرع</p>
        <AppDataTable
          :value="data.inventoryItems || []"
          :columns="inventoryColumns"
          empty-message="لا توجد كميات مسجلة لهذا الفرع."
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
  branches: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["add-stock", "remove-stock"]);

const expandedRows = ref({});

const columns = [
  { key: "expander", expander: true, style: "width: 3rem" },
  { field: "name", header: "اسم الفرع" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "inventory", header: "المنتجات بالكميات", slot: "inventory" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 16rem" },
];

const inventoryColumns = [
  { field: "productName", header: "المنتج" },
  { field: "physicalQuantity", header: "الكمية الفعلية" },
  { field: "reservedQuantity", header: "المحجوز" },
  { field: "availableQuantity", header: "المتاح" },
];
</script>

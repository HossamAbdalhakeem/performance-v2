<template>
  <div>
    <div v-if="loading" class="grid gap-4">
      <Skeleton v-for="i in 5" :key="i" width="100%" height="3rem" border-radius="12px" />
    </div>

    <DataTable
      v-else
      v-model:expandedRows="expandedRows"
      :value="branches"
      dataKey="id"
      paginator
      :rows="10"
      tableStyle="min-width: 100%"
      emptyMessage="لا توجد فروع مسجلة."
    >
      <Column expander style="width: 3rem" />
      <Column field="name" header="اسم الفرع" />
      <Column field="statusLabel" header="الحالة">
        <template #body="{ data }">
          <Tag :value="data.statusLabel" :severity="data.statusSeverity" />
        </template>
      </Column>
      <Column header="المنتجات بالكميات">
        <template #body="{ data }">
          <span v-if="!data.inventoryItems?.length" class="text-slate-400">لا توجد منتجات</span>
          <div v-else class="flex flex-col gap-1 text-right text-sm">
            <span
              v-for="item in data.inventoryItems.slice(0, 3)"
              :key="item.productId"
              class="text-slate-700"
            >
              {{ item.productName }}:
              <strong>{{ item.physicalQuantity }}</strong>
            </span>
            <span v-if="data.inventoryItems.length > 3" class="text-xs text-slate-400">
              +{{ data.inventoryItems.length - 3 }} منتج آخر (افتح الصف)
            </span>
          </div>
        </template>
      </Column>
      <Column header="إجراء" style="width: 16rem">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
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
      </Column>

      <template #expansion="{ data }">
        <div class="rounded-xl bg-slate-50 p-4">
          <p class="mb-3 text-sm font-semibold text-slate-800">مخزون الفرع</p>
          <DataTable
            :value="data.inventoryItems"
            emptyMessage="لا توجد كميات مسجلة لهذا الفرع."
            size="small"
          >
            <Column field="productName" header="المنتج" />
            <Column field="physicalQuantity" header="الكمية الفعلية" />
            <Column field="reservedQuantity" header="المحجوز" />
            <Column field="availableQuantity" header="المتاح" />
          </DataTable>
        </div>
      </template>
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
  branches: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["add-stock", "remove-stock"]);

const expandedRows = ref({});
</script>

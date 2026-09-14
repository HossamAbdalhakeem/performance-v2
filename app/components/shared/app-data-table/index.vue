<template>
  <div class="app-data-table-wrap overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
    <div v-if="loading" class="grid gap-3 p-4">
      <Skeleton
        v-for="i in skeletonRows"
        :key="i"
        width="100%"
        height="3rem"
        border-radius="12px"
      />
    </div>

    <DataTable
      v-else
      v-bind="tableAttrs"
      :value="value"
      :paginator="paginator"
      :rows="rows"
      :row-class="rowClass"
      :table-style="tableStyle"
      class="app-data-table"
      size="small"
      striped-rows
    >
      <template #empty>
        <div class="app-data-table-empty">
          {{ emptyMessage }}
        </div>
      </template>

      <template v-if="$slots.expansion" #expansion="slotProps">
        <slot name="expansion" v-bind="slotProps" />
      </template>

      <slot>
        <Column
          v-for="col in resolvedColumns"
          :key="col.key || col.field || col.header"
          :field="col.field"
          :header="col.header"
          :sortable="col.sortable"
          :style="col.style"
          :header-style="col.headerStyle || col.style"
          :body-style="col.bodyStyle || col.style"
          :class="col.class"
          :header-class="col.headerClass"
          :body-class="col.bodyClass"
          :expander="col.expander"
        >
          <template v-if="hasCustomBody(col)" #body="slotProps">
            <slot
              v-if="col.slot || (col.field && $slots[col.field])"
              :name="col.slot || col.field"
              v-bind="slotProps"
            >
              {{ resolveCell(slotProps.data, col) }}
            </slot>
            <template v-else>
              {{ resolveCell(slotProps.data, col) }}
            </template>
          </template>
        </Column>
      </slot>
    </DataTable>
  </div>
</template>

<script setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Skeleton from "primevue/skeleton";

defineOptions({
  name: "AppDataTable",
  inheritAttrs: false,
});

const props = defineProps({
  value: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyMessage: { type: String, default: "لا توجد بيانات." },
  paginator: { type: Boolean, default: false },
  rows: { type: Number, default: 10 },
  tableStyle: { type: String, default: "min-width: 100%" },
  rowClass: { type: [Function, String, Object], default: undefined },
  skeletonRows: { type: Number, default: 5 },
});

const attrs = useAttrs();
const slots = useSlots();

const tableAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

const resolvedColumns = computed(() => {
  const cols = props.columns || [];
  const autoWidth = cols.length ? `${(100 / cols.length).toFixed(4)}%` : undefined;

  return cols.map((col) => ({
    ...col,
    style: col.style || (autoWidth ? `width: ${autoWidth}` : undefined),
  }));
});

const hasCustomBody = (col) =>
  Boolean(col.slot || col.format || (col.field && slots[col.field]));

const resolveCell = (row, col) => {
  const raw = col.field ? row?.[col.field] : undefined;
  if (typeof col.format === "function") return col.format(raw, row);
  if (raw == null || raw === "") return col.fallback ?? "-";
  return raw;
};
</script>

<style scoped>
.app-data-table-wrap :deep(.app-data-table) {
  background: transparent;
}

.app-data-table-wrap :deep(.p-datatable-table-container),
.app-data-table-wrap :deep(.p-datatable-wrapper),
.app-data-table-wrap :deep(.p-datatable-table) {
  background: #0f172a !important;
  border: none !important;
  border-collapse: collapse !important;
  width: 100% !important;
}

.app-data-table-wrap :deep(.p-datatable-table) {
  table-layout: fixed !important;
}

.app-data-table-wrap :deep(.p-datatable-thead > tr > th),
.app-data-table-wrap :deep(.p-datatable-tbody > tr > td) {
  background: transparent !important;
  color: #e2e8f0 !important;
  border: none !important;
  border-bottom: 1px solid #334155 !important;
  padding: 0.85rem 0.75rem !important;
  text-align: center !important;
  vertical-align: middle !important;
  font-size: 0.875rem !important;
  box-shadow: none !important;
}

.app-data-table-wrap :deep(.p-datatable-thead > tr > th) {
  background: #1e293b !important;
  font-weight: 700 !important;
  white-space: nowrap;
}

.app-data-table-wrap :deep(.p-datatable-tbody > tr) {
  background: #0f172a !important;
  color: #e2e8f0 !important;
  transition: background-color 0.15s ease;
}

.app-data-table-wrap :deep(.p-datatable-tbody > tr:last-child > td) {
  border-bottom: none !important;
}

.app-data-table-wrap :deep(.p-datatable-tbody > tr:hover > td),
.app-data-table-wrap :deep(.p-datatable-tbody > tr.p-datatable-row-odd:hover > td) {
  background: #1e293b !important;
}

.app-data-table-wrap :deep(.p-datatable-tbody > tr.p-datatable-row-odd > td) {
  background: #0b1220 !important;
}

.app-data-table-wrap :deep(.p-datatable-tbody > tr.app-row-matched > td) {
  background: rgba(14, 165, 233, 0.12) !important;
}

.app-data-table-wrap :deep(.p-datatable-empty-message > td),
.app-data-table-wrap :deep(.p-datatable-emptymessage > td) {
  text-align: center !important;
  color: #94a3b8 !important;
  padding: 2.5rem 1rem !important;
  border: none !important;
  border-bottom: none !important;
  border-top: none !important;
  background: #0f172a !important;
  box-shadow: none !important;
}

.app-data-table-empty {
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
  padding: 0.5rem 0;
}

.app-data-table-wrap :deep(.p-paginator) {
  background: #0f172a !important;
  border: none !important;
  border-top: 1px solid #334155 !important;
  color: #e2e8f0 !important;
  padding: 0.75rem !important;
  justify-content: center;
}

.app-data-table-wrap :deep(.p-paginator .p-paginator-page),
.app-data-table-wrap :deep(.p-paginator .p-paginator-prev),
.app-data-table-wrap :deep(.p-paginator .p-paginator-next),
.app-data-table-wrap :deep(.p-paginator .p-paginator-first),
.app-data-table-wrap :deep(.p-paginator .p-paginator-last) {
  background: transparent !important;
  color: #cbd5e1 !important;
  border: 1px solid transparent !important;
  min-width: 2.25rem;
  height: 2.25rem;
}

.app-data-table-wrap :deep(.p-paginator .p-paginator-page.p-highlight) {
  background: #1e293b !important;
  color: #f8fafc !important;
  border-color: #475569 !important;
}
</style>

<!-- Unscoped so Aura theme cannot beat header flex alignment -->
<style>
.app-data-table-wrap .p-datatable-thead > tr > th {
  text-align: center !important;
}

.app-data-table-wrap .p-datatable-column-header-content,
.app-data-table-wrap [data-pc-section="columnheadercontent"] {
  display: flex !important;
  width: 100% !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 0.25rem;
}

.app-data-table-wrap .p-datatable-column-title,
.app-data-table-wrap [data-pc-section="columntitle"] {
  display: inline-block !important;
  width: auto !important;
  text-align: center !important;
  margin: 0 auto !important;
}

.app-data-table-wrap .p-datatable-tbody > tr > td {
  text-align: center !important;
}

.app-data-table-wrap .p-datatable-tbody > tr > td > * {
  margin-left: auto !important;
  margin-right: auto !important;
}
</style>

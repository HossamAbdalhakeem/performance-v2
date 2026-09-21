<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <div class="mb-4 min-w-0">
      <p class="font-bold text-white">سجل العمليات</p>
      <p class="mt-1 text-xs text-slate-400">
        بيع وحجز — افتح الصف لعرض سجل العملية
      </p>
    </div>

    <div v-if="loading && !rows.length" class="space-y-2">
      <Skeleton v-for="i in 5" :key="`ops-skel-${i}`" height="2.4rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      :message="error"
      @retry="$emit('retry')"
    />

    <ReportsSectionEmpty
      v-else-if="!loading && !displayRows.length"
      message="لا توجد عمليات بيع أو حجز خلال الفترة المحددة."
    />

    <AppDataTable
      v-else
      v-model:expandedRows="expandedRows"
      data-key="id"
      :value="displayRows"
      :columns="columns"
      :loading="loading"
      lazy
      paginator
      :rows="pageSize"
      :first="first"
      :total-records="totalRecords"
      empty-message="لا توجد عمليات بيع أو حجز خلال الفترة المحددة."
      @page="onPage"
      @row-expand="onRowExpand"
    >
      <template #time="{ data }">
        <AppDateTimeCell :value="data.createdAt" />
      </template>

      <template #type="{ data }">
        <span class="ops-tag" :style="tagStyle(data.typeColor)">
          {{ data.typeLabel }}
        </span>
      </template>

      <template #status="{ data }">
        <span class="ops-tag" :style="tagStyle(data.statusColor)">
          {{ data.statusLabel }}
        </span>
      </template>

      <template #product="{ data }">
        <ProductCell :product="data.productObj" />
      </template>

      <template #totalAmount="{ data }">
        <span class="ops-tag tabular-nums" :style="tagStyle(METRIC_COLORS.price)">
          {{ data.totalAmount }}
        </span>
      </template>

      <template #paidAmount="{ data }">
        <span class="ops-tag tabular-nums" :style="tagStyle(METRIC_COLORS.paid)">
          {{ data.paidAmount }}
        </span>
      </template>

      <template #remainingAmount="{ data }">
        <span
          class="ops-tag tabular-nums"
          :style="
            tagStyle(
              data.remainingRaw > 0
                ? METRIC_COLORS.remaining
                : METRIC_COLORS.remainingZero,
            )
          "
        >
          {{ data.remainingAmount }}
        </span>
      </template>

      <template #expansion="{ data }">
        <div class="w-full max-w-full overflow-visible rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-right">
          <OperationTimelinePanel
            :timeline="getTimelineEvents(data.id)"
            :loading="!!timelineState[data.id]?.loading"
            :error="timelineState[data.id]?.error || ''"
            @retry="loadTimeline(data.id)"
          />
        </div>
      </template>
    </AppDataTable>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";
import ReportsSectionEmpty from "~/components/dashboard/pages/reports/admin/ReportsSectionEmpty/index.vue";
import ProductCell from "~/components/shared/product-cell/index.vue";
import AppDateTimeCell from "~/components/shared/app-datetime-cell/index.vue";
import OperationTimelinePanel from "./partials/OperationTimelinePanel.vue";
import { reportService } from "~/services/reportService";
import { formatMoney } from "~/utils/format";
import { getPaymentMethodLabel } from "~/utils/paymentMethods";
import {
  DEFAULT_METRIC_COLOR,
  STOCK_MOVEMENT_COLORS,
  getOperationStatusColor,
  getOperationStatusLabel,
  getStockMovementColor,
  getStudentSaleLabel,
  getTimelineEventLabel,
} from "~/utils/domainLabels";

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);

defineOptions({ name: "DailyReportStudentOperationsSection" });

const METRIC_COLORS = {
  qty: STOCK_MOVEMENT_COLORS.STOCK_IN,
  price: STOCK_MOVEMENT_COLORS.SALE,
  paid: STOCK_MOVEMENT_COLORS.STOCK_IN,
  remaining: STOCK_MOVEMENT_COLORS.RETURN,
  remainingZero: DEFAULT_METRIC_COLOR,
};

const tagStyle = (color) => {
  const c = color || DEFAULT_METRIC_COLOR;
  return {
    color: c,
    backgroundColor: `${c}22`,
    border: `1px solid ${c}55`,
  };
};

const props = defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 15 },
  totalRecords: { type: Number, default: 0 },
});

const emit = defineEmits(["retry", "update:page"]);

const expandedRows = ref({});
const timelineState = reactive({});

watch(
  () => [props.page, props.rows],
  () => {
    expandedRows.value = {};
  },
);

const columns = [
  { key: "expander", expander: true, style: "width: 3rem" },
  { field: "createdAt", header: "التاريخ", slot: "time" },
  { field: "typeLabel", header: "النوع", slot: "type" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "studentName", header: "الطالب" },
  { field: "product", header: "المنتج", slot: "product" },
  { field: "totalAmount", header: "الإجمالي", slot: "totalAmount" },
  { field: "paidAmount", header: "المدفوع", slot: "paidAmount" },
  { field: "remainingAmount", header: "المتبقي", slot: "remainingAmount" },
];

const first = computed(() =>
  Math.max(0, (Number(props.page) - 1) * props.pageSize),
);

const moneyLabel = (value) => {
  if (value == null || value === "") return null;
  return formatMoney(value, "locale");
};

const moneyOrDash = (value) => moneyLabel(value) || "-";

const toProductCell = (product) => {
  const name = product?.name || null;
  if (!name) return null;
  return {
    name,
    price: moneyLabel(product?.price ?? product?.sellingPrice),
    teacherName: product?.teacher?.name || product?.teacherName || null,
    studyYearName: product?.studyYear?.name || product?.studyYearName || null,
    priceColor: STOCK_MOVEMENT_COLORS.SALE,
  };
};

const displayRows = computed(() =>
  (Array.isArray(props.rows) ? props.rows : []).map((row) => {
    const typeKey = String(row.type || "").toUpperCase();
    const statusKey = String(row.status || row.operationStatus || "").toUpperCase();
    const remainingRaw = Number(row.remainingAmount ?? 0);
    return {
      id: row.id,
      createdAt: row.date || row.createdAt || null,
      typeKey,
      typeLabel: getStudentSaleLabel(typeKey) || typeKey,
      typeColor: getStockMovementColor(typeKey),
      studentName: row.student?.name || "-",
      productObj: toProductCell(row.product),
      totalAmount: moneyOrDash(row.totalAmount),
      paidAmount: moneyOrDash(row.paidAmount),
      remainingAmount: moneyOrDash(row.remainingAmount),
      remainingRaw: Number.isFinite(remainingRaw) ? remainingRaw : 0,
      statusKey,
      statusLabel: getOperationStatusLabel(statusKey) || "—",
      statusColor: getOperationStatusColor(statusKey),
    };
  }),
);

const formatProductLine = (product) => {
  if (!product?.name) return null;

  const parts = [];
  const pushUnique = (value) => {
    const text = String(value || "").trim();
    if (!text) return;
    if (parts.some((part) => part === text || part.includes(text))) return;
    parts.push(text);
  };

  pushUnique(product.name);
  pushUnique(product.teacher?.name || product.teacherName);
  pushUnique(product.studyYear?.name || product.studyYearName);

  return parts.join(" — ");
};

const buildEventDetails = (event) => {
  const type = String(event?.type || "").toUpperCase();
  const data = event?.data || {};
  const lines = [];

  if (type === "CREATED") {
    const productLine = formatProductLine(data.product);
    if (productLine) lines.push(productLine);
    if (data.quantity != null) lines.push(`الكمية: ${data.quantity}`);
    if (data.total != null) lines.push(`الإجمالي: ${moneyOrDash(data.total)}`);
    if (data.paid != null) lines.push(`المدفوع: ${moneyOrDash(data.paid)}`);
    if (data.remaining != null) {
      lines.push(`المتبقي: ${moneyOrDash(data.remaining)}`);
    }
    if (data.method) lines.push(`طريقة الدفع: ${getPaymentMethodLabel(data.method)}`);
  } else if (type === "PAYMENT") {
    if (data.amount != null) lines.push(moneyOrDash(data.amount));
    if (data.method) lines.push(getPaymentMethodLabel(data.method));
  } else if (type === "EXCHANGE") {
    const oldLine = formatProductLine(data.oldProduct);
    const newLine = formatProductLine(data.newProduct);
    if (oldLine) lines.push(`المنتج السابق: ${oldLine}`);
    if (newLine) lines.push(`المنتج الجديد: ${newLine}`);
    if (data.quantity != null) lines.push(`الكمية: ${data.quantity}`);
    if (data.differenceAmount != null) {
      lines.push(`فرق السعر: ${moneyOrDash(data.differenceAmount)}`);
    }
    if (data.refundAmount != null) {
      lines.push(`المبلغ المسترد: ${moneyOrDash(data.refundAmount)}`);
    }
    if (data.method) {
      lines.push(`طريقة الاسترداد: ${getPaymentMethodLabel(data.method)}`);
    }
  } else if (type === "CANCELLED") {
    if (data.reason) lines.push(`السبب: ${data.reason}`);
    if (data.refundAmount != null || data.amount != null) {
      lines.push(
        `المبلغ المسترد: ${moneyOrDash(data.refundAmount ?? data.amount)}`,
      );
    }
    if (data.method) {
      lines.push(`طريقة الاسترداد: ${getPaymentMethodLabel(data.method)}`);
    }
  } else if (type === "REFUND") {
    if (data.amount != null) {
      lines.push(`المبلغ المسترد: ${moneyOrDash(data.amount)}`);
    }
    if (data.method) {
      lines.push(`طريقة الاسترداد: ${getPaymentMethodLabel(data.method)}`);
    }
  } else if (type === "RETURN") {
    const items = Array.isArray(data.items) ? data.items : [];
    if (items.length) {
      for (const item of items) {
        const productLine = formatProductLine(item.product);
        if (productLine) lines.push(`المنتج: ${productLine}`);
        if (item.quantity != null) lines.push(`الكمية: ${item.quantity}`);
        if (item.refundAmount != null) {
          lines.push(`مبلغ الصنف: ${moneyOrDash(item.refundAmount)}`);
        }
      }
    } else {
      const productLine = formatProductLine(data.product);
      if (productLine) lines.push(`المنتج: ${productLine}`);
      if (data.quantity != null) lines.push(`الكمية: ${data.quantity}`);
    }
    if (data.amount != null) lines.push(`مبلغ المرتجع: ${moneyOrDash(data.amount)}`);
    if (data.method) {
      lines.push(`طريقة الاسترداد: ${getPaymentMethodLabel(data.method)}`);
    }
  } else if (type === "DELIVERED" || type === "COMPLETED") {
    const productLine = formatProductLine(data.product);
    if (productLine) lines.push(productLine);
    if (data.quantity != null) lines.push(`الكمية: ${data.quantity}`);
    if (data.paid != null) lines.push(`المدفوع: ${moneyOrDash(data.paid)}`);
    if (data.method) lines.push(`طريقة الدفع: ${getPaymentMethodLabel(data.method)}`);
  }

  return lines;
};

const mapTimelineEvents = (payload) => {
  const events = payload?.timeline;
  const operationType = payload?.operation?.type || null;
  if (!Array.isArray(events)) return [];
  return events.map((event) => {
    const type = String(event.type || "").toUpperCase();
    const source =
      String(event?.data?.source || "").toUpperCase() || operationType;
    return {
      id: event.id,
      type,
      title: getTimelineEventLabel(type, source, event?.data || {}),
      date: event.date,
      actorName: event.actor?.name || null,
      details: buildEventDetails(event),
    };
  });
};

const getTimelineEvents = (operationId) =>
  mapTimelineEvents(timelineState[operationId]?.payload);

const ensureTimelineState = (operationId) => {
  if (!timelineState[operationId]) {
    timelineState[operationId] = {
      loading: false,
      error: "",
      payload: null,
    };
  }
  return timelineState[operationId];
};

const loadTimeline = async (operationId) => {
  if (!operationId) return;

  const state = ensureTimelineState(operationId);
  state.loading = true;
  state.error = "";

  try {
    const payload = await reportService.getBranchOperationTimeline(operationId);
    state.payload = payload;
  } catch (error) {
    state.error = error?.message || "تعذر تحميل سجل العملية.";
  } finally {
    state.loading = false;
  }
};

const onRowExpand = (event) => {
  const operationId = event?.data?.id;
  if (operationId) loadTimeline(operationId);
};

const onPage = (event) => {
  const nextPage = Math.floor(Number(event?.first || 0) / props.pageSize) + 1;
  emit("update:page", nextPage);
};
</script>

<style scoped>
.ops-tag {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 9999px;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.25rem;
}
</style>

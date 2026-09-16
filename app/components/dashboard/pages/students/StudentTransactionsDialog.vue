<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    :header="dialogTitle"
    :style="{ width: '960px', maxWidth: '96vw' }"
    :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    @update:visible="$emit('update:visible', $event)"
    @hide="$emit('hide')"
  >
    <div class="flex flex-col gap-4">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium text-slate-700">من تاريخ</label>
          <input
            v-model="filters.from"
            type="date"
            class="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium text-slate-700">إلى تاريخ</label>
          <input
            v-model="filters.to"
            type="date"
            class="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div class="flex flex-col gap-2 text-right">
          <AppGlobalSelectTeacher
            v-model="filters.teacherId"
            label="المدرس"
            placeholder="كل المدرسين"
            show-clear
            :exclude-inactive="false"
          />
        </div>
        <div class="flex flex-col gap-2 text-right">
          <ProductSelect
            v-model="filters.productId"
            source="catalog"
            variant="simple"
            label="المنتج"
            placeholder="كل المنتجات"
            show-clear
          />
        </div>
      </div>

      <div class="flex justify-end">
        <Button
          label="تطبيق الفلاتر"
          icon="pi pi-filter"
          severity="secondary"
          :loading="loading"
          @click="applyFilters"
        />
      </div>

      <AppDataTable
        :value="rows"
        :columns="columns"
        :loading="loading"
        paginator
        lazy
        :rows="pagination.perPage"
        :first="pagination.first"
        :total-records="pagination.total"
        empty-message="لا توجد معاملات لهذا الطالب."
        @page="onPage"
      >
        <template #typeLabel="{ data }">
          <Tag
            :value="data.typeLabel"
            :severity="typeSeverity(data.type)"
          />
        </template>
        <template #amountLabel="{ data }">
          <span
            class="font-semibold"
            :class="data.type === 'RETURN' ? 'text-rose-600' : 'text-emerald-700'"
          >
            {{ data.amountLabel }}
          </span>
        </template>
        <template #statusLabel="{ data }">
          <Tag :value="data.statusLabel" :severity="data.statusSeverity" />
        </template>
      </AppDataTable>
    </div>
  </Dialog>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Tag from "primevue/tag";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import ProductSelect from "~/components/shared/product-select/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/app-global-select-teacher/index.vue";
import { studentService } from "~/services/studentService";
import { useAppToast } from "~/composables/useAppToast";
import { formatMoney, formatDateTime } from "~/utils/format";

const props = defineProps({
  visible: { type: Boolean, default: false },
  student: { type: Object, default: null },
});

defineEmits(["update:visible", "hide"]);

const { showError } = useAppToast();

const loading = ref(false);
const rows = ref([]);

const pagination = reactive({
  page: 1,
  perPage: 20,
  total: 0,
  first: 0,
});

const TYPE_META = {
  SALE: { label: "بيع", severity: "info" },
  RESERVATION: { label: "حجز", severity: "warn" },
  RETURN: { label: "مرتجع", severity: "danger" },
  EXCHANGE: { label: "استبدال", severity: "secondary" },
};

const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const monthStart = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

const filters = reactive({
  from: monthStart(),
  to: today(),
  teacherId: null,
  productId: null,
});

const dialogTitle = computed(() =>
  props.student?.name
    ? `معاملات الطالب: ${props.student.name}`
    : "معاملات الطالب",
);

const typeSeverity = (type) =>
  TYPE_META[String(type || "").toUpperCase()]?.severity || "warn";

const statusSeverity = (status, type) => {
  const normalizedType = String(type || "").toUpperCase();
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedType === "SALE") return "success";
  if (normalizedType === "RETURN") return "danger";
  if (normalizedStatus === "CANCELLED") return "danger";
  if (normalizedStatus === "DELIVERED") return "success";
  if (normalizedStatus === "READY") return "info";
  return "warn";
};

const columns = [
  { field: "dateLabel", header: "التاريخ" },
  { field: "typeLabel", header: "النوع", slot: "typeLabel" },
  { field: "productName", header: "المنتج" },
  { field: "teacherName", header: "المدرس" },
  { field: "branchName", header: "الفرع" },
  { field: "quantity", header: "الكمية" },
  { field: "amountLabel", header: "المبلغ", slot: "amountLabel" },
  { field: "statusLabel", header: "الحالة", slot: "statusLabel" },
];

const buildParams = () => {
  const params = {
    page: pagination.page,
    per_page: pagination.perPage,
  };
  if (filters.from) {
    params.from = new Date(`${filters.from}T00:00:00`).toISOString();
  }
  if (filters.to) {
    params.to = new Date(`${filters.to}T23:59:59.999`).toISOString();
  }
  if (filters.teacherId) params.teacherId = filters.teacherId;
  if (filters.productId) params.productId = filters.productId;
  return params;
};

const normalizeTransaction = (item) => {
  const type = String(item.type || item.transactionType || "").toUpperCase();
  const typeMeta = TYPE_META[type] || {
    label: item.typeLabel || type || "—",
    severity: "warn",
  };
  const dateValue = item.date || item.createdAt || item.created_at;
  const amount = item.amount ?? item.totalAmount ?? item.paidAmount ?? 0;
  const productName =
    item.productName ||
    item.product?.name ||
    item.product_name ||
    "—";
  const teacherName =
    item.teacherName ||
    item.teacher?.name ||
    item.teacher_name ||
    "";
  const branchName =
    item.branchName ||
    item.branch?.name ||
    item.branch_name ||
    "—";
  const status = item.status || item.statusLabel || "";
  const statusLabel =
    item.statusLabel ||
    status ||
    (type === "RETURN" ? "مرتجع" : "—");

  return {
    ...item,
    type,
    typeLabel: typeMeta.label,
    dateLabel: formatDateTime(dateValue, { empty: "—" }),
    amountLabel: formatMoney(amount),
    productName,
    teacherName: teacherName ? `أ. ${teacherName}` : "—",
    branchName,
    quantity: item.quantity ?? item.qty ?? "—",
    statusLabel,
    statusSeverity: statusSeverity(status, type),
  };
};

/** Support both `{ data, pagination }` and legacy `{ transactions }` shapes */
const extractRows = (result) => {
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.transactions)) return result.transactions;
  if (Array.isArray(result)) return result;
  return [];
};

const loadTransactions = async () => {
  if (!props.student?.id) return;
  loading.value = true;
  try {
    const result = await studentService.getStudentTransactions(
      props.student.id,
      buildParams(),
    );
    rows.value = extractRows(result).map(normalizeTransaction);
    pagination.total = Number(
      result?.pagination?.total ?? extractRows(result).length,
    );
  } catch (error) {
    rows.value = [];
    pagination.total = 0;
    showError(error?.message || "تعذر تحميل معاملات الطالب.");
  } finally {
    loading.value = false;
  }
};

const resetPagination = () => {
  pagination.page = 1;
  pagination.first = 0;
};

const applyFilters = () => {
  resetPagination();
  loadTransactions();
};

const onPage = (event) => {
  pagination.page = event.page + 1;
  pagination.perPage = event.rows;
  pagination.first = event.first;
  loadTransactions();
};

watch(
  () => [props.visible, props.student?.id],
  async ([open]) => {
    if (!open || !props.student?.id) return;
    filters.from = monthStart();
    filters.to = today();
    filters.teacherId = null;
    filters.productId = null;
    resetPagination();
    await loadTransactions();
  },
  { immediate: true },
);
</script>

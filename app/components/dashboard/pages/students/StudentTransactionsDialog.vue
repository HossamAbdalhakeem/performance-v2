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
          <label class="text-sm font-medium text-slate-700">المدرس</label>
          <Select
            v-model="filters.teacherId"
            :options="teacherOptions"
            option-label="label"
            option-value="value"
            placeholder="كل المدرسين"
            show-clear
            filter
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium text-slate-700">المنتج</label>
          <Select
            v-model="filters.productId"
            :options="productOptions"
            option-label="label"
            option-value="value"
            placeholder="كل المنتجات"
            show-clear
            filter
            class="w-full"
          />
        </div>
      </div>

      <div class="flex justify-end">
        <Button
          label="تطبيق الفلاتر"
          icon="pi pi-filter"
          severity="secondary"
          :loading="loading"
          @click="loadTransactions"
        />
      </div>

      <AppDataTable
        :value="rows"
        :columns="columns"
        :loading="loading"
        paginator
        :rows="20"
        empty-message="لا توجد معاملات لهذا الطالب."
      >
        <template #typeLabel="{ data }">
          <Tag
            :value="data.typeLabel"
            :severity="data.type === 'SALE' ? 'info' : 'warn'"
          />
        </template>
        <template #amountLabel="{ data }">
          <span class="font-semibold text-emerald-700">{{ data.amountLabel }}</span>
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
import Select from "primevue/select";
import Tag from "primevue/tag";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import { productService } from "~/services/productService";
import { studentService } from "~/services/studentService";
import { teacherService } from "~/services/teacherService";
import { useAppToast } from "~/composables/useAppToast";

const props = defineProps({
  visible: { type: Boolean, default: false },
  student: { type: Object, default: null },
});

defineEmits(["update:visible", "hide"]);

const { showError } = useAppToast();

const loading = ref(false);
const rows = ref([]);
const teacherOptions = ref([]);
const productOptions = ref([]);

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

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} ج.م`;

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const statusSeverity = (status, type) => {
  if (type === "SALE") return "success";
  if (status === "CANCELLED") return "danger";
  if (status === "DELIVERED") return "success";
  if (status === "READY") return "info";
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
  const params = {};
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

const loadFilters = async () => {
  try {
    const [teachers, products] = await Promise.all([
      teacherService.getTeachers(),
      productService.getProducts({ per_page: 200 }),
    ]);
    const teacherList = Array.isArray(teachers) ? teachers : teachers?.data || [];
    const productList = products.data || [];

    teacherOptions.value = teacherList.map((item) => ({
      label: item.name || item.id,
      value: item.id,
    }));
    productOptions.value = productList.map((item) => ({
      label: item.name || item.title || item.id,
      value: item.id,
    }));
  } catch (error) {
    teacherOptions.value = [];
    productOptions.value = [];
  }
};

const loadTransactions = async () => {
  if (!props.student?.id) return;
  loading.value = true;
  try {
    const payload = await studentService.getStudentTransactions(
      props.student.id,
      buildParams(),
    );
    rows.value = (payload?.transactions || []).map((item) => ({
      ...item,
      dateLabel: formatDateTime(item.date),
      amountLabel: formatMoney(item.amount),
      teacherName: item.teacherName ? `أ. ${item.teacherName}` : "—",
      statusSeverity: statusSeverity(item.status, item.type),
    }));
  } catch (error) {
    rows.value = [];
    showError(error?.message || "تعذر تحميل معاملات الطالب.");
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.visible,
  async (open) => {
    if (!open) return;
    filters.from = monthStart();
    filters.to = today();
    filters.teacherId = null;
    filters.productId = null;
    await loadFilters();
    await loadTransactions();
  },
);
</script>

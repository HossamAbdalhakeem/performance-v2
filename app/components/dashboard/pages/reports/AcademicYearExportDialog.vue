<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    header="تصدير العام الدراسي"
    :style="{ width: '34rem', maxWidth: '95vw' }"
    :dismissableMask="!exporting"
    :closable="!exporting"
    :pt="{
      header: { class: 'text-right' },
      content: { class: 'text-right' },
    }"
    @update:visible="onVisibleChange"
    @show="onShow"
  >
    <div class="flex flex-col gap-4">
      <div
        v-if="hasPreview"
        class="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm"
      >
        <p class="mb-3 font-semibold text-white">
          {{ selectedYearLabel || "—" }}
        </p>
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-slate-300">
          <p class="flex items-center justify-between gap-2">
            <span>الإيرادات</span>
            <strong class="text-white">
              {{ formatMoney(preview.revenue, "locale") }}
            </strong>
          </p>
          <p class="flex items-center justify-between gap-2">
            <span>تكلفة البضاعة</span>
            <strong class="text-white">
              {{ formatMoney(preview.cogs, "locale") }}
            </strong>
          </p>
          <p class="flex items-center justify-between gap-2">
            <span>إجمالي الربح</span>
            <strong class="text-white">
              {{ formatMoney(preview.grossProfit, "locale") }}
            </strong>
          </p>
          <p class="flex items-center justify-between gap-2">
            <span>المصروفات</span>
            <strong class="text-white">
              {{ formatMoney(preview.expenses, "locale") }}
            </strong>
          </p>
          <p
            class="col-span-2 flex items-center justify-between gap-2 border-t border-white/5 pt-2"
          >
            <span>صافي الربح</span>
            <strong class="text-emerald-300">
              {{ formatMoney(preview.netProfit, "locale") }}
            </strong>
          </p>
        </div>
        <div
          class="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-white/5 pt-3 text-xs text-slate-400"
        >
          <p class="flex items-center justify-between gap-2">
            <span>المبيعات</span>
            <strong class="text-slate-200">
              {{ formatCount(preview.sales) }}
            </strong>
          </p>
          <p class="flex items-center justify-between gap-2">
            <span>الحجوزات</span>
            <strong class="text-slate-200">
              {{ formatCount(preview.reservations) }}
            </strong>
          </p>
          <p class="flex items-center justify-between gap-2">
            <span>الطلاب</span>
            <strong class="text-slate-200">
              {{ formatCount(preview.students) }}
            </strong>
          </p>
          <p class="flex items-center justify-between gap-2">
            <span>المنتجات</span>
            <strong class="text-slate-200">
              {{ formatCount(preview.products) }}
            </strong>
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-slate-300">العام الدراسي</label>
        <Select
          v-model="form.academicYearId"
          :options="yearOptions"
          option-label="label"
          option-value="value"
          placeholder="اختر العام الدراسي"
          :loading="loadingYears"
          :disabled="exporting || loadingYears"
          class="w-full"
        />
      </div>

      <AppGlobalSelectBranch
        v-model="form.branchId"
        label="الفرع"
        label-class="text-slate-300"
        placeholder="كل الفروع"
        include-all-option
        all-option-label="كل الفروع"
        all-option-value="all"
        :disabled="exporting"
      />

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-slate-300">التاريخ</label>
        <Select
          v-model="dateMode"
          :options="dateModeOptions"
          option-label="label"
          option-value="value"
          :disabled="exporting"
          class="w-full"
        />
        <DateRangePicker
          v-if="dateMode === 'custom'"
          :from="form.from"
          :to="form.to"
          label=""
          placeholder="من / إلى"
          @update:from="form.from = $event"
          @update:to="form.to = $event"
        />
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between gap-2">
          <label class="text-sm font-medium text-slate-300">بيانات التصدير</label>
          <div class="flex gap-2 text-xs">
            <button
              type="button"
              class="text-sky-400 hover:underline disabled:opacity-50"
              :disabled="exporting"
              @click="selectAllSections"
            >
              تحديد الكل
            </button>
            <button
              type="button"
              class="text-slate-400 hover:underline disabled:opacity-50"
              :disabled="exporting"
              @click="clearSections"
            >
              إلغاء الكل
            </button>
          </div>
        </div>
        <div
          class="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/40 p-3"
        >
          <label
            v-for="option in sectionOptions"
            :key="option.key"
            class="flex cursor-pointer items-start gap-2 text-sm text-slate-200"
          >
            <Checkbox
              v-model="selectedSections"
              :input-id="`export-section-${option.key}`"
              :value="option.key"
              :disabled="exporting"
            />
            <span class="leading-snug">
              {{ option.label }}
              <span
                v-if="option.hint"
                class="mt-0.5 block text-xs text-slate-500"
              >
                {{ option.hint }}
              </span>
            </span>
          </label>
        </div>
        <p v-if="!selectedSections.length" class="text-xs text-amber-400">
          اختر قسماً واحداً على الأقل للتصدير.
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <Button
          label="إلغاء"
          text
          severity="secondary"
          :disabled="exporting"
          @click="close"
        />
        <Button
          :label="exporting ? 'جاري التصدير...' : 'تصدير Excel'"
          icon="pi pi-download"
          :loading="exporting"
          :disabled="exporting || !form.academicYearId || !selectedSections.length"
          @click="runExport"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Select from "primevue/select";
import Checkbox from "primevue/checkbox";
import AppGlobalSelectBranch from "~/components/shared/app-global-select-branch/index.vue";
import DateRangePicker from "~/components/shared/date-range-picker/index.vue";
import { academicYearService } from "~/services/academicYearService";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYearId } from "~/composables/useAcademicYearId";
import { ApiError } from "~/utils/apiFetch";
import { downloadBlob, sanitizeDownloadFilename } from "~/utils/downloadFile";
import { formatMoney } from "~/utils/format";

defineOptions({ name: "AcademicYearExportDialog" });

const SECTION_OPTIONS = [
  {
    key: "summary",
    label: "الملخص والإيرادات",
    hint: "ملخص العام والأرباح",
  },
  { key: "branchPerformance", label: "أداء الفروع" },
  {
    key: "teachersBooks",
    label: "المعلمون ومنتجاتهم",
    hint: "كل معلم مع كتبه/منتجاته والأسعار",
  },
  {
    key: "studentPurchases",
    label: "الطلاب ومشترياتهم",
    hint: "اسم الطالب، الهاتف، السنة الدراسية، وكل منتج اشتراه مع السعر",
  },
  {
    key: "sales",
    label: "المبيعات والمدفوعات",
    hint: "المبيعات وبنودها والمدفوعات",
  },
  { key: "products", label: "المنتجات" },
  { key: "teachers", label: "المعلمون (إجماليات)" },
  {
    key: "students",
    label: "الطلاب (إجماليات)",
    hint: "يشمل أيضاً ورقة مشتريات الطلاب بالتفصيل",
  },
  { key: "reservations", label: "الحجوزات" },
  { key: "returns", label: "المرتجعات" },
  { key: "exchanges", label: "الاستبدالات" },
  { key: "expenses", label: "المصروفات" },
  { key: "inventory", label: "المخزون وحركاته" },
];

const ALL_SECTION_KEYS = SECTION_OPTIONS.map((option) => option.key);

const props = defineProps({
  visible: { type: Boolean, default: false },
  academicYearId: { type: [String, Number], default: null },
  branchId: { type: [String, Number], default: "all" },
  from: { type: String, default: null },
  to: { type: String, default: null },
  preview: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:visible", "exported"]);

const { showError, showSuccess } = useAppToast();
const { academicYearId: storedAcademicYearId } = useAcademicYearId();

const exporting = ref(false);
const loadingYears = ref(false);
const years = ref([]);
const dateMode = ref("entire");
const selectedSections = ref([...ALL_SECTION_KEYS]);
const sectionOptions = SECTION_OPTIONS;

const form = reactive({
  academicYearId: null,
  branchId: "all",
  from: null,
  to: null,
});

const dateModeOptions = [
  { label: "كامل العام الدراسي", value: "entire" },
  { label: "فترة مخصصة", value: "custom" },
];

const yearOptions = computed(() =>
  years.value.map((year) => ({
    label: year.name,
    value: String(year.id),
  })),
);

const selectedYearLabel = computed(() => {
  const match = years.value.find(
    (year) => String(year.id) === String(form.academicYearId),
  );
  return match?.name || "";
});

const hasPreview = computed(() => {
  const p = props.preview || {};
  return [
    p.revenue,
    p.cogs,
    p.grossProfit,
    p.expenses,
    p.netProfit,
    p.sales,
    p.reservations,
    p.students,
    p.products,
  ].some((value) => value != null);
});

const formatCount = (value) =>
  Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

const toIsoDateTime = (dateValue, endOfDay = false) => {
  if (!dateValue) return undefined;
  const suffix = endOfDay ? "T23:59:59.999" : "T00:00:00";
  const date = new Date(`${dateValue}${suffix}`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const exportErrorMessage = (error) => {
  const status = Number(error?.status || 0);
  if (status === 401) return "انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.";
  if (status === 403) return "غير مصرح لك بتصدير تقرير العام الدراسي.";
  if (status === 404) return "العام الدراسي غير موجود.";
  if (status === 400 || status === 422) {
    return "الفلاتر غير صالحة. يرجى مراجعة الأقسام أو الفرع أو الفترة والمحاولة مرة أخرى.";
  }
  return "تعذر تصدير تقرير العام الدراسي. يرجى المحاولة مرة أخرى.";
};

const selectAllSections = () => {
  selectedSections.value = [...ALL_SECTION_KEYS];
};

const clearSections = () => {
  selectedSections.value = [];
};

const close = () => {
  if (exporting.value) return;
  emit("update:visible", false);
};

const onVisibleChange = (value) => {
  if (!value && exporting.value) return;
  emit("update:visible", value);
};

const resetForm = () => {
  form.academicYearId = props.academicYearId
    ? String(props.academicYearId)
    : storedAcademicYearId.value
      ? String(storedAcademicYearId.value)
      : null;
  form.branchId = props.branchId ? String(props.branchId) : "all";
  form.from = props.from || null;
  form.to = props.to || props.from || null;
  dateMode.value = "entire";
  selectedSections.value = [...ALL_SECTION_KEYS];
};

const loadYears = async () => {
  loadingYears.value = true;
  try {
    years.value = await academicYearService.getAcademicYears();
    if (!form.academicYearId && years.value[0]?.id) {
      form.academicYearId = String(years.value[0].id);
    }
  } catch (error) {
    showError(error?.message || "تعذر تحميل الأعوام الدراسية.");
  } finally {
    loadingYears.value = false;
  }
};

const onShow = async () => {
  resetForm();
  await loadYears();
};

const runExport = async () => {
  if (exporting.value || !form.academicYearId) return;
  if (!selectedSections.value.length) {
    showError("اختر قسماً واحداً على الأقل للتصدير.");
    return;
  }

  exporting.value = true;
  try {
    const params = {
      format: "xlsx",
      sections: selectedSections.value.join(","),
    };
    if (form.branchId && form.branchId !== "all") {
      params.branchId = String(form.branchId);
    }
    if (dateMode.value === "custom") {
      const from = toIsoDateTime(form.from, false);
      const to = toIsoDateTime(form.to || form.from, true);
      if (from) params.dateFrom = from;
      if (to) params.dateTo = to;
    }

    const result = await academicYearService.exportAcademicYear(
      String(form.academicYearId),
      params,
    );

    const fallbackName = `library-academic-year-${sanitizeDownloadFilename(
      selectedYearLabel.value || form.academicYearId,
      "report",
    )}.xlsx`;

    downloadBlob(result.blob, result.filename || fallbackName);
    showSuccess("تم تصدير تقرير العام الدراسي بنجاح.");
    emit("exported");
    emit("update:visible", false);
  } catch (error) {
    const message =
      error instanceof ApiError
        ? exportErrorMessage(error)
        : "تعذر تصدير تقرير العام الدراسي. يرجى المحاولة مرة أخرى.";
    showError(message);
  } finally {
    exporting.value = false;
  }
};
</script>

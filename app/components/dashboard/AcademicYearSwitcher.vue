<template>
  <div ref="rootRef" class="relative" dir="rtl">
    <button
      type="button"
      class="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-right text-sm transition hover:bg-slate-800"
      :disabled="loading && !years.length"
      @click="toggle"
    >
      <div class="min-w-0 flex-1">
        <p class="text-[11px] text-slate-500">العام الدراسي</p>
        <p class="truncate font-semibold text-white">
          {{ selectedLabel }}
        </p>
      </div>
      <i
        class="pi pi-chevron-down text-xs text-slate-400 transition-transform"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <div
      v-if="open"
      class="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-2xl"
    >
      <div class="max-h-56 overflow-y-auto py-1">
        <div
          v-if="!years.length"
          class="px-3 py-4 text-center text-xs text-slate-500"
        >
          لا توجد أعوام دراسية
        </div>

        <button
          v-for="year in years"
          :key="year.id"
          type="button"
          class="group flex w-full items-center justify-between gap-2 px-3 py-2.5 text-right text-sm transition hover:bg-white/5"
          :class="
            String(year.id) === String(selectedId)
              ? 'bg-sky-500/10 text-sky-200'
              : 'text-slate-200'
          "
          @click="onSelect(year)"
        >
          <span class="min-w-0 flex-1 truncate">{{ year.name }}</span>
          <span class="flex shrink-0 items-center gap-1">
            <span
              v-if="isActiveYear(year)"
              class="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300"
            >
              نشط
            </span>
            <span
              class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-white/10 hover:text-sky-300 group-hover:opacity-100"
              title="تعديل"
              @click.stop="openEdit(year)"
            >
              <i class="pi pi-pencil text-xs" />
            </span>
          </span>
        </button>
      </div>

      <div class="border-t border-white/10 p-2">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500/15 px-3 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/25"
          @click="openCreate"
        >
          <i class="pi pi-plus text-xs" />
          <span>إضافة عام دراسي</span>
        </button>
      </div>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      dir="rtl"
      :header="dialogTitle"
      :style="{ width: '28rem', maxWidth: '95vw' }"
      :dismissableMask="true"
      @hide="editingItem = null"
    >
      <AcademicYearForm
        v-if="dialogVisible"
        :academic-year="editingItem"
        @saved="handleSaved"
        @cancel="dialogVisible = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import Dialog from "primevue/dialog";
import { academicYearService } from "~/services/academicYearService";
import { useAppToast } from "~/composables/useAppToast";

const AcademicYearForm = defineAsyncComponent(() =>
  import("~/components/dashboard/AcademicYearForm.vue"),
);

defineOptions({ name: "AcademicYearSwitcher" });

const STORAGE_KEY = "academicYearId";
const yearStorage = useLocalStorage(STORAGE_KEY);

const { showSuccess, showError } = useAppToast();

const open = ref(false);
const rootRef = ref(null);
const dialogVisible = ref(false);
const editingItem = ref(null);
const loading = ref(false);
const years = ref([]);
const selectedId = ref(yearStorage.value || null);

const selectedYear = computed(
  () => years.value.find((y) => String(y.id) === String(selectedId.value)) || null,
);

const activeId = computed(() => {
  const active = years.value.find((y) => String(y.status).toUpperCase() === "ACTIVE");
  return active?.id ? String(active.id) : null;
});

const selectedLabel = computed(
  () =>
    selectedYear.value?.name ||
    (loading.value ? "جاري التحميل..." : "اختر العام الدراسي"),
);

const dialogTitle = computed(() =>
  editingItem.value?.id ? "تعديل العام الدراسي" : "إضافة عام دراسي",
);

const isActiveYear = (year) =>
  activeId.value && String(year.id) === String(activeId.value);

const writeStorage = (id) => {
  yearStorage.value = id ? String(id) : null;
  selectedId.value = yearStorage.value;
};

const loadYears = async () => {
  loading.value = true;
  try {
    years.value = await academicYearService.getAcademicYears();
    const storedId = yearStorage.value ? String(yearStorage.value) : null;
    const storedExists = storedId
      ? years.value.some((y) => String(y.id) === storedId)
      : false;

    if (storedExists) {
      selectedId.value = storedId;
      return;
    }

    // UI default: highlight ACTIVE, but do not write storage until user selects
    if (yearStorage.value) yearStorage.value = null;
    selectedId.value =
      activeId.value || (years.value[0]?.id ? String(years.value[0].id) : null);
  } finally {
    loading.value = false;
  }
};

const toggle = () => {
  open.value = !open.value;
};

const onSelect = (year) => {
  open.value = false;
  const nextId = year?.id ? String(year.id) : null;
  if (!nextId) return;

  const alreadySaved = yearStorage.value && String(yearStorage.value) === nextId;
  if (alreadySaved) return;

  writeStorage(nextId);
  if (import.meta.client) window.location.reload();
};

const openCreate = () => {
  open.value = false;
  editingItem.value = null;
  dialogVisible.value = true;
};

const openEdit = (year) => {
  open.value = false;
  editingItem.value = year;
  dialogVisible.value = true;
};

const handleSaved = async () => {
  dialogVisible.value = false;
  editingItem.value = null;
  showSuccess("تم حفظ العام الدراسي بنجاح.");
  try {
    await loadYears();
  } catch (error) {
    showError(error?.message || "تعذر تحديث قائمة الأعوام الدراسية.");
  }
};

const onDocumentClick = (event) => {
  if (!open.value || !rootRef.value) return;
  if (!rootRef.value.contains(event.target)) open.value = false;
};

onMounted(async () => {
  document.addEventListener("click", onDocumentClick);
  try {
    await loadYears();
  } catch (error) {
    showError(error?.message || "تعذر تحميل الأعوام الدراسية.");
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
});
</script>

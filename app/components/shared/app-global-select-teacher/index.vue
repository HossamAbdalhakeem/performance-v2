<template>
  <div class="flex flex-col gap-2 text-right" :class="wrapperClass">
    <label v-if="label" class="text-sm font-medium" :class="labelClass">{{ label }}</label>

    <Select
      :model-value="modelValue"
      :options="resolvedOptions"
      option-label="label"
      option-value="value"
      :placeholder="placeholder"
      filter
      :loading="isLoading"
      :disabled="disabled || isLoading"
      :show-clear="showClear"
      :invalid="invalid"
      class="w-full"
      :class="[selectClass, { 'p-invalid': invalid }]"
      @update:model-value="onUpdate"
    />

    <small v-if="hint" class="text-xs text-slate-400">{{ hint }}</small>
  </div>
</template>

<script setup>
import Select from "primevue/select";
import { teacherService } from "~/services/teacherService";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "AppGlobalSelectTeacher" });

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  /** Pass options to skip auto-fetch; leave null to load from API */
  options: { type: Array, default: null },
  label: { type: String, default: "المدرس" },
  labelClass: { type: String, default: "text-slate-700" },
  wrapperClass: { type: String, default: "" },
  selectClass: { type: String, default: "" },
  placeholder: { type: String, default: "اختر المدرس" },
  hint: { type: String, default: "" },
  invalid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  showClear: { type: Boolean, default: false },
  /** When true, omit teachers with status INACTIVE */
  excludeInactive: { type: Boolean, default: true },
  /** Auto-load teachers on mount when options is not provided */
  autoLoad: { type: Boolean, default: true },
  query: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:modelValue", "change", "loaded"]);

const { showError } = useAppToast();

const internalOptions = ref([]);
const internalLoading = ref(false);

const isLoading = computed(() => props.loading || internalLoading.value);

const mapTeacherOption = (teacher) => ({
  label: teacher.name || teacher.teacher_name || `مدرس ${teacher.id}`,
  value: teacher.id,
  status: teacher.status,
  raw: teacher,
});

const resolvedOptions = computed(() => {
  if (Array.isArray(props.options)) return props.options;
  return internalOptions.value;
});

const loadTeachers = async () => {
  if (!props.autoLoad || Array.isArray(props.options)) return;

  internalLoading.value = true;
  try {
    const teachers = await teacherService.getTeachers(props.query);
    const list = Array.isArray(teachers) ? teachers : teachers?.data || [];
    const mapped = list
      .filter((teacher) =>
        props.excludeInactive ? teacher.status !== "INACTIVE" : true,
      )
      .map(mapTeacherOption);

    internalOptions.value = mapped;
    emit("loaded", mapped);
  } catch (error) {
    internalOptions.value = [];
    showError(error?.message || "تعذر تحميل المدرسين.");
  } finally {
    internalLoading.value = false;
  }
};

const onUpdate = (value) => {
  emit("update:modelValue", value ?? null);
  emit("change", value ?? null);
};

/** Allow parent to refresh after creating a teacher */
const reload = () => loadTeachers();

const prependOption = (option) => {
  if (!option?.value) return;
  internalOptions.value = [
    option,
    ...internalOptions.value.filter((item) => item.value !== option.value),
  ];
};

defineExpose({ reload, prependOption, options: resolvedOptions });

onMounted(() => {
  loadTeachers();
});

watch(
  () => props.query,
  () => {
    loadTeachers();
  },
  { deep: true },
);
</script>

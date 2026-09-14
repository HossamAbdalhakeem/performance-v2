<template>
  <div class="flex flex-col gap-2 text-right" dir="rtl">
    <label v-if="label" class="text-sm font-medium text-slate-700">{{ label }}</label>

    <div
      class="rounded-xl border border-dashed px-4 py-4 transition"
      :class="invalid || errorMessage ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'"
    >
      <input
        ref="inputRef"
        type="file"
        class="hidden"
        accept="image/*"
        @change="onFileChange"
      />

      <div v-if="previewUrl" class="space-y-3">
        <img
          :src="previewUrl"
          alt="معاينة الصورة"
          class="mx-auto max-h-40 rounded-lg object-contain"
        />
        <div class="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            label="تغيير الصورة"
            icon="pi pi-image"
            size="small"
            severity="secondary"
            outlined
            @click="openPicker"
          />
          <Button
            type="button"
            label="إزالة"
            icon="pi pi-times"
            size="small"
            severity="danger"
            text
            @click="clear"
          />
        </div>
        <p v-if="fileMeta" class="text-center text-xs text-slate-500">{{ fileMeta }}</p>
      </div>

      <button
        v-else
        type="button"
        class="flex w-full flex-col items-center gap-2 py-2 text-slate-600 hover:text-slate-900"
        @click="openPicker"
      >
        <i class="pi pi-upload text-2xl" />
        <span class="text-sm font-medium">{{ placeholder }}</span>
        <span class="text-xs text-slate-400">
          صور فقط — الحد الأقصى {{ maxSizeLabel }}
        </span>
      </button>
    </div>

    <p v-if="errorMessage" class="text-xs text-red-500">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import Button from "primevue/button";

const props = defineProps({
  label: { type: String, default: "صورة إثبات الدفع" },
  placeholder: { type: String, default: "اختر صورة" },
  maxSizeMb: { type: Number, default: 0.5 },
  invalid: { type: Boolean, default: false },
  modelValue: { type: [Object, File, null], default: null },
});

const emit = defineEmits(["update:modelValue", "select", "clear", "error"]);

const inputRef = ref(null);
const previewUrl = ref("");
const errorMessage = ref("");
const fileMeta = ref("");

const maxBytes = computed(() => Math.max(0.05, props.maxSizeMb) * 1024 * 1024);
const maxSizeLabel = computed(() => {
  if (props.maxSizeMb < 1) return `${Math.round(props.maxSizeMb * 1024)} ك.ب`;
  return `${props.maxSizeMb} م.ب`;
});

const revokePreview = () => {
  if (previewUrl.value?.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl.value);
  }
  previewUrl.value = "";
};

const openPicker = () => {
  inputRef.value?.click();
};

const clear = () => {
  revokePreview();
  errorMessage.value = "";
  fileMeta.value = "";
  if (inputRef.value) inputRef.value.value = "";
  emit("update:modelValue", null);
  emit("clear");
};

const onFileChange = (event) => {
  const file = event.target?.files?.[0];
  if (!file) return;

  errorMessage.value = "";

  if (!file.type.startsWith("image/")) {
    errorMessage.value = "يسمح برفع الصور فقط.";
    emit("error", errorMessage.value);
    if (inputRef.value) inputRef.value.value = "";
    return;
  }

  if (file.size > maxBytes.value) {
    errorMessage.value = `حجم الصورة كبير. الحد الأقصى ${maxSizeLabel.value}.`;
    emit("error", errorMessage.value);
    if (inputRef.value) inputRef.value.value = "";
    return;
  }

  revokePreview();
  previewUrl.value = URL.createObjectURL(file);
  fileMeta.value = `${file.name} • ${(file.size / 1024).toFixed(1)} ك.ب`;
  emit("update:modelValue", file);
  emit("select", file);
};

watch(
  () => props.modelValue,
  (value) => {
    if (value) return;
    if (!previewUrl.value && !fileMeta.value && !errorMessage.value) return;
    revokePreview();
    errorMessage.value = "";
    fileMeta.value = "";
    if (inputRef.value) inputRef.value.value = "";
  },
);

onBeforeUnmount(() => {
  revokePreview();
});

defineExpose({ clear, openPicker });
</script>

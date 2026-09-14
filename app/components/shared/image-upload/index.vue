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

      <div v-if="previewUrl" class="iu-preview space-y-3">
        <img
          :src="previewUrl"
          alt="معاينة الصورة"
          class="mx-auto max-h-40 rounded-lg object-contain"
          :style="aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined"
        />

        <div class="iu-hover-overlay">
          <button type="button" class="iu-hover-action" @click="openCropper">
            <i class="pi pi-crop" />
            <span>قص</span>
          </button>
          <button type="button" class="iu-hover-action" @click="openPicker">
            <i class="pi pi-pencil" />
            <span>تغيير</span>
          </button>
          <button
            type="button"
            class="iu-hover-action iu-hover-action--danger"
            @click="clear"
          >
            <i class="pi pi-trash" />
            <span>إزالة</span>
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            label="قص الصورة"
            icon="pi pi-crop"
            size="small"
            severity="secondary"
            outlined
            @click="openCropper"
          />
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

    <ImageCropper
      v-model="showCropper"
      :image-src="selectedImage"
      :title="cropperTitle"
      :aspect-ratio="aspectRatio"
      :processing="isProcessing"
      :close-on-cropped="false"
      @cropped="handleCropped"
      @error="handleCropperError"
      @update:model-value="handleCropperClose"
      @upload-new="handleUploadNew"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import ImageCropper from "~/components/shared/image-cropper/index.vue";

defineOptions({ name: "ImageUpload" });

const props = defineProps({
  label: { type: String, default: "صورة إثبات الدفع" },
  placeholder: { type: String, default: "اختر صورة" },
  cropperTitle: { type: String, default: "قص الصورة" },
  aspectRatio: { type: Number, default: NaN },
  maxSizeMb: { type: Number, default: 0.5 },
  invalid: { type: Boolean, default: false },
  modelValue: { type: [Object, File, null], default: null },
});

const emit = defineEmits(["update:modelValue", "select", "clear", "error", "cropped"]);

const inputRef = ref(null);
const previewUrl = ref("");
const errorMessage = ref("");
const fileMeta = ref("");
const showCropper = ref(false);
const selectedImage = ref("");
const isProcessing = ref(false);
const originalFileName = ref("cropped-image.jpg");

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
  selectedImage.value = "";
  originalFileName.value = "cropped-image.jpg";
  if (inputRef.value) inputRef.value.value = "";
  emit("update:modelValue", null);
  emit("clear");
};

const openCropper = () => {
  if (!previewUrl.value && !selectedImage.value) return;
  selectedImage.value = selectedImage.value || previewUrl.value;
  showCropper.value = true;
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

  originalFileName.value = file.name || "cropped-image.jpg";

  const reader = new FileReader();
  reader.onload = (e) => {
    selectedImage.value = String(e.target?.result || "");
    showCropper.value = true;
  };
  reader.onerror = () => {
    errorMessage.value = "تعذر قراءة الصورة.";
    emit("error", errorMessage.value);
  };
  reader.readAsDataURL(file);

  if (inputRef.value) inputRef.value.value = "";
};

const handleCropped = async ({ blob, dataURL }) => {
  if (!blob) {
    errorMessage.value = "تعذر قص الصورة.";
    emit("error", errorMessage.value);
    return;
  }

  isProcessing.value = true;

  try {
    const extension = blob.type === "image/png" ? "png" : "jpg";
    const baseName = String(originalFileName.value).replace(/\.[^.]+$/, "") || "cropped-image";
    const file = new File([blob], `${baseName}.${extension}`, {
      type: blob.type || "image/jpeg",
    });

    if (file.size > maxBytes.value) {
      errorMessage.value = `حجم الصورة بعد القص كبير. الحد الأقصى ${maxSizeLabel.value}.`;
      emit("error", errorMessage.value);
      return;
    }

    revokePreview();
    previewUrl.value = dataURL || URL.createObjectURL(file);
    selectedImage.value = previewUrl.value;
    fileMeta.value = `${file.name} • ${(file.size / 1024).toFixed(1)} ك.ب`;

    emit("update:modelValue", file);
    emit("select", file);
    emit("cropped", { blob, dataURL, file });
    showCropper.value = false;
  } catch (error) {
    errorMessage.value = "تعذر حفظ الصورة المقصوصة.";
    emit("error", error);
  } finally {
    isProcessing.value = false;
  }
};

const handleCropperError = (error) => {
  errorMessage.value = "تعذر قص الصورة. حاول مرة أخرى.";
  emit("error", error);
};

const handleCropperClose = (isOpen) => {
  if (!isOpen) {
    selectedImage.value = previewUrl.value || "";
  }
};

const handleUploadNew = () => {
  showCropper.value = false;
  nextTick(() => openPicker());
};

watch(
  () => props.modelValue,
  (value) => {
    if (value) return;
    if (!previewUrl.value && !fileMeta.value && !errorMessage.value) return;
    revokePreview();
    errorMessage.value = "";
    fileMeta.value = "";
    selectedImage.value = "";
    if (inputRef.value) inputRef.value.value = "";
  },
);

onBeforeUnmount(() => {
  revokePreview();
});

defineExpose({ clear, openPicker, openCropper });
</script>

<style scoped>
.iu-preview {
  position: relative;
  display: inline-block;
  width: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
}

.iu-hover-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: none;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.iu-preview:hover .iu-hover-overlay,
.iu-preview:focus-within .iu-hover-overlay {
  display: flex;
  pointer-events: auto;
}

.iu-hover-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #1f2937;
  border: none;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
}

.iu-hover-action--danger {
  background: rgba(220, 38, 38, 0.92);
  color: #fff;
}
</style>

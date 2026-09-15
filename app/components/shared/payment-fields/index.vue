<template>
  <div
    class="grid gap-4"
    :class="showImage ? 'md:grid-cols-2' : ''"
    dir="rtl"
  >
    <PaymentMethods
      :model-value="method"
      :label="methodLabel"
      :options="options"
      :exclude="exclude"
      :invalid="methodInvalid"
      :error-message="methodError"
      @update:model-value="onMethodChange"
    />

    <div v-if="showImage" class="flex h-full flex-col gap-2 text-right">
      <ImageUpload
        :model-value="image"
        :label="imageLabel"
        :placeholder="imagePlaceholder"
        :max-size-mb="maxSizeMb"
        :invalid="imageInvalid || Boolean(imageError)"
        @update:model-value="onImageFileChange"
        @select="onImageSelect"
        @clear="onImageClear"
        @error="onImageError"
      />
      <p v-if="imageError" class="text-xs text-red-500">{{ imageError }}</p>
    </div>
  </div>
</template>

<script setup>
import PaymentMethods from "~/components/shared/payment-methods/index.vue";
import ImageUpload from "~/components/shared/image-upload/index.vue";

defineOptions({ name: "PaymentFields" });

const props = defineProps({
  method: { type: String, default: "CASH" },
  image: { type: [Object, File, null], default: null },
  imageDataUrl: { type: String, default: "" },
  methodLabel: { type: String, default: "طريقة الدفع" },
  imageLabel: { type: String, default: "صورة إثبات الدفع (اختياري)" },
  imagePlaceholder: { type: String, default: "ارفع صورة المحفظة / إنستاباي" },
  options: { type: Array, default: null },
  exclude: { type: Array, default: () => [] },
  /** When to show image upload: non-cash | always | never */
  showImageWhen: {
    type: String,
    default: "non-cash",
    validator: (value) => ["non-cash", "always", "never"].includes(value),
  },
  /** When image is required: non-cash | always | never */
  requireImageWhen: {
    type: String,
    default: "non-cash",
    validator: (value) => ["non-cash", "always", "never"].includes(value),
  },
  maxSizeMb: { type: Number, default: 0.5 },
  methodInvalid: { type: Boolean, default: false },
  methodError: { type: String, default: "" },
  imageInvalid: { type: Boolean, default: false },
  imageRequiredMessage: {
    type: String,
    default: "صورة إثبات الدفع مطلوبة لطريقة الدفع المحددة.",
  },
});

const emit = defineEmits([
  "update:method",
  "update:image",
  "update:imageDataUrl",
  "change",
]);

const internalImageError = ref("");

const normalizedMethod = computed(() =>
  String(props.method || "CASH").trim().toUpperCase(),
);

const isNonCash = computed(
  () =>
    normalizedMethod.value === "WALLET" ||
    normalizedMethod.value === "INSTAPAY",
);

const showImage = computed(() => {
  if (props.showImageWhen === "always") return true;
  if (props.showImageWhen === "never") return false;
  return isNonCash.value;
});

const imageRequired = computed(() => {
  if (props.requireImageWhen === "always") return true;
  if (props.requireImageWhen === "never") return false;
  return isNonCash.value;
});

const imageError = computed(() => {
  if (internalImageError.value) return internalImageError.value;
  if (props.imageInvalid && imageRequired.value) {
    return props.imageRequiredMessage;
  }
  return "";
});

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const emitChange = (next = {}) => {
  emit("change", {
    method: next.method ?? normalizedMethod.value,
    image: next.image === undefined ? props.image : next.image,
    imageDataUrl:
      next.imageDataUrl === undefined ? props.imageDataUrl : next.imageDataUrl,
  });
};

const clearImage = () => {
  internalImageError.value = "";
  emit("update:image", null);
  emit("update:imageDataUrl", "");
  emitChange({ image: null, imageDataUrl: "" });
};

const onMethodChange = (value) => {
  const method = String(value || "CASH").trim().toUpperCase();
  emit("update:method", method);

  const keepsImage =
    props.showImageWhen === "always" ||
    method === "WALLET" ||
    method === "INSTAPAY";

  if (!keepsImage && props.image) {
    emit("update:image", null);
    emit("update:imageDataUrl", "");
    emitChange({ method, image: null, imageDataUrl: "" });
    return;
  }

  emitChange({ method });
};

const onImageFileChange = (file) => {
  emit("update:image", file);
  if (!file) {
    emit("update:imageDataUrl", "");
    emitChange({ image: null, imageDataUrl: "" });
  }
};

const onImageSelect = async (file) => {
  internalImageError.value = "";
  emit("update:image", file);

  try {
    const dataUrl = await fileToDataUrl(file);
    emit("update:imageDataUrl", dataUrl);
    emitChange({ image: file, imageDataUrl: dataUrl });
  } catch {
    internalImageError.value = "تعذر قراءة صورة الإثبات.";
    emit("update:image", null);
    emit("update:imageDataUrl", "");
    emitChange({ image: null, imageDataUrl: "" });
  }
};

const onImageClear = () => {
  clearImage();
};

const onImageError = (message) => {
  internalImageError.value = message || "تعذر رفع صورة الإثبات.";
};

/** Returns false when a required proof image is missing. */
const validate = () => {
  if (!imageRequired.value) return true;
  if (props.image || props.imageDataUrl) return true;
  internalImageError.value = props.imageRequiredMessage;
  return false;
};

const reset = () => {
  internalImageError.value = "";
  emit("update:image", null);
  emit("update:imageDataUrl", "");
};

defineExpose({ validate, reset, showImage, imageRequired });
</script>

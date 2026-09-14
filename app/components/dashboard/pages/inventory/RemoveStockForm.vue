<template>
  <form class="grid gap-4" @submit.prevent="submitRemove">
    <div v-if="!lockedBranchId" class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">الفرع</label>
      <Select
        v-model="form.branchId"
        :options="branchOptions"
        option-label="label"
        option-value="value"
        placeholder="اختار الفرع ▾"
        filter
        class="w-full"
        :invalid="!!errors.branchId"
      />
      <small v-if="errors.branchId" class="text-xs text-red-500">{{ errors.branchId }}</small>
    </div>

    <div v-else class="rounded-xl bg-slate-50 px-3 py-2 text-right text-sm text-slate-600">
      الفرع: <strong class="text-slate-900">{{ branchName || "—" }}</strong>
    </div>

    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">سحبت ايه</label>
      <Select
        :model-value="form.productId"
        :options="productOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="اختار المنتج ▾"
        filter
        class="w-full"
        :invalid="!!errors.productId"
        @update:model-value="onProductChange"
      />
      <small v-if="errors.productId" class="text-xs text-red-500">{{ errors.productId }}</small>
    </div>

    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">الكمية</label>
      <AppInputNumber
        v-model="form.quantity"
        :min="1"
        :max-fraction-digits="0"
        :invalid="!!errors.quantity"
      />
      <small v-if="errors.quantity" class="text-xs text-red-500">{{ errors.quantity }}</small>
    </div>

    <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-right text-sm text-slate-600">
      المتاح بالمخزن حالياً:
      <strong class="text-slate-900">{{ availableQty }}</strong>
    </div>

    <p v-if="errorMessage" class="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
      {{ errorMessage }}
    </p>

    <div class="flex justify-end gap-2">
      <Button
        v-if="showCancel"
        type="button"
        label="إلغاء"
        severity="secondary"
        text
        @click="$emit('cancel')"
      />
      <Button type="submit" label="تأكيد السحب" :loading="saving" severity="warning" />
    </div>
  </form>
</template>

<script setup>
import Button from "primevue/button";
import Select from "primevue/select";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import { inventoryService } from "~/services/inventoryService";
import { branchService } from "~/services/branchService";
import { productService } from "~/services/productService";

const props = defineProps({
  lockedBranchId: { type: String, default: "" },
  branchName: { type: String, default: "" },
  showCancel: { type: Boolean, default: true },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const availableQty = ref(0);
const errorMessage = ref("");
const branchOptions = ref([]);
const productOptions = ref([]);
const errors = reactive({
  branchId: "",
  productId: "",
  quantity: "",
});

const form = reactive({
  branchId: props.lockedBranchId || null,
  productId: null,
  quantity: null,
});

const toId = (value) => {
  if (value == null || value === "") return null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    const id = value.value ?? value.id ?? value.productId;
    return id != null && id !== "" ? String(id) : null;
  }
  return null;
};

const onProductChange = (value) => {
  form.productId = toId(value);
};

const validate = () => {
  const branchId = props.lockedBranchId || form.branchId;
  errors.branchId = branchId ? "" : "الفرع مطلوب.";
  errors.productId = form.productId ? "" : "المنتج مطلوب.";
  errors.quantity =
    form.quantity != null && Number(form.quantity) >= 1
      ? ""
      : "الكمية يجب أن تكون 1 على الأقل.";
  return !errors.branchId && !errors.productId && !errors.quantity;
};

const loadOptions = async () => {
  try {
    const [branches, products] = await Promise.all([
      props.lockedBranchId ? Promise.resolve([]) : branchService.getBranches(),
      productService.getProducts(),
    ]);

    const branchList = Array.isArray(branches) ? branches : branches?.data || [];
    const productList = Array.isArray(products) ? products : products?.data || [];

    branchOptions.value = branchList.map((branch) => ({
      label: branch.name || branch.id,
      value: branch.id,
    }));

    productOptions.value = productList
      .filter((product) => product?.id)
      .map((product) => ({
        label: product.name || product.title || product.id,
        value: String(product.id),
      }));
  } catch (error) {
    console.error("Failed to load remove-stock options", error);
    errorMessage.value = error?.message || "تعذر تحميل المنتجات.";
  }
};

const loadAvailability = async () => {
  const branchId = props.lockedBranchId || form.branchId;
  if (!branchId || !form.productId) {
    availableQty.value = 0;
    return;
  }

  const data = await inventoryService.getAvailability({
    branchId,
    productId: form.productId,
  });
  availableQty.value = data?.availableQuantity ?? data?.available ?? 0;
};

const submitRemove = async () => {
  errorMessage.value = "";
  if (!validate()) return;

  saving.value = true;
  try {
    await inventoryService.removeStock({
      branchId: props.lockedBranchId || form.branchId,
      productId: form.productId,
      quantity: Number(form.quantity),
    });

    form.productId = null;
    form.quantity = null;
    if (!props.lockedBranchId) form.branchId = null;
    availableQty.value = 0;
    emit("saved");
  } catch (error) {
    errorMessage.value = error?.message || "تعذر سحب المنتج من الفرع.";
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.lockedBranchId,
  (value) => {
    form.branchId = value || null;
  },
  { immediate: true },
);

watch([() => props.lockedBranchId || form.branchId, () => form.productId], () => {
  loadAvailability();
});

onMounted(loadOptions);
</script>

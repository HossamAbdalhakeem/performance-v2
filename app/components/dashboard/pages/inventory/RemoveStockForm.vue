<template>
  <Form
    v-slot="{ errors: fieldErrors }"
    :initial-values="initialValues"
    :key="formKey"
    class="grid gap-4"
    @submit="submitRemove"
  >
    <Field
      v-if="!lockedBranchId"
      v-slot="{ field, errorMessage }"
      name="branch"
      rules="required"
    >
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">الفرع</label>
        <Select
          v-bind="field"
          v-model="form.branch"
          :options="branchOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="اختار الفرع ▾"
          filter
          class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.branch }"
        />
        <ErrorMessage name="branch" class="text-xs text-red-500" />
      </div>
    </Field>

    <div v-else class="rounded-xl bg-slate-50 px-3 py-2 text-right text-sm text-slate-600">
      الفرع: <strong class="text-slate-900">{{ branchName || "—" }}</strong>
    </div>

    <Field v-slot="{ field, errorMessage }" name="product" rules="required">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">سحبت ايه</label>
        <Select
          v-bind="field"
          v-model="form.product"
          :options="productOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="اختار المنتج ▾"
          filter
          class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.product }"
        />
        <ErrorMessage name="product" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field v-slot="{ errorMessage }" v-model="form.quantity" name="quantity" rules="required|min_value:1">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">الكمية</label>
        <AppInputNumber
          v-model="form.quantity"
          :min="1"
          :max-fraction-digits="0"
          :invalid="!!(errorMessage || fieldErrors.quantity)"
        />
        <ErrorMessage name="quantity" class="text-xs text-red-500" />
      </div>
    </Field>

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
  </Form>
</template>

<script setup>
import Button from "primevue/button";
import Select from "primevue/select";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
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
const formKey = ref(0);

const form = reactive({ branch: props.lockedBranchId || "", product: "", quantity: null });
const initialValues = { branch: props.lockedBranchId || "", product: "", quantity: null };

const effectiveBranchId = computed(() => props.lockedBranchId || form.branch);

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

    productOptions.value = productList.map((product) => ({
      label: product.name || product.title || product.id,
      value: product.id,
    }));
  } catch (error) {
    console.error("Failed to load remove-stock options", error);
  }
};

const loadAvailability = async () => {
  if (!effectiveBranchId.value || !form.product) {
    availableQty.value = 0;
    return;
  }

  const data = await inventoryService.getAvailability({
    branchId: effectiveBranchId.value,
    productId: form.product,
  });
  availableQty.value = data?.availableQuantity ?? data?.available ?? 0;
};

const submitRemove = async () => {
  saving.value = true;
  errorMessage.value = "";

  try {
    await inventoryService.removeStock({
      branchId: effectiveBranchId.value,
      productId: form.product,
      quantity: form.quantity,
    });

    Object.assign(form, {
      branch: props.lockedBranchId || "",
      product: "",
      quantity: null,
    });
    availableQty.value = 0;
    formKey.value += 1;
    emit("saved");
  } catch (error) {
    errorMessage.value = error?.message || "تعذر سحب المنتج من الفرع.";
  } finally {
    saving.value = false;
  }
};

watch([effectiveBranchId, () => form.product], () => {
  loadAvailability();
});

watch(
  () => props.lockedBranchId,
  (value) => {
    form.branch = value || "";
  },
);

onMounted(() => {
  loadOptions();
});
</script>

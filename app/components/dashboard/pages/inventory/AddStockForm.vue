<template>
  <Form
    v-slot="{ errors: fieldErrors }"
    :initial-values="initialValues"
    :key="formKey"
    class="grid gap-4"
    @submit="submitStock"
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
        <label class="text-sm font-medium text-slate-700">المنتج</label>
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

    <div class="overflow-hidden rounded-2xl border border-slate-200">
      <table class="w-full text-right text-sm">
        <thead class="bg-slate-100 text-slate-700">
          <tr>
            <th class="px-3 py-2">المنتج</th>
            <th class="px-3 py-2">الكمية المُسلّمة</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!form.product || !form.quantity" class="text-slate-400">
            <td colspan="2" class="px-3 py-4 text-center">سيظهر الملخص هنا بعد اختيار المنتج والكمية</td>
          </tr>
          <tr v-else>
            <td class="px-3 py-3">{{ currentProductName }}</td>
            <td class="px-3 py-3">{{ form.quantity }}</td>
          </tr>
        </tbody>
      </table>
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
      <Button type="submit" label="تسليم المنتجات للفرع" :loading="saving" severity="info" />
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
const errorMessage = ref("");
const branchOptions = ref([]);
const productOptions = ref([]);
const formKey = ref(0);

const form = reactive({ branch: props.lockedBranchId || "", product: "", quantity: null });
const initialValues = { branch: props.lockedBranchId || "", product: "", quantity: null };

const currentProductName = computed(() => {
  const selected = productOptions.value.find((item) => item.value === form.product);
  return selected?.label || "-";
});

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
    console.error("Failed to load add-stock options", error);
  }
};

const submitStock = async () => {
  saving.value = true;
  errorMessage.value = "";

  try {
    const branchId = props.lockedBranchId || form.branch;
    await inventoryService.addStock({
      branchId,
      productId: form.product,
      quantity: form.quantity,
    });

    Object.assign(form, {
      branch: props.lockedBranchId || "",
      product: "",
      quantity: null,
    });
    formKey.value += 1;
    emit("saved");
  } catch (error) {
    errorMessage.value = error?.message || "تعذر إضافة المنتج للفرع.";
  } finally {
    saving.value = false;
  }
};

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

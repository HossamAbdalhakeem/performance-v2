<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold">سحب من المخزن</span>
      </template>
      <template #content>
        <Form
          v-slot="{ errors: fieldErrors }"
          :initial-values="initialValues"
          class="space-y-4"
          @submit="submitRemove"
        >
          <div class="grid gap-4 md:grid-cols-2">
            <Field v-slot="{ field, errorMessage }" name="branch" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium">الفرع</label>
                <Select
                  v-bind="field"
                  v-model="form.branch"
                  :options="branchOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="اختار الفرع ▾"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.branch }"
                />
                <ErrorMessage name="branch" class="text-xs text-red-400" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="date" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium">التاريخ</label>
                <DatePicker
                  v-bind="field"
                  v-model="form.date"
                  dateFormat="dd/mm/yy"
                  showIcon
                  class="w-full"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.date }"
                />
                <ErrorMessage name="date" class="text-xs text-red-400" />
              </div>
            </Field>
          </div>

          <div class="grid gap-4 md:grid-cols-[1.6fr_0.8fr]">
            <Field v-slot="{ field, errorMessage }" name="product" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium">سحبت ايه</label>
                <Select
                  v-bind="field"
                  v-model="form.product"
                  :options="productOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="اختار المنتج ▾"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.product }"
                />
                <ErrorMessage name="product" class="text-xs text-red-400" />
              </div>
            </Field>

            <Field v-slot="{ errorMessage }" v-model="form.quantity" name="quantity" rules="required|min_value:1">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium">الكمية</label>
                <AppInputNumber v-model="form.quantity" :min="1" :max-fraction-digits="0" :invalid="!!(errorMessage || fieldErrors.quantity)" />
                <ErrorMessage name="quantity" class="text-xs text-red-400" />
              </div>
            </Field>
          </div>

          <div class="rounded-2xl border border-dashed border-white/20 bg-slate-950/60 p-4 text-right text-sm text-slate-300">
            المتاح بالمخزن حالياً: <strong class="text-white">{{ availableQty }}</strong>
          </div>

          <div class="flex justify-center">
            <Button type="submit" label="تأكيد السحب" :loading="saving" severity="warning" class="min-w-[180px]" />
          </div>
        </Form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import Select from "primevue/select";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import DatePicker from "primevue/datepicker";
import { Form, Field, ErrorMessage } from "vee-validate";
import { inventoryService } from "~/services/inventoryService";
import { branchService } from "~/services/branchService";
import { productService } from "~/services/productService";

const saving = ref(false);
const availableQty = ref(20);
const branchOptions = ref([]);
const productOptions = ref([]);

const form = reactive({ branch: "", date: new Date(), product: "", quantity: null });
const initialValues = { branch: "", date: new Date(), product: "", quantity: null };

const loadOptions = async () => {
  try {
    const [branches, products] = await Promise.all([
      branchService.getBranches(),
      productService.getProducts(),
    ]);

    const branchList = Array.isArray(branches) ? branches : branches?.data || [];
    const productList = Array.isArray(products) ? products : products?.data || [];

    branchOptions.value = branchList.map((branch) => ({
      label: branch.name || branch.label || branch.id,
      value: branch.id,
    }));

    productOptions.value = productList.map((product) => ({
      label: product.name || product.title || product.id,
      value: product.id,
      stock: product.stock,
    }));
  } catch (error) {
    console.error("Failed to load inventory remove options", error);
  }
};

const loadAvailability = async () => {
  if (!form.branch || !form.product) {
    availableQty.value = 20;
    return;
  }

  try {
    const data = await inventoryService.getAvailability({
      branch_id: form.branch,
      product_id: form.product,
    });
    const selected = productOptions.value.find((item) => item.value === form.product);
    availableQty.value = data?.available ?? data?.quantity ?? selected?.stock ?? 20;
  } catch {
    const selected = productOptions.value.find((item) => item.value === form.product);
    availableQty.value = selected?.stock ?? 20;
  }
};

const submitRemove = async () => {
  saving.value = true;

  try {
    await inventoryService.removeStock({
      branch_id: form.branch,
      product_id: form.product,
      quantity: form.quantity,
      date: form.date,
    });

    Object.assign(form, { ...initialValues, date: new Date() });
    availableQty.value = 20;
  } finally {
    saving.value = false;
  }
};

watch([() => form.branch, () => form.product], () => {
  loadAvailability();
});

onMounted(() => {
  loadOptions();
});
</script>

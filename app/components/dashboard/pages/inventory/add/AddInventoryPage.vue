<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold">إضافة للمخزن</span>
      </template>

      <template #content>
        <Form v-slot="{ errors: fieldErrors }" :initial-values="initialValues" class="grid gap-4 md:grid-cols-2" @submit="submitStock">
          <Field v-slot="{ field, errorMessage }" name="branch" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium">الفرع</label>
              <Select v-bind="field" v-model="form.branch" :options="branchOptions" optionLabel="label" optionValue="value" placeholder="اختار الفرع ▾" :class="{ 'p-invalid': errorMessage || fieldErrors.branch }" />
              <ErrorMessage name="branch" class="text-xs text-red-400" />
            </div>
          </Field>

          <Field v-slot="{ errorMessage }" v-model="form.date" name="date" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium">التاريخ</label>
              <DatePicker v-model="form.date" dateFormat="dd/mm/yy" showIcon class="w-full" :class="{ 'p-invalid': errorMessage || fieldErrors.date }" />
              <ErrorMessage name="date" class="text-xs text-red-400" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="product" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium">المنتج</label>
              <Select v-bind="field" v-model="form.product" :options="productOptions" optionLabel="label" optionValue="value" placeholder="اختار المنتج ▾" :class="{ 'p-invalid': errorMessage || fieldErrors.product }" />
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

          <div class="md:col-span-2 overflow-hidden rounded-2xl border border-white/10">
            <table class="w-full text-right text-sm">
              <thead class="bg-slate-800 text-slate-100">
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

          <div class="md:col-span-2 flex justify-center">
            <Button type="submit" label="تسليم المنتجات للفرع" :loading="saving" severity="info" class="min-w-[200px]" />
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
const branchOptions = ref([]);
const productOptions = ref([]);

const form = reactive({ branch: "", product: "", quantity: null, date: new Date() });
const initialValues = { branch: "", product: "", quantity: null, date: new Date() };

const currentProductName = computed(() => {
  const selected = productOptions.value.find((item) => item.value === form.product);
  return selected?.label || "-";
});

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
    }));
  } catch (error) {
    console.error("Failed to load inventory options", error);
  }
};

const submitStock = async () => {
  saving.value = true;

  try {
    await inventoryService.addStock({
      branch_id: form.branch,
      product_id: form.product,
      quantity: form.quantity,
      received_at: form.date,
    });

    Object.assign(form, { ...initialValues, date: new Date() });
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadOptions();
});
</script>

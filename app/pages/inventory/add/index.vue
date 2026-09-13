<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">إضافة للمخزن</span>
      </template>

      <template #content>
        <Form v-slot="{ errors: fieldErrors }" @submit="submitStock" :initial-values="initialValues" class="grid gap-4 md:grid-cols-2">
          <Field v-slot="{ field, errorMessage }" name="branch" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">الفرع</label>
              <Select v-bind="field" v-model="form.branch" :options="branchOptions" optionLabel="label" optionValue="value" placeholder="اختار الفرع" :class="{ 'p-invalid': errorMessage || fieldErrors.branch }" />
              <ErrorMessage name="branch" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="date" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">التاريخ</label>
              <Calendar v-bind="field" v-model="form.date" dateFormat="dd/mm/yy" :class="{ 'p-invalid': errorMessage || fieldErrors.date }" />
              <ErrorMessage name="date" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="product" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">المنتج</label>
              <Select v-bind="field" v-model="form.product" :options="productOptions" optionLabel="label" optionValue="value" placeholder="اختار المنتج" :class="{ 'p-invalid': errorMessage || fieldErrors.product }" />
              <ErrorMessage name="product" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="quantity" rules="required|min_value:1">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">الكمية</label>
              <InputNumber v-bind="field" v-model="form.quantity" :class="{ 'p-invalid': errorMessage || fieldErrors.quantity }" />
              <ErrorMessage name="quantity" class="text-xs text-red-500" />
            </div>
          </Field>

          <div class="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="mb-3 text-right text-sm font-medium text-slate-700">العناصر المرسلة</div>
            <div class="overflow-hidden rounded-xl border border-slate-200">
              <table class="w-full text-right text-sm">
                <thead class="bg-slate-100 text-slate-700">
                  <tr>
                    <th class="px-3 py-2">المنتج</th>
                    <th class="px-3 py-2">الكمية المطلوبة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!form.product || !form.quantity" class="bg-white text-slate-500">
                    <td colspan="2" class="px-3 py-4 text-center">سيظهر الملخص هنا بعد اختيار المنتج والكمية</td>
                  </tr>
                  <tr v-else class="bg-white text-slate-700">
                    <td class="px-3 py-3">{{ currentProductName }}</td>
                    <td class="px-3 py-3">{{ form.quantity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="md:col-span-2 flex justify-end gap-3">
            <Button label="إلغاء" severity="secondary" text />
            <Button type="submit" label="تسليم المنتجات للفرع" :loading="saving" severity="info" />
          </div>
        </Form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import Calendar from "primevue/calendar";
import { Form, Field, ErrorMessage } from "vee-validate";
import { inventoryService } from "~/services/inventoryService";
import { branchService } from "~/services/branchService";
import { productService } from "~/services/productService";

const saving = ref(false);
const loadingOptions = ref(true);
const branchOptions = ref([]);
const productOptions = ref([]);

const form = reactive({ branch: "", product: "", quantity: null, date: null });
const initialValues = { branch: "", product: "", quantity: null, date: null };

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

    branchOptions.value = Array.isArray(branches)
      ? branches.map((branch) => ({ label: branch.name || branch.label || branch.id, value: branch.id }))
      : (branches?.data || []).map((branch) => ({ label: branch.name || branch.label || branch.id, value: branch.id }));

    productOptions.value = Array.isArray(products)
      ? products.map((product) => ({ label: product.name || product.title || product.id, value: product.id }))
      : (products?.data || []).map((product) => ({ label: product.name || product.title || product.id, value: product.id }));
  } catch (error) {
    console.error("Failed to load inventory options", error);
  } finally {
    loadingOptions.value = false;
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

    Object.assign(form, initialValues);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadOptions();
});

definePageMeta({ middleware: ["local-pages"] });
</script>

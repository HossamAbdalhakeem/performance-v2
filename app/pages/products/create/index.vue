<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">إضافة منتج</span>
      </template>

      <template #content>
        <Form v-slot="{ errors: fieldErrors }" @submit="submitProduct" :initial-values="initialValues" class="grid gap-4 md:grid-cols-2">
          <Field v-slot="{ field, errorMessage }" name="name" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">اسم المنتج</label>
              <InputText v-bind="field" v-model="form.name" :class="{ 'p-invalid': errorMessage || fieldErrors.name }" />
              <ErrorMessage name="name" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="category" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">الفئة</label>
              <Select v-bind="field" v-model="form.category" :options="categoryOptions" optionLabel="label" optionValue="value" placeholder="اختر الفئة" :class="{ 'p-invalid': errorMessage || fieldErrors.category }" />
              <ErrorMessage name="category" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="price" rules="required|min_value:1">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">السعر</label>
              <InputNumber v-bind="field" v-model="form.price" :class="{ 'p-invalid': errorMessage || fieldErrors.price }" />
              <ErrorMessage name="price" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="stock" rules="required|min_value:0">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">الكمية المتاحة</label>
              <InputNumber v-bind="field" v-model="form.stock" :class="{ 'p-invalid': errorMessage || fieldErrors.stock }" />
              <ErrorMessage name="stock" class="text-xs text-red-500" />
            </div>
          </Field>

          <div class="md:col-span-2 flex justify-end gap-3">
            <Button label="إلغاء" severity="secondary" text />
            <Button type="submit" label="حفظ المنتج" :loading="saving" severity="info" />
          </div>
        </Form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import { Form, Field, ErrorMessage } from "vee-validate";
import { productService } from "~/services/productService";

const saving = ref(false);
const categoryOptions = ref([
  { label: "كتب", value: "books" },
  { label: "لوازم", value: "supplies" },
  { label: "مستلزمات تعليمية", value: "education" },
]);

const form = reactive({ name: "", category: "books", price: null, stock: 0 });
const initialValues = { name: "", category: "books", price: null, stock: 0 };

const submitProduct = async () => {
  saving.value = true;

  try {
    await productService.createProduct({
      name: form.name,
      category: form.category,
      price: form.price,
      stock: form.stock,
    });

    Object.assign(form, initialValues);
  } catch (error) {
    console.error("Product creation failed:", error);
  } finally {
    saving.value = false;
  }
};

definePageMeta({ middleware: ["local-pages"] });
</script>

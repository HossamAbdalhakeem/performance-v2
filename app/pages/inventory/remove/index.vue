<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">سحب من المخزن</span>
      </template>
      <template #content>
        <Form v-slot="{ errors: fieldErrors }" @submit="submitRemove" :initial-values="initialValues" class="grid gap-4 md:grid-cols-2">
          <Field v-slot="{ field, errorMessage }" name="branch" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">الفرع</label>
              <Select v-bind="field" v-model="form.branch" :options="branchOptions" optionLabel="label" optionValue="value" placeholder="اختر الفرع" :class="{ 'p-invalid': errorMessage || fieldErrors.branch }" />
              <ErrorMessage name="branch" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="product" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">المنتج</label>
              <Select v-bind="field" v-model="form.product" :options="productOptions" optionLabel="label" optionValue="value" placeholder="اختر المنتج" :class="{ 'p-invalid': errorMessage || fieldErrors.product }" />
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

          <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-right text-sm text-amber-800 md:col-span-2">
            المتاح بالمخزن حالياً: <strong>20</strong>
          </div>

          <div class="md:col-span-2 flex justify-end gap-3">
            <Button label="إلغاء" severity="secondary" text />
            <Button type="submit" label="سحب من المخزن" :loading="saving" severity="warning" />
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
import { Form, Field, ErrorMessage } from "vee-validate";

const saving = ref(false);
const branchOptions = [
  { label: "فرع الرياض", value: "riyadh" },
  { label: "فرع جدة", value: "jeddah" },
  { label: "فرع المدينة", value: "madina" },
];
const productOptions = [
  { label: "كتاب X", value: "book-x" },
  { label: "كتاب Y", value: "book-y" },
  { label: "محاضرة Z", value: "lecture-z" },
];

const form = reactive({ branch: "", product: "", quantity: null });
const initialValues = { branch: "", product: "", quantity: null };

const submitRemove = async () => {
  saving.value = true;
  await new Promise((resolve) => setTimeout(resolve, 700));
  saving.value = false;
  Object.assign(form, initialValues);
};

definePageMeta({ middleware: ["local-pages"] });
</script>

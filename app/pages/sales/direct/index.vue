<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">البيع المباشر</span>
      </template>
      <template #content>
        <Form v-slot="{ errors: fieldErrors }" @submit="submitSale" :initial-values="initialValues" class="grid gap-4 md:grid-cols-2">
          <Field v-slot="{ field, errorMessage }" name="customer" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">اسم العميل</label>
              <InputText v-bind="field" v-model="form.customer" :class="{ 'p-invalid': errorMessage || fieldErrors.customer }" />
              <ErrorMessage name="customer" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="phone" rules="required|min:10">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">رقم الهاتف</label>
              <InputText v-bind="field" v-model="form.phone" :class="{ 'p-invalid': errorMessage || fieldErrors.phone }" />
              <ErrorMessage name="phone" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="product" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">المنتج</label>
              <Select v-bind="field" v-model="form.product" :options="productOptions" optionLabel="label" optionValue="value" placeholder="اختر المنتج" :class="{ 'p-invalid': errorMessage || fieldErrors.product }" />
              <ErrorMessage name="product" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="amount" rules="required|min_value:1">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">المبلغ</label>
              <InputNumber v-bind="field" v-model="form.amount" mode="currency" currency="EGP" locale="ar-EG" :class="{ 'p-invalid': errorMessage || fieldErrors.amount }" />
              <ErrorMessage name="amount" class="text-xs text-red-500" />
            </div>
          </Field>

          <div class="md:col-span-2 flex justify-end gap-3">
            <Button label="إلغاء" severity="secondary" text />
            <Button type="submit" label="إتمام البيع" :loading="saving" severity="info" />
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

const saving = ref(false);
const productOptions = [
  { label: "كتاب X", value: "book-x" },
  { label: "كتاب Y", value: "book-y" },
  { label: "محاضرة Z", value: "lecture-z" },
];

const form = reactive({ customer: "", phone: "", product: "", amount: null });
const initialValues = { customer: "", phone: "", product: "", amount: null };

const submitSale = async () => {
  saving.value = true;
  await new Promise((resolve) => setTimeout(resolve, 700));
  saving.value = false;
  Object.assign(form, initialValues);
};

definePageMeta({ middleware: ["local-pages"] });
</script>

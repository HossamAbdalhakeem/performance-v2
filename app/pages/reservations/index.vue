<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">حجز الكتب</span>
      </template>

      <template #content>
        <Form v-slot="{ errors: fieldErrors }" @submit="submitReservation" :initial-values="initialValues" class="grid gap-4 md:grid-cols-2">
          <Field v-slot="{ field, errorMessage }" name="stage" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">السنة الدراسية</label>
              <Select v-bind="field" v-model="form.stage" :options="stageOptions" optionLabel="label" optionValue="value" placeholder="اختر السنة" :class="{ 'p-invalid': errorMessage || fieldErrors.stage }" />
              <ErrorMessage name="stage" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="teacher" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">اسم المدرس</label>
              <Select v-bind="field" v-model="form.teacher" :options="teacherOptions" optionLabel="label" optionValue="value" placeholder="اختر المدرس" :class="{ 'p-invalid': errorMessage || fieldErrors.teacher }" />
              <ErrorMessage name="teacher" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="product" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">المنتج</label>
              <Select v-bind="field" v-model="form.product" :options="productOptions" optionLabel="label" optionValue="value" placeholder="اختر المنتج" :class="{ 'p-invalid': errorMessage || fieldErrors.product }" />
              <ErrorMessage name="product" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="student" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">اسم الطالب</label>
              <InputText v-bind="field" v-model="form.student" :class="{ 'p-invalid': errorMessage || fieldErrors.student }" />
              <ErrorMessage name="student" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="phone" rules="required|min:10">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">رقم الموبايل</label>
              <InputText v-bind="field" v-model="form.phone" :class="{ 'p-invalid': errorMessage || fieldErrors.phone }" />
              <ErrorMessage name="phone" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="amount" rules="required|min_value:1">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">المبلغ المدفوع (مقدم)</label>
              <InputNumber v-bind="field" v-model="form.amount" mode="currency" currency="EGP" locale="ar-EG" :class="{ 'p-invalid': errorMessage || fieldErrors.amount }" />
              <ErrorMessage name="amount" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="paymentMethod" rules="required">
            <div class="flex flex-col gap-2 text-right md:col-span-2">
              <label class="text-sm font-medium text-slate-700">طريقة الدفع</label>
              <Select v-bind="field" v-model="form.paymentMethod" :options="paymentOptions" optionLabel="label" optionValue="value" placeholder="اختر طريقة الدفع" :class="{ 'p-invalid': errorMessage || fieldErrors.paymentMethod }" />
              <ErrorMessage name="paymentMethod" class="text-xs text-red-500" />
            </div>
          </Field>

          <div class="md:col-span-2 flex justify-end gap-3">
            <Button label="إلغاء" severity="secondary" text />
            <Button type="submit" label="حفظ الحجز" :loading="saving" severity="info" />
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
import { reservationService } from "~/services/reservationService";
import { teacherService } from "~/services/teacherService";
import { productService } from "~/services/productService";

const saving = ref(false);
const teacherOptions = ref([]);
const productOptions = ref([]);
const stageOptions = [
  { label: "ثانوية عامة", value: "secondary" },
  { label: "بكالوريا", value: "baccalaureate" },
  { label: "جامعي", value: "university" },
];
const paymentOptions = [
  { label: "كاش", value: "cash" },
  { label: "فودافون كاش", value: "vodafone" },
  { label: "انستاباي", value: "instapay" },
  { label: "أخرى", value: "other" },
];

const form = reactive({ stage: "", teacher: "", product: "", student: "", phone: "", amount: null, paymentMethod: "" });
const initialValues = { stage: "", teacher: "", product: "", student: "", phone: "", amount: null, paymentMethod: "" };

const loadOptions = async () => {
  try {
    const [teachers, products] = await Promise.all([
      teacherService.getTeachers(),
      productService.getProducts(),
    ]);

    const teacherList = Array.isArray(teachers) ? teachers : teachers?.data || [];
    const productList = Array.isArray(products) ? products : products?.data || [];

    teacherOptions.value = teacherList.map((teacher) => ({
      label: teacher.name || teacher.full_name || `مدرس ${teacher.id}`,
      value: teacher.id,
    }));

    productOptions.value = productList.map((product) => ({
      label: product.name || product.title || `منتج ${product.id}`,
      value: product.id,
    }));
  } catch (error) {
    console.error("Failed to load reservation options", error);
  }
};

const submitReservation = async () => {
  saving.value = true;

  try {
    await reservationService.createReservation({
      stage: form.stage,
      teacher_id: form.teacher,
      product_id: form.product,
      student_name: form.student,
      phone: form.phone,
      amount: form.amount,
      payment_method: form.paymentMethod,
      status: "pending",
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

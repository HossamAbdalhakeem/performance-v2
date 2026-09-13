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

          <Field v-slot="{ field, errorMessage }" name="teacher" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">المدرس</label>
              <Select v-bind="field" v-model="form.teacher" :options="teacherOptions" optionLabel="label" optionValue="value" placeholder="اختر مدرس" :class="{ 'p-invalid': errorMessage || fieldErrors.teacher }" />
              <ErrorMessage name="teacher" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="wholesalePrice" rules="required|min_value:1">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">سعر الجملة</label>
              <InputNumber v-bind="field" v-model="form.wholesalePrice" mode="currency" currency="EGP" locale="ar-EG" :class="{ 'p-invalid': errorMessage || fieldErrors.wholesalePrice }" />
              <ErrorMessage name="wholesalePrice" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="salePrice" rules="required|min_value:1">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">سعر البيع</label>
              <InputNumber v-bind="field" v-model="form.salePrice" mode="currency" currency="EGP" locale="ar-EG" :class="{ 'p-invalid': errorMessage || fieldErrors.salePrice }" />
              <ErrorMessage name="salePrice" class="text-xs text-red-500" />
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
import { teacherService } from "~/services/teacherService";

const saving = ref(false);
const loadingTeachers = ref(true);
const teacherOptions = ref([]);

const form = reactive({
  name: "",
  teacher: "",
  wholesalePrice: null,
  salePrice: null,
});

const initialValues = { name: "", teacher: "", wholesalePrice: null, salePrice: null };

const loadTeacherOptions = async () => {
  try {
    const teachers = await teacherService.getTeachers();
    teacherOptions.value = Array.isArray(teachers)
      ? teachers.map((teacher) => ({ label: teacher.name, value: teacher.id }))
      : (teachers?.data || []).map((teacher) => ({ label: teacher.name, value: teacher.id }));
  } catch (error) {
    console.error("Failed to load teachers", error);
  } finally {
    loadingTeachers.value = false;
  }
};

const submitProduct = async () => {
  saving.value = true;

  try {
    await productService.createProduct({
      name: form.name,
      teacher_id: form.teacher,
      wholesale_price: form.wholesalePrice,
      sale_price: form.salePrice,
    });

    Object.assign(form, initialValues);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadTeacherOptions();
});

definePageMeta({ middleware: ["local-pages"] });
</script>

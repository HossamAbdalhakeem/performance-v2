<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold">إضافة منتج</span>
      </template>

      <template #content>
        <Form
          v-slot="{ errors: fieldErrors }"
          :initial-values="initialValues"
          class="grid gap-4 md:grid-cols-2"
          @submit="submitProduct"
        >
          <Field v-slot="{ field, errorMessage }" name="teacher" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium">اختر المدرس</label>
              <Select
                v-bind="field"
                v-model="form.teacher"
                :options="teacherOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="اختر المدرس ▾"
                :class="{ 'p-invalid': errorMessage || fieldErrors.teacher }"
              />
              <ErrorMessage name="teacher" class="text-xs text-red-400" />
            </div>
          </Field>

          <div class="flex items-end">
            <Button
              label="+ إضافة مدرس"
              severity="secondary"
              outlined
              class="w-full md:w-auto"
              type="button"
              @click="showTeacherDialog = true"
            />
          </div>

          <Field v-slot="{ field, errorMessage }" name="name" rules="required">
            <div class="flex flex-col gap-2 text-right md:col-span-2">
              <label class="text-sm font-medium">اسم المنتج (كتاب جديد / محاضرة نزلة)</label>
              <InputText
                v-bind="field"
                v-model="form.name"
                :class="{ 'p-invalid': errorMessage || fieldErrors.name }"
                class="w-full"
              />
              <ErrorMessage name="name" class="text-xs text-red-400" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="wholesalePrice" rules="required|min_value:0">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium">سعر الجملة</label>
              <InputNumber
                v-bind="field"
                v-model="form.wholesalePrice"
                mode="currency"
                currency="EGP"
                locale="ar-EG"
                class="w-full"
                :class="{ 'p-invalid': errorMessage || fieldErrors.wholesalePrice }"
              />
              <ErrorMessage name="wholesalePrice" class="text-xs text-red-400" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="salePrice" rules="required|min_value:0">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium">سعر البيع</label>
              <InputNumber
                v-bind="field"
                v-model="form.salePrice"
                mode="currency"
                currency="EGP"
                locale="ar-EG"
                class="w-full"
                :class="{ 'p-invalid': errorMessage || fieldErrors.salePrice }"
              />
              <ErrorMessage name="salePrice" class="text-xs text-red-400" />
            </div>
          </Field>

          <div class="md:col-span-2 flex justify-center">
            <Button type="submit" label="حفظ المنتج" :loading="saving" severity="info" class="min-w-[180px]" />
          </div>
        </Form>
      </template>
    </Card>

    <Dialog v-model:visible="showTeacherDialog" header="إضافة مدرس" modal class="w-full max-w-md" dir="rtl">
      <Form :initial-values="{ teacherName: '' }" class="space-y-4" @submit="submitTeacher">
        <Field v-slot="{ field, errorMessage }" name="teacherName" rules="required">
          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium">اسم المدرس</label>
            <InputText v-bind="field" v-model="teacherName" :class="{ 'p-invalid': errorMessage }" class="w-full" />
            <ErrorMessage name="teacherName" class="text-xs text-red-400" />
          </div>
        </Field>
        <div class="flex justify-end gap-2">
          <Button type="button" label="إلغاء" severity="secondary" text @click="showTeacherDialog = false" />
          <Button type="submit" label="حفظ المدرس" :loading="savingTeacher" severity="info" />
        </div>
      </Form>
    </Dialog>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import Dialog from "primevue/dialog";
import { Form, Field, ErrorMessage } from "vee-validate";
import { productService } from "~/services/productService";
import { teacherService } from "~/services/teacherService";

const saving = ref(false);
const savingTeacher = ref(false);
const showTeacherDialog = ref(false);
const teacherName = ref("");
const teacherOptions = ref([]);

const form = reactive({ teacher: "", name: "", wholesalePrice: null, salePrice: null });
const initialValues = { teacher: "", name: "", wholesalePrice: null, salePrice: null };

const loadTeachers = async () => {
  try {
    const teachers = await teacherService.getTeachers();
    const list = Array.isArray(teachers) ? teachers : teachers?.data || [];
    teacherOptions.value = list.map((teacher) => ({
      label: teacher.name || teacher.full_name || `مدرس ${teacher.id}`,
      value: teacher.id,
    }));
  } catch (error) {
    console.error("Failed to load teacher options", error);
  }
};

const submitTeacher = async () => {
  savingTeacher.value = true;

  try {
    const created = await teacherService.createTeacher({ name: teacherName.value });
    const value = created?.id || `teacher-${Date.now()}`;
    teacherOptions.value = [
      { label: created?.name || teacherName.value, value },
      ...teacherOptions.value,
    ];
    form.teacher = value;
    teacherName.value = "";
    showTeacherDialog.value = false;
  } finally {
    savingTeacher.value = false;
  }
};

const submitProduct = async () => {
  saving.value = true;

  try {
    await productService.createProduct({
      teacher_id: form.teacher,
      name: form.name,
      wholesale_price: form.wholesalePrice,
      sale_price: form.salePrice,
    });

    Object.assign(form, initialValues);
  } catch (error) {
    console.error("Product creation failed:", error);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadTeachers();
});

definePageMeta({ middleware: ["local-pages"] });
</script>

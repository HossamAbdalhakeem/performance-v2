<template>
  <Form
    v-slot="{ errors: fieldErrors }"
    :key="formKey"
    :initial-values="initialValues"
    class="grid gap-4"
    @submit="submit"
  >
    <Field v-slot="{ field, errorMessage }" name="name" rules="required">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">اسم الطالب</label>
        <InputText
          v-bind="field"
          v-model="form.name"
          class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.name }"
        />
        <ErrorMessage name="name" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field v-slot="{ field }" name="phone">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">رقم الهاتف</label>
        <InputText v-bind="field" v-model="form.phone" class="w-full" />
      </div>
    </Field>

    <div class="flex justify-end gap-2">
      <Button type="button" label="إلغاء" severity="secondary" text @click="$emit('cancel')" />
      <Button type="submit" :label="isEdit ? 'حفظ التعديل' : 'إضافة'" :loading="saving" severity="info" />
    </div>
  </Form>
</template>

<script setup>
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { Form, Field, ErrorMessage } from "vee-validate";
import { studentService } from "~/services/studentService";
import { useAppToast } from "~/composables/useAppToast";

const { showError } = useAppToast();

const props = defineProps({
  student: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const formKey = ref(0);
const isEdit = computed(() => Boolean(props.student?.id));

const form = reactive({ name: "", phone: "" });
const initialValues = computed(() => ({
  name: props.student?.name || "",
  phone: props.student?.phone || "",
}));

watch(
  () => props.student,
  (value) => {
    form.name = value?.name || "";
    form.phone = value?.phone || "";
    formKey.value += 1;
  },
  { immediate: true },
);

const submit = async () => {
  saving.value = true;
  try {
    const payload = { name: form.name, phone: form.phone || undefined };
    const result = isEdit.value
      ? await studentService.updateStudent(props.student.id, payload)
      : await studentService.createStudent(payload);
    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر حفظ الطالب.");
  } finally {
    saving.value = false;
  }
};
</script>

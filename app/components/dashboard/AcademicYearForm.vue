<template>
  <Form
    v-slot="{ errors: fieldErrors, meta }"
    :key="formKey"
    :initial-values="initialValues"
    class="grid gap-4"
    @submit="submit"
  >
    <Field v-slot="{ field, errorMessage }" name="name" rules="required">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">اسم العام الدراسي</label>
        <InputText
          v-bind="field"
          v-model="form.name"
          class="w-full"
          placeholder="مثال: 2025/2026"
          :class="{ 'p-invalid': errorMessage || fieldErrors.name }"
        />
        <ErrorMessage name="name" class="text-xs text-red-500" />
      </div>
    </Field>

    <div class="flex justify-end gap-2">
      <Button type="button" label="إلغاء" severity="secondary" text @click="$emit('cancel')" />
      <FormSubmitButton
        :label="isEdit ? 'حفظ التعديل' : 'إضافة'"
        :loading="saving"
        :valid="meta.valid"
      />
    </div>
  </Form>
</template>

<script setup>
import Button from "primevue/button";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import InputText from "primevue/inputtext";
import { Form, Field, ErrorMessage } from "vee-validate";
import { academicYearService } from "~/services/academicYearService";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "AcademicYearForm" });

const { showError } = useAppToast();

const props = defineProps({
  academicYear: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const formKey = ref(0);
const isEdit = computed(() => Boolean(props.academicYear?.id));

const form = reactive({ name: "" });
const initialValues = computed(() => ({ name: props.academicYear?.name || "" }));

watch(
  () => props.academicYear,
  (value) => {
    form.name = value?.name || "";
    formKey.value += 1;
  },
  { immediate: true },
);

const submit = async () => {
  saving.value = true;
  try {
    const result = isEdit.value
      ? await academicYearService.updateAcademicYear(props.academicYear.id, {
          name: form.name,
        })
      : await academicYearService.createAcademicYear({ name: form.name });
    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر حفظ العام الدراسي.");
  } finally {
    saving.value = false;
  }
};
</script>

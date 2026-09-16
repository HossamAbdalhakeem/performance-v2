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

    <Field v-slot="{ errorMessage }" name="studyYearId" rules="required">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">السنة الدراسية</label>
        <Select
          v-model="form.studyYearId"
          :options="studyYearOptions"
          option-label="label"
          option-value="value"
          placeholder="اختر السنة الدراسية"
          filter
          :loading="loadingYears"
          class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.studyYearId }"
        />
        <ErrorMessage name="studyYearId" class="text-xs text-red-500" />
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
import Select from "primevue/select";
import { Form, Field, ErrorMessage } from "vee-validate";
import { studentService } from "~/services/studentService";
import { studyYearService } from "~/services/studyYearService";
import { useAppToast } from "~/composables/useAppToast";

const { showError } = useAppToast();

const props = defineProps({
  student: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const loadingYears = ref(false);
const formKey = ref(0);
const studyYearOptions = ref([]);
const isEdit = computed(() => Boolean(props.student?.id));

const form = reactive({
  name: "",
  phone: "",
  studyYearId: null,
});

const initialValues = computed(() => ({
  name: props.student?.name || "",
  phone: props.student?.phone || "",
  studyYearId:
    props.student?.studyYearId || props.student?.studyYear?.id || null,
}));

const loadStudyYears = async () => {
  loadingYears.value = true;
  try {
    const items = await studyYearService.getStudyYears();
    const list = Array.isArray(items) ? items : items?.data || [];
    studyYearOptions.value = list.map((year) => ({
      label: year.name,
      value: year.id,
    }));
  } catch (error) {
    studyYearOptions.value = [];
    showError(error?.message || "تعذر تحميل السنوات الدراسية.");
  } finally {
    loadingYears.value = false;
  }
};

watch(
  () => props.student,
  (value) => {
    form.name = value?.name || "";
    form.phone = value?.phone || "";
    form.studyYearId = value?.studyYearId || value?.studyYear?.id || null;
    formKey.value += 1;
  },
  { immediate: true },
);

const submit = async () => {
  if (!form.studyYearId) {
    showError("السنة الدراسية مطلوبة.");
    return;
  }

  saving.value = true;
  try {
    const payload = {
      name: form.name,
      phone: form.phone || undefined,
      studyYearId: form.studyYearId,
    };
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

onMounted(loadStudyYears);
</script>

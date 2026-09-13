<template>
  <div class="space-y-6">
    <div class="grid gap-4 md:grid-cols-3">
      <Card v-for="stat in stats" :key="stat.label">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">{{ stat.label }}</p>
              <p class="mt-2 text-2xl font-bold text-slate-900">{{ stat.value }}</p>
            </div>
            <span class="rounded-xl px-2 py-1 text-xs font-semibold" :class="stat.badgeClass">{{ stat.tag }}</span>
          </div>
        </template>
      </Card>
    </div>

    <Card>
      <template #title>
        <div class="flex items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">الطلاب</span>
          <Button label="إضافة طالب" icon="pi pi-plus" severity="info" @click="toggleForm" />
        </div>
      </template>

      <template #content>
        <div v-if="showForm" class="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Form v-slot="{ errors: fieldErrors }" @submit="submitStudent" :initial-values="formInitialValues" class="grid gap-4 md:grid-cols-2">
            <Field v-slot="{ field, errorMessage }" name="name" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">اسم الطالب</label>
                <InputText v-bind="field" v-model="form.name" :class="{ 'p-invalid': errorMessage || fieldErrors.name }" />
                <ErrorMessage name="name" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="grade" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">المرحلة</label>
                <InputText v-bind="field" v-model="form.grade" :class="{ 'p-invalid': errorMessage || fieldErrors.grade }" />
                <ErrorMessage name="grade" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="branch" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">الفرع</label>
                <Select v-bind="field" v-model="form.branch" :options="branchOptions" optionLabel="label" optionValue="value" placeholder="اختر" :class="{ 'p-invalid': errorMessage || fieldErrors.branch }" />
                <ErrorMessage name="branch" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="status" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">الحالة</label>
                <Select v-bind="field" v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="اختر" :class="{ 'p-invalid': errorMessage || fieldErrors.status }" />
                <ErrorMessage name="status" class="text-xs text-red-500" />
              </div>
            </Field>

            <div class="md:col-span-2 flex justify-end gap-3">
              <Button label="إلغاء" severity="secondary" text @click="toggleForm" />
              <Button type="submit" label="حفظ الطالب" :loading="saving" severity="info" />
            </div>
          </Form>
        </div>

        <div v-if="pending" class="grid gap-4">
          <Skeleton v-for="i in 5" :key="i" width="100%" height="3rem" border-radius="12px" />
        </div>

        <DataTable v-else :value="students" paginator :rows="8" tableStyle="min-width: 100%" :emptyMessage="emptyMessage">
          <Column field="name" header="الاسم" />
          <Column field="grade" header="المرحلة" />
          <Column field="branch" header="الفرع" />
          <Column field="status" header="الحالة">
            <template #body="slotProps">
              <Tag :value="slotProps.data.status" :severity="slotProps.data.statusSeverity" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Skeleton from "primevue/skeleton";
import { Form, Field, ErrorMessage } from "vee-validate";
import { studentService } from "~/services/studentService";

const pending = ref(true);
const saving = ref(false);
const showForm = ref(false);
const branchOptions = [
  { label: "الرياض", value: "riyadh" },
  { label: "جدة", value: "jeddah" },
  { label: "المدينة", value: "madina" },
];
const statusOptions = [
  { label: "نشط", value: "active" },
  { label: "مؤجل", value: "pending" },
  { label: "موقوف", value: "blocked" },
];

const form = reactive({ name: "", grade: "", branch: "riyadh", status: "active" });
const formInitialValues = { name: "", grade: "", branch: "riyadh", status: "active" };
const students = ref([]);

const normalizeStudent = (student) => ({
  name: student.name || "-",
  grade: student.grade || "-",
  branch: branchOptions.find((item) => item.value === student.branch)?.label || "الرياض",
  status: statusOptions.find((item) => item.value === student.status)?.label || "نشط",
  statusSeverity: student.status === "active" ? "success" : student.status === "pending" ? "warning" : "danger",
});

const loadStudents = async () => {
  try {
    const items = await studentService.getStudents();
    const list = Array.isArray(items) ? items : items?.data || [];
    students.value = list.map(normalizeStudent);
  } catch (error) {
    console.error("Failed to load students", error);
    students.value = [];
  } finally {
    pending.value = false;
  }
};

const stats = computed(() => [
  { label: "إجمالي الطلاب", value: String(students.value.length || 0), tag: "مسجلين", badgeClass: "bg-sky-100 text-sky-700" },
  { label: "نشط", value: String(students.value.filter((item) => item.status === "نشط").length || 0), tag: "حاليًا", badgeClass: "bg-green-100 text-green-700" },
  { label: "قيد المتابعة", value: String(students.value.filter((item) => item.status === "مؤجل").length || 0), tag: "مهم", badgeClass: "bg-amber-100 text-amber-700" },
]);

const emptyMessage = "لا يوجد طلاب مسجلين.";

const toggleForm = () => {
  showForm.value = !showForm.value;
};

const submitStudent = async () => {
  saving.value = true;

  try {
    const result = await studentService.createStudent({
      name: form.name,
      grade: form.grade,
      branch: form.branch,
      status: form.status,
    });

    students.value.unshift(normalizeStudent(result || { ...form }));
    Object.assign(form, formInitialValues);
    showForm.value = false;
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadStudents();
});

definePageMeta({ middleware: ["local-pages"] });
</script>

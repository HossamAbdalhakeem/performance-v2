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
          <span class="text-lg font-bold text-slate-900">الحجوزات</span>
          <Button label="حجز جديد" icon="pi pi-plus" severity="info" @click="toggleForm" />
        </div>
      </template>

      <template #content>
        <div v-if="showForm" class="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Form v-slot="{ errors: fieldErrors }" @submit="submitReservation" :initial-values="formInitialValues" class="grid gap-4 md:grid-cols-2">
            <Field v-slot="{ field, errorMessage }" name="student" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">اسم الطالب</label>
                <InputText v-bind="field" v-model="form.student" :class="{ 'p-invalid': errorMessage || fieldErrors.student }" />
                <ErrorMessage name="student" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="book" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">اسم الكتاب</label>
                <InputText v-bind="field" v-model="form.book" :class="{ 'p-invalid': errorMessage || fieldErrors.book }" />
                <ErrorMessage name="book" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="date" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">تاريخ الاستلام</label>
                <Calendar v-bind="field" v-model="form.date" dateFormat="dd/mm/yy" :class="{ 'p-invalid': errorMessage || fieldErrors.date }" />
                <ErrorMessage name="date" class="text-xs text-red-500" />
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
              <Button type="submit" label="حفظ الحجز" :loading="saving" severity="info" />
            </div>
          </Form>
        </div>

        <div v-if="pending" class="grid gap-4">
          <Skeleton v-for="i in 5" :key="i" width="100%" height="3rem" border-radius="12px" />
        </div>

        <DataTable v-else :value="filteredReservations" paginator :rows="8" tableStyle="min-width: 100%" :emptyMessage="emptyMessage">
          <Column field="id" header="الكود" />
          <Column field="student" header="الطالب" />
          <Column field="book" header="الكتاب" />
          <Column field="date" header="تاريخ الاستلام" />
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
import Calendar from "primevue/calendar";
import Skeleton from "primevue/skeleton";
import { Form, Field, ErrorMessage } from "vee-validate";

const pending = ref(true);
const saving = ref(false);
const showForm = ref(false);
const search = ref("");
const statusOptions = [
  { label: "قيد التنفيذ", value: "pending" },
  { label: "مكتمل", value: "complete" },
  { label: "ملغي", value: "cancelled" },
];

const form = reactive({ student: "", book: "", date: null, status: "pending" });
const formInitialValues = { student: "", book: "", date: null, status: "pending" };

const reservations = ref([
  { id: "RES-201", student: "سارة أحمد", book: "مبادئ البرمجة", date: "12/09/2026", branch: "الرياض", status: "قيد التنفيذ", statusSeverity: "warning" },
  { id: "RES-202", student: "خالد حسن", book: "الاقتصاد الإسلامي", date: "18/09/2026", branch: "جدة", status: "مكتمل", statusSeverity: "success" },
  { id: "RES-203", student: "لينا سالم", book: "أساسيات الرياضيات", date: "20/09/2026", branch: "المدينة", status: "ملغي", statusSeverity: "danger" },
]);

const filteredReservations = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return reservations.value;
  return reservations.value.filter((item) => JSON.stringify(item).toLowerCase().includes(term));
});

const stats = computed(() => [
  { label: "إجمالي الحجوزات", value: "42", tag: "جديدة", badgeClass: "bg-sky-100 text-sky-700" },
  { label: "قيد التنفيذ", value: "28", tag: "نشط", badgeClass: "bg-amber-100 text-amber-700" },
  { label: "مكتملة", value: "12", tag: "مؤكد", badgeClass: "bg-green-100 text-green-700" },
]);

const emptyMessage = "لا توجد حجوزات متاحة.";

const toggleForm = () => {
  showForm.value = !showForm.value;
};

const submitReservation = async () => {
  saving.value = true;
  await new Promise((resolve) => setTimeout(resolve, 700));
  reservations.value.unshift({
    id: `RES-${Date.now().toString().slice(-4)}`,
    student: form.student,
    book: form.book,
    date: form.date ? new Date(form.date).toLocaleDateString("en-GB") : "-",
    branch: "الرياض",
    status: "قيد التنفيذ",
    statusSeverity: "warning",
  });
  Object.assign(form, formInitialValues);
  showForm.value = false;
  saving.value = false;
};

onMounted(() => {
  setTimeout(() => {
    pending.value = false;
  }, 350);
});

definePageMeta({ middleware: ["local-pages"] });
</script>

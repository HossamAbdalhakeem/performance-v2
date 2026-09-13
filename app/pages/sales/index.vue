<template>
  <div class="space-y-6">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          <span class="text-lg font-bold text-slate-900">إدارة المبيعات</span>
          <Button label="بيع جديد" icon="pi pi-plus" severity="info" @click="toggleForm" />
        </div>
      </template>

      <template #content>
        <div v-if="showForm" class="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Form v-slot="{ errors: fieldErrors }" @submit="submitSale" :initial-values="formInitialValues" class="grid gap-4 md:grid-cols-2">
            <Field v-slot="{ field, errorMessage }" name="student" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">اسم الطالب</label>
                <InputText v-bind="field" v-model="form.student" :class="{ 'p-invalid': errorMessage || fieldErrors.student }" />
                <ErrorMessage name="student" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="book" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">الكتاب</label>
                <InputText v-bind="field" v-model="form.book" :class="{ 'p-invalid': errorMessage || fieldErrors.book }" />
                <ErrorMessage name="book" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="amount" rules="required|min_value:1">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">المبلغ</label>
                <InputNumber v-bind="field" v-model="form.amount" mode="currency" currency="SAR" locale="ar-SA" :class="{ 'p-invalid': errorMessage || fieldErrors.amount }" />
                <ErrorMessage name="amount" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="paymentMethod" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">طريقة الدفع</label>
                <Select v-bind="field" v-model="form.paymentMethod" :options="paymentOptions" optionLabel="label" optionValue="value" placeholder="اختر" :class="{ 'p-invalid': errorMessage || fieldErrors.paymentMethod }" />
                <ErrorMessage name="paymentMethod" class="text-xs text-red-500" />
              </div>
            </Field>

            <div class="md:col-span-2 flex justify-end gap-3">
              <Button label="إلغاء" severity="secondary" text @click="toggleForm" />
              <Button type="submit" label="حفظ البيع" :loading="saving" severity="info" />
            </div>
          </Form>
        </div>

        <div v-if="pending" class="grid gap-4">
          <Skeleton v-for="i in 5" :key="i" width="100%" height="3rem" border-radius="12px" />
        </div>

        <DataTable v-else :value="filteredSales" paginator :rows="8" tableStyle="min-width: 100%" :emptyMessage="emptyMessage">
          <Column field="id" header="الكود" />
          <Column field="student" header="الطالب" />
          <Column field="book" header="الكتاب" />
          <Column field="branch" header="الفرع" />
          <Column field="amount" header="المبلغ">
            <template #body="slotProps">
              <span class="font-semibold text-slate-800">{{ slotProps.data.amount }}</span>
            </template>
          </Column>
          <Column field="paymentMethod" header="الدفع">
            <template #body="slotProps">
              <Tag :value="slotProps.data.paymentMethod" :severity="slotProps.data.paymentSeverity" />
            </template>
          </Column>
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
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import Skeleton from "primevue/skeleton";
import { Form, Field, ErrorMessage } from "vee-validate";

const pending = ref(true);
const saving = ref(false);
const showForm = ref(false);
const search = ref("");
const paymentOptions = [
  { label: "نقدي", value: "cash" },
  { label: "بطاقة", value: "card" },
  { label: "محفظة", value: "wallet" },
];

const form = reactive({
  student: "",
  book: "",
  amount: null,
  paymentMethod: "cash",
});

const formInitialValues = { student: "", book: "", amount: null, paymentMethod: "cash" };

const sales = ref([
  { id: "SAL-101", student: "سارة أحمد", book: "مبادئ البرمجة", branch: "الرياض", amount: "350 ر.س", paymentMethod: "بطاقة", paymentSeverity: "success", status: "مكتمل", statusSeverity: "success" },
  { id: "SAL-102", student: "خالد حسن", book: "الاقتصاد الإسلامي", branch: "جدة", amount: "280 ر.س", paymentMethod: "نقدي", paymentSeverity: "info", status: "قيد التنفيذ", statusSeverity: "warning" },
  { id: "SAL-103", student: "لينا سالم", book: "أساسيات الرياضيات", branch: "المدينة", amount: "420 ر.س", paymentMethod: "محفظة", paymentSeverity: "warning", status: "مكتمل", statusSeverity: "success" },
  { id: "SAL-104", student: "يوسف ناصر", book: "موسوعة اللغة العربية", branch: "الرياض", amount: "520 ر.س", paymentMethod: "بطاقة", paymentSeverity: "success", status: "معلق", statusSeverity: "secondary" },
]);

const filteredSales = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return sales.value;
  return sales.value.filter((item) => JSON.stringify(item).toLowerCase().includes(term));
});

const stats = computed(() => [
  { label: "إجمالي اليوم", value: "12,450 ر.س", tag: "+18%", badgeClass: "bg-green-100 text-green-700" },
  { label: "الطلبات المكتملة", value: "86", tag: "نشطة", badgeClass: "bg-sky-100 text-sky-700" },
  { label: "قيد التنفيذ", value: "14", tag: "مستمر", badgeClass: "bg-amber-100 text-amber-700" },
  { label: "المتوسط", value: "320 ر.س", tag: "حالة", badgeClass: "bg-violet-100 text-violet-700" },
]);

const emptyMessage = "لا توجد مبيعات في هذا الوقت.";

const toggleForm = () => {
  showForm.value = !showForm.value;
};

const submitSale = async () => {
  saving.value = true;
  await new Promise((resolve) => setTimeout(resolve, 700));
  sales.value.unshift({
    id: `SAL-${Date.now().toString().slice(-4)}`,
    student: form.student,
    book: form.book,
    branch: "الرياض",
    amount: `${form.amount} ر.س`,
    paymentMethod: paymentOptions.find((item) => item.value === form.paymentMethod)?.label || "نقدي",
    paymentSeverity: "success",
    status: "مكتمل",
    statusSeverity: "success",
  });
  Object.assign(form, formInitialValues);
  showForm.value = false;
  saving.value = false;
};

onMounted(() => {
  setTimeout(() => {
    pending.value = false;
  }, 400);
});

definePageMeta({ middleware: ["local-pages"] });
</script>

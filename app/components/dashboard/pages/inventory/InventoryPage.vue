<template>
  <div class="space-y-6">
    <div class="grid gap-4 md:grid-cols-4">
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
          <span class="text-lg font-bold text-slate-900">المخزون</span>
          <Button label="إضافة مخزون" icon="pi pi-plus" severity="info" @click="toggleForm" />
        </div>
      </template>

      <template #content>
        <div v-if="showForm" class="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Form v-slot="{ errors: fieldErrors }" @submit="submitStock" :initial-values="formInitialValues" class="grid gap-4 md:grid-cols-2">
            <Field v-slot="{ field, errorMessage }" name="item" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">اسم العنصر</label>
                <InputText v-bind="field" v-model="form.item" :class="{ 'p-invalid': errorMessage || fieldErrors.item }" />
                <ErrorMessage name="item" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="quantity" rules="required|min_value:1">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">الكمية</label>
                <InputNumber v-bind="field" v-model="form.quantity" :class="{ 'p-invalid': errorMessage || fieldErrors.quantity }" />
                <ErrorMessage name="quantity" class="text-xs text-red-500" />
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
              <Button type="submit" label="حفظ المخزون" :loading="saving" severity="info" />
            </div>
          </Form>
        </div>

        <div v-if="pending" class="grid gap-4">
          <Skeleton v-for="i in 5" :key="i" width="100%" height="3rem" border-radius="12px" />
        </div>

        <DataTable v-else :value="inventory" paginator :rows="8" tableStyle="min-width: 100%" :emptyMessage="emptyMessage">
          <Column field="item" header="العنصر" />
          <Column field="category" header="الفئة" />
          <Column field="quantity" header="الكمية" />
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
import InputNumber from "primevue/inputnumber";
import Select from "primevue/select";
import Skeleton from "primevue/skeleton";
import { Form, Field, ErrorMessage } from "vee-validate";

const pending = ref(true);
const saving = ref(false);
const showForm = ref(false);
const branchOptions = [
  { label: "الرياض", value: "riyadh" },
  { label: "جدة", value: "jeddah" },
  { label: "المدينة", value: "madina" },
];
const statusOptions = [
  { label: "متوفر", value: "available" },
  { label: "قليل", value: "low" },
  { label: "منتهي", value: "out" },
];

const form = reactive({ item: "", quantity: null, branch: "riyadh", status: "available" });
const formInitialValues = { item: "", quantity: null, branch: "riyadh", status: "available" };

const inventory = ref([
  { item: "كتاب مبادئ البرمجة", category: "كتب", quantity: "120", branch: "الرياض", status: "متوفر", statusSeverity: "success" },
  { item: "لعبة تعليمية", category: "ألعاب", quantity: "42", branch: "جدة", status: "قليل", statusSeverity: "warning" },
  { item: "مفكرة طلابية", category: "لوازم", quantity: "7", branch: "المدينة", status: "منتهي", statusSeverity: "danger" },
]);

const stats = computed(() => [
  { label: "إجمالي العناصر", value: "1,240", tag: "العناصر", badgeClass: "bg-sky-100 text-sky-700" },
  { label: "متوفر", value: "980", tag: "حسن", badgeClass: "bg-green-100 text-green-700" },
  { label: "قليل", value: "180", tag: "تنبيه", badgeClass: "bg-amber-100 text-amber-700" },
  { label: "منتهي", value: "34", tag: "مهم", badgeClass: "bg-red-100 text-red-700" },
]);

const emptyMessage = "لا يوجد مخزون مسجل.";

const toggleForm = () => {
  showForm.value = !showForm.value;
};

const submitStock = async () => {
  saving.value = true;
  await new Promise((resolve) => setTimeout(resolve, 700));
  inventory.value.unshift({
    item: form.item,
    category: "قيمة جديدة",
    quantity: `${form.quantity}`,
    branch: branchOptions.find((item) => item.value === form.branch)?.label || "الرياض",
    status: statusOptions.find((item) => item.value === form.status)?.label || "متوفر",
    statusSeverity: form.status === "available" ? "success" : form.status === "low" ? "warning" : "danger",
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
</script>

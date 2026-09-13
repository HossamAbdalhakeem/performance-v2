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
          <span class="text-lg font-bold text-slate-900">الفروع</span>
          <Button label="إضافة فرع" icon="pi pi-plus" severity="info" @click="toggleForm" />
        </div>
      </template>

      <template #content>
        <div v-if="showForm" class="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Form v-slot="{ errors: fieldErrors }" @submit="submitBranch" :initial-values="formInitialValues" class="grid gap-4 md:grid-cols-2">
            <Field v-slot="{ field, errorMessage }" name="name" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">اسم الفرع</label>
                <InputText v-bind="field" v-model="form.name" :class="{ 'p-invalid': errorMessage || fieldErrors.name }" />
                <ErrorMessage name="name" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="manager" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">مدير الفرع</label>
                <InputText v-bind="field" v-model="form.manager" :class="{ 'p-invalid': errorMessage || fieldErrors.manager }" />
                <ErrorMessage name="manager" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="city" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">المدينة</label>
                <InputText v-bind="field" v-model="form.city" :class="{ 'p-invalid': errorMessage || fieldErrors.city }" />
                <ErrorMessage name="city" class="text-xs text-red-500" />
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
              <Button type="submit" label="حفظ الفرع" :loading="saving" severity="info" />
            </div>
          </Form>
        </div>

        <div v-if="pending" class="grid gap-4">
          <Skeleton v-for="i in 5" :key="i" width="100%" height="3rem" border-radius="12px" />
        </div>

        <DataTable v-else :value="branches" paginator :rows="8" tableStyle="min-width: 100%" :emptyMessage="emptyMessage">
          <Column field="name" header="الفرع" />
          <Column field="manager" header="المدير" />
          <Column field="city" header="المدينة" />
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

const pending = ref(true);
const saving = ref(false);
const showForm = ref(false);
const statusOptions = [
  { label: "نشط", value: "active" },
  { label: "قيد التقييم", value: "review" },
  { label: "مغلق", value: "closed" },
];

const form = reactive({ name: "", manager: "", city: "", status: "active" });
const formInitialValues = { name: "", manager: "", city: "", status: "active" };

const branches = ref([
  { name: "فرع الرياض", manager: "أحمد سالم", city: "الرياض", status: "نشط", statusSeverity: "success" },
  { name: "فرع جدة", manager: "سارة علي", city: "جدة", status: "قيد التقييم", statusSeverity: "warning" },
  { name: "فرع المدينة", manager: "إبراهيم فهد", city: "المدينة", status: "مغلق", statusSeverity: "danger" },
]);

const stats = computed(() => [
  { label: "إجمالي الفروع", value: "6", tag: "نشط", badgeClass: "bg-sky-100 text-sky-700" },
  { label: "نشطة", value: "4", tag: "حالة", badgeClass: "bg-green-100 text-green-700" },
  { label: "قيد التقييم", value: "2", tag: "مهم", badgeClass: "bg-amber-100 text-amber-700" },
]);

const emptyMessage = "لا توجد فروع مسجلة.";

const toggleForm = () => {
  showForm.value = !showForm.value;
};

const submitBranch = async () => {
  saving.value = true;
  await new Promise((resolve) => setTimeout(resolve, 600));
  branches.value.unshift({
    name: form.name,
    manager: form.manager,
    city: form.city,
    status: statusOptions.find((item) => item.value === form.status)?.label || "نشط",
    statusSeverity: form.status === "active" ? "success" : form.status === "review" ? "warning" : "danger",
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

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
          <span class="text-lg font-bold text-slate-900">المستخدمين</span>
          <Button label="إضافة مستخدم" icon="pi pi-plus" severity="info" @click="toggleForm" />
        </div>
      </template>

      <template #content>
        <div v-if="showForm" class="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Form v-slot="{ errors: fieldErrors }" @submit="submitUser" :initial-values="formInitialValues" class="grid gap-4 md:grid-cols-2">
            <Field v-slot="{ field, errorMessage }" name="name" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">اسم المستخدم</label>
                <InputText v-bind="field" v-model="form.name" :class="{ 'p-invalid': errorMessage || fieldErrors.name }" />
                <ErrorMessage name="name" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="email" rules="required|email">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
                <InputText v-bind="field" v-model="form.email" :class="{ 'p-invalid': errorMessage || fieldErrors.email }" />
                <ErrorMessage name="email" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="role" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">الدور</label>
                <Select v-bind="field" v-model="form.role" :options="roleOptions" optionLabel="label" optionValue="value" placeholder="اختر" :class="{ 'p-invalid': errorMessage || fieldErrors.role }" />
                <ErrorMessage name="role" class="text-xs text-red-500" />
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
              <Button type="submit" label="حفظ المستخدم" :loading="saving" severity="info" />
            </div>
          </Form>
        </div>

        <div v-if="pending" class="grid gap-4">
          <Skeleton v-for="i in 5" :key="i" width="100%" height="3rem" border-radius="12px" />
        </div>

        <DataTable v-else :value="users" paginator :rows="8" tableStyle="min-width: 100%" :emptyMessage="emptyMessage">
          <Column field="name" header="الاسم" />
          <Column field="email" header="البريد" />
          <Column field="role" header="الدور" />
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
import { userService } from "~/services/userService";

const pending = ref(true);
const saving = ref(false);
const showForm = ref(false);
const roleOptions = [
  { label: "مدير", value: "admin" },
  { label: "فرع", value: "branch" },
  { label: "اجتماعي", value: "social" },
];
const statusOptions = [
  { label: "نشط", value: "active" },
  { label: "مؤجل", value: "pending" },
  { label: "مغلق", value: "blocked" },
];

const form = reactive({ name: "", email: "", role: "admin", status: "active" });
const formInitialValues = { name: "", email: "", role: "admin", status: "active" };
const users = ref([]);

const normalizeUser = (user) => ({
  name: user.name || "-",
  email: user.email || "-",
  role: roleOptions.find((item) => item.value === user.role)?.label || "مدير",
  status: statusOptions.find((item) => item.value === user.status)?.label || "نشط",
  statusSeverity: user.status === "active" ? "success" : user.status === "pending" ? "warning" : "danger",
});

const loadUsers = async () => {
  try {
    const items = await userService.getUsers();
    const list = Array.isArray(items) ? items : items?.data || [];
    users.value = list.map(normalizeUser);
  } catch (error) {
    console.error("Failed to load users", error);
    users.value = [];
  } finally {
    pending.value = false;
  }
};

const stats = computed(() => [
  { label: "إجمالي المستخدمين", value: String(users.value.length || 0), tag: "نشط", badgeClass: "bg-sky-100 text-sky-700" },
  { label: "مديرين", value: String(users.value.filter((item) => item.role === "مدير").length || 0), tag: "رئيسي", badgeClass: "bg-green-100 text-green-700" },
  { label: "فروع", value: String(users.value.filter((item) => item.role === "فرع").length || 0), tag: "مهم", badgeClass: "bg-amber-100 text-amber-700" },
]);

const emptyMessage = "لا توجد مستخدمين.";

const toggleForm = () => {
  showForm.value = !showForm.value;
};

const submitUser = async () => {
  saving.value = true;

  try {
    const result = await userService.createUser({
      name: form.name,
      email: form.email,
      role: form.role,
      status: form.status,
    });

    users.value.unshift(normalizeUser(result || { ...form }));
    Object.assign(form, formInitialValues);
    showForm.value = false;
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadUsers();
});

definePageMeta({ middleware: ["local-pages"] });
</script>

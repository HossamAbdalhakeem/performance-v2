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
            <span class="rounded-xl px-2 py-1 text-xs font-semibold" :class="stat.badgeClass">
              {{ stat.tag }}
            </span>
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
        <p
          v-if="feedback.message"
          class="mb-4 rounded-xl px-3 py-2 text-sm"
          :class="feedback.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'"
        >
          {{ feedback.message }}
        </p>

        <div v-if="showForm" class="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Form
            v-slot="{ errors: fieldErrors }"
            :initial-values="formInitialValues"
            class="grid gap-4 md:grid-cols-2"
            @submit="submitUser"
          >
            <Field v-slot="{ field, errorMessage }" name="fullName" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">اسم المستخدم</label>
                <InputText
                  v-bind="field"
                  v-model="form.fullName"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.fullName }"
                />
                <ErrorMessage name="fullName" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="email" rules="required|email">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
                <InputText
                  v-bind="field"
                  v-model="form.email"
                  type="email"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.email }"
                />
                <ErrorMessage name="email" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="password" rules="required|min:6">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">كلمة المرور</label>
                <Password
                  v-bind="field"
                  v-model="form.password"
                  toggle-mask
                  :feedback="false"
                  class="w-full"
                  :input-class="['w-full', { 'p-invalid': errorMessage || fieldErrors.password }]"
                />
                <ErrorMessage name="password" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="phone">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">رقم الهاتف</label>
                <InputText
                  v-bind="field"
                  v-model="form.phone"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.phone }"
                />
                <ErrorMessage name="phone" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="role" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">الدور</label>
                <Select
                  v-bind="field"
                  v-model="form.role"
                  :options="roleOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="اختر"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.role }"
                />
                <ErrorMessage name="role" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field
              v-if="isBranchEmployee"
              v-slot="{ field, errorMessage }"
              name="branchId"
              rules="required"
            >
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">الفرع</label>
                <Select
                  v-bind="field"
                  v-model="form.branchId"
                  :options="branchOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="اختر الفرع"
                  :loading="loadingBranches"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.branchId }"
                />
                <ErrorMessage name="branchId" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="status" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">الحالة</label>
                <Select
                  v-bind="field"
                  v-model="form.status"
                  :options="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="اختر"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.status }"
                />
                <ErrorMessage name="status" class="text-xs text-red-500" />
              </div>
            </Field>

            <div class="md:col-span-2 flex justify-end gap-3">
              <Button label="إلغاء" severity="secondary" text type="button" @click="toggleForm" />
              <Button type="submit" label="حفظ المستخدم" :loading="saving" severity="info" />
            </div>
          </Form>
        </div>

        <div v-if="pending" class="grid gap-4">
          <Skeleton v-for="i in 5" :key="i" width="100%" height="3rem" border-radius="12px" />
        </div>

        <DataTable
          v-else
          :value="users"
          paginator
          :rows="8"
          tableStyle="min-width: 100%"
          :emptyMessage="emptyMessage"
        >
          <Column field="fullName" header="الاسم" />
          <Column field="email" header="البريد" />
          <Column field="roleLabel" header="الدور" />
          <Column field="branchLabel" header="الفرع" />
          <Column field="phone" header="الهاتف" />
          <Column field="statusLabel" header="الحالة">
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.statusLabel"
                :severity="slotProps.data.statusSeverity"
              />
            </template>
          </Column>
          <Column header="إجراء">
            <template #body="slotProps">
              <Button
                :label="slotProps.data.status === 'ACTIVE' ? 'تعطيل' : 'تفعيل'"
                size="small"
                text
                :severity="slotProps.data.status === 'ACTIVE' ? 'danger' : 'success'"
                :loading="statusLoadingId === slotProps.data.id"
                @click="toggleUserStatus(slotProps.data)"
              />
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
import Password from "primevue/password";
import Select from "primevue/select";
import Skeleton from "primevue/skeleton";
import { Form, Field, ErrorMessage } from "vee-validate";
import { userService } from "~/services/userService";
import { branchService } from "~/services/branchService";

const pending = ref(true);
const saving = ref(false);
const loadingBranches = ref(false);
const showForm = ref(false);
const statusLoadingId = ref(null);
const users = ref([]);
const branchOptions = ref([]);
const branchesById = ref({});
const feedback = reactive({ type: "success", message: "" });

const roleOptions = [
  { label: "مدير", value: "ADMIN" },
  { label: "خدمة العملاء", value: "CUSTOMER_SERVICE" },
  { label: "موظف فرع", value: "BRANCH_EMPLOYEE" },
];

const statusOptions = [
  { label: "نشط", value: "ACTIVE" },
  { label: "غير نشط", value: "INACTIVE" },
];

const form = reactive({
  fullName: "",
  email: "",
  password: "",
  phone: "",
  role: "ADMIN",
  branchId: "",
  status: "ACTIVE",
});

const formInitialValues = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  role: "ADMIN",
  branchId: "",
  status: "ACTIVE",
};

const isBranchEmployee = computed(() => form.role === "BRANCH_EMPLOYEE");
const emptyMessage = "لا توجد مستخدمين.";

const roleLabel = (role) =>
  roleOptions.find((item) => item.value === role)?.label || role || "-";

const statusLabel = (status) =>
  statusOptions.find((item) => item.value === status)?.label || status || "-";

const normalizeUser = (user) => {
  const branchId = user.branchId || null;
  return {
    id: user.id,
    fullName: user.fullName || user.name || "-",
    email: user.email || "-",
    phone: user.phone || "-",
    role: user.role,
    roleLabel: roleLabel(user.role),
    branchId,
    branchLabel: branchId ? branchesById.value[branchId] || branchId : "-",
    status: user.status || "ACTIVE",
    statusLabel: statusLabel(user.status || "ACTIVE"),
    statusSeverity: user.status === "INACTIVE" ? "danger" : "success",
  };
};

const setFeedback = (type, message) => {
  feedback.type = type;
  feedback.message = message;
};

const loadBranches = async () => {
  loadingBranches.value = true;
  try {
    const items = await branchService.getBranches();
    const list = Array.isArray(items) ? items : items?.data || [];
    const map = {};
    branchOptions.value = list
      .filter((branch) => branch.status !== "INACTIVE")
      .map((branch) => {
        map[branch.id] = branch.name;
        return { label: branch.name, value: branch.id };
      });
    // Keep inactive names for table display too
    list.forEach((branch) => {
      map[branch.id] = branch.name;
    });
    branchesById.value = map;
  } catch (error) {
    console.error("Failed to load branches", error);
  } finally {
    loadingBranches.value = false;
  }
};

const loadUsers = async () => {
  pending.value = true;
  try {
    const items = await userService.getUsers();
    const list = Array.isArray(items) ? items : items?.data || [];
    users.value = list.map(normalizeUser);
  } catch (error) {
    setFeedback("error", error?.message || "تعذر تحميل المستخدمين.");
    users.value = [];
  } finally {
    pending.value = false;
  }
};

const stats = computed(() => [
  {
    label: "إجمالي المستخدمين",
    value: String(users.value.length || 0),
    tag: "الكل",
    badgeClass: "bg-sky-100 text-sky-700",
  },
  {
    label: "مديرين",
    value: String(users.value.filter((item) => item.role === "ADMIN").length || 0),
    tag: "Admin",
    badgeClass: "bg-green-100 text-green-700",
  },
  {
    label: "موظفي الفروع",
    value: String(
      users.value.filter((item) => item.role === "BRANCH_EMPLOYEE").length || 0,
    ),
    tag: "Branch",
    badgeClass: "bg-amber-100 text-amber-700",
  },
]);

const toggleForm = () => {
  showForm.value = !showForm.value;
  setFeedback("success", "");
  if (!showForm.value) {
    Object.assign(form, formInitialValues);
  }
};

watch(
  () => form.role,
  (role) => {
    if (role !== "BRANCH_EMPLOYEE") {
      form.branchId = "";
    }
  },
);

const submitUser = async () => {
  saving.value = true;
  setFeedback("success", "");

  try {
    if (form.role === "BRANCH_EMPLOYEE" && !form.branchId) {
      throw new Error("الفرع مطلوب لموظف الفرع.");
    }

    if (form.role !== "BRANCH_EMPLOYEE" && form.branchId) {
      form.branchId = "";
    }

    const created = await userService.createUser({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone?.trim() || undefined,
      role: form.role,
      branchId: form.role === "BRANCH_EMPLOYEE" ? form.branchId : undefined,
    });

    let result = created;
    if (form.status === "INACTIVE" && created?.id) {
      result = await userService.updateUserStatus(created.id, "INACTIVE");
    }

    users.value.unshift(normalizeUser(result || created));
    Object.assign(form, formInitialValues);
    showForm.value = false;
    setFeedback("success", "تم إضافة المستخدم بنجاح.");
  } catch (error) {
    setFeedback("error", error?.message || "تعذر حفظ المستخدم.");
  } finally {
    saving.value = false;
  }
};

const toggleUserStatus = async (user) => {
  statusLoadingId.value = user.id;
  try {
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const updated = await userService.updateUserStatus(user.id, nextStatus);
    const index = users.value.findIndex((item) => item.id === user.id);
    if (index >= 0) {
      users.value[index] = normalizeUser(updated || { ...user, status: nextStatus });
    }
    setFeedback(
      "success",
      nextStatus === "ACTIVE" ? "تم تفعيل المستخدم." : "تم تعطيل المستخدم.",
    );
  } catch (error) {
    setFeedback("error", error?.message || "تعذر تحديث حالة المستخدم.");
  } finally {
    statusLoadingId.value = null;
  }
};

onMounted(async () => {
  await loadBranches();
  await loadUsers();
});
</script>

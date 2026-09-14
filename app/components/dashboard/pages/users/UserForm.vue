<template>
  <Form
    v-slot="{ errors: fieldErrors }"
    :key="formKey"
    :initial-values="initialValues"
    class="grid gap-4"
    @submit="submit"
  >
    <Field v-slot="{ field, errorMessage }" name="fullName" rules="required">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">الاسم الكامل</label>
        <InputText
          v-bind="field"
          v-model="form.fullName"
          class="w-full"
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
          class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.email }"
        />
        <ErrorMessage name="email" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field
      v-slot="{ field, errorMessage }"
      name="password"
      :rules="isEdit ? 'min:6' : 'required|min:6'"
    >
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">
          كلمة المرور
          <span v-if="isEdit" class="text-xs text-slate-400">(اختياري عند التعديل)</span>
        </label>
        <Password
          v-bind="field"
          v-model="form.password"
          toggle-mask
          :feedback="false"
          class="w-full"
          input-class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.password }"
        />
        <ErrorMessage name="password" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field v-slot="{ field }" name="phone">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">الهاتف</label>
        <InputText v-bind="field" v-model="form.phone" class="w-full" />
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
          placeholder="اختر الدور"
          class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.role }"
        />
        <ErrorMessage name="role" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field
      v-if="needsBranch"
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
          filter
          class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.branchId }"
        />
        <ErrorMessage name="branchId" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field v-if="isEdit" v-slot="{ field }" name="status">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">الحالة</label>
        <Select
          v-bind="field"
          v-model="form.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>
    </Field>

    <p v-if="feedback.message" class="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
      {{ feedback.message }}
    </p>

    <div class="flex justify-end gap-2">
      <Button type="button" label="إلغاء" severity="secondary" text @click="$emit('cancel')" />
      <Button type="submit" :label="isEdit ? 'حفظ التعديل' : 'إضافة'" :loading="saving" severity="info" />
    </div>
  </Form>
</template>

<script setup>
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Select from "primevue/select";
import { Form, Field, ErrorMessage } from "vee-validate";
import { userService } from "~/services/userService";
import { branchService } from "~/services/branchService";

const props = defineProps({
  user: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const formKey = ref(0);
const feedback = reactive({ message: "" });
const branchOptions = ref([]);
const isEdit = computed(() => Boolean(props.user?.id));

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
  branchId: null,
  status: "ACTIVE",
});

const needsBranch = computed(() => form.role === "BRANCH_EMPLOYEE");

const initialValues = computed(() => ({
  fullName: props.user?.fullName || "",
  email: props.user?.email || "",
  password: "",
  phone: props.user?.phone || "",
  role: props.user?.role || "ADMIN",
  branchId: props.user?.branchId || null,
  status: props.user?.status || "ACTIVE",
}));

const loadBranches = async () => {
  try {
    const branches = await branchService.getBranches();
    const list = Array.isArray(branches) ? branches : branches?.data || [];
    branchOptions.value = list.map((branch) => ({
      label: branch.name,
      value: branch.id,
    }));
  } catch (error) {
    console.error("Failed to load branches", error);
  }
};

watch(
  () => props.user,
  (value) => {
    form.fullName = value?.fullName || "";
    form.email = value?.email || "";
    form.password = "";
    form.phone = value?.phone || "";
    form.role = value?.role || "ADMIN";
    form.branchId = value?.branchId || null;
    form.status = value?.status || "ACTIVE";
    formKey.value += 1;
    feedback.message = "";
  },
  { immediate: true },
);

watch(
  () => form.role,
  (role) => {
    if (role !== "BRANCH_EMPLOYEE") form.branchId = null;
  },
);

const submit = async () => {
  saving.value = true;
  feedback.message = "";
  try {
    const payload = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || undefined,
      role: form.role,
      branchId: needsBranch.value ? form.branchId : undefined,
    };
    if (form.password) payload.password = form.password;

    let result;
    if (isEdit.value) {
      result = await userService.updateUser(props.user.id, payload);
      if (form.status && form.status !== props.user.status) {
        result = await userService.updateUserStatus(props.user.id, form.status);
      }
    } else {
      result = await userService.createUser(payload);
    }
    emit("saved", result);
  } catch (error) {
    feedback.message = error?.message || "تعذر حفظ المستخدم.";
  } finally {
    saving.value = false;
  }
};

onMounted(loadBranches);
</script>

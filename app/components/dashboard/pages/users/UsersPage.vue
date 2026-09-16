<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">المستخدمون</span>
          <Button label="إضافة مستخدم" icon="pi pi-plus" severity="info" @click="openCreate" />
        </div>
      </template>
      <template #content>
        <div class="mb-5 grid gap-3 md:grid-cols-2">
          <SearchInput placeholder="اسم / بريد" @search="onSearch" />
          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">الدور</label>
            <Select
              v-model="filters.role"
              :options="roleOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="كل الأدوار"
              showClear
              class="w-full"
              @update:modelValue="loadData"
            />
          </div>
        </div>

        <UsersTable :users="users" :loading="loading" @edit="openEdit" />
      </template>
    </Card>

    <EntityDrawer v-model:visible="drawerVisible" :title="drawerTitle" width="420px">
      <UserForm
        v-if="drawerVisible"
        :user="editingItem"
        @saved="handleSaved"
        @cancel="drawerVisible = false"
      />
    </EntityDrawer>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import Select from "primevue/select";
import EntityDrawer from "~/components/dashboard/EntityDrawer.vue";
import SearchInput from "~/components/shared/search-input/index.vue";
import UsersTable from "~/components/dashboard/pages/users/UsersTable.vue";
import { userService } from "~/services/userService";
import { branchService } from "~/services/branchService";
import { useAppToast } from "~/composables/useAppToast";

const UserForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/users/UserForm.vue"),
);

const { showError, showSuccess } = useAppToast();

const ROLE_LABELS = {
  ADMIN: "مدير",
  CUSTOMER_SERVICE: "خدمة العملاء",
  BRANCH_EMPLOYEE: "موظف فرع",
};

const loading = ref(true);
const drawerVisible = ref(false);
const editingItem = ref(null);
const users = ref([]);
const filters = reactive({
  search: "",
  role: null,
});
const roleOptions = [
  { label: "مدير", value: "ADMIN" },
  { label: "خدمة العملاء", value: "CUSTOMER_SERVICE" },
  { label: "موظف فرع", value: "BRANCH_EMPLOYEE" },
];

const drawerTitle = computed(() =>
  editingItem.value?.id ? "تعديل المستخدم" : "إضافة مستخدم",
);

const normalizeUser = (user) => ({
  ...user,
  fullName: user.fullName || "-",
  email: user.email || "-",
  roleLabel: ROLE_LABELS[user.role] || user.role || "-",
  branchName: user.branch?.name || "-",
  statusLabel: user.status === "INACTIVE" ? "غير نشط" : "نشط",
  statusSeverity: user.status === "INACTIVE" ? "danger" : "success",
});

const buildQuery = () => {
  const params = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.role) params.role = filters.role;
  return params;
};

const loadData = async () => {
  loading.value = true;
  try {
    const [items, branches] = await Promise.all([
      userService.getUsers(buildQuery()),
      branchService.getBranches(),
    ]);
    const list = Array.isArray(items) ? items : items?.data || [];
    const branchList = Array.isArray(branches) ? branches : branches?.data || [];
    const branchNameById = Object.fromEntries(
      branchList.map((branch) => [branch.id, branch.name]),
    );

    users.value = list.map((user) => {
      const normalized = normalizeUser(user);
      return {
        ...normalized,
        branchName: branchNameById[user.branchId] || normalized.branchName || "-",
      };
    });
  } catch (error) {
    showError(error?.message || "تعذر تحميل المستخدمين.");
    users.value = [];
  } finally {
    loading.value = false;
  }
};

const onSearch = (value) => {
  filters.search = value;
  loadData();
};

const openCreate = () => {
  editingItem.value = null;
  drawerVisible.value = true;
};

const openEdit = (item) => {
  editingItem.value = item;
  drawerVisible.value = true;
};

const handleSaved = async () => {
  drawerVisible.value = false;
  editingItem.value = null;
  showSuccess("تم حفظ المستخدم بنجاح.");
  await loadData();
};

watch(drawerVisible, (visible) => {
  if (!visible) editingItem.value = null;
});

onMounted(loadData);
</script>

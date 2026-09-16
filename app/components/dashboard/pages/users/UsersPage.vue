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
          <AppGlobalSelectUserRole
            v-model="filters.role"
            label="الدور"
            placeholder="كل الأدوار"
            show-clear
            @change="loadData"
          />
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
import EntityDrawer from "~/components/dashboard/EntityDrawer.vue";
import SearchInput from "~/components/shared/search-input/index.vue";
import AppGlobalSelectUserRole from "~/components/shared/app-global-select-user-role/index.vue";
import UsersTable from "~/components/dashboard/pages/users/UsersTable.vue";
import { userService } from "~/services/userService";
import { branchService } from "~/services/branchService";
import { useAppToast } from "~/composables/useAppToast";
import { getUserRoleLabel } from "~/enums/userRole";

const UserForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/users/UserForm.vue"),
);

const { showError, showSuccess } = useAppToast();

const loading = ref(true);
const drawerVisible = ref(false);
const editingItem = ref(null);
const users = ref([]);
const filters = reactive({
  search: "",
  role: null,
});

const drawerTitle = computed(() =>
  editingItem.value?.id ? "تعديل المستخدم" : "إضافة مستخدم",
);

const normalizeUser = (user) => ({
  ...user,
  fullName: user.fullName || "-",
  email: user.email || "-",
  roleLabel: getUserRoleLabel(user.role),
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

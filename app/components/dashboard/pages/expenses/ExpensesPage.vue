<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">المصروفات</span>
          <Button label="إضافة مصروف" icon="pi pi-plus" severity="info" @click="openCreate" />
        </div>
      </template>
      <template #content>
        <div class="mb-5 grid gap-3 md:grid-cols-2">
          <SearchInput placeholder="تصنيف / وصف / فرع" @search="onSearch" />
          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">الفرع</label>
            <Select
              v-model="filters.branchId"
              :options="branchOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="كل الفروع"
              showClear
              filter
              class="w-full"
              @update:modelValue="onBranchChange"
            />
          </div>
        </div>

        <ExpensesTable
          :expenses="expenses"
          :loading="loading"
          :rows="pagination.perPage"
          :first="pagination.first"
          :total-records="pagination.total"
          @edit="openEdit"
          @page="onPage"
        />
      </template>
    </Card>

    <EntityDrawer v-model:visible="drawerVisible" :title="drawerTitle" width="420px">
      <ExpenseForm
        v-if="drawerVisible"
        :expense="editingItem"
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
import ExpensesTable from "~/components/dashboard/pages/expenses/ExpensesTable.vue";
import ExpenseForm from "~/components/dashboard/pages/expenses/ExpenseForm.vue";
import { expenseService } from "~/services/expenseService";
import { branchService } from "~/services/branchService";
import { useAppToast } from "~/composables/useAppToast";

const { showError, showSuccess } = useAppToast();
const loading = ref(true);
const drawerVisible = ref(false);
const editingItem = ref(null);
const expenses = ref([]);
const branchOptions = ref([]);
const filters = reactive({
  search: "",
  branchId: null,
});
const pagination = reactive({
  page: 1,
  perPage: 20,
  total: 0,
  first: 0,
});
const drawerTitle = computed(() =>
  editingItem.value?.id ? "تعديل المصروف" : "إضافة مصروف",
);

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} ج.م`;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("ar-EG");
};

const normalizeExpense = (expense) => ({
  ...expense,
  categoryName: expense.category?.name || "-",
  branchName: expense.branch?.name || "عام",
  amountLabel: formatMoney(expense.amount),
  expenseDateLabel: formatDate(expense.expenseDate),
  description: expense.description || "-",
});

const buildQuery = () => {
  const params = {
    page: pagination.page,
    per_page: pagination.perPage,
  };
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.branchId) params.branchId = filters.branchId;
  return params;
};

const resetPagination = () => {
  pagination.page = 1;
  pagination.first = 0;
};

const onPage = (event) => {
  pagination.page = event.page + 1;
  pagination.perPage = event.rows;
  pagination.first = event.first;
  loadData();
};

const loadBranches = async () => {
  const branches = await branchService.getBranches();
  const branchList = Array.isArray(branches) ? branches : branches?.data || [];
  branchOptions.value = branchList.map((branch) => ({
    label: branch.name,
    value: branch.id,
  }));
};

const loadData = async () => {
  loading.value = true;
  try {
    const result = await expenseService.getExpenses(buildQuery());
    expenses.value = result.data.map(normalizeExpense);
    pagination.total = result.pagination.total;
  } catch (error) {
    showError(error?.message || "تعذر تحميل المصروفات.");
    expenses.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const onSearch = (value) => {
  filters.search = value;
  resetPagination();
  loadData();
};

const onBranchChange = () => {
  resetPagination();
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
  showSuccess("تم حفظ المصروف بنجاح.");
  await loadData();
};

watch(drawerVisible, (visible) => {
  if (!visible) editingItem.value = null;
});

onMounted(async () => {
  try {
    await loadBranches();
  } catch (error) {
    showError(error?.message || "تعذر تحميل الفروع.");
  }
  await loadData();
});
</script>

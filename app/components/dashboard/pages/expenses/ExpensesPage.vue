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
        <p
          v-if="feedback.message"
          class="mb-4 rounded-xl px-3 py-2 text-sm"
          :class="feedback.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'"
        >
          {{ feedback.message }}
        </p>

        <div class="mb-5 grid gap-3 md:grid-cols-2">
          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">بحث</label>
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText v-model="filters.search" class="w-full" placeholder="تصنيف / وصف / فرع" />
            </IconField>
          </div>
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
            />
          </div>
        </div>

        <ExpensesTable :expenses="filteredExpenses" :loading="loading" @edit="openEdit" />
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
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import EntityDrawer from "~/components/dashboard/EntityDrawer.vue";
import ExpensesTable from "~/components/dashboard/pages/expenses/ExpensesTable.vue";
import ExpenseForm from "~/components/dashboard/pages/expenses/ExpenseForm.vue";
import { expenseService } from "~/services/expenseService";
import { branchService } from "~/services/branchService";

const loading = ref(true);
const drawerVisible = ref(false);
const editingItem = ref(null);
const expenses = ref([]);
const branchOptions = ref([]);
const filters = reactive({ search: "", branchId: null });
const feedback = reactive({ type: "success", message: "" });

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

const filteredExpenses = computed(() => {
  const q = filters.search.trim().toLowerCase();
  return expenses.value.filter((item) => {
    if (filters.branchId && item.branchId !== filters.branchId) return false;
    if (!q) return true;
    return (
      String(item.categoryName || "").toLowerCase().includes(q) ||
      String(item.branchName || "").toLowerCase().includes(q) ||
      String(item.description || "").toLowerCase().includes(q)
    );
  });
});

const loadData = async () => {
  loading.value = true;
  try {
    const [items, branches] = await Promise.all([
      expenseService.getExpenses(),
      branchService.getBranches(),
    ]);
    const branchList = Array.isArray(branches) ? branches : branches?.data || [];
    expenses.value = (items || []).map(normalizeExpense);
    branchOptions.value = branchList.map((branch) => ({
      label: branch.name,
      value: branch.id,
    }));
  } catch (error) {
    feedback.type = "error";
    feedback.message = error?.message || "تعذر تحميل المصروفات.";
    expenses.value = [];
  } finally {
    loading.value = false;
  }
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
  feedback.type = "success";
  feedback.message = "تم حفظ المصروف بنجاح.";
  await loadData();
};

watch(drawerVisible, (visible) => {
  if (!visible) editingItem.value = null;
});

onMounted(loadData);
</script>

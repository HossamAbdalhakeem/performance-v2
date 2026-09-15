<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">الفروع</span>
      </template>

      <template #content>
        <BranchesTable
          :branches="branches"
          :loading="loading"
          @add-stock="openAddStock"
          @remove-stock="openRemoveStock"
        />
      </template>
    </Card>

    <Drawer
      v-model:visible="addDrawerVisible"
      header="إضافة منتج للفرع"
      position="right"
      :modal="true"
      :blockScroll="true"
      :baseZIndex="1400"
      class="branch-stock-drawer"
      :pt="{
        root: {
          class: 'branch-stock-drawer-panel',
          style: { width: '420px', maxWidth: '420px' },
        },
        header: { class: 'text-right' },
        content: { class: 'overflow-y-auto' },
      }"
    >
      <AddStockForm
        v-if="addDrawerVisible && selectedBranch"
        :locked-branch-id="selectedBranch.id"
        :branch-name="selectedBranch.name"
        @saved="handleAddSaved"
        @cancel="addDrawerVisible = false"
      />
    </Drawer>

    <Drawer
      v-model:visible="removeDrawerVisible"
      header="سحب منتج من الفرع"
      position="right"
      :modal="true"
      :blockScroll="true"
      :baseZIndex="1400"
      class="branch-stock-drawer"
      :pt="{
        root: {
          class: 'branch-stock-drawer-panel',
          style: { width: '420px', maxWidth: '420px' },
        },
        header: { class: 'text-right' },
        content: { class: 'overflow-y-auto' },
      }"
    >
      <RemoveStockForm
        v-if="removeDrawerVisible && selectedBranch"
        :locked-branch-id="selectedBranch.id"
        :branch-name="selectedBranch.name"
        @saved="handleRemoveSaved"
        @cancel="removeDrawerVisible = false"
      />
    </Drawer>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Drawer from "primevue/drawer";
import BranchesTable from "~/components/dashboard/pages/branches/BranchesTable.vue";
import AddStockForm from "~/components/dashboard/pages/inventory/AddStockForm.vue";
import RemoveStockForm from "~/components/dashboard/pages/inventory/RemoveStockForm.vue";
import { branchService } from "~/services/branchService";
import { inventoryService } from "~/services/inventoryService";
import { useAppToast } from "~/composables/useAppToast";

const { showError, showSuccess } = useAppToast();
const loading = ref(true);
const branches = ref([]);
const selectedBranch = ref(null);
const addDrawerVisible = ref(false);
const removeDrawerVisible = ref(false);

const statusMeta = (status) => {
  if (status === "INACTIVE") {
    return { label: "غير نشط", severity: "danger" };
  }
  return { label: "نشط", severity: "success" };
};

const normalizeInventoryItem = (item) => ({
  productId: item.productId,
  productName: item.product?.name || "-",
  physicalQuantity: item.physicalQuantity ?? 0,
  reservedQuantity: item.reservedQuantity ?? 0,
  availableQuantity: item.availableQuantity ?? Math.max(0, (item.physicalQuantity || 0) - (item.reservedQuantity || 0)),
});

const buildBranchRows = (branchList, inventoryList) => {
  const byBranch = inventoryList.reduce((acc, item) => {
    const key = item.branchId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(normalizeInventoryItem(item));
    return acc;
  }, {});

  return branchList.map((branch) => {
    const meta = statusMeta(branch.status);
    return {
      id: branch.id,
      name: branch.name || "-",
      status: branch.status,
      statusLabel: meta.label,
      statusSeverity: meta.severity,
      inventoryItems: byBranch[branch.id] || [],
    };
  });
};

const loadData = async () => {
  loading.value = true;
  try {
    const [branchResult, inventoryResult] = await Promise.all([
      branchService.getBranches(),
      inventoryService.getInventory(),
    ]);

    const branchList = Array.isArray(branchResult) ? branchResult : branchResult?.data || [];
    const inventoryList = Array.isArray(inventoryResult) ? inventoryResult : [];

    branches.value = buildBranchRows(branchList, inventoryList);
  } catch (error) {
    showError(error?.message || "تعذر تحميل الفروع.");
    branches.value = [];
  } finally {
    loading.value = false;
  }
};

const openAddStock = (branch) => {
  selectedBranch.value = branch;
  removeDrawerVisible.value = false;
  addDrawerVisible.value = true;
};

const openRemoveStock = (branch) => {
  selectedBranch.value = branch;
  addDrawerVisible.value = false;
  removeDrawerVisible.value = true;
};

const handleAddSaved = async () => {
  addDrawerVisible.value = false;
  selectedBranch.value = null;
  showSuccess("تم إضافة المنتج للفرع بنجاح.");
  await loadData();
};

const handleRemoveSaved = async () => {
  removeDrawerVisible.value = false;
  selectedBranch.value = null;
  showSuccess("تم سحب المنتج من الفرع بنجاح.");
  await loadData();
};

watch([addDrawerVisible, removeDrawerVisible], ([addVisible, removeVisible]) => {
  if (!addVisible && !removeVisible) selectedBranch.value = null;
});

onMounted(() => {
  loadData();
});
</script>

<style scoped>
:deep(.branch-stock-drawer-panel) {
  width: 420px !important;
  max-width: 420px !important;
}
</style>

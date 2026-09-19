<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">الفروع</span>
          <Button
            label="إضافة فرع جديد"
            icon="pi pi-plus"
            severity="info"
            @click="openCreate"
          />
        </div>
      </template>

      <template #content>
        <BranchesTable
          :branches="branches"
          :loading="loading"
          @edit="openEdit"
          @add-stock="openAddStock"
          @remove-stock="openRemoveStock"
        />
      </template>
    </Card>

    <EntityDrawer v-model:visible="formDrawerVisible" :title="formDrawerTitle">
      <BranchForm
        v-if="formDrawerVisible"
        :branch="editingBranch"
        @saved="handleBranchSaved"
        @cancel="closeFormDrawer"
      />
    </EntityDrawer>

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
import Button from "primevue/button";
import Drawer from "primevue/drawer";
import EntityDrawer from "~/components/dashboard/EntityDrawer.vue";
import BranchesTable from "~/components/dashboard/pages/branches/BranchesTable.vue";
import { branchService } from "~/services/branchService";
import { useAppToast } from "~/composables/useAppToast";
import { getStatusTagMeta } from "~/utils/statusTags";

const BranchForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/branches/BranchForm.vue"),
);
const AddStockForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/inventory/AddStockForm.vue"),
);
const RemoveStockForm = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/inventory/RemoveStockForm.vue"),
);

const { showError, showSuccess } = useAppToast();
const loading = ref(true);
const branches = ref([]);
const selectedBranch = ref(null);
const editingBranch = ref(null);
const formDrawerVisible = ref(false);
const addDrawerVisible = ref(false);
const removeDrawerVisible = ref(false);

const formDrawerTitle = computed(() =>
  editingBranch.value?.id ? "تعديل الفرع" : "إضافة فرع جديد",
);

const statusMeta = (status) => getStatusTagMeta("entity", status);

const normalizeInventoryItem = (item) => ({
  productId: item.productId || item.product?.id,
  productName: item.productName || item.product?.name || "-",
  physicalQuantity: item.physicalQuantity ?? 0,
  reservedQuantity: item.reservedQuantity ?? 0,
  availableQuantity:
    item.availableQuantity ??
    Math.max(
      0,
      (item.physicalQuantity || 0) - (item.reservedQuantity || 0),
    ),
});

const loadData = async () => {
  loading.value = true;
  try {
    const branchResult = await branchService.getBranches({
      inventory_summary: true,
    });

    const branchList = Array.isArray(branchResult)
      ? branchResult
      : branchResult?.data || [];

    branches.value = branchList.map((branch) => {
      const meta = statusMeta(branch.status);
      const summary = branch.inventorySummary || {
        productsCount: 0,
        preview: [],
        items: [],
      };
      const items = (summary.items || summary.preview || []).map(
        normalizeInventoryItem,
      );

      return {
        id: branch.id,
        name: branch.name || "-",
        address: branch.address || "",
        phone: branch.phone || "",
        status: branch.status,
        statusLabel: meta.label,
        productsCount: Number(summary.productsCount ?? items.length),
        inventoryPreview: (summary.preview || items.slice(0, 3)).map(
          normalizeInventoryItem,
        ),
        inventoryItems: items,
      };
    });
  } catch (error) {
    showError(error?.message || "تعذر تحميل الفروع.");
    branches.value = [];
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  editingBranch.value = null;
  formDrawerVisible.value = true;
};

const openEdit = (branch) => {
  editingBranch.value = branch;
  formDrawerVisible.value = true;
};

const closeFormDrawer = () => {
  formDrawerVisible.value = false;
  editingBranch.value = null;
};

const handleBranchSaved = async () => {
  closeFormDrawer();
  showSuccess("تم حفظ الفرع بنجاح.");
  await loadData();
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

watch(formDrawerVisible, (visible) => {
  if (!visible) editingBranch.value = null;
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

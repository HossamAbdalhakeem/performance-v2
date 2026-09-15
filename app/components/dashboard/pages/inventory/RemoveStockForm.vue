<template>
  <form class="grid gap-4" @submit.prevent="submitRemove">
    <div v-if="!lockedBranchId" class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">الفرع</label>
      <Select
        v-model="form.branchId"
        :options="branchOptions"
        option-label="label"
        option-value="value"
        placeholder="اختار الفرع ▾"
        filter
        class="w-full"
        :invalid="!!errors.branchId"
        @update:model-value="onBranchChange"
      />
      <small v-if="errors.branchId" class="text-xs text-red-500">{{ errors.branchId }}</small>
    </div>

    <div v-else class="rounded-xl bg-slate-50 px-3 py-2 text-right text-sm text-slate-600">
      الفرع: <strong class="text-slate-900">{{ branchName || "—" }}</strong>
    </div>

    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">سحبت ايه</label>
      <Select
        :model-value="form.productId"
        :options="productOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="اختار منتجاً من مخزن الفرع ▾"
        filter
        :loading="loadingProducts"
        :disabled="!selectedBranchId || loadingProducts"
        class="w-full"
        :invalid="!!errors.productId"
        @update:model-value="onProductChange"
      >
        <template #option="{ option }">
          <div class="flex w-full items-center justify-between gap-3 text-right">
            <span>{{ option.name }}</span>
            <span
              class="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700"
            >
              متاح {{ option.availableQuantity }}
            </span>
          </div>
        </template>
      </Select>
      <small v-if="!selectedBranchId" class="text-xs text-slate-400">
        اختر الفرع أولاً لعرض منتجات المخزن.
      </small>
      <small v-else-if="!loadingProducts && !productOptions.length" class="text-xs text-slate-400">
        لا توجد منتجات متاحة في مخزن هذا الفرع.
      </small>
      <small v-if="errors.productId" class="text-xs text-red-500">{{ errors.productId }}</small>
    </div>

    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">الكمية</label>
      <AppInputNumber
        v-model="form.quantity"
        :min="1"
        :max="maxQuantity"
        :max-fraction-digits="0"
        :invalid="!!errors.quantity"
      />
      <small v-if="errors.quantity" class="text-xs text-red-500">{{ errors.quantity }}</small>
    </div>

    <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-right text-sm text-slate-600">
      المتاح بالمخزن حالياً:
      <strong class="text-slate-900">{{ availableQty }}</strong>
    </div>

    <p v-if="errorMessage" class="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
      {{ errorMessage }}
    </p>

    <div class="flex justify-end gap-2">
      <Button
        v-if="showCancel"
        type="button"
        label="إلغاء"
        severity="secondary"
        text
        @click="$emit('cancel')"
      />
      <Button type="submit" label="تأكيد السحب" :loading="saving" severity="warning" />
    </div>
  </form>
</template>

<script setup>
import Button from "primevue/button";
import Select from "primevue/select";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import { inventoryService } from "~/services/inventoryService";
import { branchService } from "~/services/branchService";

const props = defineProps({
  lockedBranchId: { type: String, default: "" },
  branchName: { type: String, default: "" },
  showCancel: { type: Boolean, default: true },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const loadingProducts = ref(false);
const errorMessage = ref("");
const branchOptions = ref([]);
const productOptions = ref([]);
const errors = reactive({
  branchId: "",
  productId: "",
  quantity: "",
});

const form = reactive({
  branchId: props.lockedBranchId || null,
  productId: null,
  quantity: null,
});

const selectedBranchId = computed(() => props.lockedBranchId || form.branchId || null);

const selectedProduct = computed(
  () => productOptions.value.find((option) => option.value === form.productId) || null
);

const availableQty = computed(() =>
  Number(selectedProduct.value?.availableQuantity || 0)
);

const maxQuantity = computed(() => Math.max(1, availableQty.value || 1));

const toId = (value) => {
  if (value == null || value === "") return null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    const id = value.value ?? value.id ?? value.productId;
    return id != null && id !== "" ? String(id) : null;
  }
  return null;
};

const onBranchChange = async (value) => {
  form.branchId = toId(value);
  form.productId = null;
  form.quantity = null;
  errors.productId = "";
  errors.quantity = "";
  await loadBranchProducts();
};

const onProductChange = (value) => {
  form.productId = toId(value);
  errors.productId = "";

  const available = availableQty.value;
  if (form.quantity != null && Number(form.quantity) > available) {
    form.quantity = available > 0 ? available : null;
  }
};

const validate = () => {
  const branchId = selectedBranchId.value;
  errors.branchId = branchId ? "" : "الفرع مطلوب.";
  errors.productId = form.productId ? "" : "المنتج مطلوب.";

  const qty = Number(form.quantity);
  if (!form.quantity || qty < 1) {
    errors.quantity = "الكمية يجب أن تكون 1 على الأقل.";
  } else if (qty > availableQty.value) {
    errors.quantity = `الكمية أكبر من المتاح (${availableQty.value}).`;
  } else {
    errors.quantity = "";
  }

  return !errors.branchId && !errors.productId && !errors.quantity;
};

const loadBranches = async () => {
  if (props.lockedBranchId) return;

  try {
    const branches = await branchService.getBranches();
    const branchList = Array.isArray(branches) ? branches : branches?.data || [];
    branchOptions.value = branchList.map((branch) => ({
      label: branch.name || branch.id,
      value: branch.id,
    }));
  } catch (error) {
    console.error("Failed to load branches", error);
    errorMessage.value = error?.message || "تعذر تحميل الفروع.";
  }
};

const loadBranchProducts = async () => {
  const branchId = selectedBranchId.value;
  productOptions.value = [];

  if (!branchId) return;

  loadingProducts.value = true;
  errorMessage.value = "";
  try {
    const items = await inventoryService.getBranchInventory(branchId, {
      availableOnly: true,
    });
    const list = Array.isArray(items) ? items : items?.data || [];

    productOptions.value = list
      .map((item) => {
        const product = item.product || item;
        const productId = product.id || item.productId;
        if (!productId) return null;

        const availableQuantity = Number(
          item.availableQuantity ??
            Math.max(
              0,
              Number(item.physicalQuantity || 0) - Number(item.reservedQuantity || 0)
            )
        );
        const name = product.name || product.title || productId;

        return {
          name,
          availableQuantity,
          label: `${name} · متاح ${availableQuantity}`,
          value: String(productId),
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Failed to load branch inventory products", error);
    errorMessage.value = error?.message || "تعذر تحميل منتجات مخزن الفرع.";
  } finally {
    loadingProducts.value = false;
  }
};

const submitRemove = async () => {
  errorMessage.value = "";
  if (!validate()) return;

  saving.value = true;
  try {
    await inventoryService.removeStock({
      branchId: selectedBranchId.value,
      productId: form.productId,
      quantity: Number(form.quantity),
    });

    form.productId = null;
    form.quantity = null;
    if (!props.lockedBranchId) form.branchId = null;
    productOptions.value = [];
    emit("saved");
  } catch (error) {
    errorMessage.value = error?.message || "تعذر سحب المنتج من الفرع.";
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.lockedBranchId,
  async (value) => {
    form.branchId = value || null;
    form.productId = null;
    form.quantity = null;
    await loadBranchProducts();
  },
  { immediate: true },
);

onMounted(async () => {
  await loadBranches();
  if (selectedBranchId.value) {
    await loadBranchProducts();
  }
});
</script>

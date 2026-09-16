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
      <ProductSelect
        v-model="form.productId"
        source="inventory"
        :branch-id="selectedBranchId"
        :inventory-query="{ availableOnly: true }"
        label="سحبت ايه"
        placeholder="اختار منتجاً من مخزن الفرع ▾"
        :disabled="!selectedBranchId"
        :invalid="!!errors.productId"
        :hint="
          !selectedBranchId
            ? 'اختر الفرع أولاً لعرض منتجات المخزن.'
            : ''
        "
        @select="onProductSelect"
        @loaded="onProductsLoaded"
      />
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

    <div class="flex justify-end gap-2">
      <Button
        v-if="showCancel"
        type="button"
        label="إلغاء"
        severity="secondary"
        text
        @click="$emit('cancel')"
      />
      <FormSubmitButton
        label="تأكيد السحب"
        :loading="saving"
        :valid="isFormValid"
        severity="warning"
      />
    </div>
  </form>
</template>

<script setup>
import Button from "primevue/button";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import ProductSelect from "~/components/shared/product-select/index.vue";
import Select from "primevue/select";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import { inventoryService } from "~/services/inventoryService";
import { branchService } from "~/services/branchService";
import { useAppToast } from "~/composables/useAppToast";

const props = defineProps({
  lockedBranchId: { type: String, default: "" },
  branchName: { type: String, default: "" },
  showCancel: { type: Boolean, default: true },
});

const emit = defineEmits(["saved", "cancel"]);
const { showError } = useAppToast();

const saving = ref(false);
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
  () => productOptions.value.find((option) => option.value === form.productId) || null,
);

const availableQty = computed(() =>
  Number(selectedProduct.value?.availableQuantity || 0),
);

const maxQuantity = computed(() => Math.max(1, availableQty.value || 1));

const isFormValid = computed(() => {
  const branchId = selectedBranchId.value;
  const qty = Number(form.quantity);
  return Boolean(
    branchId &&
      form.productId &&
      form.quantity != null &&
      qty >= 1 &&
      qty <= availableQty.value,
  );
});

const toId = (value) => {
  if (value == null || value === "") return null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    const id = value.value ?? value.id ?? value.productId;
    return id != null && id !== "" ? String(id) : null;
  }
  return null;
};

const onBranchChange = (value) => {
  form.branchId = toId(value);
  form.productId = null;
  form.quantity = null;
  errors.productId = "";
  errors.quantity = "";
};

const onProductsLoaded = (options) => {
  productOptions.value = options || [];
};

const onProductSelect = () => {
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
    showError(error?.message || "تعذر تحميل الفروع.");
  }
};

const submitRemove = async () => {
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
    showError(error?.message || "تعذر سحب المنتج من الفرع.");
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.lockedBranchId,
  (value) => {
    form.branchId = value || null;
    form.productId = null;
    form.quantity = null;
  },
  { immediate: true },
);

onMounted(loadBranches);
</script>

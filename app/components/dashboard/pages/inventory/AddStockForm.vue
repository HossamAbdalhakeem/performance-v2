<template>
  <form class="grid gap-4" @submit.prevent="submitStock">
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
      />
      <small v-if="errors.branchId" class="text-xs text-red-500">{{ errors.branchId }}</small>
    </div>

    <div v-else class="rounded-xl bg-slate-50 px-3 py-2 text-right text-sm text-slate-600">
      الفرع: <strong class="text-slate-900">{{ branchName || "—" }}</strong>
    </div>

    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">المنتج</label>
      <Select
        :model-value="form.productId"
        :options="productOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="اختار المنتج ▾"
        filter
        class="w-full"
        :invalid="!!errors.productId"
        @update:model-value="onProductChange"
      />
      <small v-if="errors.productId" class="text-xs text-red-500">{{ errors.productId }}</small>
    </div>

    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">الكمية</label>
      <AppInputNumber
        v-model="form.quantity"
        :min="1"
        :max-fraction-digits="0"
        :invalid="!!errors.quantity"
      />
      <small v-if="errors.quantity" class="text-xs text-red-500">{{ errors.quantity }}</small>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200">
      <table class="w-full text-right text-sm">
        <thead class="bg-slate-100 text-slate-700">
          <tr>
            <th class="px-3 py-2">المنتج</th>
            <th class="px-3 py-2">الكمية المُسلّمة</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!form.productId || !form.quantity" class="text-slate-400">
            <td colspan="2" class="px-3 py-4 text-center">سيظهر الملخص هنا بعد اختيار المنتج والكمية</td>
          </tr>
          <tr v-else>
            <td class="px-3 py-3">{{ currentProductName }}</td>
            <td class="px-3 py-3">{{ form.quantity }}</td>
          </tr>
        </tbody>
      </table>
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
      <Button type="submit" label="تسليم المنتجات للفرع" :loading="saving" severity="info" />
    </div>
  </form>
</template>

<script setup>
import Button from "primevue/button";
import Select from "primevue/select";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import { inventoryService } from "~/services/inventoryService";
import { branchService } from "~/services/branchService";
import { productService } from "~/services/productService";
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

const toId = (value) => {
  if (value == null || value === "") return null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    const id = value.value ?? value.id ?? value.productId;
    return id != null && id !== "" ? String(id) : null;
  }
  return null;
};

const onProductChange = (value) => {
  form.productId = toId(value);
};

const currentProductName = computed(() => {
  const selected = productOptions.value.find((item) => item.value === form.productId);
  return selected?.label || "-";
});

const validate = () => {
  const branchId = props.lockedBranchId || form.branchId;
  errors.branchId = branchId ? "" : "الفرع مطلوب.";
  errors.productId = form.productId ? "" : "المنتج مطلوب.";
  errors.quantity =
    form.quantity != null && Number(form.quantity) >= 1
      ? ""
      : "الكمية يجب أن تكون 1 على الأقل.";
  return !errors.branchId && !errors.productId && !errors.quantity;
};

const loadOptions = async () => {
  try {
    const [branches, products] = await Promise.all([
      props.lockedBranchId ? Promise.resolve([]) : branchService.getBranches(),
      productService.getProducts({ per_page: 200 }),
    ]);

    const branchList = Array.isArray(branches) ? branches : branches?.data || [];
    const productList = products.data || [];

    branchOptions.value = branchList.map((branch) => ({
      label: branch.name || branch.id,
      value: branch.id,
    }));

    productOptions.value = productList
      .filter((product) => product?.id)
      .map((product) => ({
        label: product.name || product.title || product.id,
        value: String(product.id),
      }));
  } catch (error) {
    console.error("Failed to load add-stock options", error);
    showError(error?.message || "تعذر تحميل المنتجات.");
  }
};

const submitStock = async () => {
  if (!validate()) return;

  saving.value = true;
  try {
    await inventoryService.addStock({
      branchId: props.lockedBranchId || form.branchId,
      productId: form.productId,
      quantity: Number(form.quantity),
    });

    form.productId = null;
    form.quantity = null;
    if (!props.lockedBranchId) form.branchId = null;
    emit("saved");
  } catch (error) {
    showError(error?.message || "تعذر إضافة المنتج للفرع.");
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.lockedBranchId,
  (value) => {
    form.branchId = value || null;
  },
  { immediate: true },
);

onMounted(loadOptions);
</script>

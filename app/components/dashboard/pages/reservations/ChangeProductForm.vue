<template>
  <Form
    v-slot="{ errors: fieldErrors }"
    :key="formKey"
    :initial-values="initialValues"
    class="grid gap-4"
    @submit="submit"
  >
    <div class="rounded-xl bg-slate-50 px-3 py-2 text-right text-sm text-slate-600">
      الحجز:
      <strong class="text-slate-900">{{ reservation?.reservationNumber || "—" }}</strong>
      <br />
      المنتج الحالي:
      <strong class="text-slate-900">{{ reservation?.productName || "—" }}</strong>
    </div>

    <Field v-slot="{ field, errorMessage }" name="newProductId" rules="required">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">المنتج الجديد</label>
        <Select
          v-bind="field"
          v-model="form.newProductId"
          :options="productOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="اختر المنتج"
          filter
          class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.newProductId }"
        />
        <ErrorMessage name="newProductId" class="text-xs text-red-500" />
      </div>
    </Field>

    <div class="flex justify-end gap-2">
      <Button type="button" label="إلغاء" severity="secondary" text @click="$emit('cancel')" />
      <Button type="submit" label="تأكيد التبديل" :loading="saving" severity="info" />
    </div>
  </Form>
</template>

<script setup>
import Button from "primevue/button";
import Select from "primevue/select";
import { Form, Field, ErrorMessage } from "vee-validate";
import { productService } from "~/services/productService";
import { reservationService } from "~/services/reservationService";
import { useAppToast } from "~/composables/useAppToast";

const props = defineProps({
  reservation: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);
const { showError } = useAppToast();

const saving = ref(false);
const formKey = ref(0);
const productOptions = ref([]);
const form = reactive({ newProductId: null });
const initialValues = { newProductId: null };

const loadProducts = async () => {
  try {
    const items = await productService.getProducts();
    const list = Array.isArray(items) ? items : items?.data || [];
    productOptions.value = list
      .filter((product) => product.reservationAllowed !== false)
      .map((product) => ({
        label: product.name,
        value: product.id,
      }));
  } catch (error) {
    showError(error?.message || "تعذر تحميل المنتجات.");
  }
};

const submit = async () => {
  if (!props.reservation?.id) return;
  saving.value = true;
  try {
    const result = await reservationService.changeProduct(props.reservation.id, {
      newProductId: form.newProductId,
    });
    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر تبديل المنتج.");
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.reservation,
  () => {
    form.newProductId = null;
    formKey.value += 1;
  },
  { immediate: true },
);

onMounted(loadProducts);
</script>

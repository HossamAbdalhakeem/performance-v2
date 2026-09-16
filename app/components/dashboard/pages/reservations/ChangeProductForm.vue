<template>
  <Form
    v-slot="{ errors: fieldErrors, meta }"
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

    <Field v-slot="{ errorMessage }" v-model="form.newProductId" name="newProductId" rules="required">
      <div class="flex flex-col gap-2 text-right">
        <ProductSelect
          v-model="form.newProductId"
          source="catalog"
          label="المنتج الجديد"
          :reservation-only="true"
          :exclude-product-id="reservation?.productId"
          variant="simple"
          :invalid="!!(errorMessage || fieldErrors.newProductId)"
        />
        <ErrorMessage name="newProductId" class="text-xs text-red-500" />
      </div>
    </Field>

    <div class="flex justify-end gap-2">
      <Button type="button" label="إلغاء" severity="secondary" text @click="$emit('cancel')" />
      <FormSubmitButton label="تأكيد التبديل" :loading="saving" :valid="meta.valid" />
    </div>
  </Form>
</template>

<script setup>
import Button from "primevue/button";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import ProductSelect from "~/components/shared/product-select/index.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { reservationService } from "~/services/reservationService";
import { useAppToast } from "~/composables/useAppToast";

const props = defineProps({
  reservation: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);
const { showError } = useAppToast();

const saving = ref(false);
const formKey = ref(0);
const form = reactive({ newProductId: null });
const initialValues = { newProductId: null };

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
</script>

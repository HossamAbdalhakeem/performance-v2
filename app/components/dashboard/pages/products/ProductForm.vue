<template>
  <div class="space-y-4" dir="rtl">
    <Form
      v-slot="{ errors: fieldErrors }"
      :key="formKey"
      :initial-values="initialValues"
      class="grid gap-4"
      @submit="submit"
    >
      <Field v-slot="{ field, errorMessage }" name="type" rules="required">
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium">نوع المنتج</label>
          <Select
            v-bind="field"
            v-model="form.type"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="اختر النوع ▾"
            :class="{ 'p-invalid': errorMessage || fieldErrors.type }"
          />
          <ErrorMessage name="type" class="text-xs text-red-400" />
        </div>
      </Field>

      <Field
        v-if="isBook"
        v-slot="{ field, errorMessage }"
        name="studyYearId"
        rules="required"
      >
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium">السنة الدراسية</label>
          <Select
            v-bind="field"
            v-model="form.studyYearId"
            :options="studyYearOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="اختر السنة الدراسية ▾"
            :loading="loadingLookups"
            :class="{ 'p-invalid': errorMessage || fieldErrors.studyYearId }"
          />
          <ErrorMessage name="studyYearId" class="text-xs text-red-400" />
        </div>
      </Field>

      <Field v-slot="{ field, errorMessage }" name="teacherId" rules="required">
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium">اختر المدرس</label>
          <div class="flex gap-2">
            <Select
              v-bind="field"
              v-model="form.teacherId"
              :options="teacherOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="اختر المدرس ▾"
              class="flex-1"
              filter
              :loading="loadingLookups"
              :class="{ 'p-invalid': errorMessage || fieldErrors.teacherId }"
            />
            <Button
              type="button"
              icon="pi pi-plus"
              severity="info"
              outlined
              aria-label="إضافة مدرس"
              @click="openTeacherDialog"
            />
          </div>
          <ErrorMessage name="teacherId" class="text-xs text-red-400" />
        </div>
      </Field>

      <Field v-slot="{ field, errorMessage }" name="name" rules="required">
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium">اسم المنتج</label>
          <InputText
            v-bind="field"
            v-model="form.name"
            class="w-full"
            :class="{ 'p-invalid': errorMessage || fieldErrors.name }"
          />
          <ErrorMessage name="name" class="text-xs text-red-400" />
        </div>
      </Field>

      <Field
        v-slot="{ errorMessage }"
        v-model="form.purchasePrice"
        name="purchasePrice"
        rules="required|min_value:0.01"
      >
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium">سعر الشراء / الجملة</label>
          <AppInputNumber
            v-model="form.purchasePrice"
            mode="currency"
            currency="EGP"
            :min="0"
            :min-fraction-digits="2"
            :use-grouping="true"
            :invalid="!!(errorMessage || fieldErrors.purchasePrice)"
          />
          <ErrorMessage name="purchasePrice" class="text-xs text-red-400" />
        </div>
      </Field>

      <Field
        v-slot="{ errorMessage }"
        v-model="form.sellingPrice"
        name="sellingPrice"
        rules="required|min_value:0.01"
      >
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium">سعر البيع</label>
          <AppInputNumber
            v-model="form.sellingPrice"
            mode="currency"
            currency="EGP"
            :min="0"
            :min-fraction-digits="2"
            :use-grouping="true"
            :invalid="!!(errorMessage || fieldErrors.sellingPrice)"
          />
          <ErrorMessage name="sellingPrice" class="text-xs text-red-400" />
        </div>
      </Field>

      <Field
        v-slot="{ errorMessage }"
        v-model="form.minStockQuantity"
        name="minStockQuantity"
        label="حد تنبيه المخزون"
        rules="min_value:0"
      >
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium">حد تنبيه المخزون</label>
          <AppInputNumber
            v-model="form.minStockQuantity"
            :min="0"
            :min-fraction-digits="0"
            :max-fraction-digits="0"
            :use-grouping="false"
            :invalid="!!(errorMessage || fieldErrors.minStockQuantity)"
          />
          <p class="text-xs text-slate-500">
            عند وصول كمية المخزون لهذا الرقم أو أقل، سيتم إرسال تنبيه بنقص المخزون.
          </p>
          <ErrorMessage name="minStockQuantity" class="text-xs text-red-400" />
        </div>
      </Field>

      <div class="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 text-right">
        نسبة الربح المحسوبة:
        <span class="font-semibold text-slate-900">{{ profitPercentage }}%</span>
      </div>

      <div class="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3">
        <div class="text-right">
          <p class="text-sm font-medium text-slate-800">السماح بالحجز</p>
          <p class="text-xs text-slate-500">تفعيل إمكانية حجز هذا المنتج</p>
        </div>
        <ToggleSwitch v-model="form.reservationAllowed" />
      </div>

      <Field
        v-if="form.reservationAllowed"
        v-slot="{ errorMessage }"
        v-model="form.reservationPrice"
        name="reservationPrice"
        rules="min_value:0.01"
      >
        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium">سعر الحجز (اختياري)</label>
          <AppInputNumber
            v-model="form.reservationPrice"
            mode="currency"
            currency="EGP"
            :min="0"
            :min-fraction-digits="2"
            :use-grouping="true"
            :invalid="!!(errorMessage || fieldErrors.reservationPrice)"
          />
          <ErrorMessage name="reservationPrice" class="text-xs text-red-400" />
        </div>
      </Field>

      <div class="flex justify-end gap-2 pt-2">
        <Button type="button" label="إلغاء" severity="secondary" text @click="$emit('cancel')" />
        <Button
          type="submit"
          :label="isEdit ? 'تحديث المنتج' : 'حفظ المنتج'"
          :loading="saving"
          severity="info"
        />
      </div>
    </Form>

    <Dialog
      v-model:visible="showTeacherDialog"
      header="إضافة مدرس"
      modal
      class="w-full max-w-md"
      dir="rtl"
    >
      <Form :initial-values="{ teacherName: '' }" class="space-y-4" @submit="submitTeacher">
        <Field v-slot="{ field, errorMessage }" name="teacherName" rules="required">
          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium">اسم المدرس</label>
            <InputText
              v-bind="field"
              v-model="teacherName"
              class="w-full"
              :class="{ 'p-invalid': errorMessage }"
            />
            <ErrorMessage name="teacherName" class="text-xs text-red-400" />
          </div>
        </Field>

        <p v-if="teacherError" class="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          {{ teacherError }}
        </p>

        <div class="flex justify-end gap-2">
          <Button type="button" label="إلغاء" severity="secondary" text @click="showTeacherDialog = false" />
          <Button type="submit" label="حفظ المدرس" :loading="savingTeacher" severity="info" />
        </div>
      </Form>
    </Dialog>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Dialog from "primevue/dialog";
import ToggleSwitch from "primevue/toggleswitch";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { productService } from "~/services/productService";
import { teacherService } from "~/services/teacherService";
import { studyYearService } from "~/services/studyYearService";
import { useAppToast } from "~/composables/useAppToast";

const { showError } = useAppToast();

const props = defineProps({
  product: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const savingTeacher = ref(false);
const loadingLookups = ref(false);
const showTeacherDialog = ref(false);
const teacherName = ref("");
const teacherError = ref("");
const teacherOptions = ref([]);
const studyYearOptions = ref([]);
const typeOptions = [
  { label: "كتاب", value: "BOOK" },
  { label: "كارت", value: "CARD" },
];

const emptyForm = () => ({
  type: "BOOK",
  teacherId: "",
  studyYearId: "",
  name: "",
  purchasePrice: null,
  sellingPrice: null,
  minStockQuantity: null,
  reservationAllowed: false,
  reservationPrice: null,
});

const form = reactive(emptyForm());
const initialValues = reactive(emptyForm());
const formKey = ref(0);

const isEdit = computed(() => Boolean(props.product?.id));
const isBook = computed(() => form.type === "BOOK");

const profitPercentage = computed(() => {
  const purchase = Number(form.purchasePrice || 0);
  const selling = Number(form.sellingPrice || 0);
  if (!purchase || purchase <= 0) return "0.00";
  return (((selling - purchase) / purchase) * 100).toFixed(2);
});

const toNumber = (value) => {
  if (value == null || value === "") return null;
  return Number(value);
};

const applyProduct = (product) => {
  const next = {
    type: product?.type || "BOOK",
    teacherId: product?.teacherId || product?.teacher?.id || "",
    studyYearId: product?.studyYearId || product?.studyYear?.id || "",
    name: product?.name || "",
    purchasePrice: toNumber(product?.purchasePrice),
    sellingPrice: toNumber(product?.sellingPrice),
    minStockQuantity: toNumber(
      product?.minStockQuantity ?? product?.min_stock_quantity,
    ),
    reservationAllowed: Boolean(product?.reservationAllowed),
    reservationPrice: toNumber(product?.reservationPrice),
  };

  Object.assign(form, next);
  Object.assign(initialValues, next);
  formKey.value += 1;
};

watch(
  () => props.product,
  (product) => {
    applyProduct(product);
  },
  { immediate: true },
);

watch(
  () => form.type,
  (type) => {
    if (type !== "BOOK") form.studyYearId = "";
  },
);

watch(
  () => form.reservationAllowed,
  (allowed) => {
    if (!allowed) form.reservationPrice = null;
  },
);

const loadTeachers = async () => {
  const teachers = await teacherService.getTeachers();
  const list = Array.isArray(teachers) ? teachers : teachers?.data || [];
  teacherOptions.value = list
    .filter((teacher) => teacher.status !== "INACTIVE")
    .map((teacher) => ({
      label: teacher.name || `مدرس ${teacher.id}`,
      value: teacher.id,
    }));
};

const loadStudyYears = async () => {
  const years = await studyYearService.getStudyYears();
  const list = Array.isArray(years) ? years : years?.data || [];
  studyYearOptions.value = list.map((year) => ({
    label: year.name,
    value: year.id,
  }));
};

const loadLookups = async () => {
  loadingLookups.value = true;
  try {
    await Promise.all([loadTeachers(), loadStudyYears()]);
  } catch (error) {
    showError(error?.message || "تعذر تحميل بيانات النموذج.");
  } finally {
    loadingLookups.value = false;
  }
};

const openTeacherDialog = () => {
  teacherName.value = "";
  teacherError.value = "";
  showTeacherDialog.value = true;
};

const submitTeacher = async () => {
  savingTeacher.value = true;
  teacherError.value = "";

  try {
    const created = await teacherService.createTeacher({ name: teacherName.value.trim() });
    if (!created?.id) throw new Error("تعذر إنشاء المدرس.");

    teacherOptions.value = [
      { label: created.name || teacherName.value, value: created.id },
      ...teacherOptions.value.filter((item) => item.value !== created.id),
    ];
    form.teacherId = created.id;
    teacherName.value = "";
    showTeacherDialog.value = false;
  } catch (error) {
    teacherError.value = error?.message || "تعذر إضافة المدرس.";
  } finally {
    savingTeacher.value = false;
  }
};

const buildPayload = () => {
  const payload = {
    type: form.type,
    teacherId: form.teacherId,
    name: form.name.trim(),
    purchasePrice: form.purchasePrice,
    sellingPrice: form.sellingPrice,
    profitPercentage: Number(profitPercentage.value),
    reservationAllowed: form.reservationAllowed,
    minStockQuantity:
      form.minStockQuantity == null ? null : Number(form.minStockQuantity),
  };

  if (isBook.value) {
    payload.studyYearId = form.studyYearId;
  } else if (isEdit.value) {
    payload.studyYearId = null;
  }

  if (form.reservationAllowed && form.reservationPrice != null) {
    payload.reservationPrice = form.reservationPrice;
  } else if (isEdit.value) {
    payload.reservationPrice = null;
  }

  return payload;
};

const submit = async () => {
  saving.value = true;

  try {
    if (isBook.value && !form.studyYearId) {
      throw new Error("السنة الدراسية مطلوبة للكتب.");
    }

    const payload = buildPayload();
    const result = isEdit.value
      ? await productService.updateProduct(props.product.id, payload)
      : await productService.createProduct(payload);

    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر حفظ المنتج.");
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadLookups();
});
</script>

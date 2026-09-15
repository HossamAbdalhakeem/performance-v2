<template>
  <div class="space-y-4" dir="rtl">
    <div v-if="showHeader" class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-xl font-bold text-slate-900">{{ title }}</h2>
      <NuxtLink
        v-if="backTo"
        :to="backTo"
        class="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
      >
        ← رجوع للكتب
      </NuxtLink>
    </div>

    <div
      v-if="showHint"
      class="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-center text-sm text-emerald-700"
    >
      يتم تسجيل الحجز ويظهر رقم حجز للطالب
    </div>

    <p
      v-if="feedback.message && feedback.type === 'error'"
      class="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600"
    >
      {{ feedback.message }}
    </p>

    <div class="grid gap-4">
      <Form
        v-slot="{ errors: fieldErrors, setFieldValue }"
        :key="formKey"
        :initial-values="formInitialValues"
        class="grid gap-4 md:grid-cols-2"
        @submit="handleSubmit"
      >
        <Field
          v-slot="{ errorMessage }"
          v-model="form.studentName"
          name="studentName"
          label="اسم الطالب"
          rules="required"
        >
          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">اسم الطالب</label>
            <AutoComplete
              v-model="form.studentName"
              :suggestions="nameSuggestions"
              optionLabel="name"
              dropdown
              :forceSelection="false"
              :loading="searchingStudents"
              placeholder="اكتب أو ابحث باسم الطالب"
              class="w-full"
              input-class="w-full"
              :invalid="!!(errorMessage || fieldErrors.studentName)"
              @complete="onNameComplete"
              @item-select="(event) => onStudentPicked(event.value, setFieldValue)"
              @update:modelValue="(value) => onNameTyped(value, setFieldValue)"
            >
              <template #option="{ option }">
                <div class="flex w-full items-center justify-between gap-3 text-right">
                  <span>{{ option.name }}</span>
                  <span class="text-xs text-slate-400">{{ option.phone || "بدون رقم" }}</span>
                </div>
              </template>
            </AutoComplete>
            <ErrorMessage name="studentName" class="text-xs text-red-500" />
          </div>
        </Field>

        <Field
          v-slot="{ errorMessage }"
          v-model="form.studentPhone"
          name="studentPhone"
          label="رقم الهاتف"
          rules="required"
        >
          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">رقم الهاتف</label>
            <AutoComplete
              v-model="form.studentPhone"
              :suggestions="phoneSuggestions"
              optionLabel="phone"
              dropdown
              :forceSelection="false"
              :loading="searchingStudents"
              placeholder="اكتب أو ابحث برقم الهاتف"
              class="w-full"
              input-class="w-full"
              :invalid="!!(errorMessage || fieldErrors.studentPhone)"
              @complete="onPhoneComplete"
              @item-select="(event) => onStudentPicked(event.value, setFieldValue)"
              @update:modelValue="(value) => onPhoneTyped(value, setFieldValue)"
            >
              <template #option="{ option }">
                <div class="flex w-full items-center justify-between gap-3 text-right">
                  <span>{{ option.phone || "بدون رقم" }}</span>
                  <span class="text-xs text-slate-400">{{ option.name }}</span>
                </div>
              </template>
            </AutoComplete>
            <ErrorMessage name="studentPhone" class="text-xs text-red-500" />
          </div>
        </Field>

        <div
          class="md:col-span-2 grid gap-4"
          :class="isCustomerService ? 'md:grid-cols-2' : 'md:grid-cols-1'"
        >
          <Field
            v-slot="{ errorMessage }"
            v-model="form.productId"
            name="productId"
            label="المنتج"
            rules="required"
          >
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">المنتج</label>
              <Select
                v-model="form.productId"
                :options="productOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="اختر المنتج"
                filter
                :filter-fields="['name', 'teacherName', 'label']"
                class="w-full product-select"
                :class="{ 'p-invalid': errorMessage || fieldErrors.productId }"
              >
                <template #value="{ placeholder }">
                  <div v-if="selectedProductOption" class="w-full py-0.5 text-right">
                    <div class="flex items-start justify-between gap-3">
                      <span class="font-medium text-slate-100">{{ selectedProductOption.name }}</span>
                      <span class="shrink-0 text-sm text-sky-300">
                        سعره {{ selectedProductOption.priceLabel }}
                      </span>
                    </div>
                    <p class="mt-0.5 text-xs text-slate-400">
                      مقدم من أ/ {{ selectedProductOption.teacherName || "-" }}
                    </p>
                  </div>
                  <span v-else>{{ placeholder }}</span>
                </template>
                <template #option="{ option }">
                  <div class="w-full py-1 text-right">
                    <div class="flex items-start justify-between gap-3">
                      <span class="font-medium">{{ option.name }}</span>
                      <span class="shrink-0 text-sm text-sky-300">سعره {{ option.priceLabel }}</span>
                    </div>
                    <p class="mt-0.5 text-xs text-slate-400">
                      مقدم من أ/ {{ option.teacherName || "-" }}
                    </p>
                  </div>
                </template>
              </Select>
              <ErrorMessage name="productId" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field
            v-if="isCustomerService"
            v-slot="{ errorMessage }"
            v-model="form.branchId"
            name="branchId"
            label="الفرع"
            rules="required"
          >
            <div class="flex h-full flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">اختيار الفرع</label>
              <Select
                v-model="form.branchId"
                :options="branchOptions"
                option-label="label"
                option-value="value"
                placeholder="اختر الفرع"
                filter
                class="w-full"
                :class="{ 'p-invalid': errorMessage || fieldErrors.branchId }"
              />
              <ErrorMessage name="branchId" class="text-xs text-red-500" />
            </div>
          </Field>
        </div>

        <div
          v-if="selectedProductOption"
          class="md:col-span-2 rounded-2xl border border-amber-400/40 bg-gradient-to-l from-amber-500/20 via-orange-500/10 to-slate-900 px-6 py-8 text-center"
        >
          <p class="mb-2 text-sm font-medium text-amber-100/80">مبلغ المنتج</p>
          <p class="text-4xl font-extrabold tracking-tight text-amber-300 md:text-5xl">
            {{ formatMoney(productPrice) }}
          </p>
        </div>

        <Field
          v-slot="{ errorMessage }"
          v-model="form.amount"
          name="amount"
          label="المبلغ المدفوع مقدما"
          rules="required|min_value:1"
        >
          <div class="md:col-span-2 flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">المبلغ المدفوع (مقدم)</label>
            <AppInputNumber
              v-model="form.amount"
              mode="currency"
              currency="EGP"
              :min="1"
              :min-fraction-digits="2"
              :use-grouping="true"
              :invalid="!!(errorMessage || fieldErrors.amount)"
            />
            <ErrorMessage name="amount" class="text-xs text-red-500" />
          </div>
        </Field>

        <div class="md:col-span-2">
          <Field
            v-slot="{ errorMessage }"
            v-model="form.paymentMethod"
            name="paymentMethod"
            rules="required"
          >
            <PaymentFields
              v-model:method="form.paymentMethod"
              v-model:image="proofFile"
              v-model:image-data-url="proofDataUrl"
              :exclude="paymentExclude"
              show-image-when="always"
              require-image-when="never"
              image-label="إرفاق صورة التحويل (اختياري)"
              image-placeholder="اضغط لرفع الصورة"
              :method-invalid="!!errorMessage"
              :method-error="errorMessage || ''"
            />
          </Field>
        </div>

        <div class="md:col-span-2 flex justify-center">
          <Button
            type="submit"
            :label="submitLabel"
            :loading="saving"
            severity="info"
            class="min-w-[220px]"
          />
        </div>
      </Form>
    </div>

    <Dialog
      v-model:visible="successDialogVisible"
      modal
      dir="rtl"
      :closable="false"
      :dismissableMask="false"
      :closeOnEscape="false"
      :style="{ width: '400px', maxWidth: '95vw' }"
      :pt="{
        header: { class: 'hidden' },
        content: { class: 'pt-6' },
      }"
    >
      <div class="flex flex-col items-center justify-center text-center">
        <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white">
          ✓
        </div>
        <p class="text-base font-bold text-slate-900">تم تسجيل الحجز بنجاح</p>
        <template v-if="showReceipt && receiptCode">
          <p class="mt-4 text-xs text-slate-500">رقم الحجز</p>
          <div class="mt-2 rounded-xl bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-700">
            {{ receiptCode }}
          </div>
          <p class="mt-3 text-xs text-slate-500">احتفظ برقم الحجز لتسليم الكتاب لاحقًا</p>
        </template>
      </div>

      <template #footer>
        <div class="flex w-full justify-center">
          <Button
            label="إغلاق"
            severity="secondary"
            class="min-w-[120px]"
            @click="closeSuccessDialog"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import AutoComplete from "primevue/autocomplete";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { productService } from "~/services/productService";
import { studentService } from "~/services/studentService";
import { branchService } from "~/services/branchService";
import { useThrottledCallback } from "~/composables/useThrottledCallback";

const props = defineProps({
  title: { type: String, default: "احجز كتاب" },
  submitLabel: { type: String, default: "تأكيد الحجز" },
  showHeader: { type: Boolean, default: false },
  showHint: { type: Boolean, default: false },
  showReceipt: { type: Boolean, default: false },
  backTo: { type: String, default: "" },
  initialProduct: { type: [String, Number], default: "" },
  /** API role e.g. CUSTOMER_SERVICE, or dashboard role "social" */
  role: { type: String, default: "" },
  submitFn: { type: Function, required: true },
});

const isCustomerService = computed(() => {
  const role = String(props.role || "").toUpperCase();
  return role === "CUSTOMER_SERVICE" || role === "SOCIAL" || role === "CUSTOMER-SERVICE";
});

const saving = ref(false);
const formKey = ref(0);
const receiptCode = ref("");
const successDialogVisible = ref(false);
const proofFile = ref(null);
const proofDataUrl = ref("");
const searchingStudents = ref(false);
const nameSuggestions = ref([]);
const phoneSuggestions = ref([]);
const selectedStudent = ref(null);
const products = ref([]);
const branches = ref([]);
const feedback = reactive({ type: "success", message: "" });

const paymentExclude = computed(() =>
  isCustomerService.value ? ["CASH"] : [],
);

const defaultPaymentMethod = computed(() =>
  isCustomerService.value ? "INSTAPAY" : "CASH",
);

const form = reactive({
  studentName: "",
  studentPhone: "",
  branchId: null,
  productId: props.initialProduct || null,
  amount: null,
  paymentMethod: defaultPaymentMethod.value,
});

const formInitialValues = computed(() => ({
  studentName: "",
  studentPhone: "",
  branchId: null,
  productId: props.initialProduct || null,
  amount: null,
  paymentMethod: defaultPaymentMethod.value,
}));

const branchOptions = computed(() =>
  branches.value.map((branch) => ({
    label: branch.name || branch.id,
    value: branch.id,
  })),
);

const productOptions = computed(() =>
  products.value.map((product) => {
    const teacherName =
      product.teacher?.name || product.teacherName || product.teacher_name || "";
    const priceLabel = `${Number(product.sellingPrice || product.selling_price || 0).toFixed(2)}ج.م`;
    const name = product.name || product.title || "-";

    return {
      name,
      teacherName,
      priceLabel,
      teacherId: product.teacherId || product.teacher_id || product.teacher?.id || "",
      label: `${name} سعره ${priceLabel} مقدم من أ/ ${teacherName || "-"}`,
      value: product.id,
      sellingPrice: Number(product.sellingPrice || product.selling_price || 0),
    };
  }),
);

const selectedProductOption = computed(() =>
  productOptions.value.find((option) => option.value === form.productId) || null,
);

const productPrice = computed(() => Number(selectedProductOption.value?.sellingPrice || 0));

const formatMoney = (value) => `\u2066${Number(value || 0).toFixed(2)} ج.م\u2069`;

const normalizeStudent = (student) => ({
  id: student.id,
  name: student.name || "",
  phone: student.phone || "",
});

const asText = (value, key = "") => {
  if (value == null) return "";
  if (typeof value === "object") {
    if (key && value[key] != null) return String(value[key]).trim();
    return "";
  }
  return String(value).trim();
};

const loadProducts = async () => {
  const items = await productService.getProducts();
  const list = Array.isArray(items) ? items : items?.data || [];
  products.value = list.filter((product) => product.status !== "INACTIVE");
};

const loadBranches = async () => {
  if (!isCustomerService.value) {
    branches.value = [];
    return;
  }

  const items = await branchService.getBranches();
  const list = Array.isArray(items) ? items : items?.data || [];
  branches.value = list.filter((branch) => branch.status !== "INACTIVE");
};

const searchStudents = async (term = "") => {
  searchingStudents.value = true;
  try {
    const items = await studentService.searchStudents(term);
    return (items || []).map(normalizeStudent);
  } catch (error) {
    console.error("Failed to search students", error);
    return [];
  } finally {
    searchingStudents.value = false;
  }
};

const { run: runNameSearch } = useThrottledCallback(async (term) => {
  nameSuggestions.value = await searchStudents(term);
}, 350);

const { run: runPhoneSearch } = useThrottledCallback(async (term) => {
  phoneSuggestions.value = await searchStudents(term);
}, 350);

const onNameComplete = (event) => {
  runNameSearch(event.query || "");
};

const onPhoneComplete = (event) => {
  runPhoneSearch(event.query || "");
};

const onStudentPicked = (student, setFieldValue) => {
  if (!student || typeof student === "string") return;

  const name = String(student.name || "").trim();
  const phone = String(student.phone || "").trim();

  selectedStudent.value = { id: student.id || null, name, phone };
  form.studentName = name;
  form.studentPhone = phone;
  setFieldValue?.("studentName", name);
  setFieldValue?.("studentPhone", phone);

  nextTick(() => {
    form.studentName = name;
    form.studentPhone = phone;
  });
};

const onNameTyped = (value, setFieldValue) => {
  if (value && typeof value === "object") {
    onStudentPicked(value, setFieldValue);
    return;
  }

  const text = String(value || "");
  form.studentName = text;
  if (!selectedStudent.value || text.trim() !== selectedStudent.value.name) {
    selectedStudent.value = null;
  }
  setFieldValue?.("studentName", text);
};

const onPhoneTyped = (value, setFieldValue) => {
  if (value && typeof value === "object") {
    onStudentPicked(value, setFieldValue);
    return;
  }

  const text = String(value || "");
  form.studentPhone = text;
  if (!selectedStudent.value || text.trim() !== selectedStudent.value.phone) {
    selectedStudent.value = null;
  }
  setFieldValue?.("studentPhone", text);
};

const ensureStudent = async () => {
  const name = asText(form.studentName, "name");
  const phone = asText(form.studentPhone, "phone");

  form.studentName = name;
  form.studentPhone = phone;

  if (!name || !phone) {
    throw new Error("اسم الطالب ورقم الهاتف مطلوبان.");
  }

  const picked = selectedStudent.value;
  if (picked?.id && picked.name === name && picked.phone === phone) {
    return picked.id;
  }

  selectedStudent.value = null;

  const matches = await studentService.searchStudents(phone);
  const existing = (matches || []).find(
    (student) => String(student.phone || "").trim() === phone,
  );

  if (existing?.id) {
    selectedStudent.value = normalizeStudent(existing);
    return existing.id;
  }

  const created = await studentService.createStudent({ name, phone });
  if (!created?.id) {
    throw new Error("تعذر إضافة الطالب الجديد.");
  }

  selectedStudent.value = normalizeStudent(created);
  return created.id;
};

const clearProof = () => {
  proofFile.value = null;
  proofDataUrl.value = "";
};

const resetForm = () => {
  Object.assign(form, {
    studentName: "",
    studentPhone: "",
    branchId: null,
    productId: props.initialProduct || null,
    amount: null,
    paymentMethod: defaultPaymentMethod.value,
  });
  selectedStudent.value = null;
  nameSuggestions.value = [];
  phoneSuggestions.value = [];
  clearProof();
  formKey.value += 1;
};

const closeSuccessDialog = () => {
  successDialogVisible.value = false;
  receiptCode.value = "";
  feedback.message = "";
};

const handleSubmit = async () => {
  feedback.message = "";
  saving.value = true;

  try {
    if (isCustomerService.value && !form.branchId) {
      throw new Error("اختيار الفرع مطلوب.");
    }

    const studentId = await ensureStudent();
    const product = selectedProductOption.value;

    const result = await props.submitFn({
      teacher_id: product?.teacherId || "",
      product_id: form.productId,
      productId: form.productId,
      studentId,
      student_id: studentId,
      student_name: form.studentName,
      phone: form.studentPhone,
      amount: form.amount,
      paid_amount: form.amount,
      deposit: form.amount,
      payment_method: form.paymentMethod,
      method: form.paymentMethod,
      branchId: form.branchId || undefined,
      branch_id: form.branchId || undefined,
      receipt_image: proofDataUrl.value || null,
      proofReference: proofDataUrl.value || undefined,
      quantity: 1,
    });

    receiptCode.value =
      result?.reservation_number ||
      result?.reservationNumber ||
      result?.code ||
      result?.id ||
      "";

    feedback.type = "success";
    feedback.message = "تم تسجيل الحجز بنجاح.";
    successDialogVisible.value = true;
    resetForm();
  } catch (error) {
    feedback.type = "error";
    feedback.message = error?.message || "تعذر تسجيل الحجز.";
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.initialProduct,
  (value) => {
    if (value) form.productId = value;
  },
);

watch(isCustomerService, (value) => {
  if (value && form.paymentMethod === "CASH") {
    form.paymentMethod = defaultPaymentMethod.value;
  }
  if (!value) {
    form.branchId = null;
  }
});

onMounted(async () => {
  try {
    await Promise.all([loadProducts(), loadBranches()]);
    if (props.initialProduct) form.productId = props.initialProduct;
    if (isCustomerService.value && form.paymentMethod === "CASH") {
      form.paymentMethod = defaultPaymentMethod.value;
    }
  } catch (error) {
    feedback.type = "error";
    feedback.message = error?.message || "تعذر تحميل بيانات الحجز.";
  }
});
</script>

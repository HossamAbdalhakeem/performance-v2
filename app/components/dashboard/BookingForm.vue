<template>
  <div class="space-y-4" dir="rtl">
    <div
      v-if="showHeader"
      class="flex flex-wrap items-center justify-between gap-3"
    >
      <h2
        class="text-xl font-bold"
        :class="isCustomerService ? 'text-white' : 'text-slate-900'"
      >
        {{ title }}
      </h2>
      <NuxtLink
        v-if="backTo"
        :to="backTo"
        class="rounded-xl border px-4 py-2 text-sm transition"
        :class="
          isCustomerService
            ? 'border-white/10 text-slate-300 hover:bg-white/5'
            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
        "
      >
        ← رجوع للكتب
      </NuxtLink>
    </div>

    <div class="grid gap-4">
      <Form
        v-slot="{ errors: fieldErrors, setFieldValue, meta }"
        :key="formKey"
        :initial-values="formInitialValues"
        class="grid gap-4 md:grid-cols-2"
        @submit="handleSubmit"
      >
        <Field
          v-slot="{ errorMessage }"
          class="md:col-span-2"
          name="studentId"
          :rules="validateStudentSelection"
        >
          <div class="flex flex-col gap-2 text-right">
            <StudentSearchField
              v-model="selectedStudent"
              :variant="isCustomerService ? 'dark' : 'default'"
              :label-class="
                isCustomerService ? 'text-slate-200' : 'text-slate-700'
              "
              :invalid="!!(errorMessage || fieldErrors.studentId)"
              @select="(student) => applyStudent(student, setFieldValue)"
              @created="(student) => applyStudent(student, setFieldValue)"
              @clear="() => clearStudent(setFieldValue)"
            />
            <ErrorMessage name="studentId" class="text-xs text-red-500" />
          </div>
        </Field>

        <div
          class="md:col-span-2 grid gap-4"
          :class="isCustomerService ? 'md:grid-cols-2' : 'md:grid-cols-1'"
        >
          <Field
            v-if="isCustomerService"
            v-slot="{ errorMessage }"
            v-model="form.branchId"
            name="branchId"
            label="الفرع"
            rules="required"
          >
            <div class="flex h-full flex-col gap-2 text-right">
              <AppGlobalSelectBranch
                v-model="form.branchId"
                label="اختيار الفرع"
                placeholder="اختر الفرع"
                :invalid="!!(errorMessage || fieldErrors.branchId)"
                @change="onBranchChange"
              />
              <ErrorMessage name="branchId" class="text-xs text-red-500" />
            </div>
          </Field>
          <Field
            v-slot="{ errorMessage }"
            v-model="form.productId"
            name="productId"
            label="المنتج"
            rules="required"
          >
            <div class="flex flex-col gap-2 text-right">
              <ProductSelect
                v-model="form.productId"
                :options="productOptions"
                :loading="loadingProducts"
                :disabled="!resolvedBranchId"
                :invalid="!!(errorMessage || fieldErrors.productId)"
                :hint="
                  !resolvedBranchId
                    ? isCustomerService
                      ? 'اختر الفرع أولاً لعرض منتجات الحجز.'
                      : 'لا يوجد فرع مرتبط بالمستخدم الحالي.'
                    : ''
                "
                @search="onProductSearch"
              />
              <ErrorMessage name="productId" class="text-xs text-red-500" />
            </div>
          </Field>
        </div>

        <div
          v-if="selectedProductOption"
          class="md:col-span-2 rounded-2xl border border-amber-400/40 bg-gradient-to-l from-amber-500/20 via-orange-500/10 to-slate-900 px-6 py-8 text-center"
        >
          <p class="mb-2 text-sm font-medium text-amber-100/80">
            {{ selectedProductOption.priceKindLabel || "مبلغ المنتج" }}
          </p>
          <p
            class="text-4xl font-extrabold tracking-tight text-amber-300 md:text-5xl"
          >
            {{ formatMoney(productDisplayPrice, "rtl") }}
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
            <div class="flex items-center justify-between gap-2">
              <label class="text-sm font-medium text-slate-700"
                >المبلغ المدفوع (مقدم)</label
              >
              <span
                v-if="productDepositCap > 0"
                class="text-xs font-medium text-slate-500"
              >
                الحد الأقصى: {{ formatMoney(productDepositCap, "rtl") }}
              </span>
            </div>
            <AppInputNumber
              v-model="form.amount"
              mode="currency"
              currency="EGP"
              :min="1"
              :max="productDepositCap > 0 ? productDepositCap : undefined"
              :min-fraction-digits="2"
              :use-grouping="true"
              :invalid="!!(errorMessage || fieldErrors.amount || amountError)"
            />
            <p v-if="amountError" class="text-xs text-red-500">
              {{ amountError }}
            </p>
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
              ref="paymentFieldsRef"
              v-model:method="form.paymentMethod"
              v-model:image="proofFile"
              v-model:image-data-url="proofKey"
              v-model:image-preview-url="proofPreviewUrl"
              :exclude="paymentExclude"
              :method-invalid="!!errorMessage"
              :method-error="errorMessage || ''"
              :image-invalid="proofRequiredError"
            />
          </Field>
        </div>

        <div class="md:col-span-2 flex justify-center">
          <FormSubmitButton
            :label="submitLabel"
            :loading="saving"
            :valid="meta.valid"
            button-class="min-w-[220px]"
          />
        </div>
      </Form>
    </div>

    <ReservationSuccessDialog
      v-if="successDialogVisible"
      v-model:visible="successDialogVisible"
      :summary="reservationSummary"
      @close="closeSuccessDialog"
    />
  </div>
</template>

<script setup>
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import ProductSelect from "~/components/shared/product-select/index.vue";
import StudentSearchField from "~/components/shared/student-search-field/index.vue";
import AppGlobalSelectBranch from "~/components/shared/app-global-select-branch/index.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { inventoryService } from "~/services/inventoryService";
import { mapInventoryProductOption } from "~/utils/productOptions";
import {
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  paymentMethodNeedsProof,
} from "~/utils/paymentMethods";
import { formatMoney, formatDateTime } from "~/utils/format";
import { useAuthStore } from "~/store/auth";
import { useAppToast } from "~/composables/useAppToast";
import { useThrottledCallback } from "~/composables/useThrottledCallback";

defineOptions({ name: "DashboardBookingForm" });

const ReservationSuccessDialog = defineAsyncComponent(
  () => import("~/components/dashboard/ReservationSuccessDialog.vue"),
);

const props = defineProps({
  title: { type: String, default: "احجز كتاب" },
  submitLabel: { type: String, default: "تأكيد الحجز" },
  showHeader: { type: Boolean, default: false },
  showReceipt: { type: Boolean, default: false },
  backTo: { type: String, default: "" },
  initialProduct: { type: [String, Number], default: "" },
  /** API role e.g. CUSTOMER_SERVICE, or dashboard role "social" */
  role: { type: String, default: "" },
  submitFn: { type: Function, required: true },
});

const { showError } = useAppToast();
const authStore = useAuthStore();

const isCustomerService = computed(() => {
  const role = String(props.role || "").toUpperCase();
  return (
    role === "CUSTOMER_SERVICE" ||
    role === "SOCIAL" ||
    role === "CUSTOMER-SERVICE"
  );
});

const employeeBranchId = computed(
  () =>
    authStore.user?.branch_id ||
    authStore.user?.branchId ||
    authStore.user?.branches?.[0]?.id ||
    null,
);

const saving = ref(false);
const loadingProducts = ref(false);
const formKey = ref(0);
const receiptCode = ref("");
const reservationSummary = ref(null);
const successDialogVisible = ref(false);
const proofFile = ref(null);
const proofKey = ref("");
const proofPreviewUrl = ref("");
const proofRequiredError = ref(false);
const paymentFieldsRef = ref(null);
const selectedStudent = ref(null);
const inventoryItems = ref([]);

const paymentExclude = computed(() =>
  isCustomerService.value ? [PaymentMethod.CASH] : [],
);

const defaultPaymentMethod = computed(() =>
  isCustomerService.value ? PaymentMethod.INSTAPAY : PaymentMethod.CASH,
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
  studentId: null,
  studentName: "",
  studentPhone: "",
  branchId: null,
  productId: props.initialProduct || null,
  amount: null,
  paymentMethod: defaultPaymentMethod.value,
}));

const resolvedBranchId = computed(() =>
  isCustomerService.value ? form.branchId : employeeBranchId.value,
);

const productOptions = computed(() =>
  inventoryItems.value.map(mapInventoryProductOption),
);

const selectedProductOption = computed(
  () =>
    productOptions.value.find((option) => option.value === form.productId) ||
    null,
);

/** Same amount shown in the product dropdown (selling or initial price) */
const productDisplayPrice = computed(() =>
  Number(selectedProductOption.value?.displayPrice || 0),
);

/** Deposit max = same displayed product price */
const productDepositCap = computed(() => productDisplayPrice.value);

/** @deprecated alias kept for existing watchers/submit logic */
const productPrice = productDepositCap;

const amountError = ref("");

const validateDepositAmount = () => {
  amountError.value = "";
  const paid = Number(form.amount || 0);
  const max = Number(productDepositCap.value || 0);

  if (!form.productId || max <= 0) {
    return true;
  }

  if (paid > max) {
    amountError.value = `لا يمكن دفع أكثر من سعر المنتج (${formatMoney(max, "rtl")}).`;
    return false;
  }

  return true;
};

const loadProducts = async (search = "") => {
  const branchId = resolvedBranchId.value;

  if (!branchId) {
    inventoryItems.value = [];
    return;
  }

  loadingProducts.value = true;
  try {
    const query = String(search || "").trim();
    const items = await inventoryService.getBranchInventory(branchId, {
      forReservation: true,
      ...(query ? { search: query } : {}),
    });
    inventoryItems.value = Array.isArray(items) ? items : items?.data || [];

    if (
      form.productId &&
      !inventoryItems.value.some(
        (item) =>
          (item.product?.id || item.productId || item.id) === form.productId,
      )
    ) {
      form.productId = props.initialProduct || null;
    }
  } finally {
    loadingProducts.value = false;
  }
};

const { run: onProductSearch } = useThrottledCallback((term) => {
  loadProducts(term);
}, 400);

const onBranchChange = async (value) => {
  form.branchId = value || null;
  form.productId = props.initialProduct || null;
  await loadProducts();
};

const validateStudentSelection = (value) => {
  if (value) return true;
  return "اختر طالباً من القائمة أو أضف طالباً جديداً.";
};

const applyStudent = (student, setFieldValue) => {
  selectedStudent.value = student;
  form.studentName = student.name;
  form.studentPhone = student.phone;
  setFieldValue?.("studentId", student.id);
  setFieldValue?.("studentName", student.name);
  setFieldValue?.("studentPhone", student.phone);
};

const clearStudent = (setFieldValue) => {
  selectedStudent.value = null;
  form.studentName = "";
  form.studentPhone = "";
  setFieldValue?.("studentId", null);
  setFieldValue?.("studentName", "");
  setFieldValue?.("studentPhone", "");
};

const ensureStudent = async () => {
  if (!selectedStudent.value?.id) {
    throw new Error("اختر طالباً من القائمة أو أضف طالباً جديداً.");
  }

  form.studentName = selectedStudent.value.name;
  form.studentPhone = selectedStudent.value.phone;
  return selectedStudent.value.id;
};

const clearProof = () => {
  proofFile.value = null;
  proofKey.value = "";
  proofPreviewUrl.value = "";
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
  clearProof();
  amountError.value = "";
  proofRequiredError.value = false;
  paymentFieldsRef.value?.reset?.();
  formKey.value += 1;
};

const closeSuccessDialog = () => {
  successDialogVisible.value = false;
  reservationSummary.value = null;
  receiptCode.value = "";
};

const handleSubmit = async () => {
  amountError.value = "";
  proofRequiredError.value = false;

  if (paymentFieldsRef.value && !paymentFieldsRef.value.validate()) {
    proofRequiredError.value = true;
    return;
  }

  if (!validateDepositAmount()) {
    return;
  }

  saving.value = true;

  try {
    if (isCustomerService.value && !form.branchId) {
      throw new Error("اختيار الفرع مطلوب.");
    }

    const studentId = await ensureStudent();
    const product = selectedProductOption.value;
    const method = form.paymentMethod;
    const needsProof = paymentMethodNeedsProof(method);
    const paidAmount = Number(form.amount || 0);

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
      payment_method: method,
      method,
      branchId: form.branchId || undefined,
      branch_id: form.branchId || undefined,
      receipt_image: needsProof ? proofPreviewUrl.value || null : null,
      proofReference: needsProof ? proofKey.value || undefined : undefined,
      quantity: 1,
    });

    const reservationNumber =
      result?.reservationNumber ||
      result?.reservation_number ||
      result?.code ||
      result?.id ||
      "";

    receiptCode.value = reservationNumber;

    reservationSummary.value = {
      reservationNumber,
      dateTimeLabel: formatDateTime(result?.createdAt || new Date()),
      productName: product?.name || result?.product?.name || "-",
      teacherName: product?.teacherName || result?.product?.teacher?.name || "",
      studyYearName:
        product?.studyYearName || result?.product?.studyYear?.name || "",
      studentName: form.studentName || result?.student?.name || "-",
      paidAmount: Number(result?.paidAmount ?? paidAmount),
      totalAmount: Number(
        result?.totalAmount ?? product?.sellingPrice ?? paidAmount,
      ),
      methodLabel: PAYMENT_METHOD_LABELS[method] || method,
      proofImage: needsProof ? proofPreviewUrl.value || "" : "",
    };

    successDialogVisible.value = true;
    resetForm();
  } catch (error) {
    showError(error?.message || "تعذر تسجيل الحجز.");
  } finally {
    saving.value = false;
  }
};

watch(
  () => form.productId,
  () => {
    amountError.value = "";
    if (
      form.amount != null &&
      productPrice.value > 0 &&
      Number(form.amount) > productPrice.value
    ) {
      form.amount = productPrice.value;
    }
  },
);

watch(
  () => form.amount,
  () => {
    if (form.productId && productPrice.value > 0) {
      validateDepositAmount();
    } else {
      amountError.value = "";
    }
  },
);

watch(
  () => props.initialProduct,
  (value) => {
    if (value) form.productId = value;
  },
);

watch(isCustomerService, async (value) => {
  if (value && form.paymentMethod === PaymentMethod.CASH) {
    form.paymentMethod = defaultPaymentMethod.value;
  }
  if (!value) {
    form.branchId = null;
  }
  await loadProducts();
});

onMounted(async () => {
  try {
    await loadProducts();
    if (props.initialProduct) form.productId = props.initialProduct;
    if (isCustomerService.value && form.paymentMethod === PaymentMethod.CASH) {
      form.paymentMethod = defaultPaymentMethod.value;
    }
  } catch (error) {
    showError(error?.message || "تعذر تحميل بيانات الحجز.");
  }
});
</script>

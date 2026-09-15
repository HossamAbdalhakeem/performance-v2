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
                :loading="loadingProducts"
                :disabled="!resolvedBranchId || loadingProducts"
                :filter-fields="['name', 'teacherName', 'label']"
                class="w-full product-select"
                :class="{ 'p-invalid': errorMessage || fieldErrors.productId }"
              >
                <template #value="{ placeholder }">
                  <div v-if="selectedProductOption" class="w-full py-0.5 text-right">
                    <div class="flex items-start justify-between gap-3">
                      <span class="font-medium text-slate-100">{{ selectedProductOption.name }}</span>
                      <span
                        class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                        :class="
                          selectedProductOption.isAvailable
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-200'
                        "
                      >
                        {{ selectedProductOption.availabilityLabel }}
                      </span>
                    </div>
                    <div class="mt-0.5 flex items-center justify-between gap-3">
                      <p class="text-xs text-slate-400">
                        مقدم من أ/ {{ selectedProductOption.teacherName || "-" }}
                      </p>
                      <span
                        v-if="selectedProductOption.priceLabel"
                        class="text-xs"
                        :class="
                          selectedProductOption.isSellingPrice
                            ? 'text-sky-300'
                            : 'text-amber-200'
                        "
                      >
                        {{ selectedProductOption.priceKindLabel }}
                        {{ selectedProductOption.priceLabel }}
                      </span>
                    </div>
                  </div>
                  <span v-else>{{ placeholder }}</span>
                </template>
                <template #option="{ option }">
                  <div class="w-full py-1 text-right">
                    <div class="flex items-start justify-between gap-3">
                      <span class="font-medium">{{ option.name }}</span>
                      <span
                        class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                        :class="
                          option.isAvailable
                            ? 'bg-emerald-500/15 text-emerald-700'
                            : 'bg-amber-500/15 text-amber-700'
                        "
                      >
                        {{ option.availabilityLabel }}
                      </span>
                    </div>
                    <div class="mt-0.5 flex items-center justify-between gap-3">
                      <p class="text-xs text-slate-400">
                        مقدم من أ/ {{ option.teacherName || "-" }}
                      </p>
                      <span
                        v-if="option.priceLabel"
                        class="shrink-0 text-sm"
                        :class="
                          option.isSellingPrice
                            ? 'text-sky-600'
                            : 'text-amber-700'
                        "
                        >{{ option.priceKindLabel }} {{ option.priceLabel }}</span
                      >
                    </div>
                  </div>
                </template>
              </Select>
              <small v-if="!resolvedBranchId" class="text-xs text-slate-400">
                {{
                  isCustomerService
                    ? "اختر الفرع أولاً لعرض منتجات الحجز."
                    : "لا يوجد فرع مرتبط بالمستخدم الحالي."
                }}
              </small>
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
                @update:model-value="onBranchChange"
              />
              <ErrorMessage name="branchId" class="text-xs text-red-500" />
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
          <p class="text-4xl font-extrabold tracking-tight text-amber-300 md:text-5xl">
            {{ formatMoney(productDisplayPrice) }}
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
              <label class="text-sm font-medium text-slate-700">المبلغ المدفوع (مقدم)</label>
              <span
                v-if="productDepositCap > 0"
                class="text-xs font-medium text-slate-500"
              >
                الحد الأقصى: {{ formatMoney(productDepositCap) }}
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
            <p v-if="amountError" class="text-xs text-red-500">{{ amountError }}</p>
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
      :style="{ width: '440px', maxWidth: '95vw' }"
      :pt="{
        header: { class: 'hidden' },
        content: { class: 'pt-6' },
      }"
    >
      <div v-if="reservationSummary" class="flex flex-col items-center text-center">
        <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white">
          ✓
        </div>
        <p class="text-base font-bold text-slate-900">تم تسجيل الحجز بنجاح</p>

        <div class="mt-5 w-full space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right">
          <div class="flex items-center justify-between gap-3">
            <span class="text-xs text-slate-500">رقم الحجز</span>
            <span class="text-xl font-extrabold tracking-wide text-emerald-700 break-all">
              {{ reservationSummary.reservationNumber }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <span class="text-xs text-slate-500">التاريخ والوقت</span>
            <span class="text-sm font-medium text-slate-800">
              {{ reservationSummary.dateTimeLabel }}
            </span>
          </div>

          <div class="flex items-start justify-between gap-3 border-t border-slate-200 pt-3">
            <span class="text-xs text-slate-500">المنتج</span>
            <div class="text-sm font-semibold text-slate-900">
              <p>{{ reservationSummary.productName }}</p>
              <p v-if="reservationSummary.teacherName" class="mt-0.5 text-xs font-normal text-slate-500">
                مقدم من أ/ {{ reservationSummary.teacherName }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <span class="text-xs text-slate-500">السنة الدراسية</span>
            <span class="text-sm font-medium text-slate-800">
              {{ reservationSummary.studyYearName || "-" }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <span class="text-xs text-slate-500">الطالب</span>
            <span class="text-sm font-medium text-slate-800">
              {{ reservationSummary.studentName }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <span class="text-xs text-slate-500">المبلغ المدفوع</span>
            <span class="text-sm font-medium text-slate-800">
              {{ formatMoney(reservationSummary.paidAmount) }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <span class="text-xs text-slate-500">طريقة الدفع</span>
            <span class="text-sm font-medium text-slate-800">
              {{ reservationSummary.methodLabel }}
            </span>
          </div>

          <div
            v-if="reservationSummary.proofImage"
            class="border-t border-slate-200 pt-3"
          >
            <p class="mb-2 text-xs text-slate-500">صورة إثبات الدفع</p>
            <img
              :src="reservationSummary.proofImage"
              alt="إثبات الدفع"
              class="mx-auto max-h-48 w-auto max-w-full rounded-xl border border-slate-200 object-contain"
            />
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-emerald-200 pt-3">
            <span class="text-sm font-semibold text-emerald-700">إجمالي الحجز</span>
            <span class="text-lg font-extrabold text-emerald-700">
              {{ formatMoney(reservationSummary.totalAmount) }}
            </span>
          </div>
        </div>

        <p class="mt-3 text-xs text-slate-500">احتفظ برقم الحجز لتسليم الكتاب لاحقًا</p>
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
import { inventoryService } from "~/services/inventoryService";
import { studentService } from "~/services/studentService";
import { branchService } from "~/services/branchService";
import { useAuthStore } from "~/store/auth";
import { useThrottledCallback } from "~/composables/useThrottledCallback";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "DashboardBookingForm" });

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

const METHOD_LABELS = {
  CASH: "كاش",
  INSTAPAY: "انستا باي",
  WALLET: "محفظة إلكترونية",
};

const { showError } = useAppToast();
const authStore = useAuthStore();

const isCustomerService = computed(() => {
  const role = String(props.role || "").toUpperCase();
  return role === "CUSTOMER_SERVICE" || role === "SOCIAL" || role === "CUSTOMER-SERVICE";
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
const searchingStudents = ref(false);
const nameSuggestions = ref([]);
const phoneSuggestions = ref([]);
const selectedStudent = ref(null);
const inventoryItems = ref([]);
const branches = ref([]);

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

const resolvedBranchId = computed(() =>
  isCustomerService.value ? form.branchId : employeeBranchId.value,
);

const branchOptions = computed(() =>
  branches.value.map((branch) => ({
    label: branch.name || branch.id,
    value: branch.id,
  })),
);

const toMoneyNumber = (value) => {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const productOptions = computed(() =>
  inventoryItems.value.map((item) => {
    const product = item.product || item;
    const teacherName =
      product.teacher?.name || product.teacherName || product.teacher_name || "";
    const availableQuantity = Number(
      item.availableQuantity ??
        Math.max(
          0,
          Number(item.physicalQuantity || 0) - Number(item.reservedQuantity || 0),
        ),
    );
    const isAvailable = availableQuantity > 0;
    const sellingPrice = toMoneyNumber(
      product.sellingPrice ?? product.selling_price,
    );
    const reservationPrice = toMoneyNumber(
      product.reservationPrice ?? product.reservation_price,
    );
    const hasSellingPrice = sellingPrice > 0;
    // Has selling price → label as سعر البيع (in stock or not).
    // Not available / no selling price → show reservation as سعر أولي.
    const isSellingPrice = hasSellingPrice;
    const priceKindLabel = isSellingPrice ? "سعر البيع" : "سعر أولي";
    const displayPrice = hasSellingPrice ? sellingPrice : reservationPrice;
    const priceLabel =
      displayPrice > 0 ? `${displayPrice.toFixed(2)}ج.م` : "";
    const name = product.name || product.title || "-";
    const availabilityLabel = isAvailable
      ? `متاح ${availableQuantity}`
      : "غير متاح";

    return {
      name,
      teacherName,
      studyYearName:
        product.studyYear?.name ||
        product.study_year?.name ||
        product.studyYearName ||
        "",
      priceLabel,
      priceKindLabel,
      isSellingPrice,
      displayPrice,
      availableQuantity,
      isAvailable,
      availabilityLabel,
      teacherId: product.teacherId || product.teacher_id || product.teacher?.id || "",
      label: priceLabel
        ? `${name} · ${availabilityLabel} · ${priceKindLabel} ${priceLabel}`
        : `${name} · ${availabilityLabel}`,
      value: product.id || item.productId,
      sellingPrice: displayPrice,
    };
  }),
);

const selectedProductOption = computed(() =>
  productOptions.value.find((option) => option.value === form.productId) || null,
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
    amountError.value = `لا يمكن دفع أكثر من سعر المنتج (${formatMoney(max)}).`;
    return false;
  }

  return true;
};

const formatMoney = (value) => `\u2066${Number(value || 0).toFixed(2)} ج.م\u2069`;

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

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
  const branchId = resolvedBranchId.value;
  inventoryItems.value = [];

  if (!branchId) return;

  loadingProducts.value = true;
  try {
    const items = await inventoryService.getBranchInventory(branchId, {
      forReservation: true,
    });
    inventoryItems.value = Array.isArray(items) ? items : items?.data || [];

    if (
      form.productId &&
      !inventoryItems.value.some(
        (item) => (item.product?.id || item.productId || item.id) === form.productId,
      )
    ) {
      form.productId = props.initialProduct || null;
    }
  } finally {
    loadingProducts.value = false;
  }
};

const onBranchChange = async (value) => {
  form.branchId = value || null;
  form.productId = props.initialProduct || null;
  await loadProducts();
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
  nameSuggestions.value = [];
  phoneSuggestions.value = [];
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
    const needsProof = method === "WALLET" || method === "INSTAPAY";
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
      teacherName:
        product?.teacherName ||
        result?.product?.teacher?.name ||
        "",
      studyYearName:
        product?.studyYearName ||
        result?.product?.studyYear?.name ||
        "",
      studentName: form.studentName || result?.student?.name || "-",
      paidAmount: Number(result?.paidAmount ?? paidAmount),
      totalAmount: Number(result?.totalAmount ?? product?.sellingPrice ?? paidAmount),
      methodLabel: METHOD_LABELS[method] || method,
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
  if (value && form.paymentMethod === "CASH") {
    form.paymentMethod = defaultPaymentMethod.value;
  }
  if (!value) {
    form.branchId = null;
  }
  await loadProducts();
});

onMounted(async () => {
  try {
    await loadBranches();
    await loadProducts();
    if (props.initialProduct) form.productId = props.initialProduct;
    if (isCustomerService.value && form.paymentMethod === "CASH") {
      form.paymentMethod = defaultPaymentMethod.value;
    }
  } catch (error) {
    showError(error?.message || "تعذر تحميل بيانات الحجز.");
  }
});
</script>

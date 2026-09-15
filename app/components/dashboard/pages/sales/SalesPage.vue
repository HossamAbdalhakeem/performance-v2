<template>
  <div class="space-y-6" dir="rtl">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">البيع المباشر</span>
      </template>

      <template #content>
        <Form
          v-slot="{ errors: fieldErrors, setFieldValue }"
          :key="formKey"
          :initial-values="formInitialValues"
          class="grid gap-4 md:grid-cols-2"
          @submit="submitSale"
        >
          <Field
            v-slot="{ errorMessage }"
            v-model="form.studentName"
            name="studentName"
            label="اسم الطالب"
            rules="required"
          >
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700"
                >اسم الطالب</label
              >
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
                @item-select="
                  (event) => onStudentPicked(event.value, setFieldValue)
                "
                @update:modelValue="
                  (value) => onNameTyped(value, setFieldValue)
                "
              >
                <template #option="{ option }">
                  <div
                    class="flex w-full items-center justify-between gap-3 text-right"
                  >
                    <span>{{ option.name }}</span>
                    <span class="text-xs text-slate-400">{{
                      option.phone || "بدون رقم"
                    }}</span>
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
              <label class="text-sm font-medium text-slate-700"
                >رقم الهاتف</label
              >
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
                @item-select="
                  (event) => onStudentPicked(event.value, setFieldValue)
                "
                @update:modelValue="
                  (value) => onPhoneTyped(value, setFieldValue)
                "
              >
                <template #option="{ option }">
                  <div
                    class="flex w-full items-center justify-between gap-3 text-right"
                  >
                    <span>{{ option.phone || "بدون رقم" }}</span>
                    <span class="text-xs text-slate-400">{{
                      option.name
                    }}</span>
                  </div>
                </template>
              </AutoComplete>
              <ErrorMessage name="studentPhone" class="text-xs text-red-500" />
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
              <label class="text-sm font-medium text-slate-700">المنتج</label>
              <Select
                v-model="form.productId"
                :options="productOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="اختر المنتج المتاح في الفرع"
                filter
                :filter-fields="['name', 'teacherName', 'label']"
                class="w-full product-select"
                :class="{ 'p-invalid': errorMessage || fieldErrors.productId }"
                @update:model-value="onProductChange"
              >
                <template #value="{ placeholder }">
                  <div
                    v-if="selectedProductOption"
                    class="w-full py-0.5 text-right"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <span class="font-medium text-slate-100">{{
                        selectedProductOption.name
                      }}</span>
                      <span
                        class="shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300"
                      >
                        متاح {{ selectedProductOption.availableQuantity }}
                      </span>
                    </div>
                    <div class="mt-0.5 flex items-center justify-between gap-3">
                      <p class="text-xs text-slate-400">
                        مقدم من أ/
                        {{ selectedProductOption.teacherName || "-" }}
                      </p>
                      <span class="text-xs text-sky-300">
                        سعره {{ selectedProductOption.priceLabel }}
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
                        class="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                      >
                        متاح {{ option.availableQuantity }}
                      </span>
                    </div>
                    <div class="mt-0.5 flex items-center justify-between gap-3">
                      <p class="text-xs text-slate-400">
                        مقدم من أ/ {{ option.teacherName || "-" }}
                      </p>
                      <span class="shrink-0 text-sm text-sky-600"
                        >سعره {{ option.priceLabel }}</span
                      >
                    </div>
                  </div>
                </template>
              </Select>
              <ErrorMessage name="productId" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field
            v-slot="{ errorMessage }"
            v-model="form.quantity"
            name="quantity"
            rules="required|min_value:1"
          >
            <div class="flex flex-col gap-2 text-right">
              <div class="flex items-center justify-between gap-2">
                <label class="text-sm font-medium text-slate-700">الكمية</label>
                <span
                  v-if="selectedProductOption"
                  class="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-700"
                >
                  المتاح للبيع: {{ selectedProductOption.availableQuantity }}
                </span>
              </div>
              <AppInputNumber
                v-model="form.quantity"
                :min="1"
                :max="maxQuantity"
                :max-fraction-digits="0"
                :invalid="!!(errorMessage || fieldErrors.quantity || quantityError)"
              />
              <p v-if="quantityError" class="text-xs text-red-500">
                {{ quantityError }}
              </p>
              <ErrorMessage name="quantity" class="text-xs text-red-500" />
            </div>
          </Field>

          <div
            v-if="selectedProductOption"
            class="md:col-span-2 rounded-2xl border border-amber-400/40 bg-gradient-to-l from-amber-500/20 via-orange-500/10 to-slate-900 px-6 py-8 text-center"
          >
            <p class="mb-2 text-sm font-medium text-amber-100/80">
              مبلغ المنتج
            </p>
            <p
              class="text-4xl font-extrabold tracking-tight text-amber-300 md:text-5xl"
            >
              {{ formatMoney(requiredAmount) }}
            </p>
          </div>
          <div class="md:col-span-2">
            <Field
              v-slot="{ errorMessage }"
              v-model="form.method"
              name="method"
              rules="required"
            >
              <PaymentFields
                ref="paymentFieldsRef"
                v-model:method="form.method"
                v-model:image="proofFile"
                v-model:image-data-url="proofKey"
                v-model:image-preview-url="proofPreviewUrl"
                :method-invalid="!!(errorMessage || fieldErrors.method)"
                :method-error="errorMessage || ''"
                :image-invalid="proofRequiredError"
                @change="onPaymentChange"
              />
            </Field>
          </div>

          <div class="md:col-span-2 flex justify-center">
            <Button
              type="submit"
              label="تأكيد البيع"
              :loading="saving"
              severity="info"
              class="min-w-[200px]"
            />
          </div>
        </Form>
      </template>
    </Card>

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
      <div v-if="saleSummary" class="flex flex-col items-center text-center">
        <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white">
          ✓
        </div>
        <p class="text-base font-bold text-slate-900">تم تسجيل البيع بنجاح</p>

        <div class="mt-5 w-full space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right">
          <div class="flex items-center justify-between gap-3">
            <span class="text-xs text-slate-500">رقم الدفع</span>
            <span class="text-sm font-bold text-slate-900 break-all">
              {{ saleSummary.paymentNumber }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <span class="text-xs text-slate-500">التاريخ والوقت</span>
            <span class="text-sm font-medium text-slate-800">{{ saleSummary.dateTimeLabel }}</span>
          </div>

          <div class="flex items-start justify-between gap-3 border-t border-slate-200 pt-3">
            <span class="text-xs text-slate-500">المنتج</span>
            <div class="text-sm font-semibold text-slate-900">
              <p>{{ saleSummary.productName }}</p>
              <p v-if="saleSummary.teacherName" class="mt-0.5 text-xs font-normal text-slate-500">
                مقدم من أ/ {{ saleSummary.teacherName }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <span class="text-xs text-slate-500">السنة الدراسية</span>
            <span class="text-sm font-medium text-slate-800">
              {{ saleSummary.studyYearName || "-" }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <span class="text-xs text-slate-500">الطالب</span>
            <span class="text-sm font-medium text-slate-800">{{ saleSummary.studentName }}</span>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <span class="text-xs text-slate-500">الكمية</span>
            <span class="text-sm font-medium text-slate-800">{{ saleSummary.quantity }}</span>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <span class="text-xs text-slate-500">سعر الوحدة</span>
            <span class="text-sm font-medium text-slate-800">{{ formatMoney(saleSummary.unitPrice) }}</span>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <span class="text-xs text-slate-500">طريقة الدفع</span>
            <span class="text-sm font-medium text-slate-800">{{ saleSummary.methodLabel }}</span>
          </div>

          <div
            v-if="saleSummary.proofImage"
            class="border-t border-slate-200 pt-3"
          >
            <p class="mb-2 text-xs text-slate-500">صورة إثبات الدفع</p>
            <img
              :src="saleSummary.proofImage"
              alt="إثبات الدفع"
              class="mx-auto max-h-48 w-auto max-w-full rounded-xl border border-slate-200 object-contain"
            />
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-emerald-200 pt-3">
            <span class="text-sm font-semibold text-emerald-700">الإجمالي</span>
            <span class="text-lg font-extrabold text-emerald-700">
              {{ formatMoney(saleSummary.totalAmount) }}
            </span>
          </div>
        </div>
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
import Card from "primevue/card";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import AutoComplete from "primevue/autocomplete";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { saleService } from "~/services/saleService";
import { inventoryService } from "~/services/inventoryService";
import { studentService } from "~/services/studentService";
import { useAuthStore } from "~/store/auth";
import { useThrottledCallback } from "~/composables/useThrottledCallback";
import { useAppToast } from "~/composables/useAppToast";

const METHOD_LABELS = {
  CASH: "كاش",
  INSTAPAY: "انستا باي",
  WALLET: "محفظة إلكترونية",
};

const authStore = useAuthStore();
const { showError } = useAppToast();
const saving = ref(false);
const searchingStudents = ref(false);
const formKey = ref(0);
const proofFile = ref(null);
const proofKey = ref("");
const proofPreviewUrl = ref("");
const proofRequiredError = ref(false);
const paymentFieldsRef = ref(null);
const quantityError = ref("");
const successDialogVisible = ref(false);
const saleSummary = ref(null);
const nameSuggestions = ref([]);
const phoneSuggestions = ref([]);
const selectedStudent = ref(null);

const form = reactive({
  studentName: "",
  studentPhone: "",
  productId: null,
  quantity: 1,
  method: "CASH",
});

const formInitialValues = {
  studentName: "",
  studentPhone: "",
  productId: null,
  quantity: 1,
  method: "CASH",
};

const products = ref([]);

const branchId = computed(
  () =>
    authStore.user?.branch_id ||
    authStore.user?.branchId ||
    authStore.user?.branches?.[0]?.id ||
    null
);

const productOptions = computed(() =>
  products.value.map((item) => {
    const product = item.product || item;
    const teacherName =
      product.teacher?.name ||
      product.teacherName ||
      product.teacher_name ||
      "";
    const studyYearName =
      product.studyYear?.name ||
      product.study_year?.name ||
      product.studyYearName ||
      product.study_year_name ||
      "";
    const priceLabel = `${Number(product.sellingPrice || 0).toFixed(2)}ج.م`;
    const name = product.name || "-";
    const availableQuantity = Number(
      item.availableQuantity ??
        Math.max(
          0,
          Number(item.physicalQuantity || 0) - Number(item.reservedQuantity || 0)
        )
    );

    return {
      name,
      teacherName,
      studyYearName,
      priceLabel,
      availableQuantity,
      label: `${name} · متاح ${availableQuantity} · سعره ${priceLabel}`,
      value: product.id || item.productId,
      sellingPrice: Number(product.sellingPrice || 0),
    };
  })
);

const selectedProductOption = computed(
  () =>
    productOptions.value.find((option) => option.value === form.productId) ||
    null
);

const selectedProduct = computed(() => {
  const row = products.value.find(
    (item) => (item.product?.id || item.productId || item.id) === form.productId
  );
  return row?.product || row || null;
});

const maxQuantity = computed(() =>
  Math.max(1, Number(selectedProductOption.value?.availableQuantity || 1))
);

const unitPrice = computed(() =>
  Number(selectedProduct.value?.sellingPrice || selectedProductOption.value?.sellingPrice || 0)
);
const requiredAmount = computed(() =>
  Number((unitPrice.value * Number(form.quantity || 0)).toFixed(2))
);

const formatMoney = (value) =>
  `\u2066${Number(value || 0).toFixed(2)} ج.م\u2069`;

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

const loadProducts = async () => {
  if (!branchId.value) {
    products.value = [];
    throw new Error("لا يوجد فرع مرتبط بالمستخدم الحالي.");
  }

  const items = await inventoryService.getBranchInventory(branchId.value, {
    availableOnly: true,
  });
  products.value = Array.isArray(items) ? items : items?.data || [];
};

const onProductChange = (productId) => {
  quantityError.value = "";
  form.productId = productId;
  const available = productOptions.value.find(
    (option) => option.value === productId
  )?.availableQuantity;
  if (available != null && Number(form.quantity) > Number(available)) {
    form.quantity = Number(available);
  }
};

const validateQuantity = () => {
  quantityError.value = "";
  const available = Number(selectedProductOption.value?.availableQuantity || 0);
  const qty = Number(form.quantity || 0);

  if (!selectedProductOption.value) {
    return false;
  }

  if (qty < 1) {
    quantityError.value = "الكمية يجب أن تكون 1 على الأقل.";
    return false;
  }

  if (qty > available) {
    quantityError.value = `الكمية المطلوبة أكبر من المتاح (${available}).`;
    return false;
  }

  return true;
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

const preloadStudents = async () => {
  const students = await searchStudents("");
  nameSuggestions.value = students;
  phoneSuggestions.value = students;
};

const onNameComplete = (event) => {
  runNameSearch(event.query || "");
};

const onPhoneComplete = (event) => {
  runPhoneSearch(event.query || "");
};

const asText = (value, key = "") => {
  if (value == null) return "";
  if (typeof value === "object") {
    if (key && value[key] != null) return String(value[key]).trim();
    if (value.name != null && key === "name") return String(value.name).trim();
    if (value.phone != null && key === "phone")
      return String(value.phone).trim();
    return "";
  }
  return String(value).trim();
};

const onStudentPicked = (student, setFieldValue) => {
  if (!student || typeof student === "string") return;

  const name = String(student.name || "").trim();
  const phone = String(student.phone || "").trim();

  selectedStudent.value = {
    id: student.id || null,
    name,
    phone,
  };

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

  // Any manual edit invalidates the previously selected student.
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

  // Selection no longer matches typed values → treat as a new/different student.
  selectedStudent.value = null;

  const matches = await studentService.searchStudents(phone);
  const existing = (matches || []).find(
    (student) => String(student.phone || "").trim() === phone
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

const onPaymentChange = ({ method, image, imageDataUrl, imagePreviewUrl }) => {
  proofRequiredError.value = false;
  form.method = method;
  proofFile.value = image;
  proofKey.value = imageDataUrl || "";
  proofPreviewUrl.value = imagePreviewUrl || "";
};

const closeSuccessDialog = () => {
  successDialogVisible.value = false;
  saleSummary.value = null;
};

const resetForm = () => {
  Object.assign(form, {
    studentName: "",
    studentPhone: "",
    productId: null,
    quantity: 1,
    method: "CASH",
  });
  selectedStudent.value = null;
  nameSuggestions.value = [];
  phoneSuggestions.value = [];
  proofFile.value = null;
  proofKey.value = "";
  proofPreviewUrl.value = "";
  proofRequiredError.value = false;
  quantityError.value = "";
  paymentFieldsRef.value?.reset?.();
  formKey.value += 1;
};

const submitSale = async () => {
  proofRequiredError.value = false;
  quantityError.value = "";

  if (paymentFieldsRef.value && !paymentFieldsRef.value.validate()) {
    proofRequiredError.value = true;
    return;
  }

  if (!validateQuantity()) {
    return;
  }

  saving.value = true;
  try {
    const studentId = await ensureStudent();
    const needsProof =
      form.method === "WALLET" || form.method === "INSTAPAY";
    const product = selectedProductOption.value;
    const quantity = Number(form.quantity || 0);
    const lineUnitPrice = Number(product?.sellingPrice || unitPrice.value || 0);
    const totalAmount = Number((lineUnitPrice * quantity).toFixed(2));
    const studentName = asText(form.studentName, "name");
    const method = form.method;

    const sale = await saleService.createSale({
      studentId,
      productId: form.productId,
      quantity,
      method,
      proofReference: needsProof ? proofKey.value || undefined : undefined,
    });

    const payment = Array.isArray(sale?.payments) ? sale.payments[0] : null;
    const saleProduct = sale?.items?.[0]?.product;
    const studyYearName =
      product?.studyYearName ||
      saleProduct?.studyYear?.name ||
      selectedProduct.value?.studyYear?.name ||
      "";

    saleSummary.value = {
      paymentNumber: payment?.id || sale?.id || "-",
      dateTimeLabel: formatDateTime(
        payment?.createdAt || sale?.createdAt || new Date(),
      ),
      productName: product?.name || saleProduct?.name || "-",
      teacherName: product?.teacherName || "",
      studyYearName,
      studentName: studentName || sale?.student?.name || "-",
      quantity,
      unitPrice: lineUnitPrice,
      totalAmount: Number(sale?.totalAmount ?? totalAmount),
      methodLabel: METHOD_LABELS[method] || method,
      proofImage: needsProof ? proofPreviewUrl.value || "" : "",
    };
    successDialogVisible.value = true;

    resetForm();
    await loadProducts();
  } catch (error) {
    showError(error?.message || "تعذر تسجيل البيع.");
  } finally {
    saving.value = false;
  }
};

watch(
  () => form.quantity,
  () => {
    if (selectedProductOption.value) {
      validateQuantity();
    }
  }
);

onMounted(async () => {
  try {
    await Promise.all([loadProducts(), preloadStudents()]);
  } catch (error) {
    showError(error?.message || "تعذر تحميل بيانات المبيعات.");
  }
});
</script>

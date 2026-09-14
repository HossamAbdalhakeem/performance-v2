<template>
  <div class="space-y-6" dir="rtl">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">البيع المباشر</span>
          <Button
            :label="showForm ? 'إخفاء النموذج' : 'بيع جديد'"
            :icon="showForm ? 'pi pi-minus' : 'pi pi-plus'"
            severity="info"
            @click="toggleForm"
          />
        </div>
      </template>

      <template #content>
        <p
          v-if="feedback.message"
          class="mb-4 rounded-xl px-3 py-2 text-sm"
          :class="feedback.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'"
        >
          {{ feedback.message }}
        </p>

        <div v-if="showForm" class="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Form
            v-slot="{ errors: fieldErrors }"
            :key="formKey"
            :initial-values="formInitialValues"
            class="grid gap-4 md:grid-cols-2"
            @submit="submitSale"
          >
            <Field v-slot="{ field, errorMessage }" name="studentId" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">اسم الطالب</label>
                <Select
                  v-bind="field"
                  v-model="form.studentId"
                  :options="studentNameOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="ابحث باسم الطالب"
                  filter
                  :filter-fields="['label', 'phone']"
                  :loading="searchingStudents"
                  showClear
                  class="w-full"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.studentId }"
                  @filter="onStudentNameFilter"
                  @update:modelValue="onStudentSelected"
                />
                <ErrorMessage name="studentId" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="studentPhoneId" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">رقم الهاتف</label>
                <Select
                  v-bind="field"
                  v-model="form.studentPhoneId"
                  :options="studentPhoneOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="ابحث برقم الهاتف"
                  filter
                  :filter-fields="['label', 'name']"
                  :loading="searchingStudents"
                  showClear
                  class="w-full"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.studentPhoneId }"
                  @filter="onStudentPhoneFilter"
                  @update:modelValue="onStudentPhoneSelected"
                />
                <ErrorMessage name="studentPhoneId" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="productId" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">المنتج</label>
                <Select
                  v-bind="field"
                  v-model="form.productId"
                  :options="productOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="اختر المنتج"
                  filter
                  class="w-full"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.productId }"
                />
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
                <label class="text-sm font-medium text-slate-700">الكمية</label>
                <AppInputNumber
                  v-model="form.quantity"
                  :min="1"
                  :max-fraction-digits="0"
                  :invalid="!!(errorMessage || fieldErrors.quantity)"
                />
                <ErrorMessage name="quantity" class="text-xs text-red-500" />
              </div>
            </Field>

            <div class="md:col-span-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-right text-sm text-slate-700">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span>سعر المنتج:</span>
                <strong class="text-slate-900">{{ formatMoney(unitPrice) }}</strong>
              </div>
              <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span>المبلغ المطلوب:</span>
                <strong class="text-sky-700">{{ formatMoney(requiredAmount) }}</strong>
              </div>
            </div>

            <Field v-slot="{ field, errorMessage }" name="method" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">طريقة الدفع</label>
                <Select
                  v-bind="field"
                  v-model="form.method"
                  :options="paymentOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="اختر طريقة الدفع"
                  class="w-full"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.method }"
                />
                <ErrorMessage name="method" class="text-xs text-red-500" />
              </div>
            </Field>

            <Field
              v-slot="{ errorMessage }"
              v-model="form.paidAmount"
              name="paidAmount"
              :rules="paidAmountRules"
            >
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700">المبلغ المدفوع</label>
                <AppInputNumber
                  v-model="form.paidAmount"
                  mode="currency"
                  currency="EGP"
                  :min="0"
                  :min-fraction-digits="2"
                  :use-grouping="true"
                  :invalid="!!(errorMessage || fieldErrors.paidAmount || amountTooLow)"
                />
                <ErrorMessage name="paidAmount" class="text-xs text-red-500" />
                <p v-if="amountTooLow" class="text-xs text-red-500">
                  المبلغ المدفوع أقل من المطلوب ({{ formatMoney(requiredAmount) }}).
                </p>
              </div>
            </Field>

            <div v-if="needsProof" class="md:col-span-2">
              <ImageUpload
                v-model="proofFile"
                label="صورة إثبات الدفع"
                placeholder="ارفع صورة المحفظة / إنستاباي"
                :max-size-mb="0.5"
                :invalid="proofRequiredError"
                @select="onProofSelected"
                @clear="proofDataUrl = ''"
              />
              <p v-if="proofRequiredError" class="mt-1 text-xs text-red-500">
                صورة إثبات الدفع مطلوبة لطريقة الدفع المحددة.
              </p>
            </div>

            <div class="md:col-span-2 flex justify-end gap-3">
              <Button type="button" label="إلغاء" severity="secondary" text @click="resetForm" />
              <Button type="submit" label="تأكيد البيع" :loading="saving" severity="info" />
            </div>
          </Form>
        </div>

        <div v-if="pending" class="grid gap-4">
          <Skeleton v-for="i in 5" :key="i" width="100%" height="3rem" border-radius="12px" />
        </div>

        <DataTable
          v-else
          :value="sales"
          paginator
          :rows="8"
          tableStyle="min-width: 100%"
          emptyMessage="لا توجد مبيعات."
        >
          <Column field="saleNumber" header="الكود" />
          <Column field="studentName" header="الطالب" />
          <Column field="productName" header="المنتج" />
          <Column field="branchName" header="الفرع" />
          <Column field="amountLabel" header="المبلغ" />
          <Column field="methodLabel" header="الدفع">
            <template #body="{ data }">
              <Tag :value="data.methodLabel" :severity="data.methodSeverity" />
            </template>
          </Column>
          <Column field="createdAtLabel" header="التاريخ" />
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Select from "primevue/select";
import Skeleton from "primevue/skeleton";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import ImageUpload from "~/components/dashboard/ImageUpload.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { saleService } from "~/services/saleService";
import { productService } from "~/services/productService";
import { studentService } from "~/services/studentService";
import { useThrottledCallback } from "~/composables/useThrottledCallback";

const pending = ref(true);
const saving = ref(false);
const showForm = ref(true);
const searchingStudents = ref(false);
const formKey = ref(0);
const proofFile = ref(null);
const proofDataUrl = ref("");
const proofRequiredError = ref(false);
const feedback = reactive({ type: "success", message: "" });

const paymentOptions = [
  { label: "نقدي", value: "CASH" },
  { label: "محفظة", value: "WALLET" },
  { label: "إنستاباي", value: "INSTAPAY" },
];

const METHOD_META = {
  CASH: { label: "نقدي", severity: "info" },
  WALLET: { label: "محفظة", severity: "warning" },
  INSTAPAY: { label: "إنستاباي", severity: "success" },
};

const form = reactive({
  studentId: null,
  studentPhoneId: null,
  productId: null,
  quantity: 1,
  method: "CASH",
  paidAmount: null,
});

const formInitialValues = {
  studentId: null,
  studentPhoneId: null,
  productId: null,
  quantity: 1,
  method: "CASH",
  paidAmount: null,
};

const products = ref([]);
const students = ref([]);
const sales = ref([]);

const productOptions = computed(() =>
  products.value.map((product) => ({
    label: `${product.name} — ${formatMoney(product.sellingPrice)}`,
    value: product.id,
    sellingPrice: Number(product.sellingPrice || 0),
  })),
);

const studentNameOptions = computed(() =>
  students.value.map((student) => ({
    label: student.name,
    phone: student.phone || "",
    value: student.id,
  })),
);

const studentPhoneOptions = computed(() =>
  students.value.map((student) => ({
    label: student.phone || `${student.name} (بدون رقم)`,
    name: student.name,
    value: student.id,
  })),
);

const selectedProduct = computed(() =>
  products.value.find((product) => product.id === form.productId) || null,
);

const unitPrice = computed(() => Number(selectedProduct.value?.sellingPrice || 0));
const requiredAmount = computed(() =>
  Number((unitPrice.value * Number(form.quantity || 0)).toFixed(2)),
);

const needsProof = computed(
  () => form.method === "WALLET" || form.method === "INSTAPAY",
);

const amountTooLow = computed(() => {
  if (form.paidAmount == null || requiredAmount.value <= 0) return false;
  return Number(form.paidAmount) < requiredAmount.value;
});

const paidAmountRules = computed(() => {
  if (requiredAmount.value > 0) {
    return `required|min_value:${requiredAmount.value}`;
  }
  return "required|min_value:0.01";
});

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} ج.م`;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ar-EG");
};

const normalizeSale = (sale) => {
  const method = sale.payments?.[0]?.method || sale.method || "CASH";
  const meta = METHOD_META[method] || { label: method, severity: "secondary" };
  const productName =
    sale.items?.map((item) => item.product?.name).filter(Boolean).join("، ") || "-";

  return {
    id: sale.id,
    saleNumber: sale.id?.slice(0, 8)?.toUpperCase() || "-",
    studentName: sale.student?.name || "-",
    productName,
    branchName: sale.branch?.name || "-",
    amountLabel: formatMoney(sale.totalAmount),
    methodLabel: meta.label,
    methodSeverity: meta.severity,
    createdAtLabel: formatDate(sale.createdAt),
  };
};

const loadProducts = async () => {
  const items = await productService.getProducts();
  const list = Array.isArray(items) ? items : items?.data || [];
  products.value = list.filter((product) => product.status !== "INACTIVE");
};

const loadSales = async () => {
  const items = await saleService.getSales();
  sales.value = (items || []).map(normalizeSale);
};

const searchStudents = async (term = "") => {
  searchingStudents.value = true;
  try {
    students.value = await studentService.searchStudents(term);
  } catch (error) {
    console.error("Failed to search students", error);
    students.value = [];
  } finally {
    searchingStudents.value = false;
  }
};

const { run: runStudentSearch } = useThrottledCallback((term) => {
  searchStudents(term);
}, 350);

const onStudentNameFilter = (event) => {
  runStudentSearch(event.value || "");
};

const onStudentPhoneFilter = (event) => {
  runStudentSearch(event.value || "");
};

const onStudentSelected = (studentId) => {
  form.studentId = studentId || null;
  form.studentPhoneId = studentId || null;
};

const onStudentPhoneSelected = (studentId) => {
  form.studentId = studentId || null;
  form.studentPhoneId = studentId || null;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const onProofSelected = async (file) => {
  proofRequiredError.value = false;
  try {
    proofDataUrl.value = await fileToDataUrl(file);
  } catch {
    proofDataUrl.value = "";
    feedback.type = "error";
    feedback.message = "تعذر قراءة صورة الإثبات.";
  }
};

const toggleForm = () => {
  showForm.value = !showForm.value;
};

const resetForm = () => {
  Object.assign(form, { ...formInitialValues });
  proofFile.value = null;
  proofDataUrl.value = "";
  proofRequiredError.value = false;
  formKey.value += 1;
  showForm.value = false;
};

const submitSale = async () => {
  feedback.message = "";
  proofRequiredError.value = false;

  if (amountTooLow.value) {
    feedback.type = "error";
    feedback.message = `المبلغ المدفوع أقل من المطلوب (${formatMoney(requiredAmount.value)}).`;
    return;
  }

  if (needsProof.value && !proofFile.value) {
    proofRequiredError.value = true;
    return;
  }

  if (form.studentId !== form.studentPhoneId) {
    feedback.type = "error";
    feedback.message = "اسم الطالب ورقم الهاتف يجب أن يخصا نفس الطالب.";
    return;
  }

  saving.value = true;
  try {
    await saleService.createSale({
      studentId: form.studentId,
      productId: form.productId,
      quantity: form.quantity,
      method: form.method,
      proofReference: needsProof.value ? proofDataUrl.value || proofFile.value?.name : undefined,
    });

    feedback.type = "success";
    feedback.message = "تم تسجيل البيع بنجاح.";
    resetForm();
    await loadSales();
  } catch (error) {
    feedback.type = "error";
    feedback.message = error?.message || "تعذر تسجيل البيع.";
  } finally {
    saving.value = false;
  }
};

watch(
  () => form.method,
  (method) => {
    if (method === "CASH") {
      proofFile.value = null;
      proofDataUrl.value = "";
      proofRequiredError.value = false;
    }
  },
);

watch([() => form.productId, () => form.quantity], () => {
  if (form.paidAmount == null && requiredAmount.value > 0) {
    form.paidAmount = requiredAmount.value;
  }
});

onMounted(async () => {
  pending.value = true;
  try {
    await Promise.all([loadProducts(), loadSales(), searchStudents("")]);
  } catch (error) {
    feedback.type = "error";
    feedback.message = error?.message || "تعذر تحميل بيانات المبيعات.";
  } finally {
    pending.value = false;
  }
});
</script>

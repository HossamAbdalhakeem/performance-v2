<template>
  <div class="space-y-6" dir="rtl">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">البيع المباشر</span>
      </template>

      <template #content>
        <p
          v-if="feedback.message"
          class="mb-4 rounded-xl px-3 py-2 text-sm"
          :class="feedback.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'"
        >
          {{ feedback.message }}
        </p>

        <Form
          v-slot="{ errors: fieldErrors, setFieldValue }"
          :key="formKey"
          :initial-values="formInitialValues"
          class="grid gap-4 md:grid-cols-2"
          @submit="submitSale"
        >
          <Field
            v-slot="{ errorMessage }"
            v-model="form.studentId"
            name="studentId"
            label="اسم الطالب"
            rules="required"
          >
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">اسم الطالب</label>
              <Select
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
                @update:modelValue="(id) => syncStudentSelection(id, setFieldValue)"
              />
              <ErrorMessage name="studentId" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field
            v-slot="{ errorMessage }"
            v-model="form.studentPhoneId"
            name="studentPhoneId"
            label="رقم الهاتف"
            rules="required"
          >
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">رقم الهاتف</label>
              <Select
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
                @update:modelValue="(id) => syncStudentSelection(id, setFieldValue)"
              />
              <ErrorMessage name="studentPhoneId" class="text-xs text-red-500" />
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

          <div
            class="md:col-span-2 rounded-2xl border border-amber-400/40 bg-gradient-to-l from-amber-500/20 via-orange-500/10 to-slate-900 px-6 py-8 text-center"
          >
            <p class="mb-2 text-sm font-medium text-amber-100/80">مبلغ المنتج</p>
            <p class="text-4xl font-extrabold tracking-tight text-amber-300 md:text-5xl">
              {{ formatMoney(requiredAmount) }}
            </p>
          </div>

          <Field v-slot="{ errorMessage }" v-model="form.method" name="method" rules="required">
            <div class="md:col-span-2 flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">طريقة الدفع</label>
              <div class="space-y-2 rounded-xl border border-white/10 bg-slate-950/60 p-3">
                <label
                  v-for="option in paymentOptions"
                  :key="option.value"
                  class="flex cursor-pointer items-center justify-end gap-2 text-sm text-slate-200"
                >
                  <span>{{ option.label }}</span>
                  <input
                    v-model="form.method"
                    type="radio"
                    :value="option.value"
                    class="accent-sky-400"
                  />
                </label>
              </div>
              <ErrorMessage name="method" class="text-xs text-red-500" />
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

          <div class="md:col-span-2 flex justify-center">
            <Button type="submit" label="تأكيد البيع" :loading="saving" severity="info" class="min-w-[200px]" />
          </div>
        </Form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import Select from "primevue/select";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import ImageUpload from "~/components/dashboard/ImageUpload.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { saleService } from "~/services/saleService";
import { productService } from "~/services/productService";
import { studentService } from "~/services/studentService";
import { useThrottledCallback } from "~/composables/useThrottledCallback";

const saving = ref(false);
const searchingStudents = ref(false);
const formKey = ref(0);
const proofFile = ref(null);
const proofDataUrl = ref("");
const proofRequiredError = ref(false);
const feedback = reactive({ type: "success", message: "" });

const paymentOptions = [
  { label: "كاش", value: "CASH" },
  { label: "انستا باي", value: "INSTAPAY" },
  { label: "محفظة إلكترونية", value: "WALLET" },
];

const form = reactive({
  studentId: null,
  studentPhoneId: null,
  productId: null,
  quantity: 1,
  method: "CASH",
});

const formInitialValues = {
  studentId: null,
  studentPhoneId: null,
  productId: null,
  quantity: 1,
  method: "CASH",
};

const products = ref([]);
const students = ref([]);

const productOptions = computed(() =>
  products.value.map((product) => ({
    label: `${product.name} — \u2066${Number(product.sellingPrice || 0).toFixed(2)} ج.م\u2069`,
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

const formatMoney = (value) => `\u2066${Number(value || 0).toFixed(2)} ج.م\u2069`;

const loadProducts = async () => {
  const items = await productService.getProducts();
  const list = Array.isArray(items) ? items : items?.data || [];
  products.value = list.filter((product) => product.status !== "INACTIVE");
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

const syncStudentSelection = (studentId, setFieldValue) => {
  const id = studentId || null;
  form.studentId = id;
  form.studentPhoneId = id;
  setFieldValue?.("studentId", id);
  setFieldValue?.("studentPhoneId", id);
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

const resetForm = () => {
  Object.assign(form, { ...formInitialValues });
  proofFile.value = null;
  proofDataUrl.value = "";
  proofRequiredError.value = false;
  formKey.value += 1;
};

const submitSale = async () => {
  feedback.message = "";
  proofRequiredError.value = false;

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

onMounted(async () => {
  try {
    await Promise.all([loadProducts(), searchStudents("")]);
  } catch (error) {
    feedback.type = "error";
    feedback.message = error?.message || "تعذر تحميل بيانات المبيعات.";
  }
});
</script>

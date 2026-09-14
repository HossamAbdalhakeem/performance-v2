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
          :class="
            feedback.type === 'error'
              ? 'bg-red-50 text-red-600'
              : 'bg-emerald-50 text-emerald-700'
          "
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
                placeholder="اختر المنتج"
                filter
                :filter-fields="['name', 'teacherName', 'label']"
                class="w-full product-select"
                :class="{ 'p-invalid': errorMessage || fieldErrors.productId }"
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
                      <span class="shrink-0 text-sm text-sky-300"
                        >سعره {{ option.priceLabel }}</span
                      >
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
            <p class="mb-2 text-sm font-medium text-amber-100/80">
              مبلغ المنتج
            </p>
            <p
              class="text-4xl font-extrabold tracking-tight text-amber-300 md:text-5xl"
            >
              {{ formatMoney(requiredAmount) }}
            </p>
          </div>
          <div class="md:col-span-2 grid gap-4 md:grid-cols-2">
            <Field
              v-slot="{}"
              v-model="form.method"
              name="method"
              rules="required"
            >
              <div class="flex h-full flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-700"
                  >طريقة الدفع</label
                >
                <div
                  class="space-y-2 rounded-xl border border-white/10 bg-slate-950/60 p-3"
                >
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

            <div class="flex h-full flex-col gap-2 text-right" v-if="needsProof">
              <ImageUpload
                v-model="proofFile"
                label="صورة إثبات الدفع (اختياري)"
                placeholder="ارفع صورة المحفظة / إنستاباي"
                :max-size-mb="0.5"
                :invalid="proofRequiredError"
                @select="onProofSelected"
                @clear="proofDataUrl = ''"
              />
              <p v-if="proofRequiredError" class="text-xs text-red-500">
                صورة إثبات الدفع مطلوبة لطريقة الدفع المحددة.
              </p>
            </div>
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
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import Select from "primevue/select";
import AutoComplete from "primevue/autocomplete";
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
const nameSuggestions = ref([]);
const phoneSuggestions = ref([]);
const selectedStudent = ref(null);

const paymentOptions = [
  { label: "كاش", value: "CASH" },
  { label: "انستا باي", value: "INSTAPAY" },
  { label: "محفظة إلكترونية", value: "WALLET" },
];

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

const productOptions = computed(() =>
  products.value.map((product) => {
    const teacherName =
      product.teacher?.name ||
      product.teacherName ||
      product.teacher_name ||
      "";
    const priceLabel = `${Number(product.sellingPrice || 0).toFixed(2)}ج.م`;
    const name = product.name || "-";

    return {
      name,
      teacherName,
      priceLabel,
      label: `${name} سعره ${priceLabel} مقدم من أ/ ${teacherName || "-"}`,
      value: product.id,
      sellingPrice: Number(product.sellingPrice || 0),
    };
  })
);

const selectedProductOption = computed(
  () =>
    productOptions.value.find((option) => option.value === form.productId) ||
    null
);

const selectedProduct = computed(
  () => products.value.find((product) => product.id === form.productId) || null
);

const unitPrice = computed(() =>
  Number(selectedProduct.value?.sellingPrice || 0)
);
const requiredAmount = computed(() =>
  Number((unitPrice.value * Number(form.quantity || 0)).toFixed(2))
);

const needsProof = computed(
  () => form.method === "WALLET" || form.method === "INSTAPAY"
);

const formatMoney = (value) =>
  `\u2066${Number(value || 0).toFixed(2)} ج.م\u2069`;

const normalizeStudent = (student) => ({
  id: student.id,
  name: student.name || "",
  phone: student.phone || "",
});

const loadProducts = async () => {
  const items = await productService.getProducts();
  const list = Array.isArray(items) ? items : items?.data || [];
  products.value = list.filter((product) => product.status !== "INACTIVE");
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

  saving.value = true;
  try {
    const studentId = await ensureStudent();

    await saleService.createSale({
      studentId,
      productId: form.productId,
      quantity: form.quantity,
      method: form.method,
      proofReference: needsProof.value
        ? proofDataUrl.value || proofFile.value?.name
        : undefined,
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
  }
);

onMounted(async () => {
  try {
    await loadProducts();
  } catch (error) {
    feedback.type = "error";
    feedback.message = error?.message || "تعذر تحميل بيانات المبيعات.";
  }
});
</script>

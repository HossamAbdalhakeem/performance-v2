<template>
  <div class="space-y-4">
    <div v-if="showHeader" class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-xl font-bold text-white">{{ title }}</h2>
      <NuxtLink
        v-if="backTo"
        :to="backTo"
        class="rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
      >
        ← رجوع للكتب
      </NuxtLink>
    </div>

    <div
      v-if="showHint"
      class="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-center text-sm text-emerald-200"
    >
      يتم تسجيل الحجز ويظهر رقم حجز للطالب
    </div>

    <div class="grid gap-4" :class="showReceipt && receiptCode ? 'xl:grid-cols-[1fr_240px]' : ''">
      <Form
        v-slot="{ errors: fieldErrors }"
        :initial-values="initialValues"
        class="rounded-2xl border border-white/10 bg-slate-900 p-4"
        @submit="handleSubmit"
      >
        <div class="grid gap-4" :class="requireBranch ? 'md:grid-cols-4' : 'md:grid-cols-3'">
          <Field v-slot="{ field, errorMessage }" name="stage" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-200">السنة الدراسية</label>
              <Select
                v-bind="field"
                v-model="form.stage"
                :options="stageOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="اختر السنة"
                :class="{ 'p-invalid': errorMessage || fieldErrors.stage }"
              />
              <ErrorMessage name="stage" class="text-xs text-red-400" />
            </div>
          </Field>

          <Field v-if="requireBranch" v-slot="{ field, errorMessage }" name="branch" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-200">الفرع</label>
              <Select
                v-bind="field"
                v-model="form.branch"
                :options="branchOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="اختر الفرع"
                :class="{ 'p-invalid': errorMessage || fieldErrors.branch }"
              />
              <ErrorMessage name="branch" class="text-xs text-red-400" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="teacher" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-200">اسم المدرس</label>
              <Select
                v-bind="field"
                v-model="form.teacher"
                :options="teacherOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="اختر المدرس"
                :class="{ 'p-invalid': errorMessage || fieldErrors.teacher }"
              />
              <ErrorMessage name="teacher" class="text-xs text-red-400" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="product" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-200">المنتج</label>
              <Select
                v-bind="field"
                v-model="form.product"
                :options="filteredProductOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="اختر المنتج"
                :class="{ 'p-invalid': errorMessage || fieldErrors.product }"
              />
              <ErrorMessage name="product" class="text-xs text-red-400" />
            </div>
          </Field>
        </div>

        <div class="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div class="grid gap-4 sm:grid-cols-2">
            <Field v-slot="{ field, errorMessage }" name="student" rules="required">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-200">اسم الطالب</label>
                <InputText
                  v-bind="field"
                  v-model="form.student"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.student }"
                />
                <ErrorMessage name="student" class="text-xs text-red-400" />
              </div>
            </Field>

            <Field v-slot="{ field, errorMessage }" name="phone" rules="required|min:10">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-200">رقم الموبايل</label>
                <InputText
                  v-bind="field"
                  v-model="form.phone"
                  :class="{ 'p-invalid': errorMessage || fieldErrors.phone }"
                />
                <ErrorMessage name="phone" class="text-xs text-red-400" />
              </div>
            </Field>

            <Field v-slot="{ errorMessage }" v-model="form.quantity" name="quantity" rules="required|min_value:1">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-200">الكمية</label>
                <AppInputNumber
                  v-model="form.quantity"
                  :min="1"
                  :max-fraction-digits="0"
                  :invalid="!!(errorMessage || fieldErrors.quantity)"
                />
                <ErrorMessage name="quantity" class="text-xs text-red-400" />
              </div>
            </Field>

            <Field v-slot="{ errorMessage }" v-model="form.amount" name="amount" rules="required|min_value:1">
              <div class="flex flex-col gap-2 text-right">
                <label class="text-sm font-medium text-slate-200">المبلغ المدفوع (مقدم)</label>
                <AppInputNumber
                  v-model="form.amount"
                  mode="currency"
                  currency="EGP"
                  :min="1"
                  :min-fraction-digits="2"
                  :use-grouping="true"
                  :invalid="!!(errorMessage || fieldErrors.amount)"
                />
                <ErrorMessage name="amount" class="text-xs text-red-400" />
              </div>
            </Field>

            <Field v-slot="{ errorMessage }" v-model="form.paymentMethod" name="paymentMethod" rules="required">
              <div class="flex flex-col gap-2 text-right sm:col-span-2">
                <label class="text-sm font-medium text-slate-200">طريقة الدفع</label>
                <div class="space-y-2 rounded-xl border border-white/10 bg-slate-950/60 p-3">
                  <label
                    v-for="option in paymentOptions"
                    :key="option.value"
                    class="flex cursor-pointer items-center justify-end gap-2 text-sm text-slate-200"
                  >
                    <span>{{ option.label }}</span>
                    <input
                      v-model="form.paymentMethod"
                      type="radio"
                      :value="option.value"
                      class="accent-sky-400"
                    />
                  </label>
                </div>
                <ErrorMessage name="paymentMethod" class="text-xs text-red-400" />
              </div>
            </Field>
          </div>

          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-200">
              إرفاق صورة التحويل {{ needsPaymentProof ? "(مطلوبة)" : "(اختياري للكاش)" }}
            </label>
            <label
              class="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-sky-400/50 bg-slate-950/70 px-3 py-4 text-center text-xs text-slate-300"
            >
              <input type="file" accept="image/*" class="hidden" @change="onFileChange" />
              <img v-if="imagePreview" :src="imagePreview" alt="صورة التحويل" class="mb-2 max-h-24 rounded-lg object-cover" />
              <span class="text-2xl">📷</span>
              <span class="mt-2">اضغط لرفع الصورة</span>
            </label>
            <p v-if="proofError" class="text-xs text-red-400">{{ proofError }}</p>
          </div>
        </div>

        <p v-if="submitError" class="mt-3 text-center text-sm text-red-400">{{ submitError }}</p>

        <div class="mt-5 flex justify-center">
          <Button
            type="submit"
            :label="submitLabel"
            :loading="saving"
            severity="success"
            class="min-w-[220px]"
          />
        </div>
      </Form>

      <div
        v-if="showReceipt && receiptCode"
        class="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900 p-5 text-center"
      >
        <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white">
          ✓
        </div>
        <p class="text-sm font-bold text-white">تم تسجيل الحجز بنجاح</p>
        <p class="mt-3 text-xs text-slate-300">رقم الحجز</p>
        <div class="mt-2 rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-200">
          {{ receiptCode }}
        </div>
        <p class="mt-3 text-xs text-slate-400">احتفظ برقم الحجز لتسليم الكتاب لاحقًا</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { teacherService } from "~/services/teacherService";
import { productService } from "~/services/productService";
import { studyYearService } from "~/services/studyYearService";
import { branchService } from "~/services/branchService";
import { paymentService } from "~/services/paymentService";
import { asList } from "~/utils/apiFetch";
import { useAuthStore } from "~/store/auth.js";

const props = defineProps({
  title: { type: String, default: "احجز كتاب" },
  submitLabel: { type: String, default: "تأكيد الحجز" },
  showHeader: { type: Boolean, default: false },
  showHint: { type: Boolean, default: false },
  showReceipt: { type: Boolean, default: false },
  requireBranch: { type: Boolean, default: false },
  backTo: { type: String, default: "" },
  initialProduct: { type: [String, Number], default: "" },
  submitFn: { type: Function, required: true },
});

const authStore = useAuthStore();
const saving = ref(false);
const receiptCode = ref("");
const imagePreview = ref("");
const proofFile = ref(null);
const proofError = ref("");
const submitError = ref("");
const teacherOptions = ref([]);
const productOptions = ref([]);
const stageOptions = ref([]);
const branchOptions = ref([]);
const paymentOptions = [
  { label: "كاش", value: "cash" },
  { label: "انستا باي", value: "instapay" },
  { label: "محفظة إلكترونية", value: "wallet" },
];

const form = reactive({
  stage: "",
  branch: "",
  teacher: "",
  product: props.initialProduct || "",
  student: "",
  phone: "",
  quantity: 1,
  amount: null,
  paymentMethod: "cash",
});

const initialValues = {
  stage: "",
  branch: "",
  teacher: "",
  product: props.initialProduct || "",
  student: "",
  phone: "",
  quantity: 1,
  amount: null,
  paymentMethod: "cash",
};

const needsPaymentProof = computed(() => form.paymentMethod === "instapay" || form.paymentMethod === "wallet");

const filteredProductOptions = computed(() => {
  if (!form.teacher) return productOptions.value;
  return productOptions.value.filter((item) => !item.teacherId || item.teacherId === form.teacher);
});

const mapList = (items, getLabel) =>
  asList(items).map((item) => ({
    label: getLabel(item),
    value: item.id,
    teacherId: item.teacher?.id || item.teacher_id,
  }));

const loadOptions = async () => {
  try {
    const [teachers, products, years, branches] = await Promise.all([
      teacherService.getTeachers(),
      productService.getProducts({ is_active: true }),
      studyYearService.getStudyYears(),
      props.requireBranch ? branchService.getBranches({ is_active: true }) : Promise.resolve({ data: authStore.user?.branches || [] }),
    ]);

    teacherOptions.value = mapList(teachers, (item) => item.name);
    productOptions.value = mapList(products, (item) => item.name);
    stageOptions.value = mapList(years, (item) => item.name);
    branchOptions.value = mapList(branches, (item) => item.name);

    if (!form.branch) {
      form.branch = authStore.user?.branch_id || branchOptions.value[0]?.value || "";
    }
  } catch (error) {
    console.error("Failed to load booking options", error);
  }
};

const onFileChange = (event) => {
  const file = event.target.files?.[0];
  proofError.value = "";
  proofFile.value = file || null;
  imagePreview.value = "";

  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    imagePreview.value = String(reader.result || "");
  };
  reader.readAsDataURL(file);
};

const resetForm = () => {
  Object.assign(form, {
    ...initialValues,
    product: props.initialProduct || "",
    branch: authStore.user?.branch_id || form.branch,
  });
  proofFile.value = null;
  imagePreview.value = "";
  proofError.value = "";
};

const handleSubmit = async () => {
  submitError.value = "";
  proofError.value = "";

  if (needsPaymentProof.value && !proofFile.value) {
    proofError.value = "صورة التحويل مطلوبة لطريقة الدفع المختارة.";
    return;
  }

  saving.value = true;

  try {
    let payment_proof_path = null;
    if (proofFile.value) {
      payment_proof_path = await paymentService.uploadPaymentProof(proofFile.value);
    }

    const result = await props.submitFn({
      student: {
        name: form.student,
        phone: form.phone,
      },
      study_year_id: form.stage,
      branch_id: form.branch || undefined,
      items: [
        {
          product_id: form.product,
          quantity: form.quantity || 1,
        },
      ],
      paid_amount: form.amount,
      payment_method: form.paymentMethod,
      payment_proof_path,
    });

    if (props.showReceipt) {
      receiptCode.value = result?.reservation_number || "";
    }

    resetForm();
  } catch (error) {
    submitError.value = error?.message || "تعذر إتمام العملية.";
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.initialProduct,
  (value) => {
    if (value) form.product = value;
  }
);

onMounted(() => {
  loadOptions();
  if (props.initialProduct) form.product = props.initialProduct;
});
</script>

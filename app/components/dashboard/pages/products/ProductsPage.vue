<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">المنتجات</span>
          <Button
            label="إضافة منتج جديد"
            icon="pi pi-plus"
            severity="info"
            @click="openCreate"
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

        <div class="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">بحث</label>
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="filters.searchInput"
                class="w-full"
                placeholder="اسم المنتج / مدرس / نوع / سنة"
              />
            </IconField>
          </div>

          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">المدرس</label>
            <Select
              v-model="filters.teacherId"
              :options="teacherOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="كل المدرسين"
              showClear
              filter
              class="w-full"
              @update:modelValue="reloadProducts"
            />
          </div>

          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">النوع</label>
            <Select
              v-model="filters.type"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="كل الأنواع"
              showClear
              class="w-full"
              @update:modelValue="reloadProducts"
            />
          </div>

          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">السنة الدراسية</label>
            <Select
              v-model="filters.studyYearId"
              :options="studyYearOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="كل السنوات"
              showClear
              class="w-full"
              @update:modelValue="reloadProducts"
            />
          </div>
        </div>

        <ProductsTable
          :products="products"
          :loading="loading"
          @edit="openEdit"
        />
      </template>
    </Card>

    <Drawer
      v-model:visible="drawerVisible"
      :header="drawerTitle"
      position="right"
      class="!w-[400px] max-w-[400px]"
      :style="{ width: '400px' }"
      :blockScroll="true"
    >
      <ProductForm
        v-if="drawerVisible"
        :product="editingProduct"
        @saved="handleSaved"
        @cancel="closeDrawer"
      />
    </Drawer>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import Drawer from "primevue/drawer";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import ProductsTable from "~/components/dashboard/pages/products/ProductsTable.vue";
import ProductForm from "~/components/dashboard/pages/products/ProductForm.vue";
import { productService } from "~/services/productService";
import { teacherService } from "~/services/teacherService";
import { studyYearService } from "~/services/studyYearService";

const SEARCH_THROTTLE_MS = 400;

const loading = ref(true);
const drawerVisible = ref(false);
const editingProduct = ref(null);
const products = ref([]);
const teacherOptions = ref([]);
const studyYearOptions = ref([]);
const feedback = reactive({ type: "success", message: "" });

const filters = reactive({
  searchInput: "",
  search: "",
  teacherId: null,
  type: null,
  studyYearId: null,
});

const typeOptions = [
  { label: "كتاب", value: "BOOK" },
  { label: "كارت", value: "CARD" },
];

const drawerTitle = computed(() =>
  editingProduct.value?.id ? "تعديل المنتج" : "إضافة منتج جديد",
);

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return `${amount.toFixed(2)} ج.م`;
};

const normalizeProduct = (product) => ({
  ...product,
  name: product.name || "-",
  teacherName: product.teacher?.name || "-",
  studyYearName: product.studyYear?.name || "-",
  sellingPriceLabel: formatMoney(product.sellingPrice),
  typeLabel: product.type === "CARD" ? "كارت" : "كتاب",
  reservationLabel: product.reservationAllowed ? "مفعل" : "غير مفعل",
});

const setFeedback = (type, message) => {
  feedback.type = type;
  feedback.message = message;
};

const buildQuery = () => {
  const params = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.teacherId) params.teacherId = filters.teacherId;
  if (filters.type) params.type = filters.type;
  if (filters.studyYearId) params.studyYearId = filters.studyYearId;
  return params;
};

const loadProducts = async () => {
  loading.value = true;
  try {
    const items = await productService.getProducts(buildQuery());
    const list = Array.isArray(items) ? items : items?.data || [];
    products.value = list.map(normalizeProduct);
  } catch (error) {
    setFeedback("error", error?.message || "تعذر تحميل المنتجات.");
    products.value = [];
  } finally {
    loading.value = false;
  }
};

const reloadProducts = () => {
  loadProducts();
};

const loadFilterOptions = async () => {
  try {
    const [teachers, years] = await Promise.all([
      teacherService.getTeachers(),
      studyYearService.getStudyYears(),
    ]);

    const teacherList = Array.isArray(teachers) ? teachers : teachers?.data || [];
    const yearList = Array.isArray(years) ? years : years?.data || [];

    teacherOptions.value = teacherList
      .filter((teacher) => teacher.status !== "INACTIVE")
      .map((teacher) => ({
        label: teacher.name,
        value: teacher.id,
      }));

    studyYearOptions.value = yearList.map((year) => ({
      label: year.name,
      value: year.id,
    }));
  } catch (error) {
    console.error("Failed to load product filters", error);
  }
};

let throttleTimer = null;
let lastSearchRunAt = 0;

const runThrottledSearch = () => {
  const now = Date.now();
  const remaining = SEARCH_THROTTLE_MS - (now - lastSearchRunAt);

  if (throttleTimer) {
    clearTimeout(throttleTimer);
    throttleTimer = null;
  }

  const execute = () => {
    lastSearchRunAt = Date.now();
    filters.search = filters.searchInput;
    loadProducts();
  };

  if (remaining <= 0) {
    execute();
    return;
  }

  throttleTimer = setTimeout(execute, remaining);
};

watch(
  () => filters.searchInput,
  () => {
    runThrottledSearch();
  },
);

const openCreate = () => {
  editingProduct.value = null;
  drawerVisible.value = true;
};

const openEdit = (product) => {
  editingProduct.value = product;
  drawerVisible.value = true;
};

const closeDrawer = () => {
  drawerVisible.value = false;
  editingProduct.value = null;
};

const handleSaved = async () => {
  closeDrawer();
  setFeedback("success", "تم حفظ المنتج بنجاح.");
  await loadProducts();
};

onMounted(async () => {
  await loadFilterOptions();
  await loadProducts();
});

onBeforeUnmount(() => {
  if (throttleTimer) clearTimeout(throttleTimer);
});
</script>

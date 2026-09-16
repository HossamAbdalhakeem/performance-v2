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
        <div class="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SearchInput placeholder="اسم المنتج / مدرس / نوع / سنة" @search="onSearch" />

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
          :rows="pagination.perPage"
          :first="pagination.first"
          :total-records="pagination.total"
          @edit="openEdit"
          @page="onPage"
        />
      </template>
    </Card>

    <ProductDrawer
      v-model:visible="drawerVisible"
      :product="editingProduct"
      :title="drawerTitle"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import Select from "primevue/select";
import SearchInput from "~/components/shared/search-input/index.vue";
import ProductsTable from "~/components/dashboard/pages/products/ProductsTable.vue";
import ProductDrawer from "~/components/dashboard/pages/products/ProductDrawer.vue";
import { productService } from "~/services/productService";
import { teacherService } from "~/services/teacherService";
import { studyYearService } from "~/services/studyYearService";
import { useAppToast } from "~/composables/useAppToast";

const { showError, showSuccess } = useAppToast();
const loading = ref(true);
const drawerVisible = ref(false);
const editingProduct = ref(null);
const products = ref([]);
const teacherOptions = ref([]);
const studyYearOptions = ref([]);
const filters = reactive({
  search: "",
  teacherId: null,
  type: null,
  studyYearId: null,
});
const pagination = reactive({
  page: 1,
  perPage: 20,
  total: 0,
  first: 0,
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

const buildQuery = () => {
  const params = {
    page: pagination.page,
    per_page: pagination.perPage,
  };
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.teacherId) params.teacherId = filters.teacherId;
  if (filters.type) params.type = filters.type;
  if (filters.studyYearId) params.studyYearId = filters.studyYearId;
  return params;
};

const loadProducts = async () => {
  loading.value = true;
  try {
    const result = await productService.getProducts(buildQuery());
    products.value = result.data.map(normalizeProduct);
    pagination.total = result.pagination.total;
  } catch (error) {
    showError(error?.message || "تعذر تحميل المنتجات.");
    products.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const resetPagination = () => {
  pagination.page = 1;
  pagination.first = 0;
};

const onPage = (event) => {
  pagination.page = event.page + 1;
  pagination.perPage = event.rows;
  pagination.first = event.first;
  loadProducts();
};

const reloadProducts = () => {
  resetPagination();
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

const onSearch = (value) => {
  filters.search = value;
  resetPagination();
  loadProducts();
};

const openCreate = () => {
  editingProduct.value = null;
  drawerVisible.value = true;
};

const openEdit = (product) => {
  editingProduct.value = product;
  drawerVisible.value = true;
};

watch(drawerVisible, (visible) => {
  if (!visible) editingProduct.value = null;
});

const handleSaved = async () => {
  showSuccess("تم حفظ المنتج بنجاح.");
  await loadProducts();
};

onMounted(async () => {
  await loadFilterOptions();
  await loadProducts();
});
</script>

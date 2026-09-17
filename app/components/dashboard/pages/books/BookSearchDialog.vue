<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    header="بحث عن منتج"
    :style="{ width: 'min(1100px, 96vw)' }"
    :pt="{
      header: { class: 'text-right' },
      content: { class: 'text-right' },
    }"
    @update:visible="$emit('update:visible', $event)"
    @show="onShow"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchInput
          v-model="search"
          label=""
          variant="dark"
          placeholder="بحث عن كتاب أو أستاذ…"
          input-class="w-full md:w-[420px]"
          :throttle-ms="350"
          @search="(term) => searchBooks(term)"
        />
        <span class="text-sm text-slate-300 min-w-[110px]">
          إجمالي النتائج: {{ books.length }}
        </span>
      </div>

      <AppDataTable
        :value="books"
        :columns="bookColumns"
        :loading="pending"
        :empty-message="emptyMessage"
        :skeleton-rows="4"
      >
        <template #status="{ data }">
          <AppStatusTag
            kind="product-availability"
            :code="data.status"
            :label="data.statusLabel"
          />
        </template>
        <template #branches="{ data }">
          <div class="flex max-w-[420px] flex-col gap-2">
            <div
              v-for="branch in data.branches"
              :key="branch.branchId"
              class="flex items-center justify-between gap-2 rounded-lg bg-slate-950/50 px-2 py-1.5"
            >
              <div class="min-w-0 flex flex-col">
                <span class="truncate text-sm text-slate-100">{{
                  branch.branchName
                }}</span>
                <span
                  class="text-xs font-semibold"
                  :class="
                    branch.availableQuantity > 0
                      ? 'text-emerald-300'
                      : 'text-amber-300'
                  "
                >
                  المتاح: {{ branch.availableQuantity }}
                </span>
              </div>
              <Button
                label="حجز"
                size="small"
                severity="info"
                :disabled="!data.reservationAllowed"
                @click.stop="selectBranch(data, branch)"
              />
            </div>

            <div
              v-if="!data.branches.length"
              class="flex items-center justify-between gap-2 rounded-lg bg-slate-950/50 px-2 py-1.5"
            >
              <span class="text-xs text-slate-400">غير متوفر في أي فرع</span>
              <Button
                label="حجز"
                size="small"
                severity="help"
                :disabled="!data.reservationAllowed"
                @click.stop="selectBranch(data, null)"
              />
            </div>
          </div>
        </template>
      </AppDataTable>
    </div>

    <template #footer>
      <div class="flex w-full justify-end">
        <Button
          label="إغلاق"
          text
          severity="secondary"
          @click="$emit('update:visible', false)"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import AppStatusTag from "~/components/shared/app-status-tag/index.vue";
import SearchInput from "~/components/shared/search-input/index.vue";
import { productService } from "~/services/productService";
import { useAppToast } from "~/composables/useAppToast";
import { formatMoney } from "~/utils/format";
import { getStatusTagMeta } from "~/utils/statusTags";

defineProps({
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(["update:visible", "select"]);

const { showError } = useAppToast();
const pending = ref(false);
const search = ref("");
const books = ref([]);

const bookColumns = [
  { field: "title", header: "اسم المنتج" },
  { field: "teacher", header: "الأستاذ" },
  { field: "studyYearName", header: "السنة الدراسية" },
  { field: "sellingPriceLabel", header: "سعر البيع" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "branches", header: "الفروع / الحجز", slot: "branches" },
];

const emptyMessage = computed(() =>
  search.value.trim()
    ? "لا توجد منتجات مطابقة"
    : "ابحث عن منتج لعرض النتائج.",
);

const normalizeBook = (item) => {
  const status = String(item.status || "").toUpperCase();
  const meta = getStatusTagMeta("product-availability", status, {
    label: item.status || "-",
  });

  return {
    id: item.id,
    title: item.name || item.title || "-",
    type: String(item.type || "").toUpperCase() || null,
    teacher: item.teacher?.name || "-",
    teacherId: item.teacher?.id || null,
    studyYearId: item.studyYear?.id || null,
    studyYearName: item.studyYear?.name || "-",
    sellingPrice: item.sellingPrice,
    sellingPriceLabel: formatMoney(item.sellingPrice),
    reservationPrice: item.reservationPrice,
    status,
    statusLabel: meta.label,
    reservationAllowed: Boolean(item.reservationAllowed),
    branches: Array.isArray(item.branches) ? item.branches : [],
    totalAvailable: Number(item.totalAvailable ?? 0),
    raw: item,
  };
};

const buildSelection = (product, branch = null) => ({
  productId: product.id,
  productName: product.title,
  type: product.type,
  status: product.status,
  sellingPrice: Number(branch?.sellingPrice ?? product.sellingPrice ?? 0),
  reservationAllowed: product.reservationAllowed,
  reservationPrice: product.reservationPrice,
  teacherId: product.teacherId,
  teacherName: product.teacher,
  studyYearId: product.studyYearId,
  studyYearName: product.studyYearName,
  branchId: branch?.branchId || null,
  branchName: branch?.branchName || null,
  availableQuantity: Number(branch?.availableQuantity ?? 0),
  totalAvailable: product.totalAvailable,
});

const selectBranch = (product, branch) => {
  emit("select", buildSelection(product, branch));
  emit("update:visible", false);
};

const searchBooks = async (term = search.value) => {
  const query = String(term ?? "").trim();
  search.value = query;

  if (!query) {
    books.value = [];
    return;
  }

  pending.value = true;
  try {
    const result = await productService.searchProducts({ product: query });
    books.value = (result?.data || []).map(normalizeBook);
  } catch (error) {
    books.value = [];
    showError(error?.message || "تعذر البحث في المنتجات.");
  } finally {
    pending.value = false;
  }
};

const onShow = () => {
  search.value = "";
  books.value = [];
};
</script>

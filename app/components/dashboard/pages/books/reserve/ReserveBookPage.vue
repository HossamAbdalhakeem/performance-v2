<template>
  <div class="space-y-4" dir="rtl">
    <div class="flex flex-wrap items-center justify-end gap-3">
      <Button
        label="بحث عن منتج"
        icon="pi pi-search"
        severity="info"
        outlined
        @click="showSearchDialog = true"
      />
    </div>

    <div
      v-if="selectedProduct"
      class="rounded-2xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-right text-slate-100"
    >
      <p class="mb-2 text-sm font-semibold text-sky-200">المنتج المحدد</p>
      <div class="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <p>
          <span class="text-slate-400">الاسم:</span>
          {{ selectedProduct.productName }}
        </p>
        <p>
          <span class="text-slate-400">الأستاذ:</span>
          {{ selectedProduct.teacherName || "-" }}
        </p>
        <p>
          <span class="text-slate-400">السنة:</span>
          {{ selectedProduct.studyYearName || "-" }}
        </p>
        <p>
          <span class="text-slate-400">الفرع:</span>
          {{ selectedProduct.branchName || "لم يُحدد بعد" }}
        </p>
        <p>
          <span class="text-slate-400">السعر:</span>
          {{ formatMoney(selectedProduct.sellingPrice) }}
        </p>
        <p v-if="selectedProduct.branchId != null">
          <span class="text-slate-400">المتاح:</span>
          {{ selectedProduct.availableQuantity }}
        </p>
      </div>
    </div>

    <BookReservationPage
      title="احجز كتاب"
      show-header
      show-receipt
      :initial-product="selectedProductId"
      :initial-selection="selectedProduct"
    />

    <BookSearchDialog
      v-model:visible="showSearchDialog"
      @select="onProductSelect"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import BookReservationPage from "~/components/dashboard/pages/reservations/BookReservationPage.vue";
import BookSearchDialog from "~/components/dashboard/pages/books/BookSearchDialog.vue";
import { formatMoney } from "~/utils/format";

const route = useRoute();
const showSearchDialog = ref(false);
const selectedProduct = ref(null);

const selectedProductId = computed(
  () => selectedProduct.value?.productId || route.query.book || "",
);

const onProductSelect = (selection) => {
  selectedProduct.value = selection || null;
};
</script>

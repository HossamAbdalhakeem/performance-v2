<template>
  <div v-if="reservation" class="flex flex-col gap-4">
    <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <div class="grid gap-2 sm:grid-cols-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">رقم الحجز</span>
          <span class="font-semibold text-slate-900">
            {{ reservation.reservationNumber }}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الطالب</span>
          <span class="font-medium">{{ reservation.studentName }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الفرع</span>
          <span class="font-medium">{{ reservation.branchName }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الحالة</span>
          <span class="font-medium">{{ reservation.statusLabel }}</span>
        </div>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <div class="rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">
        <p class="mb-3 text-xs font-semibold text-rose-300">
          المنتج الحالي
        </p>
        <p class="text-base font-bold text-white">
          {{ reservation.productName }}
        </p>
        <p class="mt-1 text-xs text-slate-400">
          مقدم من أ/ {{ reservation.teacherName || "—" }}
        </p>
        <div class="mt-3 space-y-1.5">
          <div class="flex items-center justify-between gap-2">
            <span class="text-slate-400">السعر</span>
            <span class="font-semibold text-slate-100">{{ reservation.sellingPriceLabel }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-slate-400">المدفوع</span>
            <span class="font-semibold text-slate-100">{{ reservation.paidAmountLabel }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-slate-400">المتبقي</span>
            <span class="font-semibold text-slate-100">{{ reservation.remainingAmountLabel }}</span>
          </div>
        </div>
      </div>

      <div
        class="rounded-xl border p-4 text-sm"
        :class="
          selectedNewProduct
            ? 'border-white/10 bg-slate-900 text-slate-200'
            : 'border-dashed border-slate-600 bg-slate-900/70 text-slate-300'
        "
      >
        <p
          class="mb-3 text-xs font-semibold"
          :class="selectedNewProduct ? 'text-emerald-300' : 'text-slate-400'"
        >
          المنتج الجديد
        </p>
        <template v-if="selectedNewProduct">
          <p class="text-base font-bold text-white">
            {{ selectedNewProduct.name }}
          </p>
          <p class="mt-1 text-xs text-slate-400">
            مقدم من أ/ {{ selectedNewProduct.teacherName || "—" }}
          </p>
          <div class="mt-3 space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-400">التوفر</span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="
                  selectedNewProduct.isAvailable
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                "
              >
                {{ selectedNewProduct.availabilityLabel }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-400">السعر</span>
              <span class="font-semibold text-slate-100">
                {{ selectedNewProduct.priceKindLabel }}
                {{ selectedNewProduct.priceLabel || "—" }}
              </span>
            </div>
          </div>
        </template>
        <p v-else class="text-sm text-slate-400">
          اختر المنتج البديل من قائمة منتجات الفرع المتاحة للحجز
        </p>
      </div>
    </div>

    <div
      v-if="priceComparison?.kind === 'less'"
      class="rounded-xl border px-4 py-3 text-sm"
      :class="priceComparison.boxClass"
    >
      <p class="font-semibold" :class="priceComparison.titleClass">
        {{ priceComparison.title }}
      </p>
      <div class="mt-2 grid gap-1 text-slate-300">
        <div class="flex items-center justify-between gap-2">
          <span>المدفوع على الحجز</span>
          <span class="font-medium text-slate-100">{{
            formatMoney(priceComparison.oldTotal)
          }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span>سعر المنتج الجديد</span>
          <span class="font-medium text-slate-100">{{
            formatMoney(priceComparison.newTotal)
          }}</span>
        </div>
        <div
          class="flex items-center justify-between gap-2 border-t border-white/10 pt-1"
        >
          <span>{{ priceComparison.diffLabel }}</span>
          <span class="font-bold" :class="priceComparison.diffClass">
            {{ formatMoney(Math.abs(priceComparison.difference)) }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2 text-right">
      <ProductSelect
        :model-value="newProductId"
        source="inventory"
        :branch-id="reservation.branchId"
        :inventory-query="{ forReservation: true }"
        :exclude-product-id="reservation.productId"
        label="المنتج الجديد"
        placeholder="اختر المنتج البديل من نفس الفرع"
        :invalid="!!exchangeError"
        :hint="
          !reservation.branchId
            ? 'لا يمكن تحميل منتجات الفرع لأن الفرع غير معروف لهذا الحجز.'
            : ''
        "
        @update:model-value="$emit('update:newProductId', $event)"
        @loaded="$emit('products-loaded', $event)"
        @loading="$emit('products-loading', $event)"
      />
      <p v-if="exchangeError" class="text-xs text-red-500">{{ exchangeError }}</p>
      <p v-if="exchangePaymentError" class="text-xs text-red-500">
        {{ exchangePaymentError }}
      </p>
    </div>

    <PaymentFields
      v-if="priceComparison?.kind === 'less'"
      :method="exchangeRefundMethod"
      :image="exchangeImage"
      :image-data-url="exchangeProofKey"
      method-label="طريقة رد فرق السعر"
      :method-invalid="!!exchangePaymentError"
      :method-error="exchangePaymentError"
      @update:method="$emit('update:exchangeRefundMethod', $event)"
      @update:image="$emit('update:exchangeImage', $event)"
      @update:image-data-url="$emit('update:exchangeProofKey', $event)"
    />
  </div>
</template>

<script setup>
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import ProductSelect from "~/components/shared/product-select/index.vue";
import { PaymentMethod } from "~/utils/paymentMethods";
import { formatMoney } from "~/utils/format";

defineProps({
  reservation: { type: Object, default: null },
  newProductId: { type: [String, Number], default: null },
  selectedNewProduct: { type: Object, default: null },
  priceComparison: { type: Object, default: null },
  exchangeError: { type: String, default: "" },
  exchangePaymentError: { type: String, default: "" },
  exchangeRefundMethod: { type: String, default: PaymentMethod.CASH },
  exchangeImage: { type: [Object, File], default: null },
  exchangeProofKey: { type: String, default: "" },
});

defineEmits([
  "update:newProductId",
  "update:exchangeRefundMethod",
  "update:exchangeImage",
  "update:exchangeProofKey",
  "products-loaded",
  "products-loading",
]);
</script>

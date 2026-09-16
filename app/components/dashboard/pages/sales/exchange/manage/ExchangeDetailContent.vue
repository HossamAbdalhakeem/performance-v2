<template>
  <div v-if="sale" class="flex flex-col gap-4">
    <div
      class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
    >
      <div class="grid gap-2 sm:grid-cols-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">رقم العملية</span>
          <span class="font-semibold text-slate-900">
            {{ sale.saleNumber }}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الطالب</span>
          <span class="font-medium">{{ sale.studentName }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الفرع</span>
          <span class="font-medium">{{ sale.branchName }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الكمية</span>
          <span class="font-medium">{{ sale.remainingQuantity }}</span>
        </div>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <div class="rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">
        <p class="mb-3 text-xs font-semibold text-rose-300">المنتج الحالي</p>
        <p class="text-base font-bold text-white">
          {{ sale.productName }}
        </p>
        <p class="mt-1 text-xs text-slate-400">
          أ/ {{ sale.teacherName || "—" }}
        </p>
        <div class="mt-3 flex items-center justify-between gap-2">
          <span class="text-slate-400">السعر</span>
          <span class="font-semibold text-slate-100">{{ sale.unitPriceLabel }}</span>
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
            أ/ {{ selectedNewProduct.teacherName || "—" }}
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
                {{ formatMoney(selectedNewProduct.unitPrice) }}
              </span>
            </div>
          </div>
        </template>
        <p v-else class="text-sm text-slate-400">
          {{ previewLoading ? "جاري حساب فرق السعر..." : "اختر منتجًا متاحًا من نفس الفرع" }}
        </p>
      </div>
    </div>

    <div
      v-if="priceComparison"
      class="rounded-xl border px-4 py-3 text-sm"
      :class="priceComparison.boxClass"
    >
      <p class="font-semibold" :class="priceComparison.titleClass">
        {{ priceComparison.title }}
      </p>
      <div class="mt-2 grid gap-1 text-slate-300">
        <div class="flex items-center justify-between gap-2">
          <span>سعر المنتج الحالي</span>
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
        :branch-id="sale.branchId"
        :inventory-query="{ availableOnly: true }"
        :exclude-product-id="sale.productId"
        :min-available-quantity="Number(sale.remainingQuantity || 1)"
        label="المنتج الجديد"
        placeholder="اختر المنتج البديل من نفس الفرع"
        :invalid="!!exchangeError"
        @update:model-value="$emit('update:newProductId', $event)"
      />
      <p v-if="exchangeError" class="text-xs text-red-500">{{ exchangeError }}</p>
    </div>

    <PaymentFields
      v-if="priceComparison?.kind === 'more'"
      :method="exchangePaymentMethod"
      :image="exchangeImage"
      :image-data-url="exchangeProofKey"
      method-label="طريقة تحصيل فرق السعر"
      :method-invalid="!!exchangePaymentError"
      :method-error="exchangePaymentError"
      @update:method="$emit('update:exchangePaymentMethod', $event)"
      @update:image="$emit('update:exchangeImage', $event)"
      @update:image-data-url="$emit('update:exchangeProofKey', $event)"
    />

    <PaymentFields
      v-else-if="priceComparison?.kind === 'less'"
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
  sale: { type: Object, default: null },
  newProductId: { type: [String, Number], default: null },
  selectedNewProduct: { type: Object, default: null },
  priceComparison: { type: Object, default: null },
  previewLoading: { type: Boolean, default: false },
  exchangeError: { type: String, default: "" },
  exchangePaymentError: { type: String, default: "" },
  exchangePaymentMethod: { type: String, default: PaymentMethod.CASH },
  exchangeRefundMethod: { type: String, default: PaymentMethod.CASH },
  exchangeImage: { type: [Object, File], default: null },
  exchangeProofKey: { type: String, default: "" },
});

defineEmits([
  "update:newProductId",
  "update:exchangePaymentMethod",
  "update:exchangeRefundMethod",
  "update:exchangeImage",
  "update:exchangeProofKey",
]);
</script>

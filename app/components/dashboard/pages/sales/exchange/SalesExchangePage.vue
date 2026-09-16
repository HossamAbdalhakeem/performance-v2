<template>
  <div class="space-y-6 text-right" dir="rtl">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">استبدال واسترداد المبيعات</span>
      </template>
      <template #content>
        <div class="mb-5 grid gap-3 md:grid-cols-2">
          <SearchInput
            placeholder="رقم العملية / طالب / منتج / موبايل"
            @search="onSearch"
          />
          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">الحالة</label>
            <Select
              v-model="filters.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="كل الحالات"
              show-clear
              class="w-full"
              @update:modelValue="loadData"
            />
          </div>
        </div>

        <SalesExchangeTable
          :sales="sales"
          :loading="loading"
          @exchange="openExchangeDialog"
          @refund="openRefundDialog"
        />
      </template>
    </Card>

    <!-- Refund detail -->
    <Dialog
      v-model:visible="refundDetailVisible"
      modal
      dir="rtl"
      header="تفاصيل البيع قبل الاسترداد"
      :style="{ width: '560px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @hide="closeRefundFlow"
    >
      <div v-if="selectedSale" class="flex flex-col gap-4">
        <div
          class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
        >
          <div class="grid gap-2">
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">رقم العملية</span>
              <span class="font-semibold text-slate-900">
                {{ selectedSale.saleNumber }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الطالب</span>
              <span class="font-medium">{{ selectedSale.studentName }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الموبايل</span>
              <span class="font-medium">{{ selectedSale.phone || "—" }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">المنتج</span>
              <span class="font-medium">{{ selectedSale.productName }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الفرع</span>
              <span class="font-medium">{{ selectedSale.branchName }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الكمية القابلة للاسترداد</span>
              <span class="font-medium">{{ selectedSale.remainingQuantity }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">طريقة الدفع الأصلية</span>
              <span class="font-medium">{{ selectedSale.paymentMethodLabel }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">مبلغ الاسترداد</span>
              <span class="font-semibold text-emerald-700">
                {{ selectedSale.refundAmountLabel }}
              </span>
            </div>
          </div>
        </div>

        <PaymentFields
          v-model:method="refundMethod"
          v-model:image="refundImage"
          v-model:image-data-url="refundProofKey"
          method-label="طريقة الاسترداد"
          image-label="صورة إثبات الاسترداد (اختياري)"
          :show-image-when="'never'"
          :require-image-when="'never'"
          :method-invalid="!!refundError"
          :method-error="refundError"
        />

        <div
          class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <p class="font-semibold">عند الاسترداد سيتم:</p>
          <ul class="mt-2 list-disc space-y-1 pr-5">
            <li>إرجاع مبلغ {{ selectedSale.refundAmountLabel }} للطالب</li>
            <li>إعادة الكمية إلى مخزون الفرع</li>
            <li>تسجيل عملية الاسترداد في التقارير</li>
          </ul>
        </div>
      </div>

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد الاسترداد"
            severity="danger"
            icon="pi pi-replay"
            :disabled="!selectedSale || busy"
            @click="requestRefundConfirm"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="closeRefundFlow"
          />
        </div>
      </template>
    </Dialog>

    <!-- Refund confirm -->
    <Dialog
      v-model:visible="refundConfirmVisible"
      modal
      dir="rtl"
      header="تأكيد الاسترداد"
      :closable="!busy"
      :dismissable-mask="!busy"
      :close-on-escape="!busy"
      :style="{ width: '420px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    >
      <div class="space-y-3 text-sm text-slate-700">
        <p>
          هل أنت متأكد من استرداد
          <span class="font-bold text-slate-900">
            {{ selectedSale?.productName }}
          </span>
          من العملية
          <span class="font-bold text-slate-900">
            {{ selectedSale?.saleNumber }}
          </span>
          ؟
        </p>
        <p
          class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700"
        >
          لا يمكن التراجع عن هذا الإجراء بعد التأكيد.
        </p>
        <p class="text-slate-600">
          سيتم تسجيل استرداد بمبلغ
          <span class="font-semibold text-emerald-700">
            {{ selectedSale?.refundAmountLabel }}
          </span>
          عبر
          <span class="font-semibold">{{ METHOD_LABELS[refundMethod] || refundMethod }}</span>
        </p>
      </div>

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="نعم، تأكيد الاسترداد"
            severity="danger"
            :loading="busy"
            :disabled="busy"
            @click="confirmRefund"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="refundConfirmVisible = false"
          />
        </div>
      </template>
    </Dialog>

    <!-- Exchange detail -->
    <Dialog
      v-model:visible="exchangeDetailVisible"
      modal
      dir="rtl"
      header="استبدال منتج البيع"
      :style="{ width: '760px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @hide="closeExchangeFlow"
    >
      <div v-if="selectedSale" class="flex flex-col gap-4">
        <div
          class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
        >
          <div class="grid gap-2 sm:grid-cols-2">
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">رقم العملية</span>
              <span class="font-semibold text-slate-900">
                {{ selectedSale.saleNumber }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الطالب</span>
              <span class="font-medium">{{ selectedSale.studentName }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الفرع</span>
              <span class="font-medium">{{ selectedSale.branchName }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الكمية</span>
              <span class="font-medium">{{ selectedSale.remainingQuantity }}</span>
            </div>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">
            <p class="mb-3 text-xs font-semibold text-rose-300">المنتج الحالي</p>
            <p class="text-base font-bold text-white">
              {{ selectedSale.productName }}
            </p>
            <p class="mt-1 text-xs text-slate-400">
              أ/ {{ selectedSale.teacherName || "—" }}
            </p>
            <div class="mt-3 flex items-center justify-between gap-2">
              <span class="text-slate-400">السعر</span>
              <span class="font-semibold text-slate-100">{{ selectedSale.unitPriceLabel }}</span>
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
              اختر منتجًا متاحًا من نفس الفرع
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
              <span class="font-medium text-slate-100">{{ formatMoney(priceComparison.oldTotal) }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span>سعر المنتج الجديد</span>
              <span class="font-medium text-slate-100">{{ formatMoney(priceComparison.newTotal) }}</span>
            </div>
            <div class="flex items-center justify-between gap-2 border-t border-white/10 pt-1">
              <span>{{ priceComparison.diffLabel }}</span>
              <span class="font-bold" :class="priceComparison.diffClass">
                {{ formatMoney(Math.abs(priceComparison.difference)) }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium text-slate-700">المنتج الجديد</label>
          <Select
            v-model="newProductId"
            :options="productOptions"
            option-label="label"
            option-value="value"
            placeholder="اختر المنتج البديل من نفس الفرع"
            filter
            :filter-fields="['name', 'teacherName', 'label']"
            :loading="loadingProducts"
            :disabled="loadingProducts || !selectedSale.branchId"
            class="w-full product-select"
            :invalid="!!exchangeError"
          >
            <template #value="{ placeholder }">
              <div v-if="selectedNewProduct" class="w-full py-0.5 text-right">
                <div class="flex items-start justify-between gap-3">
                  <span class="font-medium text-slate-900">
                    {{ selectedNewProduct.name }}
                  </span>
                  <span
                    class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="
                      selectedNewProduct.isAvailable
                        ? 'bg-emerald-500/15 text-emerald-700'
                        : 'bg-amber-500/15 text-amber-700'
                    "
                  >
                    {{ selectedNewProduct.availabilityLabel }}
                  </span>
                </div>
                <div class="mt-0.5 flex items-center justify-between gap-3">
                  <p class="text-xs text-slate-500">
                    أ/ {{ selectedNewProduct.teacherName || "-" }}
                  </p>
                  <span class="text-xs text-sky-700">
                    {{ formatMoney(selectedNewProduct.unitPrice) }}
                  </span>
                </div>
              </div>
              <span v-else>{{ placeholder }}</span>
            </template>
            <template #option="{ option }">
              <div class="w-full py-1 text-right">
                <div class="flex items-start justify-between gap-3">
                  <span class="font-medium">{{ option.name }}</span>
                  <span
                    class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="
                      option.isAvailable
                        ? 'bg-emerald-500/15 text-emerald-700'
                        : 'bg-amber-500/15 text-amber-700'
                    "
                  >
                    {{ option.availabilityLabel }}
                  </span>
                </div>
                <div class="mt-0.5 flex items-center justify-between gap-3">
                  <p class="text-xs text-slate-400">
                    أ/ {{ option.teacherName || "-" }}
                  </p>
                  <span class="text-sm text-sky-600">
                    {{ formatMoney(option.unitPrice) }}
                  </span>
                </div>
              </div>
            </template>
          </Select>
          <p v-if="exchangeError" class="text-xs text-red-500">{{ exchangeError }}</p>
        </div>

        <PaymentFields
          v-if="priceComparison?.kind === 'more'"
          v-model:method="exchangePaymentMethod"
          v-model:image="exchangeImage"
          v-model:image-data-url="exchangeProofKey"
          method-label="طريقة تحصيل فرق السعر"
          :method-invalid="!!exchangePaymentError"
          :method-error="exchangePaymentError"
        />

        <PaymentFields
          v-else-if="priceComparison?.kind === 'less'"
          v-model:method="exchangeRefundMethod"
          v-model:image="exchangeImage"
          v-model:image-data-url="exchangeProofKey"
          method-label="طريقة رد فرق السعر"
          :method-invalid="!!exchangePaymentError"
          :method-error="exchangePaymentError"
        />
      </div>

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد الاستبدال"
            severity="info"
            icon="pi pi-sync"
            :disabled="!selectedSale || busy"
            @click="requestExchangeConfirm"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="closeExchangeFlow"
          />
        </div>
      </template>
    </Dialog>

    <!-- Exchange confirm -->
    <Dialog
      v-model:visible="exchangeConfirmVisible"
      modal
      dir="rtl"
      header="تأكيد استبدال المنتج"
      :closable="!busy"
      :dismissable-mask="!busy"
      :close-on-escape="!busy"
      :style="{ width: '520px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    >
      <div class="space-y-3 text-sm text-slate-700">
        <p>
          هل أنت متأكد من استبدال منتج العملية
          <span class="font-bold text-slate-900">
            {{ selectedSale?.saleNumber }}
          </span>
          ؟
        </p>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-white/10 bg-slate-900 px-3 py-2">
            <p class="text-xs text-rose-300">من</p>
            <p class="mt-1 font-semibold text-white">
              {{ selectedSale?.productName }}
            </p>
            <p class="mt-0.5 text-xs text-slate-400">
              {{ selectedSale?.unitPriceLabel }}
            </p>
          </div>
          <div class="rounded-lg border border-white/10 bg-slate-900 px-3 py-2">
            <p class="text-xs text-emerald-300">إلى</p>
            <p class="mt-1 font-semibold text-white">
              {{ selectedNewProduct?.name || "—" }}
            </p>
            <p class="mt-0.5 text-xs text-slate-400">
              {{
                selectedNewProduct
                  ? formatMoney(selectedNewProduct.unitPrice)
                  : "—"
              }}
            </p>
          </div>
        </div>
        <p
          v-if="priceComparison"
          class="rounded-lg border px-3 py-2 text-slate-200"
          :class="priceComparison.boxClass"
        >
          {{ priceComparison.confirmText }}
        </p>
      </div>

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="نعم، تأكيد الاستبدال"
            severity="info"
            :loading="busy"
            :disabled="busy"
            @click="confirmExchange"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="exchangeConfirmVisible = false"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import SalesExchangeTable from "~/components/dashboard/pages/sales/exchange/SalesExchangeTable.vue";
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import SearchInput from "~/components/shared/search-input/index.vue";
import { exchangeService } from "~/services/exchangeService";
import { inventoryService } from "~/services/inventoryService";
import { returnService } from "~/services/returnService";
import { saleService } from "~/services/saleService";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "SalesExchangePage" });

const STATUS_META = {
  COMPLETED: { label: "مكتمل", severity: "success" },
  PARTIALLY_RETURNED: { label: "مسترد جزئيًا", severity: "warn" },
  RETURNED: { label: "تم الاسترداد", severity: "danger" },
};

const METHOD_LABELS = {
  CASH: "كاش",
  INSTAPAY: "انستا باي",
  WALLET: "محفظة إلكترونية",
};

const { showError, showSuccess } = useAppToast();

const loading = ref(true);
const busy = ref(false);
const loadingProducts = ref(false);
const selectedSale = ref(null);
const sales = ref([]);
const productOptions = ref([]);
const newProductId = ref(null);
const exchangeError = ref("");
const exchangePaymentError = ref("");
const refundError = ref("");
const filters = reactive({
  search: "",
  status: null,
});

const refundMethod = ref("CASH");
const refundImage = ref(null);
const refundProofKey = ref("");

const exchangePaymentMethod = ref("CASH");
const exchangeRefundMethod = ref("CASH");
const exchangeImage = ref(null);
const exchangeProofKey = ref("");

const refundDetailVisible = ref(false);
const refundConfirmVisible = ref(false);
const exchangeDetailVisible = ref(false);
const exchangeConfirmVisible = ref(false);

const statusOptions = Object.entries(STATUS_META).map(([value, meta]) => ({
  label: meta.label,
  value,
}));

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} ج.م`;
const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;
const toMoneyNumber = (value) => {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const normalizeSaleRow = (sale, item) => {
  const status = String(sale.status || "COMPLETED").toUpperCase();
  const meta = STATUS_META[status] || {
    label: status || "-",
    severity: "secondary",
  };
  const method = String(
    sale.payments?.[0]?.method || sale.paymentMethod || "",
  ).toUpperCase();
  const createdAt = sale.createdAt || sale.created_at;
  const quantity = Number(item?.quantity ?? 1);
  const returnedQuantity = Number(item?.returnedQuantity ?? 0);
  const remainingQuantity = Math.max(quantity - returnedQuantity, 0);
  const unitPrice = toMoneyNumber(item?.unitPrice ?? item?.unit_price);
  const lineTotal = roundMoney(unitPrice * remainingQuantity);
  const product = item?.product || sale.product || {};

  return {
    id: `${sale.id}:${item?.id || "sale"}`,
    saleId: sale.id,
    saleItemId: item?.id || null,
    productId: item?.productId || product.id || null,
    branchId: sale.branchId || sale.branch_id || sale.branch?.id || null,
    saleNumber:
      sale.saleNumber ||
      sale.sale_number ||
      sale.receiptNumber ||
      sale.code ||
      sale.id,
    studentName: sale.student?.name || "-",
    phone: sale.student?.phone || "",
    productName: product.name || "-",
    teacherName: product.teacher?.name || product.teacherName || "-",
    branchName: sale.branch?.name || "-",
    quantity,
    returnedQuantity,
    remainingQuantity,
    unitPrice,
    unitPriceLabel: formatMoney(unitPrice),
    amount: lineTotal,
    amountLabel: formatMoney(lineTotal),
    refundAmount: lineTotal,
    refundAmountLabel: formatMoney(lineTotal),
    paymentMethod: method,
    paymentMethodLabel: METHOD_LABELS[method] || method || "—",
    createdAt,
    createdAtLabel: formatDateTime(createdAt),
    status,
    statusLabel: meta.label,
    statusSeverity: meta.severity,
    canModify: status !== "RETURNED" && remainingQuantity > 0 && !!item?.id,
  };
};

const expandSales = (list) =>
  (list || []).flatMap((sale) => {
    const items = Array.isArray(sale.items) ? sale.items : [];
    if (!items.length) return [normalizeSaleRow(sale, null)];
    return items.map((item) => normalizeSaleRow(sale, item));
  });

const selectedNewProduct = computed(
  () =>
    productOptions.value.find((item) => item.value === newProductId.value) ||
    null,
);

const priceComparison = computed(() => {
  if (!selectedSale.value || !selectedNewProduct.value) return null;

  const qty = Number(selectedSale.value.remainingQuantity || 1);
  const oldTotal = roundMoney(selectedSale.value.unitPrice * qty);
  const newTotal = roundMoney(selectedNewProduct.value.unitPrice * qty);
  const difference = roundMoney(newTotal - oldTotal);

  if (difference > 0) {
    return {
      kind: "more",
      oldTotal,
      newTotal,
      difference,
      title: "الطالب سيدفع فرق سعر إضافي",
      titleClass: "text-amber-300",
      boxClass: "border-white/10 bg-slate-900",
      diffLabel: "المبلغ المطلوب تحصيله",
      diffClass: "text-amber-300",
      confirmText: `سيتم تحصيل فرق سعر قدره ${formatMoney(difference)} من الطالب.`,
    };
  }

  if (difference < 0) {
    return {
      kind: "less",
      oldTotal,
      newTotal,
      difference,
      title: "سيتم رد فرق السعر للطالب",
      titleClass: "text-emerald-300",
      boxClass: "border-white/10 bg-slate-900",
      diffLabel: "المبلغ الذي سيُرد للطالب",
      diffClass: "text-emerald-300",
      confirmText: `سيتم رد فرق سعر قدره ${formatMoney(Math.abs(difference))} للطالب.`,
    };
  }

  return {
    kind: "same",
    oldTotal,
    newTotal,
    difference: 0,
    title: "نفس السعر — لا يوجد فرق مالي",
    titleClass: "text-sky-300",
    boxClass: "border-white/10 bg-slate-900",
    diffLabel: "فرق السعر",
    diffClass: "text-sky-300",
    confirmText: "السعر متساوٍ ولن يتم تحصيل أو رد أي مبلغ.",
  };
});

const mapInventoryProductOption = (item) => {
  const product = item.product || item;
  const teacherName =
    product.teacher?.name || product.teacherName || product.teacher_name || "";
  const availableQuantity = Number(
    item.availableQuantity ??
      Math.max(
        0,
        Number(item.physicalQuantity || 0) - Number(item.reservedQuantity || 0),
      ),
  );
  const isAvailable = availableQuantity > 0;
  const unitPrice = toMoneyNumber(
    product.sellingPrice ?? product.selling_price,
  );
  const name = product.name || product.title || "-";
  const availabilityLabel = isAvailable
    ? `متاح ${availableQuantity}`
    : "غير متاح";

  return {
    name,
    teacherName,
    unitPrice,
    availableQuantity,
    isAvailable,
    availabilityLabel,
    label: `${name} · ${availabilityLabel} · ${unitPrice.toFixed(2)}ج.م`,
    value: product.id || item.productId,
  };
};

const buildQuery = () => {
  const params = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.status) params.status = filters.status;
  return params;
};

const loadData = async () => {
  loading.value = true;
  try {
    const items = await saleService.getSales(buildQuery());
    sales.value = expandSales(items);
  } catch (error) {
    showError(error?.message || "تعذر تحميل المبيعات.");
    sales.value = [];
  } finally {
    loading.value = false;
  }
};

const onSearch = (value) => {
  filters.search = value;
  loadData();
};

const loadProducts = async () => {
  loadingProducts.value = true;
  productOptions.value = [];
  try {
    const branchId = selectedSale.value?.branchId;
    if (!branchId) {
      showError("تعذر تحديد فرع البيع لتحميل المنتجات المتاحة.");
      return;
    }

    const items = await inventoryService.getBranchInventory(branchId, {
      availableOnly: true,
    });
    const list = Array.isArray(items) ? items : items?.data || [];
    const currentProductId = selectedSale.value?.productId;
    const neededQty = Number(selectedSale.value?.remainingQuantity || 1);

    productOptions.value = list
      .map(mapInventoryProductOption)
      .filter((option) => option.value && option.value !== currentProductId)
      .filter((option) => option.availableQuantity >= neededQty);
  } catch (error) {
    productOptions.value = [];
    showError(error?.message || "تعذر تحميل منتجات الفرع المتاحة.");
  } finally {
    loadingProducts.value = false;
  }
};

const resetRefundFields = () => {
  refundMethod.value = "CASH";
  refundImage.value = null;
  refundProofKey.value = "";
  refundError.value = "";
};

const resetExchangeFields = () => {
  newProductId.value = null;
  exchangeError.value = "";
  exchangePaymentError.value = "";
  exchangePaymentMethod.value = "CASH";
  exchangeRefundMethod.value = "CASH";
  exchangeImage.value = null;
  exchangeProofKey.value = "";
};

const openRefundDialog = (item) => {
  selectedSale.value = item;
  resetRefundFields();
  refundConfirmVisible.value = false;
  exchangeDetailVisible.value = false;
  exchangeConfirmVisible.value = false;
  refundDetailVisible.value = true;
};

const closeRefundFlow = () => {
  if (busy.value) return;
  refundDetailVisible.value = false;
  refundConfirmVisible.value = false;
  resetRefundFields();
  if (!exchangeDetailVisible.value) selectedSale.value = null;
};

const requestRefundConfirm = () => {
  refundError.value = "";
  if (!refundMethod.value) {
    refundError.value = "اختر طريقة الاسترداد.";
    return;
  }
  refundConfirmVisible.value = true;
};

const confirmRefund = async () => {
  if (!selectedSale.value?.saleId || !selectedSale.value?.saleItemId) return;
  busy.value = true;
  try {
    await returnService.createReturn({
      saleId: selectedSale.value.saleId,
      saleItemId: selectedSale.value.saleItemId,
      quantity: selectedSale.value.remainingQuantity,
      method: refundMethod.value,
    });
    refundConfirmVisible.value = false;
    refundDetailVisible.value = false;
    selectedSale.value = null;
    resetRefundFields();
    showSuccess("تم استرداد المنتج بنجاح.");
    await loadData();
  } catch (error) {
    showError(error?.message || "تعذر تنفيذ الاسترداد.");
  } finally {
    busy.value = false;
  }
};

const openExchangeDialog = async (item) => {
  selectedSale.value = item;
  resetExchangeFields();
  refundDetailVisible.value = false;
  refundConfirmVisible.value = false;
  exchangeConfirmVisible.value = false;
  exchangeDetailVisible.value = true;
  await loadProducts();
};

const closeExchangeFlow = () => {
  if (busy.value) return;
  exchangeDetailVisible.value = false;
  exchangeConfirmVisible.value = false;
  resetExchangeFields();
  if (!refundDetailVisible.value) selectedSale.value = null;
};

const needsProof = (method) =>
  method === "WALLET" || method === "INSTAPAY";

const requestExchangeConfirm = () => {
  exchangeError.value = "";
  exchangePaymentError.value = "";

  if (!newProductId.value) {
    exchangeError.value = "اختر المنتج الجديد قبل التأكيد.";
    return;
  }
  if (newProductId.value === selectedSale.value?.productId) {
    exchangeError.value = "اختر منتجًا مختلفًا عن المنتج الحالي.";
    return;
  }
  if (!selectedNewProduct.value?.isAvailable) {
    exchangeError.value = "المنتج المختار غير متاح في مخزون الفرع.";
    return;
  }

  const comparison = priceComparison.value;
  if (comparison?.kind === "more") {
    if (!exchangePaymentMethod.value) {
      exchangePaymentError.value = "اختر طريقة تحصيل فرق السعر.";
      return;
    }
    if (
      needsProof(exchangePaymentMethod.value) &&
      !String(exchangeProofKey.value || "").trim()
    ) {
      exchangePaymentError.value = "صورة إثبات الدفع مطلوبة لطريقة الدفع المحددة.";
      return;
    }
  }

  if (comparison?.kind === "less") {
    if (!exchangeRefundMethod.value) {
      exchangePaymentError.value = "اختر طريقة رد فرق السعر.";
      return;
    }
    if (
      needsProof(exchangeRefundMethod.value) &&
      !String(exchangeProofKey.value || "").trim()
    ) {
      exchangePaymentError.value = "صورة إثبات الرد مطلوبة لطريقة الرد المحددة.";
      return;
    }
  }

  exchangeConfirmVisible.value = true;
};

const confirmExchange = async () => {
  if (
    !selectedSale.value?.saleId ||
    !selectedSale.value?.saleItemId ||
    !newProductId.value
  ) {
    return;
  }

  busy.value = true;
  try {
    const comparison = priceComparison.value;
    const payload = {
      saleId: selectedSale.value.saleId,
      saleItemId: selectedSale.value.saleItemId,
      newProductId: newProductId.value,
      quantity: selectedSale.value.remainingQuantity,
    };

    if (comparison?.kind === "more") {
      payload.paymentMethod = exchangePaymentMethod.value;
      if (exchangeProofKey.value) {
        payload.proofReference = exchangeProofKey.value;
      }
    } else if (comparison?.kind === "less") {
      payload.refundMethod = exchangeRefundMethod.value;
      if (exchangeProofKey.value) {
        payload.proofReference = exchangeProofKey.value;
      }
    }

    await exchangeService.createExchange(payload);
    exchangeConfirmVisible.value = false;
    exchangeDetailVisible.value = false;
    selectedSale.value = null;
    resetExchangeFields();
    showSuccess("تم استبدال المنتج بنجاح.");
    await loadData();
  } catch (error) {
    showError(error?.message || "تعذر تنفيذ الاستبدال.");
  } finally {
    busy.value = false;
  }
};

watch(newProductId, () => {
  if (exchangeError.value) exchangeError.value = "";
  if (exchangePaymentError.value) exchangePaymentError.value = "";
});

watch(refundMethod, () => {
  if (refundError.value) refundError.value = "";
});

onMounted(loadData);
</script>

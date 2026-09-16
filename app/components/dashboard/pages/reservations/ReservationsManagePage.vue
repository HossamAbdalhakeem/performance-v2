<template>
  <div class="space-y-6 text-right" dir="rtl">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">الحجوزات</span>
      </template>
      <template #content>
        <div class="mb-5 grid gap-3 md:grid-cols-2">
          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">بحث</label>
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="filters.searchInput"
                class="w-full"
                placeholder="رقم الحجز / طالب / منتج"
              />
            </IconField>
          </div>
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

        <ReservationsTable
          :reservations="reservations"
          :loading="loading"
          @change-product="openExchangeDialog"
          @cancel="openCancelDialog"
        />
      </template>
    </Card>

    <Dialog
      v-model:visible="cancelDetailVisible"
      modal
      dir="rtl"
      header="تفاصيل الحجز قبل الإلغاء"
      :style="{ width: '560px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @hide="closeCancelFlow"
    >
      <div v-if="selectedReservation" class="flex flex-col gap-4">
        <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <div class="grid gap-2">
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">رقم الحجز</span>
              <span class="font-semibold text-slate-900">
                {{ selectedReservation.reservationNumber }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الطالب</span>
              <span class="font-medium">{{ selectedReservation.studentName }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الموبايل</span>
              <span class="font-medium">{{ selectedReservation.phone || "—" }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">المنتج</span>
              <span class="font-medium">{{ selectedReservation.productName }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الفرع</span>
              <span class="font-medium">{{ selectedReservation.branchName }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الكمية</span>
              <span class="font-medium">{{ selectedReservation.quantity }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الحالة</span>
              <span class="font-medium">{{ selectedReservation.statusLabel }}</span>
            </div>
          </div>

          <div class="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-white p-3">
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">إجمالي المبلغ</span>
              <span class="font-semibold">
                {{ formatMoney(selectedReservation.totalAmount) }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">المدفوع (مقدم)</span>
              <span class="font-semibold text-emerald-700">
                {{ selectedReservation.paidAmountLabel }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
              <span class="text-slate-500">المتبقي</span>
              <span class="font-semibold text-orange-600">
                {{ selectedReservation.remainingAmountLabel }}
              </span>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p class="font-semibold">عند الإلغاء سيتم:</p>
          <ul class="mt-2 list-disc space-y-1 pr-5">
            <li>إرجاع المبلغ المدفوع للطالب (إن وجد)</li>
            <li>تحرير الكمية المحجوزة من المخزون</li>
            <li>جعل المنتج متاحًا للبيع مرة أخرى</li>
          </ul>
        </div>
      </div>

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد إلغاء الحجز"
            severity="danger"
            icon="pi pi-times"
            :disabled="!selectedReservation || busy"
            @click="cancelConfirmVisible = true"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="closeCancelFlow"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="cancelConfirmVisible"
      modal
      dir="rtl"
      header="تأكيد الإلغاء"
      :closable="!busy"
      :dismissable-mask="!busy"
      :close-on-escape="!busy"
      :style="{ width: '420px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    >
      <div class="space-y-3 text-sm text-slate-700">
        <p>
          هل أنت متأكد من إلغاء الحجز
          <span class="font-bold text-slate-900">
            {{ selectedReservation?.reservationNumber }}
          </span>
          ؟
        </p>
        <p class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
          لا يمكن التراجع عن هذا الإجراء بعد التأكيد.
        </p>
        <p v-if="Number(selectedReservation?.paidAmount) > 0" class="text-slate-600">
          سيتم تسجيل استرداد بمبلغ
          <span class="font-semibold text-emerald-700">
            {{ selectedReservation?.paidAmountLabel }}
          </span>
        </p>
      </div>

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="نعم، إلغاء الحجز"
            severity="danger"
            :loading="busy"
            :disabled="busy"
            @click="confirmCancel"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="cancelConfirmVisible = false"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="exchangeDetailVisible"
      modal
      dir="rtl"
      header="استبدال منتج الحجز"
      :style="{ width: '720px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @hide="closeExchangeFlow"
    >
      <div v-if="selectedReservation" class="flex flex-col gap-4">
        <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <div class="grid gap-2 sm:grid-cols-2">
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">رقم الحجز</span>
              <span class="font-semibold text-slate-900">
                {{ selectedReservation.reservationNumber }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الطالب</span>
              <span class="font-medium">{{ selectedReservation.studentName }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الفرع</span>
              <span class="font-medium">{{ selectedReservation.branchName }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-500">الحالة</span>
              <span class="font-medium">{{ selectedReservation.statusLabel }}</span>
            </div>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">
            <p class="mb-3 text-xs font-semibold text-rose-300">
              المنتج الحالي
            </p>
            <p class="text-base font-bold text-white">
              {{ selectedReservation.productName }}
            </p>
            <p class="mt-1 text-xs text-slate-400">
              مقدم من أ/ {{ selectedReservation.teacherName || "—" }}
            </p>
            <div class="mt-3 space-y-1.5">
              <div class="flex items-center justify-between gap-2">
                <span class="text-slate-400">السعر</span>
                <span class="font-semibold text-slate-100">{{ selectedReservation.sellingPriceLabel }}</span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <span class="text-slate-400">المدفوع</span>
                <span class="font-semibold text-slate-100">{{ selectedReservation.paidAmountLabel }}</span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <span class="text-slate-400">المتبقي</span>
                <span class="font-semibold text-slate-100">{{ selectedReservation.remainingAmountLabel }}</span>
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
            :disabled="loadingProducts || !selectedReservation.branchId"
            class="w-full product-select"
            :invalid="!!exchangeError"
          >
            <template #value="{ placeholder }">
              <div v-if="selectedNewProduct" class="w-full py-0.5 text-right">
                <div class="flex items-start justify-between gap-3">
                  <span class="font-medium text-slate-900">{{ selectedNewProduct.name }}</span>
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
                    مقدم من أ/ {{ selectedNewProduct.teacherName || "-" }}
                  </p>
                  <span
                    v-if="selectedNewProduct.priceLabel"
                    class="text-xs"
                    :class="
                      selectedNewProduct.isSellingPrice
                        ? 'text-sky-700'
                        : 'text-amber-700'
                    "
                  >
                    {{ selectedNewProduct.priceKindLabel }}
                    {{ selectedNewProduct.priceLabel }}
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
                    مقدم من أ/ {{ option.teacherName || "-" }}
                  </p>
                  <span
                    v-if="option.priceLabel"
                    class="shrink-0 text-sm"
                    :class="
                      option.isSellingPrice ? 'text-sky-600' : 'text-amber-700'
                    "
                  >
                    {{ option.priceKindLabel }} {{ option.priceLabel }}
                  </span>
                </div>
              </div>
            </template>
          </Select>
          <p v-if="!selectedReservation.branchId" class="text-xs text-amber-600">
            لا يمكن تحميل منتجات الفرع لأن الفرع غير معروف لهذا الحجز.
          </p>
          <p v-if="exchangeError" class="text-xs text-red-500">{{ exchangeError }}</p>
          <p v-if="exchangePaymentError" class="text-xs text-red-500">
            {{ exchangePaymentError }}
          </p>
        </div>

        <PaymentFields
          v-if="priceComparison?.kind === 'less'"
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
            :disabled="!selectedReservation || busy"
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
          هل أنت متأكد من استبدال منتج الحجز
          <span class="font-bold text-slate-900">
            {{ selectedReservation?.reservationNumber }}
          </span>
          ؟
        </p>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-white/10 bg-slate-900 px-3 py-2">
            <p class="text-xs text-rose-300">من</p>
            <p class="mt-1 font-semibold text-white">
              {{ selectedReservation?.productName }}
            </p>
            <p class="mt-0.5 text-xs text-slate-400">
              أ/ {{ selectedReservation?.teacherName || "—" }}
            </p>
          </div>
          <div class="rounded-lg border border-white/10 bg-slate-900 px-3 py-2">
            <p class="text-xs text-emerald-300">إلى</p>
            <p class="mt-1 font-semibold text-white">
              {{ selectedNewProduct?.name || "—" }}
            </p>
            <p class="mt-0.5 text-xs text-slate-400">
              أ/ {{ selectedNewProduct?.teacherName || "—" }}
              <span v-if="selectedNewProduct?.priceLabel">
                · {{ selectedNewProduct.priceKindLabel }}
                {{ selectedNewProduct.priceLabel }}
              </span>
            </p>
          </div>
        </div>
        <p
          v-if="priceComparison?.kind === 'less'"
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
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import ReservationsTable from "~/components/dashboard/pages/reservations/ReservationsTable.vue";
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import { inventoryService } from "~/services/inventoryService";
import { reservationService } from "~/services/reservationService";
import { useThrottledCallback } from "~/composables/useThrottledCallback";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "ReservationsManagePage" });

const STATUS_META = {
  PENDING: { label: "قيد الانتظار", severity: "warn" },
  WAITING_FOR_STOCK: { label: "بانتظار المخزون", severity: "warn" },
  READY: { label: "جاهز", severity: "info" },
  DELIVERED: { label: "تم التسليم", severity: "success" },
  CANCELLED: { label: "ملغي", severity: "danger" },
};

const { showError, showSuccess } = useAppToast();

const loading = ref(true);
const busy = ref(false);
const loadingProducts = ref(false);
const selectedReservation = ref(null);
const reservations = ref([]);
const productOptions = ref([]);
const newProductId = ref(null);
const exchangeError = ref("");
const exchangePaymentError = ref("");
const exchangeRefundMethod = ref("CASH");
const exchangeImage = ref(null);
const exchangeProofKey = ref("");
const filters = reactive({
  searchInput: "",
  search: "",
  status: null,
});

const cancelDetailVisible = ref(false);
const cancelConfirmVisible = ref(false);
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

const getRemainingAmount = (item) => {
  const total = Number(item.totalAmount ?? item.total_amount ?? 0);
  const paid = Number(item.paidAmount ?? item.paid_amount ?? 0);
  return roundMoney(Math.max(total - paid, 0));
};

const normalizeReservation = (item) => {
  const status = String(item.status || "").toUpperCase();
  const meta = STATUS_META[status] || {
    label: status || "-",
    severity: "secondary",
  };
  const sellingPrice = Number(
    item.product?.sellingPrice ??
      item.product?.selling_price ??
      item.reservationPrice ??
      item.reservation_price ??
      0,
  );
  const totalAmount = Number(item.totalAmount ?? item.total_amount ?? 0);
  const paidAmount = Number(item.paidAmount ?? item.paid_amount ?? 0);
  const remainingAmount = getRemainingAmount(item);
  const createdAt = item.createdAt || item.created_at;
  const productId = item.productId || item.product_id || item.product?.id || null;
  const branchId = item.branchId || item.branch_id || item.branch?.id || null;

  return {
    ...item,
    productId,
    branchId,
    reservationNumber:
      item.reservationNumber || item.reservation_number || item.code || item.id,
    studentName: item.student?.name || "-",
    phone: item.student?.phone || item.phone || "",
    productName: item.product?.name || "-",
    teacherName:
      item.product?.teacher?.name ||
      item.product?.teacherName ||
      item.teacher?.name ||
      "-",
    branchName: item.branch?.name || "-",
    quantity: item.quantity ?? 1,
    totalAmount,
    paidAmount,
    createdAt,
    createdAtLabel: formatDateTime(createdAt),
    sellingPriceLabel: sellingPrice > 0 ? formatMoney(sellingPrice) : "—",
    paidAmountLabel: formatMoney(paidAmount),
    remainingAmount,
    remainingAmountLabel: formatMoney(remainingAmount),
    status,
    statusLabel: meta.label,
    statusSeverity: meta.severity,
  };
};

const selectedNewProduct = computed(() =>
  productOptions.value.find((item) => item.value === newProductId.value) || null,
);

const priceComparison = computed(() => {
  if (!selectedReservation.value || !selectedNewProduct.value) return null;

  const paidAmount = roundMoney(selectedReservation.value.paidAmount);
  const newPrice = roundMoney(selectedNewProduct.value.displayPrice);
  const difference = roundMoney(newPrice - paidAmount);

  if (difference >= 0) return null;

  return {
    kind: "less",
    oldTotal: paidAmount,
    newTotal: newPrice,
    difference,
    title: "سيتم رد فرق السعر للطالب",
    titleClass: "text-emerald-300",
    boxClass: "border-white/10 bg-slate-900",
    diffLabel: "المبلغ الذي سيُرد للطالب",
    diffClass: "text-emerald-300",
    confirmText: `سيتم رد فرق سعر قدره ${formatMoney(Math.abs(difference))} للطالب.`,
  };
});

const needsProof = (method) =>
  method === "WALLET" || method === "INSTAPAY";

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
  const sellingPrice = toMoneyNumber(
    product.sellingPrice ?? product.selling_price,
  );
  const reservationPrice = toMoneyNumber(
    product.reservationPrice ?? product.reservation_price,
  );
  const hasSellingPrice = sellingPrice > 0;
  const priceKindLabel = hasSellingPrice ? "سعر البيع" : "سعر أولي";
  const displayPrice = hasSellingPrice ? sellingPrice : reservationPrice;
  const priceLabel = displayPrice > 0 ? `${displayPrice.toFixed(2)}ج.م` : "";
  const name = product.name || product.title || "-";
  const availabilityLabel = isAvailable
    ? `متاح ${availableQuantity}`
    : "غير متاح";

  return {
    name,
    teacherName,
    priceLabel,
    priceKindLabel,
    isSellingPrice: hasSellingPrice,
    displayPrice,
    availableQuantity,
    isAvailable,
    availabilityLabel,
    label: priceLabel
      ? `${name} · ${availabilityLabel} · ${priceKindLabel} ${priceLabel}`
      : `${name} · ${availabilityLabel}`,
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
    const items = await reservationService.getReservations(buildQuery());
    reservations.value = (items || []).map(normalizeReservation);
  } catch (error) {
    showError(error?.message || "تعذر تحميل الحجوزات.");
    reservations.value = [];
  } finally {
    loading.value = false;
  }
};

const { run: runThrottledSearch } = useThrottledCallback(() => {
  filters.search = filters.searchInput;
  loadData();
}, 400);

watch(
  () => filters.searchInput,
  () => {
    runThrottledSearch();
  },
);

const loadProducts = async () => {
  loadingProducts.value = true;
  productOptions.value = [];
  try {
    const branchId = selectedReservation.value?.branchId;
    if (!branchId) {
      showError("تعذر تحديد فرع الحجز لتحميل المنتجات المتاحة.");
      return;
    }

    const items = await inventoryService.getBranchInventory(branchId, {
      forReservation: true,
    });
    const list = Array.isArray(items) ? items : items?.data || [];
    const currentProductId = selectedReservation.value?.productId;

    productOptions.value = list
      .map(mapInventoryProductOption)
      .filter((option) => option.value && option.value !== currentProductId);
  } catch (error) {
    productOptions.value = [];
    showError(error?.message || "تعذر تحميل منتجات الفرع المتاحة للحجز.");
  } finally {
    loadingProducts.value = false;
  }
};

const openCancelDialog = (item) => {
  selectedReservation.value = item;
  cancelConfirmVisible.value = false;
  exchangeDetailVisible.value = false;
  exchangeConfirmVisible.value = false;
  cancelDetailVisible.value = true;
};

const closeCancelFlow = () => {
  if (busy.value) return;
  cancelDetailVisible.value = false;
  cancelConfirmVisible.value = false;
  if (!exchangeDetailVisible.value) selectedReservation.value = null;
};

const confirmCancel = async () => {
  if (!selectedReservation.value?.id) return;
  busy.value = true;
  try {
    await reservationService.cancelReservation(selectedReservation.value.id);
    cancelConfirmVisible.value = false;
    cancelDetailVisible.value = false;
    selectedReservation.value = null;
    showSuccess("تم إلغاء الحجز بنجاح.");
    await loadData();
  } catch (error) {
    showError(error?.message || "تعذر إلغاء الحجز.");
  } finally {
    busy.value = false;
  }
};

const openExchangeDialog = async (item) => {
  selectedReservation.value = item;
  newProductId.value = null;
  exchangeError.value = "";
  exchangePaymentError.value = "";
  exchangeRefundMethod.value = "CASH";
  exchangeImage.value = null;
  exchangeProofKey.value = "";
  cancelDetailVisible.value = false;
  cancelConfirmVisible.value = false;
  exchangeConfirmVisible.value = false;
  exchangeDetailVisible.value = true;
  await loadProducts();
};

const closeExchangeFlow = () => {
  if (busy.value) return;
  exchangeDetailVisible.value = false;
  exchangeConfirmVisible.value = false;
  newProductId.value = null;
  exchangeError.value = "";
  exchangePaymentError.value = "";
  exchangeRefundMethod.value = "CASH";
  exchangeImage.value = null;
  exchangeProofKey.value = "";
  if (!cancelDetailVisible.value) selectedReservation.value = null;
};

const requestExchangeConfirm = () => {
  exchangeError.value = "";
  exchangePaymentError.value = "";

  if (!newProductId.value) {
    exchangeError.value = "اختر المنتج الجديد قبل التأكيد.";
    return;
  }
  if (newProductId.value === selectedReservation.value?.productId) {
    exchangeError.value = "اختر منتجًا مختلفًا عن المنتج الحالي.";
    return;
  }
  if (!selectedNewProduct.value?.isAvailable) {
    exchangeError.value = "المنتج المختار غير متاح في مخزون الفرع.";
    return;
  }

  if (priceComparison.value?.kind === "less") {
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
  if (!selectedReservation.value?.id || !newProductId.value) return;
  busy.value = true;
  try {
    const payload = {
      newProductId: newProductId.value,
    };

    if (priceComparison.value?.kind === "less") {
      payload.refundMethod = exchangeRefundMethod.value;
      if (exchangeProofKey.value) {
        payload.proofReference = exchangeProofKey.value;
      }
    }

    await reservationService.changeProduct(
      selectedReservation.value.id,
      payload,
    );
    exchangeConfirmVisible.value = false;
    exchangeDetailVisible.value = false;
    selectedReservation.value = null;
    newProductId.value = null;
    exchangeRefundMethod.value = "CASH";
    exchangeImage.value = null;
    exchangeProofKey.value = "";
    showSuccess("تم استبدال منتج الحجز بنجاح.");
    await loadData();
  } catch (error) {
    showError(error?.message || "تعذر استبدال منتج الحجز.");
  } finally {
    busy.value = false;
  }
};

watch(newProductId, () => {
  if (exchangeError.value) exchangeError.value = "";
  if (exchangePaymentError.value) exchangePaymentError.value = "";
});

watch(exchangeRefundMethod, () => {
  if (exchangePaymentError.value) exchangePaymentError.value = "";
});

onMounted(loadData);
</script>

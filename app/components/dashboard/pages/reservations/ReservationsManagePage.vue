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
                v-model="filters.search"
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
            />
          </div>
        </div>

        <ReservationsTable
          :reservations="filteredReservations"
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
      :style="{ width: '560px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @hide="closeExchangeFlow"
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
              <span class="text-slate-500">المنتج الحالي</span>
              <span class="font-medium">{{ selectedReservation.productName }}</span>
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

        <div class="flex flex-col gap-2 text-right">
          <label class="text-sm font-medium text-slate-700">المنتج الجديد</label>
          <Select
            v-model="newProductId"
            :options="productOptions"
            option-label="label"
            option-value="value"
            placeholder="اختر المنتج البديل"
            filter
            :loading="loadingProducts"
            class="w-full"
            :invalid="!!exchangeError"
          />
          <p v-if="exchangeError" class="text-xs text-red-500">{{ exchangeError }}</p>
        </div>
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
      :style="{ width: '420px', maxWidth: '95vw' }"
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
        <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p>
            من:
            <span class="font-semibold">{{ selectedReservation?.productName }}</span>
          </p>
          <p class="mt-1">
            إلى:
            <span class="font-semibold">{{ selectedNewProductLabel }}</span>
          </p>
        </div>
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
import { productService } from "~/services/productService";
import { reservationService } from "~/services/reservationService";
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
const filters = reactive({ search: "", status: null });

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

  return {
    ...item,
    reservationNumber:
      item.reservationNumber || item.reservation_number || item.code || item.id,
    studentName: item.student?.name || "-",
    phone: item.student?.phone || item.phone || "",
    productName: item.product?.name || "-",
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

const filteredReservations = computed(() => {
  const q = filters.search.trim().toLowerCase();
  return reservations.value.filter((item) => {
    if (filters.status && item.status !== filters.status) return false;
    if (!q) return true;
    return (
      String(item.reservationNumber || "").toLowerCase().includes(q) ||
      String(item.studentName || "").toLowerCase().includes(q) ||
      String(item.productName || "").toLowerCase().includes(q)
    );
  });
});

const selectedNewProductLabel = computed(() => {
  const option = productOptions.value.find(
    (item) => item.value === newProductId.value,
  );
  return option?.label || "—";
});

const loadData = async () => {
  loading.value = true;
  try {
    const items = await reservationService.getReservations();
    reservations.value = (items || []).map(normalizeReservation);
  } catch (error) {
    showError(error?.message || "تعذر تحميل الحجوزات.");
    reservations.value = [];
  } finally {
    loading.value = false;
  }
};

const loadProducts = async () => {
  loadingProducts.value = true;
  try {
    const items = await productService.getProducts();
    const list = Array.isArray(items) ? items : items?.data || [];
    productOptions.value = list
      .filter((product) => product.reservationAllowed !== false)
      .filter((product) => product.id !== selectedReservation.value?.productId)
      .map((product) => {
        const sellingPrice = Number(
          product.sellingPrice ?? product.selling_price ?? 0,
        );
        const priceLabel =
          sellingPrice > 0 ? ` · سعر البيع ${sellingPrice.toFixed(2)}ج.م` : "";
        return {
          label: `${product.name || "-"}${priceLabel}`,
          value: product.id,
        };
      });
  } catch (error) {
    productOptions.value = [];
    showError(error?.message || "تعذر تحميل المنتجات.");
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
  if (!cancelDetailVisible.value) selectedReservation.value = null;
};

const requestExchangeConfirm = () => {
  exchangeError.value = "";
  if (!newProductId.value) {
    exchangeError.value = "اختر المنتج الجديد قبل التأكيد.";
    return;
  }
  if (newProductId.value === selectedReservation.value?.productId) {
    exchangeError.value = "اختر منتجًا مختلفًا عن المنتج الحالي.";
    return;
  }
  exchangeConfirmVisible.value = true;
};

const confirmExchange = async () => {
  if (!selectedReservation.value?.id || !newProductId.value) return;
  busy.value = true;
  try {
    await reservationService.changeProduct(selectedReservation.value.id, {
      newProductId: newProductId.value,
    });
    exchangeConfirmVisible.value = false;
    exchangeDetailVisible.value = false;
    selectedReservation.value = null;
    newProductId.value = null;
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
});

onMounted(loadData);
</script>

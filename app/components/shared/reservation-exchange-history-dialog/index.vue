<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    :header="dialogTitle"
    :style="{ width: 'min(920px, 96vw)' }"
    :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    @update:visible="onVisibleChange"
  >
    <div v-if="loading" class="space-y-2 py-2">
      <Skeleton v-for="i in 4" :key="`hist-skel-${i}`" height="2.4rem" />
    </div>

    <p v-else-if="error" class="py-4 text-sm text-rose-400">
      {{ error }}
      <Button
        class="ms-2"
        label="إعادة المحاولة"
        text
        size="small"
        @click="fetchHistory"
      />
    </p>

    <AppDataTable
      v-else
      :value="rows"
      :columns="columns"
      empty-message="لا يوجد سجل استبدال."
    >
      <template #time="{ data }">
        <AppDateTimeCell :value="data.createdAt" />
      </template>
      <template #oldProduct="{ data }">
        <ProductCell :product="data.oldProductObj" />
      </template>
      <template #newProduct="{ data }">
        <ProductCell :product="data.newProductObj" />
      </template>
      <template #paid="{ data }">
        <span class="hist-tag tabular-nums" :style="tagStyle(METRIC_COLORS.paid)">
          {{ data.paidLabel }}
        </span>
      </template>
      <template #diff="{ data }">
        <span
          class="hist-tag tabular-nums"
          :style="tagStyle(METRIC_COLORS.price)"
        >
          {{ data.diffLabel }}
        </span>
      </template>
      <template #qty="{ data }">
        <span class="hist-tag tabular-nums" :style="tagStyle(METRIC_COLORS.qty)">
          {{ data.qty }}
        </span>
      </template>
    </AppDataTable>
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import Skeleton from "primevue/skeleton";
import Button from "primevue/button";
import ProductCell from "~/components/shared/product-cell/index.vue";
import AppDateTimeCell from "~/components/shared/app-datetime-cell/index.vue";
import { reservationService } from "~/services/reservationService";
import { formatMoney } from "~/utils/format";
import {
  DEFAULT_METRIC_COLOR,
  STOCK_MOVEMENT_COLORS,
} from "~/utils/domainLabels";

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);

defineOptions({ name: "ReservationExchangeHistoryDialog" });

const props = defineProps({
  visible: { type: Boolean, default: false },
  reservationId: { type: String, default: null },
  reservationNumber: { type: String, default: null },
});

const emit = defineEmits(["update:visible"]);

const METRIC_COLORS = {
  qty: STOCK_MOVEMENT_COLORS.STOCK_IN,
  price: STOCK_MOVEMENT_COLORS.SALE,
  paid: STOCK_MOVEMENT_COLORS.STOCK_IN,
};

const tagStyle = (color) => {
  const c = color || DEFAULT_METRIC_COLOR;
  return {
    color: c,
    backgroundColor: `${c}22`,
    border: `1px solid ${c}55`,
  };
};

const loading = ref(false);
const error = ref("");
const items = ref([]);
const loadedForId = ref(null);

const columns = [
  { field: "createdAt", header: "التاريخ والوقت", slot: "time" },
  { field: "oldProduct", header: "المنتج القديم", slot: "oldProduct" },
  { field: "newProduct", header: "المنتج الجديد", slot: "newProduct" },
  { field: "paidLabel", header: "المدفوع", slot: "paid" },
  { field: "diffLabel", header: "الفرق", slot: "diff" },
  { field: "qty", header: "الكمية", slot: "qty" },
  { field: "by", header: "بواسطة" },
];

const dialogTitle = computed(() => {
  const number = props.reservationNumber;
  if (number && number !== "—") return `سجل استبدال الحجز ${number}`;
  return "سجل الاستبدال";
});

const moneyOrDash = (value) => {
  if (value == null || value === "") return "—";
  return formatMoney(value, "locale");
};

const toProductCell = (product, options = {}) => {
  const name = product?.name || null;
  if (!name) return null;
  const priceValue =
    options.price ?? product?.price ?? product?.sellingPrice ?? null;
  return {
    name,
    price:
      priceValue == null || priceValue === ""
        ? null
        : formatMoney(priceValue, "locale"),
    teacherName: product?.teacher?.name || product?.teacherName || null,
    studyYearName:
      product?.studyYear?.name || product?.studyYearName || null,
    priceColor: options.priceColor || STOCK_MOVEMENT_COLORS.SALE,
  };
};

const rows = computed(() =>
  (Array.isArray(items.value) ? items.value : []).map((hop) => ({
    createdAt: hop.createdAt || null,
    oldProductObj: toProductCell(hop.oldProduct),
    newProductObj: toProductCell(hop.newProduct, {
      priceColor: STOCK_MOVEMENT_COLORS.EXCHANGE_SALE,
    }),
    paidLabel: moneyOrDash(hop.paidAmount),
    diffLabel: moneyOrDash(hop.differenceAmount),
    qty: Math.abs(Number(hop.quantity ?? 0)),
    by: hop.createdBy?.fullName || hop.createdBy?.name || "—",
  })),
);

const fetchHistory = async () => {
  const id = props.reservationId;
  if (!id) {
    items.value = [];
    error.value = "لا يمكن تحميل السجل: معرف الحجز غير موجود.";
    return;
  }

  loading.value = true;
  error.value = "";
  try {
    const payload = await reservationService.getExchangeHistory(id);
    items.value = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload)
        ? payload
        : [];
    loadedForId.value = id;
  } catch (err) {
    items.value = [];
    error.value = err?.message || "تعذر تحميل سجل الاستبدال.";
  } finally {
    loading.value = false;
  }
};

const onVisibleChange = (value) => {
  emit("update:visible", value);
  if (!value) {
    error.value = "";
  }
};

watch(
  () => [props.visible, props.reservationId],
  ([visible, id]) => {
    if (!visible) return;
    if (!id) {
      items.value = [];
      error.value = "لا يمكن تحميل السجل: معرف الحجز غير موجود.";
      return;
    }
    if (loadedForId.value === id && !error.value) return;
    fetchHistory();
  },
);
</script>

<style scoped>
.hist-tag {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 9999px;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.25rem;
}
</style>

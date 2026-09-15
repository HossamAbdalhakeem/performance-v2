<template>
  <div class="space-y-6">
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
              optionLabel="label"
              optionValue="value"
              placeholder="كل الحالات"
              showClear
              class="w-full"
            />
          </div>
        </div>

        <ReservationsTable
          :reservations="filteredReservations"
          :loading="loading"
          @change-product="openChangeProduct"
          @cancel="handleCancel"
        />
      </template>
    </Card>

    <EntityDrawer
      v-model:visible="changeDrawerVisible"
      title="تبديل منتج الحجز"
      width="420px"
    >
      <ChangeProductForm
        v-if="changeDrawerVisible"
        :reservation="selectedReservation"
        @saved="handleChanged"
        @cancel="changeDrawerVisible = false"
      />
    </EntityDrawer>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import EntityDrawer from "~/components/dashboard/EntityDrawer.vue";
import ReservationsTable from "~/components/dashboard/pages/reservations/ReservationsTable.vue";
import ChangeProductForm from "~/components/dashboard/pages/reservations/ChangeProductForm.vue";
import { reservationService } from "~/services/reservationService";
import { useAppToast } from "~/composables/useAppToast";

const STATUS_META = {
  PENDING: { label: "قيد الانتظار", severity: "warn" },
  WAITING_FOR_STOCK: { label: "بانتظار المخزون", severity: "warn" },
  READY: { label: "جاهز", severity: "info" },
  DELIVERED: { label: "تم التسليم", severity: "success" },
  CANCELLED: { label: "ملغي", severity: "danger" },
};

const { showError, showSuccess } = useAppToast();
const loading = ref(true);
const changeDrawerVisible = ref(false);
const selectedReservation = ref(null);
const reservations = ref([]);
const filters = reactive({ search: "", status: null });

const statusOptions = Object.entries(STATUS_META).map(([value, meta]) => ({
  label: meta.label,
  value,
}));

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} ج.م`;

const normalizeReservation = (item) => {
  const meta = STATUS_META[item.status] || { label: item.status || "-", severity: "secondary" };
  return {
    ...item,
    studentName: item.student?.name || "-",
    productName: item.product?.name || "-",
    branchName: item.branch?.name || "-",
    paidAmountLabel: formatMoney(item.paidAmount),
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

const openChangeProduct = (item) => {
  selectedReservation.value = item;
  changeDrawerVisible.value = true;
};

const handleChanged = async () => {
  changeDrawerVisible.value = false;
  selectedReservation.value = null;
  showSuccess("تم تبديل منتج الحجز بنجاح.");
  await loadData();
};

const handleCancel = async (item) => {
  if (!item?.id) return;
  try {
    await reservationService.cancelReservation(item.id);
    showSuccess("تم إلغاء الحجز بنجاح.");
    await loadData();
  } catch (error) {
    showError(error?.message || "تعذر إلغاء الحجز.");
  }
};

watch(changeDrawerVisible, (visible) => {
  if (!visible) selectedReservation.value = null;
});

onMounted(loadData);
</script>

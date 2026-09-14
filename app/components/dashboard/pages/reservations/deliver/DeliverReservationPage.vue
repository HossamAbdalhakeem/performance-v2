<template>
  <div class="space-y-4 bg-[#0f172a] p-4 text-right text-slate-100" dir="rtl">
    <div class="relative w-[50%]">
      <span
        class="pointer-events-none absolute inset-y-0.5 right-3 flex items-center text-slate-400"
        >⌕</span
      >
      <InputText
        v-model="search"
        placeholder="ابحث باسم الطالب أو رقم الموبايل أو رقم الحجز"
        class="w-full rounded-xl border border-slate-700 bg-slate-900 pr-10 text-right text-slate-100 placeholder:text-slate-400"
      />
    </div>

    <p
      v-if="feedback.message"
      class="rounded-xl px-3 py-2 text-sm"
      :class="
        feedback.type === 'error'
          ? 'bg-red-500/15 text-red-300'
          : 'bg-emerald-500/15 text-emerald-300'
      "
    >
      {{ feedback.message }}
    </p>

    <div class="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.7fr)]">
      <div class="space-y-3">
        <div v-if="loading" class="grid gap-4">
          <Skeleton width="100%" height="4rem" border-radius="12px" />
          <Skeleton width="100%" height="4rem" border-radius="12px" />
        </div>

        <div
          v-else
          class="overflow-hidden rounded-xl border border-slate-700 bg-slate-900"
        >
          <table class="w-full border-collapse text-sm">
            <thead class="bg-slate-800 text-right text-slate-200">
              <tr>
                <th class="px-3 py-3 text-center">الحالة</th>
                <th class="px-3 py-3 text-center">المبلغ</th>
                <th class="px-3 py-3 text-center">المتبقي</th>
                <th class="px-3 py-3 text-center">الفرع</th>
                <th class="px-3 py-3 text-center">المدرس</th>
                <th class="px-3 py-3 text-center">اسم الطالب</th>
                <th class="px-3 py-3 text-center">رقم الحجز</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredReservations"
                :key="item.id"
                class="border-t border-slate-700 bg-slate-900 text-slate-200"
                :class="
                  matchedReservation?.id === item.id ? 'bg-sky-500/10' : ''
                "
              >
                <td class="px-3 py-3 text-center">
                  <span
                    class="rounded-md px-2 py-1 text-xs font-bold"
                    :class="
                      item.hasRemaining
                        ? 'bg-orange-500/20 text-orange-300'
                        : 'bg-[#fef3c7] text-[#b45309]'
                    "
                  >
                    {{ item.statusLabel }}
                  </span>
                </td>
                <td class="px-3 py-3 text-center">
                  {{ formatMoney(item.totalAmount) }}
                </td>
                <td class="px-3 py-3 text-center">
                  {{ formatMoney(item.remainingAmount) }}
                </td>
                <td class="px-3 py-3 text-center">{{ item.branchName }}</td>
                <td class="px-3 py-3 text-center">{{ item.teacherName }}</td>
                <td class="px-3 py-3 text-center">{{ item.studentName }}</td>
                <td class="px-3 py-3 text-center">
                  {{ item.reservationNumber }}
                </td>
              </tr>
              <tr v-if="!filteredReservations.length">
                <td colspan="7" class="px-3 py-8 text-center text-slate-400">
                  {{
                    search.trim()
                      ? "لا توجد حجوزات مطابقة"
                      : "ابدأ بالبحث لعرض الحجوزات"
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="flex flex-col gap-3 rounded-xl border border-slate-700 bg-[#111827] p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div
            v-if="needsRemainingPayment"
            class="flex min-w-[30%] flex-col gap-2 text-right"
          >
            <label class="text-xs text-slate-300">سداد المبلغ المتبقي</label>
            <AppInputNumber
              v-model="remainingPaidAmount"
              mode="currency"
              currency="EGP"
              :min="0"
              :min-fraction-digits="2"
              :use-grouping="true"
            />
            <p class="text-[11px] text-orange-300 leading-[1]">
              المتبقي: {{ formatMoney(matchedReservation?.remainingAmount) }}
            </p>
          </div>

          <div class="flex min-w-[30%] flex-col gap-2 text-right">
            <label class="text-xs text-slate-300">ملاحظة (اختياري)</label>
            <InputText
              v-model="note"
              placeholder="سجّل ملاحظة إن وجدت"
              class="w-full rounded-xl border border-slate-700 bg-slate-900 text-right text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <Button
            label="تسليم الحجز"
            class="rounded-xl bg-[#f59e0b] px-8 py-3 text-xl font-bold text-white shadow-md"
            :disabled="!canDeliver"
            :loading="delivering"
            @click="deliverReservation"
          />
        </div>

        <p
          v-if="search.trim() && filteredReservations.length > 1"
          class="text-xs text-slate-400"
        >
          ضيّق البحث حتى تظهر نتيجة واحدة فقط لتفعيل التسليم.
        </p>
      </div>

      <div
        v-if="deliveryCompleted"
        class="flex min-h-[220px] items-center justify-center rounded-xl border border-slate-700 bg-[#111827] p-4"
      >
        <div class="text-center">
          <div
            class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#22c55e] text-4xl font-bold text-white shadow-md"
          >
            ✓
          </div>
          <p class="text-xl font-bold text-[#34d399]">تم تسليم الحجز بنجاح</p>
          <p class="mt-2 text-sm text-slate-300">تم خصم الكمية من المخزون</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Skeleton from "primevue/skeleton";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import { reservationService } from "~/services/reservationService";

const DELIVERABLE_STATUSES = new Set([
  "PENDING",
  "READY",
  "WAITING_FOR_STOCK",
  "pending",
  "ready",
]);

const loading = ref(true);
const delivering = ref(false);
const search = ref("");
const note = ref("");
const remainingPaidAmount = ref(null);
const deliveryCompleted = ref(false);
const reservations = ref([]);
const feedback = reactive({ type: "success", message: "" });

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} ج.م`;

const getRemainingAmount = (item) => {
  if (item.remainingAmount != null) return Number(item.remainingAmount);
  if (item.remaining_amount != null) return Number(item.remaining_amount);

  const total = Number(item.totalAmount ?? item.total_amount ?? 0);
  const paid = Number(item.paidAmount ?? item.paid_amount ?? item.deposit ?? 0);
  return Math.max(total - paid, 0);
};

const normalizeReservation = (item) => {
  const remainingAmount = getRemainingAmount(item);
  const status = String(item.status || "PENDING").toUpperCase();
  const hasRemaining = remainingAmount > 0;

  return {
    ...item,
    id: item.id,
    reservationNumber:
      item.reservationNumber || item.reservation_number || item.code || item.id,
    studentName: item.student?.name || item.student_name || item.student || "-",
    phone: item.student?.phone || item.phone || "",
    teacherName:
      item.product?.teacher?.name ||
      item.teacher?.name ||
      item.teacher_name ||
      item.teacher ||
      "-",
    branchName: item.branch?.name || item.branch_name || item.branch || "-",
    productName: item.product?.name || item.product_name || item.product || "",
    totalAmount: Number(
      item.totalAmount ?? item.total_amount ?? item.amount ?? 0
    ),
    remainingAmount,
    hasRemaining,
    status,
    statusLabel: hasRemaining ? "متبقي مبلغ" : "قيد الحجز",
  };
};

const filteredReservations = computed(() => {
  const term = search.value.trim().toLowerCase();
  const list = reservations.value.filter(
    (item) => item.status !== "DELIVERED" && item.status !== "CANCELLED"
  );

  if (!term) return [];

  return list.filter((item) =>
    `${item.studentName} ${item.phone} ${item.productName} ${item.reservationNumber} ${item.id}`
      .toLowerCase()
      .includes(term)
  );
});

const matchedReservation = computed(() =>
  search.value.trim() && filteredReservations.value.length === 1
    ? filteredReservations.value[0]
    : null
);

const needsRemainingPayment = computed(() =>
  Boolean(matchedReservation.value?.hasRemaining)
);

const isDeliverableStatus = computed(() => {
  const item = matchedReservation.value;
  if (!item) return false;
  return (
    DELIVERABLE_STATUSES.has(item.status) ||
    item.statusLabel === "قيد الحجز" ||
    item.hasRemaining
  );
});

const canDeliver = computed(() => {
  if (!matchedReservation.value || !isDeliverableStatus.value) return false;

  if (needsRemainingPayment.value) {
    return Number(remainingPaidAmount.value || 0) > 0;
  }

  return true;
});

const loadReservations = async () => {
  loading.value = true;
  feedback.message = "";

  try {
    const items = await reservationService.getReservations();
    const list = Array.isArray(items) ? items : items?.data || [];
    reservations.value = list.map(normalizeReservation);
  } catch (error) {
    reservations.value = [];
    feedback.type = "error";
    feedback.message = error?.message || "تعذر تحميل الحجوزات.";
  } finally {
    loading.value = false;
  }
};

const deliverReservation = async () => {
  if (!canDeliver.value || !matchedReservation.value) return;

  delivering.value = true;
  feedback.message = "";
  deliveryCompleted.value = false;

  try {
    await reservationService.deliverReservation(matchedReservation.value.id, {
      note: note.value || undefined,
      remainingAmount: needsRemainingPayment.value
        ? Number(remainingPaidAmount.value || 0)
        : undefined,
      paidAmount: needsRemainingPayment.value
        ? Number(remainingPaidAmount.value || 0)
        : undefined,
      method: "CASH",
    });

    reservations.value = reservations.value.filter(
      (item) => item.id !== matchedReservation.value.id
    );
    deliveryCompleted.value = true;
    note.value = "";
    remainingPaidAmount.value = null;
    search.value = "";
    feedback.type = "success";
    feedback.message = "تم تسليم الحجز بنجاح.";
  } catch (error) {
    feedback.type = "error";
    feedback.message = error?.message || "تعذر تسليم الحجز.";
  } finally {
    delivering.value = false;
  }
};

watch(matchedReservation, (item) => {
  remainingPaidAmount.value = null;
  if (item?.hasRemaining) {
    remainingPaidAmount.value = Number(item.remainingAmount || 0);
  }
});

onMounted(() => {
  loadReservations();
});
</script>

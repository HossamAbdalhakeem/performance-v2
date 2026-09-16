<template>
  <div v-if="saleSummary" class="flex flex-col items-center text-center">
    <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white">
      ✓
    </div>
    <p class="text-base font-bold text-slate-900">تم تسجيل البيع بنجاح</p>

    <div class="mt-5 w-full space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right">
      <div class="flex items-center justify-between gap-3">
        <span class="text-xs text-slate-500">رقم الدفع</span>
        <span class="text-sm font-bold text-slate-900 break-all">
          {{ saleSummary.paymentNumber }}
        </span>
      </div>

      <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
        <span class="text-xs text-slate-500">التاريخ والوقت</span>
        <span class="text-sm font-medium text-slate-800">{{ saleSummary.dateTimeLabel }}</span>
      </div>

      <div class="flex items-start justify-between gap-3 border-t border-slate-200 pt-3">
        <span class="text-xs text-slate-500">المنتج</span>
        <div class="text-sm font-semibold text-slate-900">
          <p>{{ saleSummary.productName }}</p>
          <p v-if="saleSummary.teacherName" class="mt-0.5 text-xs font-normal text-slate-500">
            مقدم من أ/ {{ saleSummary.teacherName }}
          </p>
        </div>
      </div>

      <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
        <span class="text-xs text-slate-500">السنة الدراسية</span>
        <span class="text-sm font-medium text-slate-800">
          {{ saleSummary.studyYearName || "-" }}
        </span>
      </div>

      <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
        <span class="text-xs text-slate-500">الطالب</span>
        <span class="text-sm font-medium text-slate-800">{{ saleSummary.studentName }}</span>
      </div>

      <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
        <span class="text-xs text-slate-500">الكمية</span>
        <span class="text-sm font-medium text-slate-800">{{ saleSummary.quantity }}</span>
      </div>

      <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
        <span class="text-xs text-slate-500">سعر الوحدة</span>
        <span class="text-sm font-medium text-slate-800">{{ formatMoney(saleSummary.unitPrice, "rtl") }}</span>
      </div>

      <div class="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
        <span class="text-xs text-slate-500">طريقة الدفع</span>
        <span class="text-sm font-medium text-slate-800">{{ saleSummary.methodLabel }}</span>
      </div>

      <div
        v-if="saleSummary.proofImage"
        class="border-t border-slate-200 pt-3"
      >
        <p class="mb-2 text-xs text-slate-500">صورة إثبات الدفع</p>
        <img
          :src="saleSummary.proofImage"
          alt="إثبات الدفع"
          class="mx-auto max-h-48 w-auto max-w-full rounded-xl border border-slate-200 object-contain"
        />
      </div>

      <div class="flex items-center justify-between gap-3 border-t border-emerald-200 pt-3">
        <span class="text-sm font-semibold text-emerald-700">الإجمالي</span>
        <span class="text-lg font-extrabold text-emerald-700">
          {{ formatMoney(saleSummary.totalAmount, "rtl") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatMoney } from "~/utils/format";

defineProps({
  saleSummary: { type: Object, default: null },
});
</script>

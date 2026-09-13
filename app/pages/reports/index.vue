<template>
  <div class="space-y-6 bg-[#101827] p-4 text-right" dir="rtl">
    <div class="grid gap-3 md:grid-cols-4">
      <div class="bg-[#111c2d] px-3 py-2 text-right shadow-sm">
        <label class="mb-1 block text-sm font-medium text-slate-300"
          >التاريخ</label
        >
        <Select
          v-model="selectedDate"
          :options="dateOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="اختر التاريخ"
          class="w-full"
        />
      </div>

      <div class="bg-[#111c2d] px-3 py-2 text-right shadow-sm">
        <label class="mb-1 block text-sm font-medium text-slate-300"
          >الفرع</label
        >
        <Select
          v-model="selectedBranch"
          :options="branchOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="كل الفروع"
          class="w-full"
        />
      </div>

      <div class="bg-[#111c2d] px-3 py-2 text-right shadow-sm">
        <label class="mb-1 block text-sm font-medium text-slate-300"
          >نوع التقرير</label
        >
        <Select
          v-model="selectedReportType"
          :options="reportTypeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="اختر النوع"
          class="w-full"
        />
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-sm border border-slate-700 bg-[#0f172a] px-3 py-2 text-right shadow-sm"
      >
        <p class="text-sm text-slate-300">{{ stat.label }}</p>
        <p class="mt-2 text-3xl font-bold text-slate-100">{{ stat.value }}</p>
      </div>
    </div>

    <div
      class="rounded-sm border border-slate-700 bg-[#0f172a] p-4 text-right shadow-sm"
    >
      <div class="mb-4 flex items-center justify-between">
        <span class="text-sm text-slate-300">مبيعات</span>
        <span class="text-sm text-slate-300"
          >إجمالي المبيعات : {{ totalSales }} ج.م</span
        >
      </div>

      <div class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="rounded-sm border border-slate-700 bg-[#111c2d] p-4">
          <div class="mb-4 text-right">
            <span class="text-lg font-bold text-slate-100">طرق الدفع</span>
          </div>

          <div class="flex items-end justify-around gap-3 pt-6">
            <div class="flex w-20 flex-col items-center gap-2">
              <div
                class="w-full rounded-t-sm bg-[#5b9bd5]"
                style="height: 140px"
              ></div>
              <span class="text-xs text-slate-300">كاش</span>
            </div>
            <div class="flex w-20 flex-col items-center gap-2">
              <div
                class="w-full rounded-t-sm bg-[#7a9f63]"
                style="height: 110px"
              ></div>
              <span class="text-xs text-slate-300">فودافون كاش</span>
            </div>
            <div class="flex w-20 flex-col items-center gap-2">
              <div
                class="w-full rounded-t-sm bg-[#d0a0e8]"
                style="height: 90px"
              ></div>
              <span class="text-xs text-slate-300">انستا باي</span>
            </div>
            <div class="flex w-20 flex-col items-center gap-2">
              <div
                class="w-full rounded-t-sm bg-[#f7c969]"
                style="height: 65px"
              ></div>
              <span class="text-xs text-slate-300">محفظة</span>
            </div>
          </div>

          <div
            class="mt-5 flex items-center justify-between gap-2 rounded-sm border border-dashed border-slate-600 bg-[#0b1220] px-2 py-2 text-[11px] text-slate-300"
          >
            <span>45%: 3,940 ج.م</span>
            <span>30%: 2,625 ج.م</span>
            <span>20%: 1,750 ج.م</span>
            <span>5%: 437 ج.م</span>
          </div>
        </div>

        <div class="rounded-sm border border-slate-700 bg-[#0f172a] p-4">
          <div class="mb-3 text-right">
            <span class="text-lg font-bold text-slate-100">الملخص</span>
          </div>
          <div class="space-y-3 text-right text-sm text-slate-300">
            <p>
              إجمالي المبيعات: <strong class="text-slate-100">8,750 ج.م</strong>
            </p>
            <p>إجمالي الحجوزات: <strong class="text-slate-100">24</strong></p>
            <p>إجمالي المخزون: <strong class="text-slate-100">124</strong></p>
            <p>المبيعات المباشرة: <strong class="text-slate-100">30</strong></p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="rounded-sm border border-slate-700 bg-[#0f172a] p-4 text-right shadow-sm"
    >
      <div class="mb-3 flex items-center justify-between">
        <span class="text-sm text-slate-300">تفاصيل السحب</span>
        <span class="text-lg font-bold text-slate-100">الطلاب</span>
      </div>

      <div class="overflow-hidden rounded-sm border border-slate-700">
        <table class="w-full border-collapse text-sm">
          <thead class="bg-[#111c2d] text-slate-200">
            <tr>
              <th class="border border-slate-700 px-2 py-2">الربح</th>
              <th class="border border-slate-700 px-2 py-2">الفرع</th>
              <th class="border border-slate-700 px-2 py-2">المنتج</th>
              <th class="border border-slate-700 px-2 py-2">المدرس</th>
              <th class="border border-slate-700 px-2 py-2">الطالب</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in reportRows"
              :key="row.student"
              class="bg-[#0b1220] text-slate-300"
            >
              <td class="border border-slate-700 px-2 py-2">
                {{ row.profit }}
              </td>
              <td class="border border-slate-700 px-2 py-2">
                {{ row.branch }}
              </td>
              <td class="border border-slate-700 px-2 py-2">
                {{ row.product }}
              </td>
              <td class="border border-slate-700 px-2 py-2">
                {{ row.teacher }}
              </td>
              <td class="border border-slate-700 px-2 py-2">
                {{ row.student }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import Select from "primevue/select";
import Button from "primevue/button";

const selectedDate = ref("today");
const selectedBranch = ref("all");
const selectedReportType = ref("sales");

const dateOptions = [
  { label: "اليوم", value: "today" },
  { label: "الأسبوع", value: "week" },
  { label: "الشهر", value: "month" },
];

const branchOptions = [
  { label: "كل الفروع", value: "all" },
  { label: "فرع الرياض", value: "riyadh" },
  { label: "فرع جدة", value: "jeddah" },
];

const reportTypeOptions = [
  { label: "المبيعات", value: "sales" },
  { label: "الحجوزات", value: "reservations" },
  { label: "المخزون", value: "stock" },
];

const totalSales = "8,750";

const stats = [
  { label: "إجمالي المبيعات", value: "8,750" },
  { label: "الحجوزات", value: "24" },
  { label: "المخزون", value: "124" },
  { label: "البيع المباشر", value: "30" },
];

const reportRows = [
  {
    student: "أحمد",
    teacher: "أحمد",
    product: "كتاب",
    branch: "الرياض",
    profit: "300",
  },
  {
    student: "سارة",
    teacher: "سارة",
    product: "ملزمة",
    branch: "جدة",
    profit: "250",
  },
  {
    student: "محمود",
    teacher: "خالد",
    product: "أوراق",
    branch: "الرياض",
    profit: "180",
  },
  {
    student: "ليلى",
    teacher: "مها",
    product: "كتاب",
    branch: "جدة",
    profit: "120",
  },
];

definePageMeta({ middleware: ["local-pages"] });
</script>

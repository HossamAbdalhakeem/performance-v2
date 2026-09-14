<template>
  <div class="space-y-6 text-right" dir="rtl">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-xl font-bold text-white">التقارير</h2>
      <div class="flex flex-wrap gap-2">
        <Select
          v-model="selectedBook"
          :options="bookOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="اختيار الكتاب ▾"
          class="w-40"
        />
        <Select
          v-model="selectedBranch"
          :options="branchOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="الفرع: كل الفروع ▾"
          class="w-44"
        />
        <Select
          v-model="selectedDate"
          :options="dateOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="اختيار التاريخ ▾"
          class="w-40"
        />
      </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
        <p class="text-sm text-slate-300">إجمالي المبيعات</p>
        <p class="mt-2 text-2xl font-bold text-white">8,750 ج.م</p>
      </div>
      <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
        <p class="text-sm text-slate-300">إجمالي الحجوزات</p>
        <p class="mt-2 text-2xl font-bold text-white">24</p>
      </div>
      <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
        <p class="text-sm text-slate-300">إجمالي المخزون</p>
        <p class="mt-2 text-2xl font-bold text-white">124</p>
      </div>
      <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
        <p class="text-sm text-slate-300">الكتب</p>
        <div class="mt-2 grid grid-cols-3 gap-2 text-center">
          <div>
            <p class="text-xs text-slate-400">كل</p>
            <p class="text-lg font-bold text-white">44</p>
          </div>
          <div>
            <p class="text-xs text-slate-400">محجوز</p>
            <p class="text-lg font-bold text-white">14</p>
          </div>
          <div>
            <p class="text-[11px] text-slate-400">متاح بيع مباشر</p>
            <p class="text-lg font-bold text-white">30</p>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
      <p class="mb-3 font-bold text-white">مبيعات</p>
      <div class="grid gap-2 text-sm text-slate-200">
        <p>مبيعات فرع: <strong class="text-white">8,750</strong></p>
        <p>محجوزات: <strong class="text-white">18,230</strong></p>
        <p>صافي الربح: <strong class="text-white">18,400</strong></p>
      </div>
    </div>

    <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
      <p class="mb-4 text-center font-bold text-white">طرق الدفع</p>
      <div class="flex flex-wrap items-center justify-center gap-8">
        <div
          class="h-32 w-32 rounded-full"
          style="background: conic-gradient(#4472C4 0 45%, #70AD47 45% 75%, #ED7D31 75% 95%, #7030A0 95% 100%)"
        />
        <div class="space-y-2 text-sm">
          <p class="text-[#4472C4]">● كاش: 3,940 ج.م — 45%</p>
          <p class="text-[#70AD47]">● فودافون كاش: 2,625 ج.م — 30%</p>
          <p class="text-[#ED7D31]">● انستا باي: 1,750 ج.م — 20%</p>
          <p class="text-[#7030A0]">● محفظة الكترونية: 437 ج.م — 5%</p>
          <p class="pt-1 font-bold text-white">إجمالي المبيعات: 8,750 ج.م</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
      <p class="mb-4 font-bold text-white">طلاب وعملاء</p>
      <div class="grid gap-6 xl:grid-cols-2">
        <div>
          <p class="mb-3 text-center text-sm font-semibold text-white">عدد العملاء لكل سنة دراسية</p>
          <svg viewBox="0 0 320 180" class="h-44 w-full">
            <line x1="30" y1="150" x2="300" y2="150" stroke="#64748b" />
            <line x1="30" y1="20" x2="30" y2="150" stroke="#64748b" />
            <polyline fill="none" stroke="#4472C4" stroke-width="3" points="50,132 110,88 170,104 230,48 290,68" />
            <circle cx="50" cy="132" r="4" fill="#4472C4" />
            <circle cx="110" cy="88" r="4" fill="#4472C4" />
            <circle cx="170" cy="104" r="4" fill="#4472C4" />
            <circle cx="230" cy="48" r="4" fill="#4472C4" />
            <circle cx="290" cy="68" r="4" fill="#4472C4" />
            <text x="40" y="168" fill="#cbd5e1" font-size="11">أولى</text>
            <text x="100" y="168" fill="#cbd5e1" font-size="11">تانية</text>
            <text x="160" y="168" fill="#cbd5e1" font-size="11">تالتة</text>
            <text x="220" y="168" fill="#cbd5e1" font-size="11">رابعة</text>
            <text x="275" y="168" fill="#cbd5e1" font-size="11">خامسة</text>
          </svg>
        </div>

        <div>
          <p class="mb-3 text-center text-sm font-semibold text-white">طلاب كل مدرس</p>
          <div class="overflow-hidden rounded-xl border border-white/10">
            <table class="w-full text-center text-sm">
              <thead class="bg-slate-800 text-white">
                <tr>
                  <th class="px-2 py-2">اسم الطالب</th>
                  <th class="px-2 py-2">المدرس</th>
                  <th class="px-2 py-2">الموبايل</th>
                  <th class="px-2 py-2">اشترى ايه</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in studentRows" :key="row.phone" class="border-t border-white/10 text-slate-200">
                  <td class="px-2 py-2">{{ row.student }}</td>
                  <td class="px-2 py-2">{{ row.teacher }}</td>
                  <td class="px-2 py-2">{{ row.phone }}</td>
                  <td class="px-2 py-2">{{ row.product }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <Button
      label="⬇ تصدير كل التقارير Excel"
      class="w-full justify-center"
      severity="secondary"
      @click="exportReports"
    />
  </div>
</template>

<script setup>
import Select from "primevue/select";
import Button from "primevue/button";
import { productService } from "~/services/productService";
import { branchService } from "~/services/branchService";

const selectedDate = ref("today");
const selectedBranch = ref("all");
const selectedBook = ref("all");

const dateOptions = [
  { label: "اليوم", value: "today" },
  { label: "الأسبوع", value: "week" },
  { label: "الشهر", value: "month" },
];

const branchOptions = ref([{ label: "كل الفروع", value: "all" }]);
const bookOptions = ref([{ label: "كل الكتب", value: "all" }]);

const studentRows = [
  { student: "أحمد محمد", teacher: "أ. خالد", phone: "01012845678", product: "كتاب X" },
  { student: "سارة علي", teacher: "أ. عمر", phone: "0112345678", product: "ملزمة" },
];

const loadFilters = async () => {
  try {
    const [branches, products] = await Promise.all([
      branchService.getBranches(),
      productService.getProducts(),
    ]);

    const branchList = Array.isArray(branches) ? branches : branches?.data || [];
    const productList = Array.isArray(products) ? products : products?.data || [];

    branchOptions.value = [
      { label: "كل الفروع", value: "all" },
      ...branchList.map((branch) => ({ label: branch.name || branch.id, value: branch.id })),
    ];

    bookOptions.value = [
      { label: "كل الكتب", value: "all" },
      ...productList.map((product) => ({ label: product.name || product.title || product.id, value: product.id })),
    ];
  } catch (error) {
    console.error("Failed to load report filters", error);
  }
};

const exportReports = () => {
  const rows = [
    ["اسم الطالب", "المدرس", "الموبايل", "اشترى ايه"],
    ...studentRows.map((row) => [row.student, row.teacher, row.phone, row.product]),
    [],
    ["إجمالي المبيعات", "8750"],
    ["إجمالي الحجوزات", "24"],
    ["إجمالي المخزون", "124"],
    ["مبيعات فرع", "8750"],
    ["محجوزات", "18230"],
    ["صافي الربح", "18400"],
  ];

  const csv = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "library-reports.csv";
  link.click();
  URL.revokeObjectURL(url);
};

onMounted(() => {
  loadFilters();
});
</script>

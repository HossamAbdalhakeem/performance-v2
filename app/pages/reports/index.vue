<template>
  <div class="space-y-6">
    <div class="grid gap-4 md:grid-cols-3">
      <Card v-for="stat in stats" :key="stat.label">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">{{ stat.label }}</p>
              <p class="mt-2 text-2xl font-bold text-slate-900">{{ stat.value }}</p>
            </div>
            <span class="rounded-xl px-2 py-1 text-xs font-semibold" :class="stat.badgeClass">{{ stat.tag }}</span>
          </div>
        </template>
      </Card>
    </div>

    <Card>
      <template #title>
        <div class="flex items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">التقارير</span>
          <Button label="تصدير Excel" severity="info" />
        </div>
      </template>

      <template #content>
        <div class="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="mb-2 block text-right text-sm font-medium text-slate-700">الفرع</label>
              <Select v-model="selectedBranch" :options="branchOptions" optionLabel="label" optionValue="value" placeholder="كل الفروع" />
            </div>
            <div>
              <label class="mb-2 block text-right text-sm font-medium text-slate-700">الفترة</label>
              <Select v-model="selectedPeriod" :options="periodOptions" optionLabel="label" optionValue="value" placeholder="آخر 30 يوم" />
            </div>
            <div>
              <label class="mb-2 block text-right text-sm font-medium text-slate-700">نوع التقرير</label>
              <Select v-model="selectedType" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="المبيعات" />
            </div>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <p class="text-right text-base font-bold text-slate-900">مبيعات</p>
            <div class="mt-4 space-y-3 text-right">
              <div class="flex items-center justify-between"><span>كاش</span><strong>3,940 ج.م</strong><span class="text-slate-500">45%</span></div>
              <div class="flex items-center justify-between"><span>فودافون كاش</span><strong>2,625 ج.م</strong><span class="text-slate-500">30%</span></div>
              <div class="flex items-center justify-between"><span>انستا باي</span><strong>1,750 ج.م</strong><span class="text-slate-500">20%</span></div>
              <div class="flex items-center justify-between"><span>محفظة إلكترونية</span><strong>437 ج.م</strong><span class="text-slate-500">5%</span></div>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <p class="text-right text-base font-bold text-slate-900">الكتب</p>
            <div class="mt-4 space-y-3 text-right">
              <div class="flex items-center justify-between"><span>كل</span><strong>124</strong></div>
              <div class="flex items-center justify-between"><span>محجوز</span><strong>18</strong></div>
              <div class="flex items-center justify-between"><span>متاح للبيع</span><strong>106</strong></div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import Select from "primevue/select";

const selectedBranch = ref("all");
const selectedPeriod = ref("30");
const selectedType = ref("sales");

const branchOptions = [
  { label: "كل الفروع", value: "all" },
  { label: "فرع الرياض", value: "riyadh" },
  { label: "فرع جدة", value: "jeddah" },
];
const periodOptions = [
  { label: "آخر 7 أيام", value: "7" },
  { label: "آخر 30 يوم", value: "30" },
  { label: "آخر 90 يوم", value: "90" },
];
const typeOptions = [
  { label: "المبيعات", value: "sales" },
  { label: "الحجوزات", value: "reservations" },
  { label: "المخزون", value: "inventory" },
];

const stats = computed(() => [
  { label: "إجمالي المبيعات", value: "8,750 ج.م", tag: "مبيعات", badgeClass: "bg-sky-100 text-sky-700" },
  { label: "إجمالي الحجوزات", value: "24", tag: "نشط", badgeClass: "bg-green-100 text-green-700" },
  { label: "إجمالي المخزون", value: "124", tag: "متوفر", badgeClass: "bg-amber-100 text-amber-700" },
]);

definePageMeta({ middleware: ["local-pages"] });
</script>

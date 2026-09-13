<template>
  <div class="space-y-6">
    <Card class="overflow-hidden border-0 shadow-sm">
      <template #title>
        <div class="flex items-center justify-between gap-4">
          <span class="text-lg font-bold text-slate-900">{{ pageTitle }}</span>
          <Tag :value="roleLabel" severity="info" />
        </div>
      </template>

      <template #content>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl bg-sky-50 p-4">
            <p class="text-sm text-slate-500">إجمالي اليوم</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ todaySales }}</p>
          </div>
          <div class="rounded-xl bg-emerald-50 p-4">
            <p class="text-sm text-slate-500">الحجوزات النشطة</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ activeReservations }}</p>
          </div>
          <div class="rounded-xl bg-amber-50 p-4">
            <p class="text-sm text-slate-500">الطلاب المسجلون</p>
            <p class="mt-2 text-2xl font-bold text-slate-900">{{ studentsCount }}</p>
          </div>
        </div>
      </template>
    </Card>

    <div class="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <span class="text-base font-bold text-slate-900">آخر الأنشطة</span>
            <Button label="عرض الكل" text severity="secondary" />
          </div>
        </template>

        <template #content>
          <div class="space-y-4">
            <div v-for="item in activities" :key="item.id" class="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div class="flex items-center gap-3 rtl:flex-row-reverse">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">{{ item.code }}</div>
                <div class="text-right">
                  <p class="font-medium text-slate-800">{{ item.title }}</p>
                  <p class="text-xs text-slate-500">{{ item.time }}</p>
                </div>
              </div>
              <Tag :value="item.status" :severity="item.severity" />
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #title>
          <span class="text-base font-bold text-slate-900">ملخص سريع</span>
        </template>

        <template #content>
          <div class="space-y-4 text-right">
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-sm text-slate-500">إجمالي المبيعات</p>
              <p class="mt-2 text-xl font-bold text-slate-900">{{ totalSales }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-sm text-slate-500">إجمالي الحجوزات</p>
              <p class="mt-2 text-xl font-bold text-slate-900">{{ totalReservations }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-3">
              <p class="text-sm text-slate-500">متوسط الطلب اليوم</p>
              <p class="mt-2 text-xl font-bold text-slate-900">{{ avgTicket }}</p>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import Tag from "primevue/tag";
import { useAuthStore } from "~/store/auth.js";

const authStore = useAuthStore();
const userRole = computed(() => authStore.user?.role || "admin");

const roleLabelMap = {
  admin: "مدير",
  branch: "فرع",
  social: "اجتماعي",
};

const pageTitleMap = {
  admin: "لوحة إدارة النظام",
  branch: "لوحة فرع المكتبة",
  social: "لوحة التواصل الاجتماعي",
};

const roleLabel = computed(() => roleLabelMap[userRole.value] || "مدير");
const pageTitle = computed(() => pageTitleMap[userRole.value] || "لوحة الإدارة");

const todaySales = computed(() => userRole.value === "branch" ? "3,960 ر.س" : userRole.value === "social" ? "2,140 ر.س" : "12,450 ر.س");
const activeReservations = computed(() => userRole.value === "branch" ? 21 : userRole.value === "social" ? 42 : 86);
const studentsCount = computed(() => userRole.value === "branch" ? 178 : userRole.value === "social" ? 220 : 430);
const totalSales = computed(() => userRole.value === "branch" ? "3,960 ر.س" : userRole.value === "social" ? "2,140 ر.س" : "12,450 ر.س");
const totalReservations = computed(() => userRole.value === "branch" ? 21 : userRole.value === "social" ? 42 : 86);
const avgTicket = computed(() => userRole.value === "branch" ? "188 ر.س" : userRole.value === "social" ? "119 ر.س" : "329 ر.س");

const activities = [
  { id: 1, code: "S", title: "تمت إضافة مبيع جديد", time: "منذ 10 دقائق", status: "مكتمل", severity: "success" },
  { id: 2, code: "R", title: "تمت مراجعة حجز جديد", time: "منذ 27 دقيقة", status: "قيد التنفيذ", severity: "warning" },
  { id: 3, code: "I", title: "تم تحديث المخزون", time: "قبل ساعة", status: "مؤكد", severity: "info" },
  { id: 4, code: "U", title: "قام موظف جديد بالتسجيل", time: "قبل ساعتين", status: "جديد", severity: "secondary" },
];
</script>

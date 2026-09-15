<template>
  <div class="min-h-screen bg-[#111827] text-slate-100" dir="rtl">
    <aside class="fixed inset-y-0 right-0 z-20 w-72 border-l border-white/10 bg-[#0b1220] text-slate-100 shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div>
          <p class="text-xs tracking-[0.28em] text-sky-200/80">مكتبة</p>
          <h2 class="mt-1 text-xl font-bold">لوحة التحكم</h2>
        </div>
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sm font-bold text-sky-200">
          {{ roleLabelShort }}
        </div>
      </div>

      <nav class="space-y-2 px-4 py-5">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          class="flex w-full items-center justify-between rounded-xl px-3 py-3 text-right text-sm font-medium transition hover:bg-white/5"
          :class="item.active ? 'bg-slate-800 text-sky-200 ring-1 ring-sky-500/40' : 'text-slate-300'"
        >
          <span>{{ item.label }}</span>
          <span class="text-lg">{{ item.icon }}</span>
        </NuxtLink>
      </nav>

      <div class="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-xl bg-red-500/10 px-3 py-3 text-sm font-medium text-red-200 hover:bg-red-500/20"
          @click="confirmLogoutVisible = true"
        >
          <span>تسجيل الخروج</span>
          <span>⎋</span>
        </button>
      </div>
    </aside>

    <div class="mr-72 min-h-screen">
      <header class="border-b border-white/10 bg-[#0f172a]/90 px-6 py-5 backdrop-blur-sm">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-sm text-slate-400">{{ title }}</p>
            <h1 class="mt-1 text-2xl font-bold text-white">{{ subtitle }}</h1>
          </div>

          <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 shadow-sm">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20 font-bold text-sky-200">
              {{ userInitials }}
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-white">{{ userName }}</p>
              <p class="text-xs text-slate-400">{{ roleLabel }}</p>
            </div>
          </div>
        </div>
      </header>

      <main class="p-6">
        <div v-if="stats.length" class="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-sm"
          >
            <div class="flex items-center justify-between">
              <p class="text-sm text-slate-400">{{ stat.label }}</p>
              <span class="rounded-lg bg-sky-500/15 px-2 py-1 text-xs font-semibold text-sky-200">{{ stat.tag }}</span>
            </div>
            <p class="mt-4 text-3xl font-bold text-white">{{ stat.value }}</p>
            <p class="mt-2 text-xs text-slate-400">{{ stat.note }}</p>
          </div>
        </div>

        <slot />
      </main>
    </div>

    <Dialog
      v-model:visible="confirmLogoutVisible"
      modal
      header="تأكيد تسجيل الخروج"
      :style="{ width: '28rem' }"
      :dismissableMask="true"
      dir="rtl"
    >
      <p class="text-right text-sm text-slate-600">
        هل أنت متأكد من تسجيل الخروج؟ سيتم إنهاء الجلسة وإبطال رمز الدخول الحالي.
      </p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="إلغاء"
            severity="secondary"
            text
            :disabled="loggingOut"
            @click="confirmLogoutVisible = false"
          />
          <Button
            label="تسجيل الخروج"
            severity="danger"
            :loading="loggingOut"
            @click="confirmLogout"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { useAuthStore } from "~/store/auth.js";

const props = defineProps({
  role: { type: String, default: "admin" },
  title: { type: String, default: "لوحة التحكم" },
  subtitle: { type: String, default: "نظرة عامة" },
  stats: { type: Array, default: () => [] },
});

const authStore = useAuthStore();
const route = useRoute();
const confirmLogoutVisible = ref(false);
const loggingOut = ref(false);

const roleLabels = {
  admin: { short: "AD", label: "مدير" },
  branch: { short: "BR", label: "فرع" },
  social: { short: "SO", label: "اجتماعي" },
};

const roleMeta = roleLabels[props.role] || roleLabels.admin;
const menuItems = computed(() => {
  const isActive = (to) => {
    if (to === "/reservations") return route.path === "/reservations";
    return route.path === to || route.path.startsWith(`${to}/`);
  };

  if (props.role === "branch") {
    return [
      { label: "البيع المباشر", icon: "◫", to: "/sales/direct", active: isActive("/sales/direct") },
      { label: "حجز الكتب", icon: "✓", to: "/reservations", active: isActive("/reservations") },
      { label: "تسليم الحجز", icon: "📝", to: "/reservations/deliver", active: isActive("/reservations/deliver") },
      { label: "تقرير اليوم", icon: "▤", to: "/reports/daily", active: isActive("/reports/daily") },
    ];
  }

  if (props.role === "social") {
    return [
      { label: "احجز كتاب", icon: "📝", to: "/books", active: isActive("/books") },
    ];
  }

  return [
    { label: "المنتجات", icon: "＋", to: "/products", active: isActive("/products") },
    { label: "المدرسون", icon: "◉", to: "/teachers", active: isActive("/teachers") },
    { label: "الفروع", icon: "⌂", to: "/branches", active: isActive("/branches") },
    { label: "الطلاب", icon: "◎", to: "/students", active: isActive("/students") },
    { label: "السنوات الدراسية", icon: "▦", to: "/study-years", active: isActive("/study-years") },
    { label: "المستخدمون", icon: "♟", to: "/users", active: isActive("/users") },
    { label: "المصروفات", icon: "﷼", to: "/expenses", active: isActive("/expenses") },
    { label: "الحجوزات", icon: "✓", to: "/reservations/manage", active: isActive("/reservations/manage") },
    { label: "استبدال واسترداد", icon: "⇄", to: "/sales/exchange", active: isActive("/sales/exchange") },
    { label: "التقارير", icon: "▤", to: "/reports", active: isActive("/reports") },
  ];
});

const userName = computed(() => authStore.user?.name || "مدير النظام");
const userInitials = computed(() => userName.value?.slice(0, 2)?.toUpperCase() || "MN");
const roleLabel = computed(() => roleMeta.label);
const roleLabelShort = computed(() => roleMeta.short);

const confirmLogout = async () => {
  loggingOut.value = true;
  try {
    await authStore.logout();
  } finally {
    loggingOut.value = false;
    confirmLogoutVisible.value = false;
  }
};
</script>

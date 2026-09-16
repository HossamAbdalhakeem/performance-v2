<template>
  <div class="min-h-screen bg-[#111827] text-slate-100" dir="rtl">
    <aside class="fixed inset-y-0 right-0 z-20 flex w-72 flex-col border-l border-white/10 bg-[#0b1220] text-slate-100 shadow-xl">
      <div class="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
        <div>
          <p class="text-xs tracking-[0.28em] text-sky-200/80">مكتبة</p>
          <h2 class="mt-1 text-xl font-bold">لوحة التحكم</h2>
        </div>
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sm font-bold text-sky-200">
          {{ roleLabelShort }}
        </div>
      </div>

      <nav
        class="flex-1 space-y-2 overflow-y-auto px-4 py-5"
        :class="normalizedRole === 'admin' ? 'pb-44' : 'pb-28'"
        aria-label="القائمة الرئيسية"
      >
        <div
          v-for="section in navigation"
          :key="section.id"
          class="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
        >
          <!-- Accordion header (admin groups) -->
          <button
            v-if="section.label"
            type="button"
            class="flex w-full items-center justify-between gap-2 px-3 py-3 text-right transition hover:bg-white/5"
            :aria-expanded="openSectionId === section.id"
            @click="toggleSection(section.id)"
          >
            <span class="text-xs font-bold tracking-wide text-sky-300">
              {{ section.label }}
            </span>
            <span
              class="text-sm text-slate-400 transition-transform duration-200"
              :class="openSectionId === section.id ? 'rotate-180' : ''"
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          <!-- Links: always open for unlabeled sections; accordion for labeled -->
          <div
            v-show="!section.label || openSectionId === section.id"
            class="space-y-1 px-2 pb-2"
            :class="section.label ? 'border-t border-white/5 pt-1' : 'pt-2'"
          >
            <NuxtLink
              v-for="item in section.items"
              :key="item.to"
              :to="item.to"
              class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-right text-sm font-medium transition hover:bg-white/5"
              :class="
                isActive(item.to)
                  ? 'bg-slate-800 text-sky-200 ring-1 ring-sky-500/40'
                  : 'text-slate-300'
              "
            >
              <span>{{ item.label }}</span>
              <span class="text-lg" aria-hidden="true">{{ item.icon }}</span>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <div class="absolute bottom-0 left-0 right-0 space-y-3 border-t border-white/10 bg-[#0b1220] p-4">
        <AcademicYearSwitcher v-if="normalizedRole === 'admin'" />
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

          <div class="flex items-center gap-3">
            <NotificationBell v-if="normalizedRole !== 'social'" />
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
import NotificationBell from "~/components/dashboard/NotificationBell.vue";
import AcademicYearSwitcher from "~/components/dashboard/AcademicYearSwitcher.vue";
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
/** Accordion: only one labeled section open at a time (null = all closed) */
const openSectionId = ref(null);

const roleLabels = {
  admin: { short: "AD", label: "مدير" },
  branch: { short: "BR", label: "فرع" },
  social: { short: "SO", label: "اجتماعي" },
};

const normalizedRole = computed(() => {
  const raw = String(props.role || authStore.user?.role || "admin").toLowerCase();
  if (raw === "admin" || raw === "administrator") return "admin";
  if (raw === "branch" || raw === "library_employee" || raw === "branch_employee") {
    return "branch";
  }
  if (raw === "social" || raw === "customer_service" || raw === "customer-service") {
    return "social";
  }
  return "admin";
});

const roleMeta = computed(
  () => roleLabels[normalizedRole.value] || roleLabels.admin,
);

const isActive = (to) => {
  const path = route.path;
  if (to === "/reservations") return path === "/reservations";
  if (to === "/reports") {
    return (
      path === "/reports" ||
      (path.startsWith("/reports/") && !path.startsWith("/reports/daily"))
    );
  }
  return path === to || path.startsWith(`${to}/`);
};

const toggleSection = (sectionId) => {
  openSectionId.value = openSectionId.value === sectionId ? null : sectionId;
};

const sectionHasActiveItem = (section) =>
  (section.items || []).some((item) => isActive(item.to));

const openActiveSection = () => {
  const active = navigation.value.find(
    (section) => section.label && sectionHasActiveItem(section),
  );
  openSectionId.value = active?.id || navigation.value.find((s) => s.label)?.id || null;
};

/** Single menu source — admin uses labeled groups; other roles use one unlabeled group */
const navigation = computed(() => {
  // Track role + path explicitly so active state and groups stay reactive
  const role = normalizedRole.value;
  void route.path;

  if (role === "branch") {
    return [
      {
        id: "branch-main",
        label: "",
        items: [
          { label: "البيع المباشر", icon: "◫", to: "/sales/direct" },
          { label: "حجز الكتب", icon: "✓", to: "/reservations" },
          { label: "تسليم الحجز", icon: "📝", to: "/reservations/deliver" },
          { label: "تقرير اليوم", icon: "▤", to: "/reports/daily" },
        ],
      },
    ];
  }

  if (role === "social") {
    return [
      {
        id: "social-main",
        label: "",
        items: [
          { label: "احجز كتاب", icon: "📝", to: "/books/reserve" },
          { label: "تقرير اليوم", icon: "▤", to: "/reports/daily" },
        ],
      },
    ];
  }

  // admin (default)
  return [
    {
      id: "base",
      label: "البيانات الأساسية",
      items: [
        { label: "المنتجات", icon: "＋", to: "/products" },
        { label: "المدرسون", icon: "◉", to: "/teachers" },
        { label: "السنوات الدراسية", icon: "▦", to: "/study-years" },
        { label: "الفروع", icon: "⌂", to: "/branches" },
        { label: "الطلاب", icon: "◎", to: "/students" },
      ],
    },
    {
      id: "operations",
      label: "العمليات",
      items: [
        { label: "الحجوزات", icon: "✓", to: "/reservations/manage" },
        { label: "استبدال واسترداد", icon: "⇄", to: "/sales/exchange" },
      ],
    },
    {
      id: "people",
      label: "الأشخاص",
      items: [{ label: "الموظفون", icon: "♟", to: "/users" }],
    },
    {
      id: "finance",
      label: "المالية والتقارير",
      items: [
        { label: "المصروفات", icon: "﷼", to: "/expenses" },
        { label: "التقارير", icon: "▤", to: "/reports" },
      ],
    },
  ];
});

const userName = computed(() => authStore.user?.name || "مدير النظام");
const userInitials = computed(() => userName.value?.slice(0, 2)?.toUpperCase() || "MN");
const roleLabel = computed(() => roleMeta.value.label);
const roleLabelShort = computed(() => roleMeta.value.short);

watch(
  () => [route.path, normalizedRole.value],
  () => {
    openActiveSection();
  },
  { immediate: true },
);

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

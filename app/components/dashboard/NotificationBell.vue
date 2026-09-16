<template>
  <div ref="rootRef" class="relative" dir="rtl">
    <button
      type="button"
      class="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-200 transition hover:bg-slate-800"
      aria-label="الإشعارات"
      @click="toggle"
    >
      <i class="pi pi-bell text-base" />
      <span
        v-if="notifications.length > 0"
        class="absolute -left-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white"
      >
        {{ notifications.length > 99 ? "99+" : notifications.length }}
      </span>
    </button>

    <div
      v-if="open"
      class="absolute left-0 top-12 z-50 w-[22rem] max-w-[85vw] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
    >
      <div class="border-b border-white/10 px-4 py-3">
        <p class="text-sm font-semibold text-white">الإشعارات</p>
        <p class="text-xs text-slate-500">تحديث كل 10 دقائق</p>
      </div>

      <div class="max-h-80 overflow-y-auto">
        <div v-if="loading" class="px-4 py-8 text-center text-sm text-slate-500">
          جاري التحميل...
        </div>
        <div
          v-else-if="!notifications.length"
          class="px-4 py-8 text-center text-sm text-slate-500"
        >
          لا توجد إشعارات حالياً
        </div>
        <div
          v-for="item in notifications"
          :key="item.id"
          class="flex flex-col gap-1 border-b border-white/5 px-4 py-3 text-right"
        >
          <p class="text-sm font-semibold text-white">{{ item.title }}</p>
          <p class="text-xs leading-5 text-slate-300">{{ item.message }}</p>
          <p v-if="item.createdAt" class="text-[11px] text-slate-500">
            {{ formatTime(item.createdAt) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { notificationService } from "~/services/notificationService";
import { useAuthStore } from "~/store/auth.js";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "NotificationBell" });

const POLL_MS = 10 * 60 * 1000;

const authStore = useAuthStore();
const { toast } = useAppToast();

const open = ref(false);
const rootRef = ref(null);
const loading = ref(false);
const notifications = ref([]);
const lastFirstId = ref(null);
let pollTimer = null;

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const loadNotifications = async () => {
  if (!authStore.isLoggedIn) return;

  loading.value = true;
  try {
    const list = await notificationService.getNotifications();
    const first = list[0];

    // Backend returns newest first — toast only that one when it changes
    if (
      first &&
      lastFirstId.value &&
      String(first.id) !== String(lastFirstId.value)
    ) {
      toast.add({
        severity: "warn",
        summary: first.title,
        detail: first.message,
        life: 6000,
      });
    }

    if (first) lastFirstId.value = String(first.id);
    notifications.value = list;
  } catch {
    // Keep silent on background poll failures
  } finally {
    loading.value = false;
  }
};

const startPolling = () => {
  if (!import.meta.client || pollTimer) return;
  loadNotifications();
  pollTimer = setInterval(loadNotifications, POLL_MS);
};

const stopPolling = () => {
  if (!pollTimer) return;
  clearInterval(pollTimer);
  pollTimer = null;
};

const toggle = async () => {
  open.value = !open.value;
  if (open.value) await loadNotifications();
};

const onDocumentClick = (event) => {
  if (!open.value || !rootRef.value) return;
  if (!rootRef.value.contains(event.target)) open.value = false;
};

onMounted(() => {
  startPolling();
  document.addEventListener("click", onDocumentClick);
});

watch(
  () => authStore.isLoggedIn,
  (loggedIn) => {
    if (!loggedIn) {
      open.value = false;
      stopPolling();
      return;
    }
    startPolling();
  },
);

onBeforeUnmount(() => {
  stopPolling();
  document.removeEventListener("click", onDocumentClick);
});
</script>

<template>
  <div ref="rootRef" class="relative" dir="rtl">
    <button
      ref="buttonRef"
      type="button"
      class="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-200 transition hover:bg-slate-800"
      aria-label="الإشعارات"
      @click="toggle"
    >
      <i class="pi pi-bell text-base" />
      <span
        v-if="notifications.length"
        class="absolute -left-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white"
      >
        {{ notifications.length > 99 ? "99+" : notifications.length }}
      </span>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="panelRef"
        class="fixed z-[10000] w-[22rem] max-w-[85vw] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
        :style="panelStyle"
        dir="rtl"
      >
        <div class="border-b border-white/10 px-4 py-3">
          <p class="text-sm font-semibold text-white">الإشعارات</p>
          <p class="text-xs text-slate-500">تحديث كل 10 دقائق</p>
        </div>

        <div class="max-h-80 overflow-y-auto">
          <div
            v-if="loading && !notifications.length"
            class="px-4 py-8 text-center text-sm text-slate-500"
          >
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
    </Teleport>
  </div>
</template>

<script setup>
import { notificationService } from "~/services/notificationService";
import { useAuthStore } from "~/store/auth.js";
import { useAppToast } from "~/composables/useAppToast";
import { formatDateTime } from "~/utils/format";

defineOptions({ name: "NotificationBell" });

const POLL_MS = 10 * 60 * 1000;

const authStore = useAuthStore();
const { toast } = useAppToast();

const open = ref(false);
const loading = ref(false);
const notifications = ref([]);
const lastFirstId = ref(null);
const panelStyle = ref({});

const rootRef = ref(null);
const buttonRef = ref(null);
const panelRef = ref(null);
let pollTimer = null;
let fetching = false;

const formatTime = (value) =>
  formatDateTime(value, {
    dateStyle: "short",
    timeStyle: "short",
    empty: "",
  });


const sameList = (next) => {
  const prev = notifications.value;
  if (prev.length !== next.length) return false;
  return prev.every((item, i) => String(item.id) === String(next[i]?.id));
};

const updatePanelPosition = () => {
  const button = buttonRef.value;
  if (!button) return;
  const rect = button.getBoundingClientRect();
  const width = Math.min(352, window.innerWidth * 0.85);
  const left = Math.min(rect.left, window.innerWidth - width - 8);
  panelStyle.value = {
    top: `${Math.round(rect.bottom + 8)}px`,
    left: `${Math.max(8, left)}px`,
  };
};

const loadNotifications = async ({ showLoading = false } = {}) => {
  if (!authStore.isLoggedIn || fetching) return;
  fetching = true;
  if (showLoading) loading.value = true;

  try {
    const list = await notificationService.getNotifications();
    const first = list[0];

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
    if (!sameList(list)) notifications.value = list;
  } catch {
    // silent on poll failures
  } finally {
    loading.value = false;
    fetching = false;
  }
};

const startPolling = () => {
  if (!import.meta.client || pollTimer) return;
  loadNotifications();
  pollTimer = setInterval(() => loadNotifications(), POLL_MS);
};

const stopPolling = () => {
  if (!pollTimer) return;
  clearInterval(pollTimer);
  pollTimer = null;
};

const toggle = async () => {
  open.value = !open.value;
  if (!open.value) return;
  await nextTick();
  updatePanelPosition();
  await loadNotifications({ showLoading: !notifications.value.length });
};

const onDocumentClick = (event) => {
  if (!open.value) return;
  const target = event.target;
  if (rootRef.value?.contains(target) || panelRef.value?.contains(target)) return;
  open.value = false;
};

const onWindowChange = () => {
  if (open.value) updatePanelPosition();
};

onMounted(() => {
  startPolling();
  document.addEventListener("click", onDocumentClick);
  window.addEventListener("resize", onWindowChange);
  window.addEventListener("scroll", onWindowChange, true);
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
  window.removeEventListener("resize", onWindowChange);
  window.removeEventListener("scroll", onWindowChange, true);
});
</script>

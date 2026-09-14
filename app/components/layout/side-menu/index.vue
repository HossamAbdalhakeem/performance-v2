<template>
  <div>
    <div
      v-if="open"
      class="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
      aria-hidden="true"
      @click="$emit('close')"
    />
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-emerald-950 px-5 py-6 text-white transition-transform duration-200 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex items-center justify-between px-2">
        <Logo @close="$emit('close')" />
        <button
          class="grid size-9 place-items-center rounded-lg text-emerald-100 hover:bg-white/10 lg:hidden"
          type="button"
          aria-label="Close navigation"
          @click="$emit('close')"
        >
          &#10005;
        </button>
      </div>

      <nav class="mt-12 flex-1 space-y-2" aria-label="Main navigation">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-emerald-100/75 transition hover:bg-white/10 hover:text-white"
          active-class="!bg-emerald-700 !text-white"
          @click="$emit('close')"
        >
          <span
            class="grid size-8 place-items-center rounded-lg bg-white/10 text-xs font-bold text-emerald-200"
            >{{ item.shortcut }}</span
          >
          <span class="capitalize">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="border-t border-white/10 pt-5">
        <NuxtLink
          class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-emerald-100/75 hover:bg-white/10 hover:text-white"
          to="/privacy"
        >
          <span
            class="grid size-8 place-items-center rounded-lg bg-white/10 text-xs"
            >?</span
          >
          Help & privacy
        </NuxtLink>

        <button
          type="button"
          class="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-300/90 transition hover:bg-white/10 hover:text-red-200"
          @click="confirmLogoutVisible = true"
        >
          <span
            class="grid size-8 place-items-center rounded-lg bg-white/10 text-xs font-bold"
            >&#8614;</span
          >
          Logout
        </button>
      </div>
    </aside>

    <Dialog
      v-model:visible="confirmLogoutVisible"
      modal
      header="Confirm logout"
      :style="{ width: '28rem' }"
      :dismissableMask="true"
    >
      <p class="text-sm text-slate-600">
        Are you sure you want to log out? Your current session token will be revoked.
      </p>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="Cancel"
            severity="secondary"
            text
            :disabled="loggingOut"
            @click="confirmLogoutVisible = false"
          />
          <Button
            label="Logout"
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
import Logo from "~/components/layout/logo/index.vue";
import { useAuthStore } from "~/store/auth.js";

defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(["close"]);

const authStore = useAuthStore();
const confirmLogoutVisible = ref(false);
const loggingOut = ref(false);

const confirmLogout = async () => {
  if (!authStore.isLoggedIn) return;
  loggingOut.value = true;
  try {
    emit("close");
    await authStore.logout();
  } finally {
    loggingOut.value = false;
    confirmLogoutVisible.value = false;
  }
};

const navigation = [
  { label: "home", to: "/", shortcut: "H" },
  { label: "المنتجات", to: "/products", shortcut: "P" },
  { label: "creators", to: "/creators", shortcut: "C" },
];
</script>
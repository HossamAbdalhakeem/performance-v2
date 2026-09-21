<template>
  <div class="ops-timeline-panel space-y-3 text-right" dir="rtl">
    <p class="text-sm font-semibold text-white">سجل العملية</p>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="`tl-skel-${i}`" class="flex gap-3">
        <Skeleton height="2.5rem" width="30%" />
        <Skeleton shape="circle" size="1.75rem" class="mt-0.5 shrink-0" />
        <div class="min-w-0 flex-1 space-y-2">
          <Skeleton height="0.9rem" width="60%" />
          <Skeleton height="0.75rem" width="80%" />
        </div>
      </div>
    </div>

    <div
      v-else-if="error"
      class="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300"
    >
      <p>{{ error }}</p>
      <Button
        class="mt-2"
        label="إعادة المحاولة"
        text
        size="small"
        @click="$emit('retry')"
      />
    </div>

    <p v-else-if="!timeline.length" class="text-sm text-slate-400">
      لا توجد أحداث إضافية لهذه العملية.
    </p>

    <ol v-else class="ops-timeline m-0 list-none p-0">
      <li
        v-for="(item, index) in timeline"
        :key="item.id || index"
        class="ops-timeline-item"
        dir="ltr"
      >
        <!-- Left side: event details -->
        <div class="ops-timeline-content" dir="rtl">
          <p class="m-0 font-semibold text-white">{{ item.title }}</p>
          <ul
            v-if="item.details?.length"
            class="mt-2 space-y-1 text-xs text-slate-300"
          >
            <li
              v-for="(line, idx) in item.details"
              :key="`${item.id}-d-${idx}`"
              class="break-words"
            >
              {{ line }}
            </li>
          </ul>
          <p v-if="item.actorName" class="mt-2 text-xs text-slate-500">
            بواسطة: {{ item.actorName }}
          </p>
        </div>

        <!-- Center: marker + connector -->
        <div class="ops-timeline-rail" aria-hidden="true">
          <span
            class="ops-timeline-marker"
            :style="{
              backgroundColor: `${markerMeta(item).color}22`,
              borderColor: markerMeta(item).color,
              color: markerMeta(item).color,
            }"
          >
            <i :class="markerMeta(item).icon" />
          </span>
          <span
            v-if="index < timeline.length - 1"
            class="ops-timeline-connector"
          />
        </div>

        <!-- Right side: date/time -->
        <div class="ops-timeline-opposite">
          <AppDateTimeCell :value="item.date" />
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import Button from "primevue/button";
import AppDateTimeCell from "~/components/shared/app-datetime-cell/index.vue";

defineOptions({ name: "OperationTimelinePanel" });

defineProps({
  timeline: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

defineEmits(["retry"]);

const EVENT_MARKERS = {
  CREATED: { icon: "pi pi-plus", color: "#38bdf8" },
  PAYMENT: { icon: "pi pi-wallet", color: "#10b981" },
  DELIVERED: { icon: "pi pi-box", color: "#a78bfa" },
  CANCELLED: { icon: "pi pi-times", color: "#fb7185" },
  REFUND: { icon: "pi pi-replay", color: "#f43f5e" },
  EXCHANGE: { icon: "pi pi-sync", color: "#8b5cf6" },
  RETURN: { icon: "pi pi-undo", color: "#e11d48" },
  COMPLETED: { icon: "pi pi-check", color: "#34d399" },
};

const DEFAULT_MARKER = { icon: "pi pi-circle", color: "#94a3b8" };

const markerMeta = (item) =>
  EVENT_MARKERS[String(item?.type || "").toUpperCase()] || DEFAULT_MARKER;
</script>

<style scoped>
.ops-timeline-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1.75rem minmax(7.5rem, 28%);
  width: 100%;
  max-width: 100%;
  column-gap: 0.85rem;
  align-items: stretch;
}

.ops-timeline-opposite {
  padding-top: 0.2rem;
  text-align: start;
  font-size: 0.75rem;
  line-height: 1.35;
  color: #94a3b8;
  white-space: normal;
  overflow-wrap: anywhere;
}

.ops-timeline-rail {
  display: flex;
  width: 1.75rem;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
}

.ops-timeline-marker {
  z-index: 1;
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1.5px solid;
  font-size: 0.75rem;
}

.ops-timeline-connector {
  width: 2px;
  flex: 1 1 auto;
  min-height: 0.75rem;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  background: rgba(148, 163, 184, 0.35);
  border-radius: 9999px;
}

.ops-timeline-content {
  min-width: 0;
  padding-bottom: 1.25rem;
  overflow-wrap: anywhere;
  white-space: normal;
  text-align: right;
}

@media (max-width: 640px) {
  .ops-timeline-item {
    grid-template-columns: minmax(0, 1fr) 1.75rem;
  }

  .ops-timeline-content {
    grid-column: 1;
    grid-row: 2;
  }

  .ops-timeline-rail {
    grid-column: 2;
    grid-row: 1 / span 2;
  }

  .ops-timeline-opposite {
    grid-column: 1;
    grid-row: 1;
    margin-bottom: 0.25rem;
    text-align: right;
  }
}
</style>

<template>
  <section class="space-y-3">
    <div>
      <p class="font-bold text-white">نظرة عامة</p>
      <p class="mt-0.5 text-xs text-slate-400">
        ملخص سريع — اضغط أي بطاقة للانتقال إلى الصفحة
      </p>
    </div>

    <div
      v-if="loading"
      class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <div
        v-for="i in 4"
        :key="`kpi-skel-${i}`"
        class="rounded-2xl border border-white/10 bg-slate-900 p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="w-full space-y-3">
            <Skeleton width="5rem" height="0.85rem" border-radius="6px" />
            <Skeleton width="4rem" height="1.75rem" border-radius="8px" />
            <Skeleton width="7rem" height="0.7rem" border-radius="6px" />
          </div>
          <Skeleton width="2.5rem" height="2.5rem" border-radius="12px" />
        </div>
      </div>
    </div>

    <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AdminHomeKpiCard
        v-for="card in cards"
        :key="card.type"
        :type="card.type"
        :title="card.title"
        :count="card.count"
        :hint="card.hint"
        :clickable="card.clickable !== false"
        @select="$emit('select', card)"
      />
    </div>
  </section>
</template>

<script setup>
import AdminHomeKpiCard from "./AdminHomeKpiCard.vue";

defineOptions({ name: "AdminHomeKpiSection" });

defineProps({
  cards: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["select"]);
</script>

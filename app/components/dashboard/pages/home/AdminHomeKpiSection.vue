<template>
  <section class="space-y-3">
    <div>
      <p class="font-bold text-white">نظرة عامة</p>
      <p class="mt-0.5 text-xs text-slate-400">
        ملخص سريع — اضغط أي بطاقة للانتقال إلى الصفحة
      </p>
    </div>

    <AdminHomeKpiSectionSkeleton v-if="loading" />

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
import AdminHomeKpiSectionSkeleton from "./skeletons/AdminHomeKpiSectionSkeleton.vue";

defineOptions({ name: "AdminHomeKpiSection" });

defineProps({
  cards: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["select"]);
</script>

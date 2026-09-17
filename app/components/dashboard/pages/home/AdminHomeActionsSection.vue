<template>
  <section class="space-y-3">
    <div>
      <p class="font-bold text-white">إجراءات سريعة</p>
      <p class="mt-0.5 text-xs text-slate-400">
        اختصارات للعمليات الأكثر استخدامًا
      </p>
    </div>

    <AdminHomeActionsSectionSkeleton v-if="loading" />

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <AdminHomeActionCard
        v-for="action in actions"
        :key="action.key"
        :title="action.title"
        :description="action.description"
        :action-label="action.actionLabel"
        :icon="action.icon"
        :icon-wrap-class="action.iconWrapClass"
        :button-class="action.buttonClass"
        :accent-line-class="action.accentLineClass"
        @select="$emit('select', action)"
      />
    </div>
  </section>
</template>

<script setup>
import AdminHomeActionCard from "./AdminHomeActionCard.vue";
import AdminHomeActionsSectionSkeleton from "./skeletons/AdminHomeActionsSectionSkeleton.vue";

defineOptions({ name: "AdminHomeActionsSection" });

defineProps({
  actions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

defineEmits(["select"]);
</script>

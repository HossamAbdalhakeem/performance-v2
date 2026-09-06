<template>
  <div
    class="overflow-hidden rounded-lg border border-forest/40 bg-forest/10 transition hover:shadow-lg"
  >
    <SharedWrapperImage
      :image="card.image"
      :alt="card.title"
      :loading="loading"
    />

    <div class="p-4">
      <SharedContentTitle :title="card.title" :loading="loading" />
      <SharedContentSubtitle
        v-if="loading || card.subtitle"
        class="mt-1"
        :subtitle="card.subtitle"
        :loading="loading"
      />
      <SharedContentDesc
        v-if="loading || card.description"
        class="mt-2"
        :description="card.description"
        :loading="loading"
      />

      <SharedWrapperButtonSection
        v-if="loading || card.cta"
        class="mt-4 border-0 p-0"
        :loading="loading"
      >
        <button
          class="inline-block rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-950"
          @click="emit('view', card.alias || card._id)"
        >
          {{ card.cta }}
        </button>
      </SharedWrapperButtonSection>
    </div>
  </div>
</template>

<script setup>
defineProps({
  card: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
});

// Emit the clicked creator _id so parents can navigate
const emit = defineEmits(["view"]);
</script>

<style lang="scss" scoped>
</style>
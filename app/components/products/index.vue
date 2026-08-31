<template>
  <div>
    <div class="p-6">
      <SharedSectionTitle title="Products" :loading="pending" />
      <ProductsCards
        :cards="pending ? skeletonCards : cards"
        :loading="pending"
      />
    </div>
  </div>
</template>

<script setup>
import SharedSectionTitle from "~/components/shared/section-title/index.vue";
import ProductsCards from "~/components/products/cards/index.vue";
import FeedsCrud from "~/modules/feeds/feedsCrud.js";

const skeletonCards = Array.from({ length: 6 }, () => ({
  image: {
    file_url: "",
    location: "landscape",
  },
  title: "",
  description: "",
  cta: "",
}));

// CRUD executes through useApi() internally (useFetch, SSR-friendly)
// No await => `loading` stays reactive (true while request in flight);
// Nuxt still waits for the non-lazy requests during SSR before rendering
const { data: experiencesData, loading: pending } = FeedsCrud.get({
  select:
    "type alias _id experience_id title summary about extra main_photo media fundraiser._id fundraiser.alias fundraiser.name",
  status: "published",
  page: 1,
  sort: { created_at: -1 },
});

const experiences = computed(() => experiencesData.value?.data || []);

const contributors = computed(() => contributorsData.value?.data || []);

const cards = computed(() =>
  (experiences.value || []).map((experience) => ({
    image: {
      file_url: experience.main_photo?.file_url,
      location: "landscape",
    },
    title: experience.title,
    description: experience.summary,
    cta: "View",
  }))
);
</script>

<style lang="scss" scoped>
</style>


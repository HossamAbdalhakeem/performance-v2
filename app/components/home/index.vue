<template>
  <div>
    <div class="p-6">
      <SharedSectionTitle title="Experiences" :loading="pending" />
      <ProductsCards
        :cards="pending ? skeletonCards : cards"
        :loading="pending"
      />
    </div>

    <div class="p-6">
      <SharedSectionTitle title="Creators" :loading="creatorsPending" />
      <CreatorsCards
        :cards="creatorsPending ? skeletonCreators : creatorCards"
        :loading="creatorsPending"
      />
    </div>
  </div>
</template>

<script setup>
import SharedSectionTitle from "~/components/shared/section-title/index.vue";
import ProductsCards from "~/components/products/cards/index.vue";
import CreatorsCards from "~/components/creators/cards/index.vue";
import FeedsCrud from "~/modules/feeds/feedsCrud.js";
import ContributorsCrud from "~/modules/creators/contributorsCrud.js";

const skeletonCards = Array.from({ length: 6 }, () => ({
  image: {
    file_url: "",
    location: "landscape",
  },
  title: "",
  description: "",
  cta: "",
}));
const skeletonCreators = Array.from({ length: 6 }, () => ({
  image: {
    file_url: "",
    location: "portrait",
  },
  title: "",
  description: "",
 
}));

const getMediaUrl = (media) => media?.file_url || "";

// CRUD executes through useApi() internally (useFetch, SSR-friendly)
// No await => `loading` stays reactive (true while request in flight);
// Nuxt still waits for the non-lazy requests during SSR before rendering
const requestBody = {
  select:
    "type alias _id experience_id title summary about extra main_photo media fundraiser._id fundraiser.alias fundraiser.name",
  status: "published",
  sort: { created_at: -1 },
};

// top-level await => SSR waits for page 1 and renders it server-side
const { data: experiencesData, loading: pending } = await FeedsCrud.get({
  ...requestBody,
  page: 1,
});

const { data: contributorsData, loading: creatorsPending } =
  ContributorsCrud.get();

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

const creatorCards = computed(() =>
  (contributors.value || []).map((contributor) => ({
    image: {
      file_url: getMediaUrl(contributor?.main_photo),
      location: "portrait",
    },
    title: contributor.name,
    description: contributor.description,
    cta: "View",
  }))
);
</script>

<style lang="scss" scoped>
</style>

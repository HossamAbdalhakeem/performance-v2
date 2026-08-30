<template>
  <div>
    <div class="p-6">
      <SharedSectionTitle
        title="Experiences"
        :loading="pending"
      />

      <!-- <div v-if="pending" class="py-10 text-center text-slate-500">Loading experiences...</div> -->

      <!-- <div v-if="error" class="py-10 text-center text-red-400">
        Failed to load experiences. Please try again.
      </div> -->

      <SharedCards
        :cards="pending ? skeletonCards : cards"
        :loading="pending"
      />
    </div>

    <div class="p-6">
      <SharedSectionTitle
        title="Creators"
        :loading="creatorsPending"
      />

      <!-- <div v-if="creatorsError" class="py-10 text-center text-red-400">
        Failed to load creators. Please try again.
      </div> -->

      <SharedCards
        :cards="creatorsPending ? skeletonCards : creatorCards"
        :loading="creatorsPending"
      />
    </div>
  </div>
</template>

<script setup>
import SharedCards from "~/components/shared/cards/index.vue";
import SharedSectionTitle from "~/components/shared/section-title/index.vue";
import FeedsCrud from "~/modules/feeds/feedsCrud.js";
import ContributorsCrud from "~/modules/creators/contributorsCrud.js";

const skeletonCards = Array.from({ length: 6 }, () => ({
  image: "",
  title: "",
  description: "",
  cta: "",
}));

const getMediaUrl = (media) =>
  media?.url || media?.path || media?.location || "";

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

const { data: contributorsData, loading: creatorsPending } =
  ContributorsCrud.get();

const experiences = computed(() => experiencesData.value?.data || []);

const contributors = computed(() => contributorsData.value?.data || []);

const cards = computed(() =>
  (experiences.value || []).map((experience) => ({
    image: experience.main_photo,
    title: experience.title,
    description: experience.summary,
    cta: "View",
  }))
);

const creatorCards = computed(() =>
  (contributors.value || []).map((contributor) => ({
    image: getMediaUrl(contributor.main_photo),
    title: contributor.name,
    description: contributor.description,
    cta: "View",
  }))
);
</script>

<style lang="scss" scoped>
</style>

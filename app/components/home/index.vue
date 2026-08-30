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

const experiences = ref([]);
const pending = ref(true);
const error = ref(null);

const contributors = ref([]);
const creatorsPending = ref(true);
const creatorsError = ref(null);

const skeletonCards = Array.from({ length: 6 }, () => ({
  image: "",
  title: "",
  description: "",
  cta: "",
}));

const getMediaUrl = (media) =>
  media?.url || media?.path || media?.location || "";

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

const fetchExperiences = async () => {
  pending.value = true;
  error.value = null;

  const response = await FeedsCrud.get({
    select:
      "type alias _id experience_id title summary about extra main_photo media fundraiser._id fundraiser.alias fundraiser.name",
    status: "published",
    page: 1,
    sort: { created_at: -1 },
  });

  if (response?.success) {
    experiences.value = response.data?.data || [];
  } else {
    error.value = response?.error || "Request failed";
  }

  pending.value = false;
};

const fetchContributors = async () => {
  creatorsPending.value = true;
  creatorsError.value = null;

  const response = await ContributorsCrud.get();

  if (response?.success) {
    contributors.value = response.data?.data || [];
  } else {
    creatorsError.value = response?.error || "Request failed";
  }

  creatorsPending.value = false;
};

// top-level await => Nuxt SSR waits for these requests
// and renders the data server-side
await Promise.all([
  fetchExperiences(),
  fetchContributors(),
]);
</script>

<style lang="scss" scoped>
</style>

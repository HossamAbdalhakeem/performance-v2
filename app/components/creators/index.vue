<template>
  <div>
    <div class="p-6">
      <SharedSectionTitle title="Creators" :loading="pending" />
      <CreatorsCards
        :cards="pending ? skeletonCards : cards"
        :loading="pending"
        @view="goToCreator"
      />

      <!-- Sentinel observed by IntersectionObserver to load the next page -->
      <div ref="sentinelRef" class="h-1" />

      <div v-if="loadingMore" class="flex justify-center py-6">
        <Skeleton width="200px" height="1.5rem" border-radius="8px" />
      </div>

      <p
        v-if="!hasMore && !pending"
        class="py-6 text-center text-sm text-muted"
      >
        No more creators
      </p>
    </div>
  </div>
</template>

<script setup>
import SharedSectionTitle from "~/components/shared/section-title/index.vue";
import CreatorsCards from "~/components/creators/cards/index.vue";
import ContributorsCrud from "~/modules/creators/contributorsCrud.js";
import Skeleton from "primevue/skeleton";

// Nuxt instance - lets us call ContributorsCrud.get (useFetch)
// from the observer callback via runWithContext()
const nuxtApp = useNuxtApp();

const router = useRouter();
// Navigate to the creator page for the clicked contributor _id
const goToCreator = (_id) => {
  if (_id) {
    router.push({ path: `/creators/${_id}` });
  }
};

const skeletonCards = Array.from({ length: 6 }, () => ({
  image: {
    file_url: "",
    location: "portrait",
  },
  title: "",
  description: "",
  cta: "",
}));

const getMediaUrl = (media) => media?.file_url || "";

// First page is fetched during SSR like products (no await =>
// `loading` stays reactive while the request is in flight)
const { data: contributorsData, loading: pending } = ContributorsCrud.get({
  page: 1,
});

// ---- Infinite scroll pagination ----
const page = ref(1);
const loadingMore = ref(false);
const hasMore = ref(true);
const moreContributors = ref([]);

const contributors = computed(() => {
  const firstPage = contributorsData.value?.data || [];
  return [...firstPage, ...moreContributors.value];
});

const cards = computed(() =>
  (contributors.value || []).map((contributor) => ({
    _id: contributor._id,
    image: {
      file_url: getMediaUrl(contributor?.main_photo),
      location: "portrait",
    },
    title: contributor.name,
    description: contributor.description,
    cta: "View",
  }))
);

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return;

  loadingMore.value = true;
  try {
    const nextPage = page.value + 1;

    // runWithContext restores the Nuxt instance so ContributorsCrud.get
    // (useFetch) works correctly even when called from the observer callback
    const { data } = await nuxtApp.runWithContext(() =>
      ContributorsCrud.get({ page: nextPage })
    );

    const items = data.value?.data || [];
    if (items.length === 0) {
      hasMore.value = false;
    } else {
      page.value = nextPage;
      moreContributors.value.push(...items);
    }
  } catch {
    hasMore.value = false;
  } finally {
    loadingMore.value = false;
  }
};

// ---- IntersectionObserver: fetch next page when sentinel is visible ----
// watch on the template ref replaces onMounted - it fires as soon as
// the sentinel element is mounted, and re-fires if it changes
const sentinelRef = ref(null);
let observer = null;

watch(
  sentinelRef,
  (el) => {
    observer?.disconnect();

    if (!el || !("IntersectionObserver" in window)) return;

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<style lang="scss" scoped>
</style>

<template>
  <div>
    <div class="p-6">
      <SharedSectionTitle title="Products" :loading="pending" />
      <ProductsCards
        :cards="pending ? skeletonCards : cards"
        :loading="pending"
        @view="goToPreview"
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
        No more products
      </p>
    </div>
  </div>
</template>

<script setup>
import SharedSectionTitle from "~/components/shared/section-title/index.vue";
import ProductsCards from "~/components/products/cards/index.vue";
import FeedsCrud from "~/modules/feeds/feedsCrud.js";
import Skeleton from "primevue/skeleton";

// Nuxt instance - lets us call FeedsCrud.get (useFetch)
// from the observer callback via runWithContext()
const nuxtApp = useNuxtApp();

// Navigate to the preview page for the clicked experience alias
// from marks the origin so the inner-pages X button can route back here
const router = useRouter();
const goToPreview = (alias) => {
  if (alias) {
    router.push({
      path: `/products/preview/${alias}`,
      query: { from: "products" },
    });
  }
};

const skeletonCards = Array.from({ length: 6 }, () => ({
  image: {
    file_url: "",
    location: "landscape",
  },
  title: "",
  description: "",
  cta: "",
}));

const requestBody = {
  select:
    "type alias _id experience_id title summary about extra main_photo media fundraiser._id fundraiser.alias fundraiser.name",
  status: "published",
  sort: { created_at: -1 },
};

// No await => `loading` stays reactive (true while request in flight);
// Nuxt still waits for the non-lazy requests during SSR before rendering
const { data: experiencesData, loading: pending } = FeedsCrud.get({
  ...requestBody,
  page: 1,
});

// ---- Infinite scroll pagination ----
const page = ref(1);
const loadingMore = ref(false);
const hasMore = ref(true);
const moreExperiences = ref([]);

const experiences = computed(() => {
  const firstPage = experiencesData.value?.data || [];
  return [...firstPage, ...moreExperiences.value];
});

const cards = computed(() =>
  (experiences.value || []).map((experience) => ({
    image: {
      file_url: experience.main_photo?.file_url,
      location: "landscape",
    },
    title: experience.title,
    description: experience.summary,
    alias: experience.alias,
    cta: "View",
  }))
);

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return;

  loadingMore.value = true;
  try {
    const nextPage = page.value + 1;

    // runWithContext restores the Nuxt instance so FeedsCrud.get (useFetch)
    // works correctly even when called from the observer callback
    const { data } = await nuxtApp.runWithContext(() =>
      FeedsCrud.get({ ...requestBody, page: nextPage })
    );
    // const { data} = await FeedsCrud.get({ ...requestBody, page: nextPage });

    const items = data.value?.data || [];
    if (items.length === 0) {
      hasMore.value = false;
    } else {
      page.value = nextPage;
      moreExperiences.value.push(...items);
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


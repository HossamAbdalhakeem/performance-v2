<template>
  <div>
    <div class="p-6">
      <div
        class="flex flex-col gap-8 overflow-hidden rounded-2xl border border-forest/40 bg-forest/10 lg:flex-row"
      >
        <!-- Left rail: main photo + optional preview video -->
        <div class="w-full shrink-0 lg:w-1/4">
          <div v-if="!loading">
            <div v-if="previewVideoUrl" class="p-4">
              <SharedWrapperVideo
              :src="previewVideoUrl"
              :loading="false"
              :hide-controls="true"
              aspect-ratio="aspect-[3/4]"
            />
            </div>
            <div v-else class="p-4">
              <SharedWrapperImage
                :image="profileImage"
                :alt="details?.contributor?.name"
                :loading="loading"
                :critical="true"
                class="w-full rounded-xl"
              />
            </div>
          </div>
        </div>

        <!-- Right rail: details -->
        <div class="flex-1 p-6 lg:py-8">
          <!-- Fundraiser chip -->
          <span
            v-if="loading || details?.fund_raiser?.name"
            class="mb-3 inline-block rounded-full bg-emerald-800/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
          >
            <Skeleton
              v-if="loading"
              width="6rem"
              height="1rem"
              border-radius="9999px"
            />
            <template v-else>{{ details?.fund_raiser?.name }}</template>
          </span>

          <SharedSectionTitle
            :title="about?.title || details?.contributor?.name"
            :loading="loading"
            class="mb-3"
          />

          <SharedContentSubtitle
            v-if="loading || about?.subtitle"
            class="mb-4"
            :subtitle="about?.subtitle"
            :loading="loading"
          />

          <SharedContentDesc
            v-if="loading || about?.description || details?.description"
            class="mb-6"
            :description="about?.description || details?.description"
            :loading="loading"
          />

          <section v-if="!loading && details?.contributor?.bio" class="mb-6">
            <h3 class="mb-2 font-serif text-xl font-normal text-mint">Bio</h3>
            <SharedContentDesc :description="details.contributor.bio" />
          </section>

          <p
            v-if="!loading && error"
            class="py-6 text-center text-sm text-muted"
          >
            Failed to load creator
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SharedSectionTitle from "~/components/shared/section-title/index.vue";
import SharedContentSubtitle from "~/components/shared/content-subtitle/index.vue";
import SharedContentDesc from "~/components/shared/content-desc/index.vue";
import SharedWrapperImage from "~/components/shared/wrapper-image/index.vue";
import SharedWrapperVideo from "~/components/shared/wrapper-video/index.vue";
import WebClientsCrud from "~/modules/creators/webClientsCrud.js";
import Skeleton from "primevue/skeleton";

const props = defineProps({
  alias: { type: String, default: "" },
});

// Creator web-client (contributor + fund_raiser + organization + layout).
// Fetched through useApi (useFetch) => SSR-friendly.
// Some endpoints wrap the payload in { data: ... } - handle both shapes.
const { data, loading, error } = props.alias
  ? WebClientsCrud.get(props.alias)
  : { data: ref(null), loading: ref(false), error: ref(null) };

const details = computed(() => data.value?.data || data.value || null);

// ---- Open Graph + Twitter Cards (dynamic from creator data) ----
useDynamicSeo({
  title: () => about.value?.title || details.value?.contributor?.name || 'Creator',
  description: () =>
    about.value?.subtitle ||
    about.value?.description ||
    details.value?.description ||
    details.value?.contributor?.bio ||
    undefined,
  image: () =>
    details.value?.contributor?.main_photo?.file_url ||
    details.value?.meta?.image?.file_url ||
    undefined,
  type: 'profile',
});

// contributor.about is a JSON string: { title, subtitle, description, image }
const about = computed(() => {
  const raw = details.value?.contributor?.about;
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
});

const profileImage = computed(() => {
  const photo =
    details.value?.contributor?.main_photo ||
    details.value?.meta?.image ||
    null;
  return {
    file_url: photo?.file_url || "",
    location: "portrait",
  };
});

// Optional portrait preview video from contributor.card_preview_image
const previewVideoUrl = computed(() => {
  const list = details.value?.contributor?.card_preview_image || [];
  const video = (Array.isArray(list) ? list : []).find((item) =>
    item?.mime_type?.startsWith?.("video/")
  );
  return video?.file_url || "";
});
</script>

<style lang="scss" scoped>
</style>

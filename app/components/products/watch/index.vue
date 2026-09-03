<template>
  <div>
    <div class="p-6">
      <div
        class="overflow-hidden rounded-2xl border border-forest/40 bg-forest/10"
      >
        <!-- Player -->
        <div class="aspect-video w-full bg-black">
          <video
            v-if="playableUrl && !contentPending"
            :src="playableUrl"
            controls
            playsinline
            class="h-full w-full"
          />
          <div
            v-else
            class="grid h-full place-items-center text-sm text-muted"
          >
            <Skeleton
              v-if="contentPending"
              width="100%"
              height="100%"
              border-radius="0px"
            />
            <span v-else>Video source is not available</span>
          </div>
        </div>

        <div class="p-6">
          <SharedSectionTitle
            :title="details?.title"
            :loading="productPending"
            class="mb-3"
          />

          <SharedContentSubtitle
            v-if="productPending || details?.summary"
            :subtitle="details?.summary"
            :loading="productPending"
            class="mb-4"
          />

          <div
            v-if="!contentPending && contentMeta.length"
            class="flex flex-wrap gap-2"
          >
            <span
              v-for="(item, idx) in contentMeta"
              :key="idx"
              class="inline-flex items-center gap-1 rounded-md border border-forest/40 bg-ink/40 px-2 py-1 text-xs text-mint"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import SharedSectionTitle from "~/components/shared/section-title/index.vue";
import SharedContentSubtitle from "~/components/shared/content-subtitle/index.vue";
import FeedsCrud from "~/modules/feeds/feedsCrud.js";
import ContentCrud from "~/modules/content/contentCrud.js";
import Skeleton from "primevue/skeleton";

// Route params: _id = product alias (same as preview), watchId = content _id
// taken from extra.contents_info[0]._id when clicking the watch button.
const route = useRoute();
const alias = route?.params?._id;
const watchId = route?.params?.watchId;

// ---- Product (same API/body as the preview page, resolved by alias) -----
const requestBody = {
  select:
    "type alias _id experience_id title summary about extra main_photo media fundraiser._id fundraiser.alias fundraiser.name",
  experiences_aliases: [alias],
};

const { data: productData, loading: productPending } = FeedsCrud.get(
  requestBody,
);

const details = computed(() => productData.value?.data?.[0] || null);

// ---- Content (streaming source from /merch/app-api/content) -------------
const { data: contentData, loading: contentPending } = alias
  ? ContentCrud.get(alias)
  : { data: ref(null), loading: ref(false) };

// The content entry matching the watch id from the route.
const content = computed(() => {
  const raw = contentData.value;
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
      ? raw.data
      : raw?.data
        ? [raw.data]
        : raw
          ? [raw]
          : [];
  if (!list.length) return null;
  return list.find((item) => item?._id === watchId) || list[0];
});

// ---- Playable source -----------------------------------------------------
const playableUrl = computed(() => {
  const c = content.value;
  return (
    c?.url ||
    c?.file_url ||
    c?.source?.url ||
    c?.manifest_url ||
    c?.playback_url ||
    ""
  );
});

// ---- Meta chips ----------------------------------------------------------
const contentMeta = computed(() => {
  const c = content.value;
  const items = [];
  if (c?.drm) items.push(`DRM: ${c.drm}`);
  if (c?.type) items.push(c.type);
  if (c?.status) items.push(c.status);
  return items;
});
</script>

<style lang="scss" scoped>
</style>

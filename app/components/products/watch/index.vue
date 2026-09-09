<template>
  <div>
    <div class="p-6">
      <div
        class="flex gap-8 overflow-hidden rounded-2xl border border-forest/40 bg-forest/10 lg:flex-row"
      >
        <!-- Player column -->
        <div class="w-full shrink-0 lg:w-[60%]">
          <div class="p-4">
            <div class="aspect-video w-full">
              <SharedWrapperVideo
                :src="playableUrl"
                :loading="contentPending"
              />
            </div>

            <!-- Video title (from content object) -->
            <div class="px-1 pt-3">
              <template v-if="contentPending">
                <Skeleton width="60%" height="1.25rem" border-radius="4px" />
              </template>
              <template v-else>
                <p class="font-serif text-lg font-semibold text-mint">
                  {{ content?.title || "Untitled video" }}
                </p>
              </template>
            </div>
          </div>
        </div>

        <!-- Details column -->
        <div class="flex-1 p-6 lg:py-8">
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
            class="mb-6 flex flex-wrap gap-2"
          >
            <span
              v-for="(item, idx) in contentMeta"
              :key="idx"
              class="inline-flex items-center gap-1 rounded-md border border-forest/40 bg-ink/40 px-2 py-1 text-xs text-mint"
            >
              {{ item }}
            </span>
          </div>

          <section
            v-if="contentPending || contentDescription"
            class="mb-6"
          >
            <h3 class="mb-2 font-serif text-xl font-normal text-mint">
              Description
            </h3>
            <div v-if="contentPending">
              <Skeleton
                width="100%"
                height="0.75rem"
                border-radius="4px"
                class="mb-2"
              />
              <Skeleton width="66%" height="0.75rem" border-radius="4px" />
            </div>
            <p v-else class="text-sm leading-relaxed text-muted">
              {{ contentDescription }}
            </p>
          </section>

          <section v-if="contentPending || videoFacts.length" class="mb-6">
            <h3 class="mb-3 font-serif text-xl font-normal text-mint">
              Details
            </h3>
            <div class="overflow-hidden rounded-lg border border-forest/40">
              <div
                v-for="(fact, idx) in videoFacts"
                :key="idx"
                class="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
                :class="[
                  idx % 2 === 0 ? 'bg-ink/40' : 'bg-transparent',
                  idx > 0 ? 'border-t border-forest/40' : '',
                ]"
              >
                <span class="text-muted">{{ fact.label }}</span>
                <span class="font-medium text-mint">{{ fact.value }}</span>
              </div>
            </div>
          </section>

          <p
            v-if="!contentPending && details?.fundraiser?.name"
            class="text-xs text-muted/70"
          >
            From {{ details.fundraiser.name }}
          </p>
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

// The content entry: the API returns a single object keyed by _id,
// matching the watch id taken from extra.contents_info[0]._id.
const content = computed(() => {
  const raw = contentData.value?.data;
  if (!raw || typeof raw !== 'object') return null;
  const item = Array.isArray(raw) ? raw[0] : raw;
  return item || null;
});

// ---- Open Graph + Twitter Cards (dynamic from content/product data) ----
useDynamicSeo({
  title: () => content.value?.title || details.value?.title || 'Watch',
  description: () =>
    content.value?.description || details.value?.summary || undefined,
  // Prefer a video thumbnail if available, fall back to the product photo
  image: () =>
    details.value?.main_photo?.file_url ||
    content.value?.thumbnail?.file_url ||
    undefined,
  type: 'video.other',
});

// ---- Playable source -----------------------------------------------------
const playableUrl = computed(() => 'https://media-public.genwin.app/production/5e0b95f2d93b5a416ca5b1ef/682c7c872c08d3c049de3174/videos/WYz00B-F1YiVQfVHysXj2.mp4?Expires=1788472830&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9tZWRpYS1wdWJsaWMuZ2Vud2luLmFwcC9wcm9kdWN0aW9uLzVlMGI5NWYyZDkzYjVhNDE2Y2E1YjFlZi82ODJjN2M4NzJjMDhkM2MwNDlkZTMxNzQvdmlkZW9zL1dZejAwQi1GMVlpVlFmVkh5c1hqMi5tcDQiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3ODg0NzI4MzB9fX1dfQ__&Signature=LvLNeSt7kMUQx5YGtNgvofmlMwX8TDkb8wkzSwy-mJ99yTcsFYl5RWXPdd7Ij8JAVTAcXf0Y5LKUOk-Lykb0P9yzg2vV0APe0sV3GY5FyoZiov~XF0FllmMQZpLBMf99Kbq5n2cM1EpEwVb53UvoyUMhV7J~b1y--3fgnL9eU8Jz0NBy66vcyaIdFX-z~QjnuDT8d4U6kSkWX0e0MtlqIyff1qTtL1LdCm7QokcqdAQ7uVkpzSAjJTPaFrcBISLjpZC~c76bLDjOax5Qjkb3mp18sUaHf8y8n8c1gpwMYOR4ATWe57vpTlRyGXxQ0Ht-9bortnjial7533r5YHnS-A__&Key-Pair-Id=K1A3W6AG2LLUJA' || "");

// ---- Meta chips ----------------------------------------------------------
const contentMeta = computed(() => {
  const c = content.value;
  const items = [];
  if (c?.media_type) items.push(c.media_type);
  if (c?.metadata?.duration) items.push(`${Math.round(c.metadata.duration)}s`);
  if (c?.is_public) items.push("Public");
  return items;
});

// ---- Description (from content object) -----------------------------------
const contentDescription = computed(
  () => content.value?.description || "No description provided.",
);

// ---- Details table rows ---------------------------------------------------
const videoFacts = computed(() => {
  const c = content.value;
  if (!c) return [];
  const facts = [];
  if (c.media_type) facts.push({ label: "Media type", value: c.media_type });
  if (c.metadata?.duration)
    facts.push({ label: "Duration", value: formatDuration(c.metadata.duration) });
  if (c.is_public)
    facts.push({ label: "Visibility", value: "Public" });
  else facts.push({ label: "Visibility", value: "Private" });
  if (c.is_published)
    facts.push({ label: "Status", value: "Published" });
  if (c._id) facts.push({ label: "Content ID", value: c._id });
  return facts;
});

const formatDuration = (seconds) => {
  const total = Math.round(Number(seconds) || 0);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};
</script>

<style lang="scss" scoped>
</style>

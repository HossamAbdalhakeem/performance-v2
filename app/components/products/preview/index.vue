<template>
  <div>
    <div class="p-6">
      <div
        class="flex flex-col gap-8 overflow-hidden rounded-2xl border border-forest/40 bg-forest/10 lg:flex-row"
      >
        <div class="w-full shrink-0 lg:w-1/2">
          <div class="p-4">
            <SharedWrapperImage
              :image="previewImage"
              :alt="details?.title"
              :loading="pending"
              :critical="true"
              class="w-full rounded-xl"
            />
          </div>
          <div
            v-if="!pending && previewThumbs.length > 1"
            class="flex flex-wrap gap-2 px-4 pb-4"
          >
            <button
              v-for="(thumb, idx) in previewThumbs"
              :key="idx"
              class="h-16 w-16 overflow-hidden rounded-lg border transition"
              :class="
                selectedImageIndex === idx
                  ? 'border-mint'
                  : 'border-forest/40 opacity-60 hover:opacity-100'
              "
              @click="selectedImageIndex = idx"
            >
              <img
                :src="thumb.file_url"
                :alt="details?.title"
                class="h-full w-full object-cover"
              />
            </button>
          </div>
        </div>

        <div class="flex-1 p-6 lg:py-8">
          <span
            v-if="pending || details?.type"
            class="mb-3 inline-block rounded-full bg-emerald-800/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
          >
            <Skeleton
              v-if="pending"
              width="4rem"
              height="1rem"
              border-radius="9999px"
            />
            <template v-else>{{ details.type }}</template>
          </span>

          <SharedSectionTitle
            :title="details?.title"
            :loading="pending"
            class="mb-3"
          />

          <SharedContentSubtitle
            v-if="pending || details?.summary"
            :subtitle="details?.summary"
            :loading="pending"
            class="mb-4"
          />

          <div
            v-if="!pending && metaItems.length"
            class="mb-6 flex flex-wrap gap-2"
          >
            <span
              v-for="(item, idx) in metaItems"
              :key="idx"
              class="inline-flex items-center gap-1 rounded-md border border-forest/40 bg-ink/40 px-2 py-1 text-xs text-mint"
            >
              {{ item }}
            </span>
          </div>

          <div v-if="pending || details?.extra?.subtype" class="mb-6">
            <SharedWrapperButtonSection :loading="pending">
              <button
                class="rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-950"
                @click="onCtaClick"
              >
                {{ ctaLabel }}
              </button>
            </SharedWrapperButtonSection>
          </div>

          <section v-if="pending || notesHtml" class="mb-6">
            <h3 class="mb-2 font-serif text-xl font-normal text-mint">About</h3>
            <div v-if="pending">
              <Skeleton
                width="100%"
                height="0.75rem"
                border-radius="4px"
                class="mb-2"
              />
              <Skeleton
                width="100%"
                height="0.75rem"
                border-radius="4px"
                class="mb-2"
              />
              <Skeleton width="66%" height="0.75rem" border-radius="4px" />
            </div>
            <div
              v-else
              class="leading-relaxed text-muted [&_p]:mb-2 [&_p]:last:mb-0"
              v-html="notesHtml"
            />
          </section>

          <section v-if="pending || packages.length" class="mb-6">
            <h3 class="mb-3 font-serif text-xl font-normal text-mint">
              Packages
            </h3>
            <div v-if="pending" class="space-y-3">
              <Skeleton width="100%" height="5rem" border-radius="8px" />
              <Skeleton width="100%" height="5rem" border-radius="8px" />
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="pkg in packages"
                :key="pkg._id"
                class="rounded-lg border border-forest/40 bg-ink/40 p-4"
              >
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-lg font-semibold text-mint">
                      {{ pkg.title || pkg.name }}
                    </p>
                    <p v-if="pkg.description" class="mt-1 text-sm text-muted">
                      {{ pkg.description }}
                    </p>
                  </div>
                  <p class="whitespace-nowrap text-lg font-bold text-mint">
                    ${{ pkg.price }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section v-if="pending || details?.fundraiser?.name" class="mb-6">
            <h3 class="mb-3 font-serif text-xl font-normal text-mint">
              Fundraiser
            </h3>
            <div
              class="flex items-center gap-4 rounded-lg border border-forest/40 bg-ink/40 p-4"
            >
              <SharedWrapperImage
                v-if="!pending"
                :image="{
                  file_url: details?.fundraiser?.main_photo?.file_url,
                  location: 'square',
                }"
                :alt="details?.fundraiser?.name"
                class="aspect-square w-16 shrink-0 rounded-full [&_div]:!rounded-full"
              />
              <template v-if="pending">
                <Skeleton width="3rem" height="3rem" border-radius="9999px" />
              </template>
              <div>
                <p v-if="pending">
                  <Skeleton width="8rem" height="1.25rem" border-radius="4px" />
                </p>
                <template v-else>
                  <p class="text-lg font-semibold text-mint">
                    {{ details.fundraiser.name }}
                  </p>
                  <p
                    v-if="details.fundraiser.summary"
                    class="mt-1 text-sm text-muted"
                  >
                    {{ details.fundraiser.summary }}
                  </p>
                </template>
              </div>
            </div>
          </section>

          <p v-if="!pending && createdDate" class="text-xs text-muted/70">
            Published {{ createdDate }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import SharedSectionTitle from "~/components/shared/section-title/index.vue";
import SharedWrapperImage from "~/components/shared/wrapper-image/index.vue";
import SharedWrapperButtonSection from "~/components/shared/wrapper-button-section/index.vue";
import SharedContentSubtitle from "~/components/shared/content-subtitle/index.vue";
import FeedsCrud from "~/modules/feeds/feedsCrud.js";
import Skeleton from "primevue/skeleton";

// The route param _id holds the product alias (e.g. "camp-scampi")
const route = useRoute();
const alias = route?.params?._id;

// Same body used by the products list, plus the new key that resolves
// a single experience by aliases. It always returns an array, so we
// take the first element ([0]) for the details.
const requestBody = {
  select:
    "type alias _id experience_id title summary about extra main_photo media fundraiser._id fundraiser.alias fundraiser.name",
  experiences_aliases: [alias],
};

// const { data, loading: pending } = alias
//   ? FeedsCrud.get(requestBody)
//   : { data: ref(null), loading: ref(false) };

const { data, loading: pending } = FeedsCrud.get(requestBody);

const details = computed(() => data.value?.data?.[0] || null);

// ---- Left rail: images ------------------------------------------------
// Prefer extra.card_preview_image (real experience payload) and fall back
// to main_photo. Deduplicate by file_url and honor each item's location.
const loc = (value) => {
  const map = {
    landscape: "landscape",
    portrait: "portrait",
    square: "portrait",
  };
  return map[value] || "landscape";
};

const previewImage = computed(() => {
  const thumbs = previewThumbs.value;
  if (thumbs.length) {
    const chosen = thumbs[selectedImageIndex.value] || thumbs[0];
    return { ...chosen, location: loc(chosen.location) };
  }
  const mp = details.value?.main_photo?.file_url;
  return mp
    ? { file_url: mp, location: "landscape" }
    : { file_url: "", location: "landscape" };
});

const previewThumbs = computed(() => {
  if (pending.value) return [];
  const source = details.value?.extra?.card_preview_image || [];
  const list = Array.isArray(source) ? source : [];
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const url = item?.file_url;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(item);
  }
  return out.slice(0, 6);
});

const selectedImageIndex = ref(0);

// ---- Meta chips --------------------------------------------------------
const metaItems = computed(() => {
  const d = details.value;
  const items = [];
  const subtype = d?.extra?.subtype;
  if (subtype?.title) items.push(subtype.title);
  else if (d?.type) items.push(d.type);
  if (d?.extra?.access_level) items.push(`Access: ${d.extra.access_level}`);
  if (String(d?.extra?.is_bundle) === "true") items.push("Bundle");
  if (String(d?.extra?.is_affiliate) === "true") items.push("Affiliate");
  return items;
});

// ---- CTA --------------------------------------------------------------
const ctaLabel = computed(() => {
  if (pending.value) return "";
  return details.value?.extra?.subtype?.action_btn_title || "View";
});

const onCtaClick = () => {
  // TODO: wire up actual purchase / access flow when available
};

// ---- Notes (HTML description) -----------------------------------------
const notesHtml = computed(() => details.value?.extra?.notes || "");

// ---- Packages ----------------------------------------------------------
const packages = computed(() => {
  const list = details.value?.extra?.packages;
  return Array.isArray(list) ? list : [];
});

// ---- Created date ------------------------------------------------------
const createdDate = computed(() => {
  const raw = details.value?.extra?.created_at;
  if (!raw) return "";
  const dt = new Date(raw);
  return isNaN(dt) ? "" : dt.toLocaleDateString();
});
</script>

<style lang="scss" scoped>
</style>
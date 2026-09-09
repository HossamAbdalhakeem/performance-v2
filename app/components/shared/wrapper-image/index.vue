<template>
  <div
    ref="componentRef"
    class="overflow-hidden rounded-lg border border-forest/40 bg-forest/10"
  >
    <Skeleton
      v-if="loading || !shouldRender"
      width="100%"
      height="100%"
      border-radius="0px"
      class="w-full"
      :class="aspectClass"
    />
    <img
      v-else-if="optimizedSrc"
      :src="optimizedSrc"
      :alt="alt"
      class="h-full w-full object-cover"
      :class="aspectClass"
      :loading="critical ? 'eager' : 'lazy'"
      :fetchpriority="critical ? 'high' : 'auto'"
      decoding="async"
    />
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

const props = defineProps({
  // { file_url: String, location: "landscape" | "portrait" }
  image: { type: Object, default: () => ({}) },
  alt: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  // Critical image (e.g. hero): eager + fetchpriority=high + preconnect
  critical: { type: Boolean, default: false },
  // Force a specific CDN width - 0 means auto-detect from element width
  imageWidth: { type: Number, default: 0 },
});
console.log("alt", props?.alt);
const componentRef = ref(null);
const elWidth = ref(0);
const inView = ref(false);
let resizeObserver = null;
let intersectionObserver = null;

const src = computed(() => props.image?.file_url || "");

const aspectClass = computed(() =>
  props.image?.location === "portrait" ? "aspect-[3/4]" : "aspect-video"
);

/**
 * Resolve the width used for the CDN resize request:
 * explicit prop > measured element width > 400 fallback
 */
const resolvedWidth = computed(() => {
  if (props.imageWidth > 0) return props.imageWidth;
  return elWidth.value || 400;
});

/**
 * Build a resized webp URL for genwin media hosts.
 * GIFs are skipped (animation breaks with resize/format conversion).
 */
const buildResizedUrl = (rawSrc, width) => {
  if (!rawSrc) return "";

  const last3 = rawSrc.slice(-3).toLowerCase();
  console.log("last3", last3);

  if (last3 === "gif") return rawSrc;

  const hosts = ["media-public.genwin.app", "media-privet.genwin.app"];
  for (const host of hosts) {
    if (rawSrc.includes(host)) {
      const [before, after] = rawSrc.split(host);
      console.log("before", before);
      console.log("after", after);

      return `${before}${host}/resize/w/${width}/format/webp/type/progressive/fit/cover/path${after}`;
    }
  }

  return rawSrc;
};

const optimizedSrc = computed(() =>
  buildResizedUrl(src.value, resolvedWidth.value)
);

const shouldRender = computed(() => {
  // Critical images render immediately, others wait until near viewport
  return props.critical || inView.value;
});

const preconnectCriticalImage = (url) => {
  if (!url) return;
  try {
    const { origin } = new URL(url, window.location.href);
    if (document.querySelector(`link[rel="preconnect"][href="${origin}"]`))
      return;

    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    link.crossOrigin = "";
    document.head.appendChild(link);
  } catch {
    /* invalid url - ignore */
  }
};

onMounted(() => {
  // Measure element width and keep it in sync with layout changes
  if (componentRef.value && "ResizeObserver" in window) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        console.log("entry.contentRect.width", entry.contentRect.width);

        elWidth.value = parseInt(entry.contentRect.width) || 0;
      }
    });
    resizeObserver.observe(componentRef.value);
  }

  // Non-critical images only load when close to the viewport
  if (
    !props.critical &&
    componentRef.value &&
    "IntersectionObserver" in window
  ) {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          inView.value = true;
          intersectionObserver?.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    intersectionObserver.observe(componentRef.value);
  } else {
    inView.value = true;
  }

  if (props.critical) {
    preconnectCriticalImage(src.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  intersectionObserver?.disconnect();
});
</script>

<style lang="scss" scoped>
</style>
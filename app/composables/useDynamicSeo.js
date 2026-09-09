/**
 * Dynamic Open Graph + Twitter Cards helper.
 *
 * Accepts refs/getters (or plain strings) so the meta tags stay reactive
 * and are rendered on the server during SSR (crawlers read them directly
 * from the HTML).
 *
 * Usage (inside a component/page setup):
 *   useDynamicSeo({
 *     title: () => details.value?.title,
 *     description: () => details.value?.summary,
 *     image: () => details.value?.main_photo?.file_url,
 *     type: 'product',        // og:type
 *   });
 */
export const useDynamicSeo = (options = {}) => {
  const {
    title,
    description,
    image,
    type = 'website',
    twitterCard = 'summary_large_image',
  } = options;

  const config = useRuntimeConfig();
  const route = useRoute();

  // Absolute URL of the current page (site URL + current route path)
  const pageUrl = computed(() => {
    const base = config.public.siteUrl || '';
    if (!base) return undefined;
    try {
      return new URL(route.fullPath, base).toString();
    } catch {
      return base;
    }
  });

  // Make sure the OG image is an absolute URL (crawlers require it)
  const absoluteImage = computed(() => {
    const img = resolveRefValue(image);
    if (!img) return undefined;
    if (/^https?:\/\//i.test(img)) return img;
    try {
      return new URL(img, config.public.baseUrl || '').toString();
    } catch {
      return img;
    }
  });

  const resolvedTitle = computed(() => resolveRefValue(title));
  const resolvedDescription = computed(() => resolveRefValue(description));

  useSeoMeta({
    title: resolvedTitle,
    description: resolvedDescription,

    // --- Open Graph ---
    ogTitle: resolvedTitle,
    ogDescription: resolvedDescription,
    ogType: type,
    ogUrl: pageUrl,
    ogImage: absoluteImage,
    ogImageWidth: () => (absoluteImage.value ? 1200 : undefined),
    ogImageHeight: () => (absoluteImage.value ? 630 : undefined),

    // --- Twitter Cards ---
    twitterCard: twitterCard,
    twitterTitle: resolvedTitle,
    twitterDescription: resolvedDescription,
    twitterImage: absoluteImage,
  });
};

// Internal: resolve ref / getter / plain value safely
function resolveRefValue(value) {
  if (value == null) return undefined;
  if (isRef(value) || isReactive(value)) {
    const resolved = unref(value);
    return resolved == null ? undefined : String(resolved);
  }
  if (typeof value === 'function') {
    try {
      const resolved = value();
      return resolved == null ? undefined : String(resolved);
    } catch {
      return undefined;
    }
  }
  return String(value);
}


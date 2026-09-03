/**
 * Content CRUD module
 * Handles requests for product streaming content (DRM video sources)
 *
 * Endpoint: /merch/app-api/content
 * Builds the request config and executes it through useApi()
 * (useFetch inside component setup, SSR-friendly).
 *
 * Usage:
 *   const { data, loading, error } = ContentCrud.get(productAlias);
 */
export default class ContentCrud {
  static get(productAlias, params = {}) {
    const { request } = useApi();

    const { data, pending, error, ...rest } = request({
      endpoint: "/merch/app-api/content",
      method: "GET",
      params: {
        cache_key: Date.now(),
        product_alias: productAlias,
        drm: "Widevine",
        ...params,
      },
    });

    return { data, error, loading: pending, ...rest };
  }
}

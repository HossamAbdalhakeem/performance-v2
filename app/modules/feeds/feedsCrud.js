/**
 * Feeds CRUD module
 * Handles all requests related to feeds / experiences API
 *
 * Endpoint: /feeds/app-api/experiences
 * Builds the request config and executes it through useApi()
 * (useFetch inside component setup, SSR-friendly).
 *
 * Usage:
 *   const { data, loading, error } = await FeedsCrud.get(body, params);
 */
export default class FeedsCrud {
  /**
   * Get feeds experiences list
   * @param {Object} body - request body passed from the component
   *   e.g. { select, status, page, sort }
   * @param {Object} params - optional query params overrides
   *   e.g. { cache_key, sort, organization_id, fund_raiser_id }
   * @returns {Promise<{data: Ref, pending: Ref, loading: Ref, error: Ref, ...}>}
   */
  static async get(body = {}, params = {}) {
    const { request } = useApi();

    return await request({
      endpoint: "/feeds/app-api/experiences",
      method: "POST",
      params: {
        // cache_key: Date.now(),
        sort: "created_at:-1",
        ...params,
      },
      body,
    });
  }
}


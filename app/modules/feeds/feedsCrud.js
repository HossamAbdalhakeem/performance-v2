/**
 * Feeds CRUD module
 * Handles all requests related to feeds / experiences API
 *
 * Endpoint: /feeds/app-api/experiences
 * Returns the request configuration only - execution is done by useApi()
 * (useFetch inside the component setup, SSR-friendly).
 */
export default class FeedsCrud {
  /**
   * Get feeds experiences request config
   * @param {Object} body - request body passed from the component
   *   e.g. { select, status, page, sort }
   * @param {Object} params - optional query params overrides
   *   e.g. { cache_key, sort, organization_id, fund_raiser_id }
   * @returns {Object} request config for useApi()
   */
  static get(body = {}, params = {}) {
    return {
      endpoint: "/feeds/app-api/experiences",
      method: "POST",
      params: {
        // cache_key: Date.now(),
        sort: "created_at:-1",
        ...params,
      },
      body,
    };
  }
}


import { Request } from "../request/index.js";
/**
 * Feeds CRUD module
 * Handles all requests related to feeds / experiences API
 *
 * Endpoint: /feeds/app-api/experiences
 * Body is passed fully from the calling component (select, status, page, sort, ...)
 * while query params (cache_key, sort, organization_id, fund_raiser_id) are
 * built here with defaults and can be overridden via `params`.
 */
export default class FeedsCrud {
  /**
   * Get feeds experiences list
   * @param {Object} body - request body passed from the component
   *   e.g. { select, status, page, sort }
   * @param {Object} params - optional query params overrides
   *   e.g. { cache_key, sort, organization_id, fund_raiser_id }
   * @returns {Promise<{success: boolean, data: any, status: number}>}
   */
  static async get(body = {}, params = {}) {
    const request = await Request.init({
      type: "default",
      data: {
        endpoint: "/feeds/app-api/experiences",
        method: "POST",
        useFetch: true,
        params: {
          // cache_key: Date.now(),
          sort: "created_at:-1",
          ...params,
        },
        options: { body },
      },
    });
    console.log("calling my first request");

    return await request.send();
  }
}

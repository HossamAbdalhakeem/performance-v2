import { Request } from "../request/index.js";
import { useAuthStore } from "~/store/auth.js";

/**
 * Contributors CRUD module
 * Handles requests for fundraiser contributors (creators)
 *
 * Endpoint: /fundraisers/app-api/{fund_raiser_id}/contributors
 */
export default class ContributorsCrud {
  /**
   * Get contributors list
   * @param {Object} params - optional query params overrides
   *   e.g. { page, sort, contributor_type, cache_key }
   * @returns {Promise<{success: boolean, data: any, status: number}>}
   */
  static async get(params = {}) {
    const authStore = useAuthStore();
    const config = useRuntimeConfig();

    const fundRaiserId =
      authStore.user?.fund_raiser_id || config.public.fundraiserId;

    const request = await Request.init({
      type: "default",
      data: {
        endpoint: `/fundraisers/app-api/${fundRaiserId}/contributors`,
        method: "GET",
        useFetch: true,
        params: {
          // cache_key: Date.now(),
          page: 1,
          sort: "sort_no:1",
          contributor_type: "CONTRIBUTOR_TYPE_A",
          ...params,
        },
      },
    });
    return await request.send();
  }
}

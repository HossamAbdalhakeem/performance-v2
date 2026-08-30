import { useAuthStore } from "~/store/auth.js";

/**
 * Contributors CRUD module
 * Handles requests for fundraiser contributors (creators)
 *
 * Endpoint: /fundraisers/app-api/{fund_raiser_id}/contributors
 * Returns the request configuration only - execution is done by useApi()
 */
export default class ContributorsCrud {
  /**
   * Get contributors request config
   * @param {Object} params - optional query params overrides
   *   e.g. { page, sort, contributor_type, cache_key }
   * @returns {Object} request config for useApi()
   */
  static get(params = {}) {
    const authStore = useAuthStore();
    const config = useRuntimeConfig();

    const fundRaiserId =
      authStore.user?.fund_raiser_id || config.public.fundraiserId;

    return {
      endpoint: `/fundraisers/app-api/${fundRaiserId}/contributors`,
      method: "GET",
      params: {
        // cache_key: Date.now(),
        page: 1,
        sort: "sort_no:1",
        contributor_type: "CONTRIBUTOR_TYPE_A",
        ...params,
      },
    };
  }
}


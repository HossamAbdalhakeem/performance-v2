import { useAuthStore } from "~/store/auth.js";

/**
 * Contributors CRUD module
 * Handles requests for fundraiser contributors (creators)
 *
 * Endpoint: /fundraisers/app-api/{fund_raiser_id}/contributors
 * Builds the request config and executes it through useApi()
 *
 * Usage:
 *   const { data, loading, error } = await ContributorsCrud.get();
 */
export default class ContributorsCrud {
  static get(params = {}) {
    const authStore = useAuthStore();
    const config = useRuntimeConfig();
    const { request } = useApi();

    const fundRaiserId =
      authStore.user?.fund_raiser_id || config.public.fundraiserId;

    const { data, pending, error, ...rest } = request({
      endpoint: `/fundraisers/app-api/${fundRaiserId}/contributors`,
      method: "GET",
      params: {
        // cache_key: Date.now(),
        page: 1,
        sort: "sort_no:1",
        contributor_type: "CONTRIBUTOR_TYPE_A",
        ...params,
      },
    });

    return { data, error, loading: pending, ...rest };
  }
}


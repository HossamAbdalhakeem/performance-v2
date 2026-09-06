import { useAuthStore } from "~/store/auth.js";

/**
 * WebClients CRUD module
 * Handles requests for creator (contributor) web-clients
 *
 * Endpoint: /webclients/app-api/web-clients/{alias}
 * Builds the request config and executes it through useApi()
 * (useFetch inside component setup, SSR-friendly).
 *
 * Usage:
 *   const { data, loading, error } = WebClientsCrud.get(alias);
 */
export default class WebClientsCrud {
  static get(alias, params = {}) {
    const authStore = useAuthStore();
    const config = useRuntimeConfig();
    const { request } = useApi();

    // Explicitly send the ids so the request works for
    // anonymous visitors too (useApi only appends them when logged in)
    const organizationId =
      authStore.user?.organization_id || config.public.organizationId;
    const fundRaiserId =
      authStore.user?.fund_raiser_id || config.public.fundraiserId;

    const { data, pending, error, ...rest } = request({
      endpoint: `/webclients/app-api/web-clients/${alias}`,
      method: "GET",
      params: {
        // cache_key: Date.now(),
        organization_id: organizationId,
        fund_raiser_id: fundRaiserId,
        ...params,
      },
    });

    return { data, error, loading: pending, ...rest };
  }
}

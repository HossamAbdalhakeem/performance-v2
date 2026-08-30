import { useAuthStore } from "~/store/auth.js";

/**
 * useApi - Nuxt-aware request executor
 * Responsible for running requests with useFetch so they benefit from
 * SSR, payload transfer, hydration dedup, pending & error states.
 *
 * Usage:
 *   const { request } = useApi();
 *   const { data, pending, error } = await request(config);
 *
 * Where config comes from a CRUD module:
 *   { endpoint, method, params, body, headers }
 */
export const useApi = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const request = (requestConfig) => {
    const {
      endpoint,
      method = "GET",
      params = {},
      body,
      headers = {},
    } = requestConfig;

    // Auth context (same logic as DefaultRequest)
    const requestHeaders = { ...headers };
    if (authStore.token) {
      requestHeaders.Authorization = `Bearer ${authStore.token}`;
    }

    const requestParams = { ...params };
    if (authStore.user?.organization_id) {
      requestParams.organization_id = authStore.user.organization_id;
    }
    if (authStore.user?.fund_raiser_id) {
      requestParams.fund_raiser_id = authStore.user.fund_raiser_id;
    }

    // Stable key => client reuses the SSR payload instead of re-fetching
    const key = [
      "api",
      method,
      endpoint,
      JSON.stringify(requestParams || {}),
      JSON.stringify(body || {}),
    ].join("-");

    // NOT async on purpose: useFetch returns live refs immediately,
    // so `loading` stays reactive (true while the request is in flight).
    // Nuxt still waits for non-lazy useFetch during SSR before rendering.
    const result = useFetch(endpoint, {
      key,
      method,
      params: requestParams,
      headers: requestHeaders,
      body,
      baseURL: config.public.baseUrl,
    });
    return {
      ...result,
      loading: result.pending,
    };
  };

  return { request };
};

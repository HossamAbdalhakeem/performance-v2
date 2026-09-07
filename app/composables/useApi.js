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
      // When the same key is requested twice while a request is still in
      // flight (e.g. two pages sharing the same key during a navigation,
      // or a component re-mounting), Nuxt's default dedupe mode "cancel"
      // ABORTS the in-flight request and starts a new one - showing
      // "1 canceled + 1 success" in the network tab. "defer" shares the
      // single in-flight request between both callers instead.
      dedupe: "defer",
      // Reuse the previously fetched payload on client-side navigations
      // (e.g. navigating home -> products -> back). Without this, Nuxt
      // re-requests the same key on every navigation and, because its
      // dedupe mode is "cancel", the in-flight duplicate gets aborted -
      // showing "1 canceled + 1 success" in the network tab.
      // Pass `cache: false` in the request config to always refetch.
      getCachedData: (cachedKey, nuxtApp) => {
        if (requestConfig.cache === false) return undefined;
        return (
          nuxtApp.payload.data[cachedKey] ?? nuxtApp.static.data[cachedKey]
        );
      },
    });
    return {
      ...result,
      loading: result.pending,
    };
  };

  return { request };
};

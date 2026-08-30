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
  static get(body = {}, params = {}) {
    const { request } = useApi();

    const { data, pending, error, ...rest } = request({
      endpoint: "/feeds/app-api/experiences",
      method: "POST",
      params: {
        // cache_key: Date.now(),
        sort: "created_at:-1",
        ...params,
      },
      body,
    });

    return { data, error, loading: pending, ...rest };
  }
}


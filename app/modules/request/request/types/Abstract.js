import { handleRequestError } from "../../error/index.js";

/**
 * Abstract base request class
 * Provides core request functionality with useFetch for GET and $fetch for other methods
 */
export default class AbstractRequest {
  constructor({ data }) {
    this.data = data;
  }

  /**
   * Get base URL for requests
   */
  async getBaseUrl() {
    const config = useRuntimeConfig();
    return config.public.baseUrl || "/api";
  }

  /**
   * Get request headers
   */
  async getHeaders() {
    return this.data?.options?.headers || {};
  }

  /**
   * Get request parameters
   */
  async getParams() {
    return this.data?.params || {};
  }

  /**
   * Get request options
   */
  async getOptions() {
    return this.data?.options || {};
  }

  /**
   * Get endpoint
   */
  async getEndpoint() {
    return this.data?.endpoint;
  }

  /**
   * Get HTTP method
   */
  async getMethod() {
    return this.data?.method || "GET";
  }
  async getuseFetch() {
    return this.data?.useFetch || false;
  }

  /**
   * Send request - uses useFetch for GET, $fetch for others
   */
  async send() {
    try {
      const baseUrl = await this.getBaseUrl();
      const headers = await this.getHeaders();
      const params = await this.getParams();
      const endpoint = await this.getEndpoint();
      const method = await this.getMethod();
      const options = await this.getOptions();
      const IsUseFetch = await this.getuseFetch();
      console.log("IsUseFetchIsUseFetch", IsUseFetch);

      // Use useFetch for GET requests (reactive, SSR-safe)
      if (method === "GET" || IsUseFetch) {
        console.log("2-include use fetch");

        // Stable key => the client reuses the SSR payload
        // instead of re-fetching after hydration
        const key = `req-${method}-${endpoint}-${JSON.stringify(params)}-${JSON.stringify(options?.body || {})}`;

        const { data, error } = await useFetch(endpoint, {
          key,
          method,
          headers,
          params,
          baseURL: baseUrl,
          ...options,
        });

        if (error.value) {
          return handleRequestError(error.value);
        }

        return {
          success: true,
          data: data.value,
          status: 200,
        };
      } else {
        console.log("elese one");

        // Use $fetch for other methods
        const response = await $fetch(endpoint, {
          method,
          headers,
          params,
          baseURL: baseUrl,
          body: options?.body,
          ...options,
        });

        return {
          success: true,
          data: response,
          status: 200,
        };
      }
    } catch (error) {
      return handleRequestError(error);
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    this.data = {
      method: "GET",
      endpoint,
      params,
    };
    return this.send();
  }

  /**
   * POST request
   */
  async post(endpoint, body = {}, params = {}) {
    this.data = {
      method: "POST",
      endpoint,
      params,
      options: { body },
    };
    return this.send();
  }

  /**
   * PUT request
   */
  async put(endpoint, body = {}, params = {}) {
    this.data = {
      method: "PUT",
      endpoint,
      params,
      options: { body },
    };
    return this.send();
  }

  /**
   * PATCH request
   */
  async patch(endpoint, body = {}, params = {}) {
    this.data = {
      method: "PATCH",
      endpoint,
      params,
      options: { body },
    };
    return this.send();
  }

  /**
   * DELETE request
   */
  async delete(endpoint, params = {}) {
    this.data = {
      method: "DELETE",
      endpoint,
      params,
    };
    return this.send();
  }
}

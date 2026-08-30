import { useAuthStore } from '~/store/auth.js';
import AbstractRequest from './Abstract.js';

/**
 * Default request handler with authentication
 * Automatically includes auth token and organization context
 */
export class DefaultRequest extends AbstractRequest {
  constructor({ data } = {}) {
    super({ data });
  }

  /**
   * Get auth headers with Bearer token
   */
  async getHeaders() {
    const headers = await super.getHeaders();
    const authStore = useAuthStore();

    // Add Bearer token if available
    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`;
    }

    return headers;
  }

  /**
   * Get common params with auth context
   */
  async getParams() {
    const params = await super.getParams();
    const authStore = useAuthStore();

    // Add organization and fundraiser IDs
    if (authStore.user?.organization_id) {
      params.organization_id = authStore.user.organization_id;
    }
    if (authStore.user?.fund_raiser_id) {
      params.fund_raiser_id = authStore.user.fund_raiser_id;
    }

    return params;
  }

  /**
   * Authenticated GET request
   */
  async authGet(endpoint, params = {}) {
    this.data = {
      method: 'GET',
      endpoint,
      params,
    };
    return this.send();
  }

  /**
   * Authenticated POST request
   */
  async authPost(endpoint, body = {}, params = {}) {
    this.data = {
      method: 'POST',
      endpoint,
      params,
      options: { body },
    };
    return this.send();
  }

  /**
   * Authenticated PUT request
   */
  async authPut(endpoint, body = {}, params = {}) {
    this.data = {
      method: 'PUT',
      endpoint,
      params,
      options: { body },
    };
    return this.send();
  }

  /**
   * Authenticated PATCH request
   */
  async authPatch(endpoint, body = {}, params = {}) {
    this.data = {
      method: 'PATCH',
      endpoint,
      params,
      options: { body },
    };
    return this.send();
  }

  /**
   * Authenticated DELETE request
   */
  async authDelete(endpoint, params = {}) {
    this.data = {
      method: 'DELETE',
      endpoint,
      params,
    };
    return this.send();
  }
}

/**
 * Blank request handler - no authentication
 */
export class BlankRequest extends AbstractRequest {
  constructor({ data } = {}) {
    super({ data });
  }
}

/**
 * Type definitions for request modules
 */

/**
 * @typedef {Object} IRequestData
 * @property {string} method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @property {string} endpoint - API endpoint
 * @property {Object} [params] - Query parameters
 * @property {Object} [options] - Request options (body, headers, etc)
 */

/**
 * @typedef {Object} IRequestOptions
 * @property {Object|Array|FormData} [body] - Request body
 * @property {Object} [headers] - Custom headers
 * @property {AbortSignal} [signal] - Abort signal
 */

export const REQUEST_TYPES = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};


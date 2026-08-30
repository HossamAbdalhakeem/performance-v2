/**
 * Response wrapper - wraps API responses with context
 */
export default class Response {
  constructor(payload) {
    this.request = payload?.request;
    this.response = payload?.response;
    this.status = 'success';
  }

  /**
   * Create a response instance
   */
  static create(payload) {
    return new Response(payload);
  }

  /**
   * Get response data
   */
  getData() {
    return this.response;
  }

  /**
   * Get request context
   */
  getRequest() {
    return this.request;
  }

  /**
   * Check if response is successful
   */
  isSuccess() {
    return this.status === 'success';
  }
}

import Response from './types/index.js';

/**
 * Response factory - creates response instances
 */
export default class ResponseFactory {
  /**
   * Create a response instance
   */
  static create(payload) {
    return Response.create(payload);
  }
}

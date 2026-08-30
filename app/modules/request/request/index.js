import { DefaultRequest, BlankRequest } from './types/Default.js';
import AbstractRequest from './types/Abstract.js';

/**
 * Request factory - creates request instances based on type
 */
export default class Request {
  /**
   * Initialize and return a request instance
   * @param {Object} payload
   * @param {string} payload.type - Request type ('default' | 'blank')
   * @param {Object} payload.data - Request data
   */
  static async init(payload) {
    const { type = 'default', data = {} } = payload;

    switch (type) {
      case 'default':
        return new DefaultRequest({ data });

      case 'blank':
        return new BlankRequest({ data });

      default:
        return new DefaultRequest({ data });
    }
  }

  /**
   * Create a default request quickly
   */
  static createDefault(data) {
    return new DefaultRequest({ data });
  }

  /**
   * Create a blank request quickly
   */
  static createBlank(data) {
    return new BlankRequest({ data });
  }
}

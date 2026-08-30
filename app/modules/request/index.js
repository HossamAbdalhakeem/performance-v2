/**
 * Request module - Core API request handlers
 * Provides base classes and utilities for all API calls
 * 
 * Folder structure:
 * - error/RequestError.js - Error handling
 * - request/types/Abstract.js - Base request class
 * - request/types/Default.js - Default & Blank requests with auth
 * - request/index.js - Request factory
 * - response/types/index.js - Response wrapper
 * - response/index.js - Response factory
 * 
 * Page-specific handlers should be created in their own folders
 * and import DefaultRequest from this core
 */

// Error exports
export { default as RequestError } from './error/RequestError.js';
export { handleRequestError } from './error/index.js';

// Request exports
export { default as AbstractRequest } from './request/types/Abstract.js';
export { DefaultRequest, BlankRequest } from './request/types/Default.js';
export { default as Request } from './request/index.js';
export { REQUEST_TYPES } from './request/type.js';

// Response exports
export { default as Response } from './response/types/index.js';
export { default as ResponseFactory } from './response/index.js';

export { default as RequestError } from './RequestError.js';

export const handleRequestError = (error) => {
  console.error('[API Error]', error?.message || error);
  return {
    success: false,
    error: error?.message || 'Request failed',
    status: error?.statusCode || 500,
    data: error?.data,
  };
};

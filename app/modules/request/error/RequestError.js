/**
 * Request error handler
 */
export default class RequestError {
  constructor(err) {
    this.err = err;
    this.status = 'error';
  }

  showError() {
    console.error(this.err);
    return this.err;
  }

  getErrorMessage() {
    return this.err?.data?.message || this.err?.message || 'Request failed';
  }
}

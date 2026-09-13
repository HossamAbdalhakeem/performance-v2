/**
 * Contributors CRUD module
 * Handles requests for creator/contributor records in the dashboard backend.
 */
export default class ContributorsCrud {
  static get(params = {}) {
    const { request } = useApi();

    const { data, pending, error, ...rest } = request({
      endpoint: "/creators",
      method: "GET",
      params: {
        page: 1,
        ...params,
      },
    });

    return { data, error, loading: pending, ...rest };
  }
}


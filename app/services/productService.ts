import { apiFetch, firstRow } from "~/utils/apiFetch";

const productBody = (payload: Record<string, any>) => {
  const body: Record<string, any> = {
    name: payload.name,
    teacher_id: payload.teacher_id,
    wholesale_price: payload.wholesale_price,
    selling_price: payload.selling_price ?? payload.sale_price,
  };

  if (payload.type) body.type = payload.type;
  if (payload.study_year_id) body.study_year_id = payload.study_year_id;

  return body;
};

export const productService = {
  async getProducts(params: Record<string, any> = {}) {
    return await apiFetch("/products", { method: "GET", params });
  },

  async getProduct(id: string) {
    return firstRow(await apiFetch(`/products/${id}`, { method: "GET" }));
  },

  async createProduct(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/products", {
        method: "POST",
        body: productBody(payload),
      })
    );
  },

  async updateProduct(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/products/${id}`, {
        method: "PATCH",
        body: productBody(payload),
      })
    );
  },

  async updateProductStatus(id: string, is_active: boolean) {
    return firstRow(
      await apiFetch(`/products/${id}/status`, {
        method: "PATCH",
        body: { is_active },
      })
    );
  },
};

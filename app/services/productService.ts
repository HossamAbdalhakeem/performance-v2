const fallbackProducts = [
  {
    id: "chem",
    name: "كتاب الكيمياء",
    title: "كتاب الكيمياء",
    teacher: "أ. خالد",
    teacher_id: "khaled",
    stock: 44,
    available: true,
    wholesale_price: 200,
    sale_price: 350,
  },
  {
    id: "phys",
    name: "كتاب الفيزياء",
    title: "كتاب الفيزياء",
    teacher: "أ. عمر",
    teacher_id: "omar",
    stock: 5,
    available: false,
    wholesale_price: 180,
    sale_price: 320,
  },
  {
    id: "math",
    name: "كتاب الرياضيات",
    title: "كتاب الرياضيات",
    teacher: "أ. سارة",
    teacher_id: "sara",
    stock: 18,
    available: true,
    wholesale_price: 150,
    sale_price: 280,
  },
  {
    id: "book-code",
    name: "الكتاب + كود الترم الأول",
    title: "الكتاب + كود الترم الأول",
    teacher: "مستر محمد صلاح",
    teacher_id: "salah",
    stock: 30,
    available: true,
    wholesale_price: 250,
    sale_price: 400,
  },
];

import { apiFetch } from "~/utils/apiFetch";

export const productService = {
  async getProducts(params = {}) {
    try {
      return await apiFetch("/products", {
        method: "GET",
        params,
      });
    } catch {
      return fallbackProducts;
    }
  },

  async getProduct(id: string) {
    try {
      return await apiFetch(`/products`, {
        method: "GET",
        params: { id: `eq.${id}` },
      }).then((rows: any) => (Array.isArray(rows) ? rows[0] : rows) || null);
    } catch {
      return fallbackProducts.find((product) => product.id === id) || null;
    }
  },

  async createProduct(payload: Record<string, any>) {
    try {
      return await apiFetch("/products", {
        method: "POST",
        body: payload,
      });
    } catch {
      return {
        ...payload,
        id: `product-${Date.now()}`,
      };
    }
  },
};

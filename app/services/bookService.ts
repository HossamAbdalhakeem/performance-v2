const fallbackBooks = [
  { id: "chem", title: "كتاب الكيمياء", teacher: "أ. خالد", stock: 44, available: true },
  { id: "phys", title: "كتاب الفيزياء", teacher: "أ. عمر", stock: 5, available: false },
  { id: "math", title: "كتاب الرياضيات", teacher: "أ. سارة", stock: 18, available: true },
];

import { apiFetch } from "~/utils/apiFetch";

export const bookService = {
  async getBooks(params = {}) {
    try {
      return await apiFetch("/books", {
        method: "GET",
        params,
      });
    } catch {
      return fallbackBooks;
    }
  },

  async getBook(id: string) {
    try {
      const rows = await apiFetch<any>("/books", {
        method: "GET",
        params: { id: `eq.${id}` },
      });
      return Array.isArray(rows) ? rows[0] : rows;
    } catch {
      return fallbackBooks.find((book) => book.id === id) || null;
    }
  },
};

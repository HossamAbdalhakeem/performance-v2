const fallbackBooks = [
  { id: "chem", title: "كتاب الكيمياء", teacher: "أ. خالد", stock: 44, available: true },
  { id: "phys", title: "كتاب الفيزياء", teacher: "أ. عمر", stock: 5, available: false },
  { id: "math", title: "كتاب الرياضيات", teacher: "أ. سارة", stock: 18, available: true },
];

export const bookService = {
  async getBooks(params = {}) {
    try {
      return await $fetch('/books', {
        method: 'GET',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
        params,
      });
    } catch {
      return fallbackBooks;
    }
  },

  async getBook(id: string) {
    try {
      return await $fetch(`/books/${id}`, {
        method: 'GET',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
      });
    } catch {
      return fallbackBooks.find((book) => book.id === id) || null;
    }
  },
};

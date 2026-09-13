const fallbackBooks = [
  { id: 'book-x', title: 'كتاب X' },
  { id: 'book-y', title: 'كتاب Y' },
  { id: 'lecture-z', title: 'محاضرة Z' },
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

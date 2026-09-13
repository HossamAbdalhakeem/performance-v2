const fallbackBooks = [
  { id: 'book-x', title: 'كتاب X' },
  { id: 'book-y', title: 'كتاب Y' },
  { id: 'lecture-z', title: 'محاضرة Z' },
];

export const bookService = {
  async getBooks(params = {}) {
    try {
      const supabase = useSupabase();
      let query = supabase.from('books').select('*');

      if (params?.search) {
        query = query.ilike('title', `%${params.search}%`);
      }

      const { data, error } = await query.order('title', { ascending: true });
      return { data: data || [], error };
    } catch {
      return { data: fallbackBooks, error: null, params };
    }
  },

  async getBook(id: string) {
    try {
      const supabase = useSupabase();
      const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
      return { data, error };
    } catch {
      return { data: fallbackBooks.find((book) => book.id === id) || null, error: null };
    }
  },
};

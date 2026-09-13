const fallbackTeachers = [
  { id: 'ahmed', name: 'أحمد محمد' },
  { id: 'sara', name: 'سارة علي' },
  { id: 'mahmoud', name: 'محمود فهد' },
];

export const teacherService = {
  async getTeachers(params = {}) {
    try {
      const supabase = useSupabase();
      let query = supabase.from('teachers').select('*');

      if (params?.search) {
        query = query.ilike('name', `%${params.search}%`);
      }

      const { data, error } = await query.order('name', { ascending: true });
      return { data: data || [], error };
    } catch {
      return { data: fallbackTeachers, error: null, params };
    }
  },

  async getTeacher(id: string) {
    try {
      const supabase = useSupabase();
      const { data, error } = await supabase.from('teachers').select('*').eq('id', id).single();
      return { data, error };
    } catch {
      return { data: fallbackTeachers.find((teacher) => teacher.id === id) || null, error: null };
    }
  },
};

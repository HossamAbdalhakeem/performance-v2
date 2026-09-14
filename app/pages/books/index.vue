<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span class="text-lg font-bold">الكتب</span>
          <Button label="احجز كتاب 📖" severity="info" @click="navigateToReserve" />
        </div>
      </template>

      <template #content>
        <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <InputText v-model="search" placeholder="🔍 بحث عن كتاب أو أستاذ…" class="w-full max-w-md" />
          <span class="text-sm text-slate-300">إجمالي الكتب: {{ filteredBooks.length }}</span>
        </div>

        <div v-if="pending" class="grid gap-4">
          <Skeleton v-for="i in 4" :key="i" width="100%" height="4rem" border-radius="12px" />
        </div>

        <div v-else class="overflow-hidden rounded-2xl border border-white/10">
          <table class="w-full border-collapse text-center text-sm">
            <thead class="bg-slate-800 text-white">
              <tr>
                <th class="px-3 py-3">اسم الكتاب</th>
                <th class="px-3 py-3">الأستاذ</th>
                <th class="px-3 py-3">العدد</th>
                <th class="px-3 py-3">متاح</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="book in filteredBooks"
                :key="book.id"
                class="cursor-pointer border-t border-white/10"
                :class="selectedId === book.id ? 'bg-sky-500/15' : 'hover:bg-white/5'"
                @click="selectedId = book.id"
              >
                <td class="px-3 py-3">{{ book.title }}</td>
                <td class="px-3 py-3">{{ book.teacher }}</td>
                <td class="px-3 py-3">{{ book.stock }}</td>
                <td class="px-3 py-3">
                  <span
                    class="rounded-full px-2 py-1 text-xs font-semibold"
                    :class="book.available ? 'bg-green-700 text-white' : 'bg-red-800 text-white'"
                  >
                    {{ book.available ? "✔ متاح" : "✖ غير متاح" }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-4 text-sm text-slate-400">اختيار كتاب + الضغط على زر «احجز كتاب» يفتح صفحة الحجز</p>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Skeleton from "primevue/skeleton";
import { bookService } from "~/services/bookService";
import { productService } from "~/services/productService";

const pending = ref(true);
const search = ref("");
const selectedId = ref("");
const books = ref([]);

const filteredBooks = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return books.value;

  return books.value.filter((book) =>
    `${book.title} ${book.teacher}`.toLowerCase().includes(term)
  );
});

const navigateToReserve = async () => {
  await navigateTo({
    path: "/books/reserve",
    query: selectedId.value ? { book: selectedId.value } : {},
  });
};

const loadBooks = async () => {
  try {
    const [bookItems, products] = await Promise.all([
      bookService.getBooks(),
      productService.getProducts(),
    ]);

    const bookList = Array.isArray(bookItems) ? bookItems : bookItems?.data || [];
    const productList = Array.isArray(products) ? products : products?.data || [];
    const source = bookList.length ? bookList : productList;

    books.value = source.map((item) => ({
      id: item.id,
      title: item.title || item.name,
      teacher: item.teacher || item.teacher_name || "-",
      stock: item.stock ?? 0,
      available: item.available ?? Number(item.stock || 0) > 10,
    }));
  } catch (error) {
    console.error("Failed to load books", error);
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  loadBooks();
});

definePageMeta({ middleware: ["local-pages"] });
</script>

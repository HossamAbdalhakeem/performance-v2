<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">الكتب</span>
          <Button label="احجز كتاب 📖" severity="info" @click="reserveFirstBook" />
        </div>
      </template>

      <template #content>
        <div v-if="loadingOptions" class="grid gap-3">
          <Skeleton v-for="i in 4" :key="i" height="3rem" border-radius="12px" />
        </div>

        <div v-else class="overflow-hidden rounded-2xl border border-slate-200">
          <table class="w-full border-collapse text-right text-sm">
            <thead class="bg-slate-100 text-slate-700">
              <tr>
                <th class="px-3 py-3">اسم الكتاب</th>
                <th class="px-3 py-3">الأستاذ</th>
                <th class="px-3 py-3">العدد</th>
                <th class="px-3 py-3">متاح</th>
                <th class="px-3 py-3">إجراء</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in books" :key="book.id" class="border-t border-slate-200 bg-white">
                <td class="px-3 py-3">{{ book.title || book.name }}</td>
                <td class="px-3 py-3">{{ book.teacher || "-" }}</td>
                <td class="px-3 py-3">{{ book.stock ?? 0 }}</td>
                <td class="px-3 py-3">
                  <span :class="book.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="rounded-full px-2 py-1 text-xs font-semibold">
                    {{ book.available ? '✔ متاح' : '✖ غير متاح' }}
                  </span>
                </td>
                <td class="px-3 py-3">
                  <Button label="احجز كتاب" severity="info" size="small" :disabled="!book.available" @click="reserveBook(book)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import { bookService } from "~/services/bookService";
import { reservationService } from "~/services/reservationService";

const loadingOptions = ref(true);
const books = ref([]);

const normalizeBook = (book) => ({
  id: book.id,
  title: book.title || book.name || "كتاب",
  teacher: book.teacher || book.teacher_name || book.author || "-",
  stock: book.stock ?? book.available_count ?? 0,
  available: (book.available ?? book.is_available ?? true) !== false,
});

const loadBooks = async () => {
  try {
    const items = await bookService.getBooks();
    const list = Array.isArray(items) ? items : items?.data || [];
    books.value = list.map(normalizeBook);
  } catch (error) {
    console.error("Failed to load books", error);
    books.value = [
      { id: "book-1", title: "كتاب الكيمياء", teacher: "أ. خالد", stock: 44, available: true },
      { id: "book-2", title: "كتاب الفيزياء", teacher: "أ. عمر", stock: 5, available: false },
    ];
  } finally {
    loadingOptions.value = false;
  }
};

const reserveFirstBook = async () => {
  const firstAvailable = books.value.find((book) => book.available);
  if (!firstAvailable) return;
  await reserveBook(firstAvailable);
};

const reserveBook = async (book) => {
  if (!book.available) return;

  try {
    await reservationService.createReservation({
      book_id: book.id,
      student_name: "طالب جديد",
      phone: "0000000000",
      status: "pending",
    });
  } catch (error) {
    console.error("Failed to reserve book", error);
  }
};

onMounted(() => {
  loadBooks();
});

definePageMeta({ middleware: ["local-pages"] });
</script>

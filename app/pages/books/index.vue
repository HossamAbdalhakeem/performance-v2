<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span class="text-lg font-bold text-slate-900">الكتب</span>
          <Button label="احجز كتاب 📖" severity="info" @click="navigateToReserve" />
        </div>
      </template>

      <template #content>
        <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span class="text-sm text-slate-500">إجمالي الكتب: {{ books.length }}</span>
          <div class="w-full max-w-md">
            <InputText v-model="search" placeholder="🔍 بحث عن كتاب أو أستاذ…" class="w-full" />
          </div>
        </div>

        <div v-if="pending" class="grid gap-4">
          <Skeleton v-for="i in 4" :key="i" width="100%" height="4rem" border-radius="12px" />
        </div>

        <div v-else class="overflow-hidden rounded-2xl border border-slate-200">
          <table class="w-full border-collapse text-right text-sm">
            <thead class="bg-slate-100 text-slate-700">
              <tr>
                <th class="px-3 py-3">اسم الكتاب</th>
                <th class="px-3 py-3">الأستاذ</th>
                <th class="px-3 py-3">العدد</th>
                <th class="px-3 py-3">متاح</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in filteredBooks" :key="book.id" class="border-t border-slate-200 bg-white">
                <td class="px-3 py-3">{{ book.title }}</td>
                <td class="px-3 py-3">{{ book.teacher }}</td>
                <td class="px-3 py-3">{{ book.stock }}</td>
                <td class="px-3 py-3">
                  <span :class="book.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="rounded-full px-2 py-1 text-xs font-semibold">
                    {{ book.available ? '✔ متاح' : '✖ غير متاح' }}
                  </span>
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
import InputText from "primevue/inputtext";
import Skeleton from "primevue/skeleton";

const pending = ref(true);
const search = ref("");
const books = ref([
  { id: 1, title: "كتاب الكيمياء", teacher: "أ. خالد", stock: 44, available: true },
  { id: 2, title: "كتاب الفيزياء", teacher: "أ. عمر", stock: 5, available: false },
  { id: 3, title: "كتاب الرياضيات", teacher: "أ. سارة", stock: 18, available: true },
]);

const filteredBooks = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return books.value;

  return books.value.filter((book) =>
    `${book.title} ${book.teacher}`.toLowerCase().includes(term)
  );
});

const navigateToReserve = async () => {
  await navigateTo("/books/reserve");
};

onMounted(() => {
  setTimeout(() => {
    pending.value = false;
  }, 300);
});

definePageMeta({ middleware: ["local-pages"] });
</script>

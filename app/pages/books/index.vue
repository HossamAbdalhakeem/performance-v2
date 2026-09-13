<template>
  <div class="space-y-6">
    <div class="grid gap-4 md:grid-cols-3">
      <Card v-for="stat in stats" :key="stat.label">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">{{ stat.label }}</p>
              <p class="mt-2 text-2xl font-bold text-slate-900">{{ stat.value }}</p>
            </div>
            <span class="rounded-xl px-2 py-1 text-xs font-semibold" :class="stat.badgeClass">{{ stat.tag }}</span>
          </div>
        </template>
      </Card>
    </div>

    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">الكتب</span>
      </template>
      <template #content>
        <div v-if="pending" class="grid gap-4">
          <Skeleton v-for="i in 4" :key="i" width="100%" height="4rem" border-radius="12px" />
        </div>
        <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div v-for="book in books" :key="book.id" class="rounded-2xl border border-slate-200 bg-white p-4 text-right shadow-sm">
            <div class="flex items-center justify-between">
              <Tag :value="book.status" :severity="book.statusSeverity" />
              <span class="text-xs text-slate-500">{{ book.code }}</span>
            </div>
            <h3 class="mt-4 text-lg font-bold text-slate-900">{{ book.title }}</h3>
            <p class="mt-2 text-sm text-slate-600">المدرس: {{ book.teacher }}</p>
            <p class="mt-1 text-sm text-slate-600">السعر: {{ book.price }}</p>
            <p class="mt-1 text-sm text-slate-600">المتاحة: {{ book.available }}</p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Tag from "primevue/tag";
import Skeleton from "primevue/skeleton";

const pending = ref(true);
const books = ref([
  { id: 1, code: "B-2025-00125", title: "كتاب X", teacher: "أحمد محمد", price: "250 ج.م", available: 18, status: "متاح", statusSeverity: "success" },
  { id: 2, code: "B-2025-00126", title: "كتاب Y", teacher: "سارة علي", price: "300 ج.م", available: 5, status: "قليل", statusSeverity: "warning" },
  { id: 3, code: "B-2025-00127", title: "محاضرة Z", teacher: "محمود فهد", price: "200 ج.م", available: 44, status: "متاح", statusSeverity: "success" },
]);

const stats = computed(() => [
  { label: "إجمالي الكتب", value: "3", tag: "حاليًا", badgeClass: "bg-sky-100 text-sky-700" },
  { label: "الكتب المتاحة", value: "44", tag: "متاح", badgeClass: "bg-green-100 text-green-700" },
  { label: "قريبًا", value: "5", tag: "قليل", badgeClass: "bg-amber-100 text-amber-700" },
]);

onMounted(() => {
  setTimeout(() => {
    pending.value = false;
  }, 350);
});

definePageMeta({ middleware: ["local-pages"] });
</script>

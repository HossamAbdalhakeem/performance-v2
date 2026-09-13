<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">إلغاء حجز</span>
      </template>
      <template #content>
        <div class="space-y-5">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right">
            <p class="text-sm text-slate-500">بحث</p>
            <InputText v-model="search" placeholder="اسم الطالب أو رقم الحجز" class="mt-2 w-full max-w-md" />
          </div>

          <div v-if="pending" class="grid gap-4">
            <Skeleton width="100%" height="4rem" border-radius="12px" />
            <Skeleton width="100%" height="4rem" border-radius="12px" />
          </div>

          <div v-else class="space-y-3">
            <div v-for="item in filteredReservations" :key="item.id" class="rounded-2xl border border-slate-200 p-4">
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="text-right">
                  <p class="font-bold text-slate-900">حجز #{{ item.id }}</p>
                  <p class="mt-1 text-sm text-slate-600">طالب: {{ item.student }} | كتاب: {{ item.book }} | فرع: {{ item.branch }} | مبلغ: {{ item.amount }}</p>
                </div>
                <Button label="إلغاء الحجز" severity="danger" :loading="loadingId === item.id" @click="cancelReservation(item)" />
              </div>
            </div>
          </div>
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
const loadingId = ref(null);
const search = ref("");
const reservations = ref([
  { id: "1024", student: "أحمد محمد", book: "Y", branch: "Z", amount: "500" },
  { id: "1025", student: "سارة علي", book: "X", branch: "A", amount: "450" },
]);

const filteredReservations = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return reservations.value;
  return reservations.value.filter((item) => `${item.student} ${item.book} ${item.branch}`.toLowerCase().includes(term));
});

const cancelReservation = async (item) => {
  loadingId.value = item.id;
  await new Promise((resolve) => setTimeout(resolve, 700));
  reservations.value = reservations.value.filter((reservation) => reservation.id !== item.id);
  loadingId.value = null;
};

onMounted(() => {
  setTimeout(() => {
    pending.value = false;
  }, 350);
});

definePageMeta({ middleware: ["local-pages"] });
</script>

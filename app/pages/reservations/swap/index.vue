<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">تبديل حجز</span>
      </template>
      <template #content>
        <Form v-slot="{ errors: fieldErrors }" @submit="submitSwap" :initial-values="initialValues" class="grid gap-4 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="mb-2 block text-right text-sm font-medium text-slate-700">ابحث رقم البحث</label>
            <InputText v-model="reservationSearch" placeholder="ابحث رقم البحث" class="w-full" />
          </div>

          <div v-if="loadingOptions" class="md:col-span-2 grid gap-3">
            <Skeleton width="100%" height="3.5rem" border-radius="12px" />
            <Skeleton width="100%" height="3.5rem" border-radius="12px" />
          </div>

          <div v-else class="md:col-span-2 space-y-3">
            <div v-for="item in filteredReservations" :key="item.value" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-bold text-slate-900">حجز #{{ item.value }}</p>
                  <p class="mt-1 text-sm text-slate-600">{{ item.label }}</p>
                </div>
                <Button type="button" label="اختيار" severity="info" @click="form.reservation = item.value" />
              </div>
            </div>
          </div>

          <Field v-slot="{ field, errorMessage }" name="teacher" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">المدرس الجديد</label>
              <Select v-bind="field" v-model="form.teacher" :options="teacherOptions" optionLabel="label" optionValue="value" placeholder="اختر مدرس" :class="{ 'p-invalid': errorMessage || fieldErrors.teacher }" />
              <ErrorMessage name="teacher" class="text-xs text-red-500" />
            </div>
          </Field>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right md:col-span-2">
            <p class="text-sm text-slate-500">ملاحظات</p>
            <p class="mt-2 text-sm text-slate-700">عند التبديل: يتحدث الحجز بالمدرس الجديد + يتحدث مخزون الفرعين</p>
          </div>

          <div class="md:col-span-2 flex justify-end gap-3">
            <Button label="إلغاء" severity="secondary" text />
            <Button type="submit" label="تبديل الحجز" :loading="saving" severity="info" />
          </div>
        </Form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Skeleton from "primevue/skeleton";
import { Form, Field, ErrorMessage } from "vee-validate";
import { reservationService } from "~/services/reservationService";
import { teacherService } from "~/services/teacherService";

const saving = ref(false);
const loadingOptions = ref(true);
const reservationSearch = ref("");
const reservationOptions = ref([]);
const teacherOptions = ref([]);

const form = reactive({ reservation: "", teacher: "" });
const initialValues = { reservation: "", teacher: "" };

const filteredReservations = computed(() => {
  const term = reservationSearch.value.trim().toLowerCase();
  if (!term) return reservationOptions.value;

  return reservationOptions.value.filter((item) => {
    const text = `${item.label || ""} ${item.value || ""}`.toLowerCase();
    return text.includes(term);
  });
});

const selectedReservationLabel = computed(() => {
  const selected = reservationOptions.value.find((item) => item.value === form.reservation);
  return selected ? selected.label : "لم يتم اختيار حجز";
});

const loadOptions = async () => {
  try {
    const [reservations, teachers] = await Promise.all([
      reservationService.getReservations(),
      teacherService.getTeachers(),
    ]);

    const reservationList = Array.isArray(reservations) ? reservations : reservations?.data || [];
    const teacherList = Array.isArray(teachers) ? teachers : teachers?.data || [];

    reservationOptions.value = reservationList.map((item) => ({
      label: `حجز #${item.id} - ${item.student || item.student_name || "طالب"}`,
      value: item.id,
    }));

    teacherOptions.value = teacherList.map((item) => ({
      label: item.name || item.teacher_name || "مدرس",
      value: item.id,
    }));
  } catch (error) {
    console.error("Failed to load swap options", error);
  } finally {
    loadingOptions.value = false;
  }
};

const submitSwap = async () => {
  saving.value = true;

  try {
    await reservationService.exchangeReservation(form.reservation, {
      teacher_id: form.teacher,
    });

    Object.assign(form, initialValues);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadOptions();
});

definePageMeta({ middleware: ["local-pages"] });
</script>

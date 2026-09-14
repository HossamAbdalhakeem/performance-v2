<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold">تبديل حجز</span>
      </template>
      <template #content>
        <Form
          v-slot="{ errors: fieldErrors }"
          :initial-values="initialValues"
          class="space-y-5"
          @submit="submitSwap"
        >
          <div>
            <label class="mb-2 block text-right text-sm font-medium">بحث: رقم الحجز / رقم الموبايل</label>
            <InputText v-model="reservationSearch" placeholder="🔍 رقم الحجز / رقم الموبايل" class="w-full" />
          </div>

          <div v-if="loadingOptions" class="grid gap-3">
            <Skeleton width="100%" height="3.5rem" border-radius="12px" />
            <Skeleton width="100%" height="3.5rem" border-radius="12px" />
          </div>

          <div v-else class="space-y-3">
            <button
              v-for="item in filteredReservations"
              :key="item.value"
              type="button"
              class="w-full rounded-2xl border p-4 text-right transition"
              :class="form.reservation === item.value ? 'border-sky-400 bg-sky-500/10' : 'border-white/10 hover:bg-white/5'"
              @click="form.reservation = item.value"
            >
              <p class="font-bold text-white">حجز #{{ item.value }}</p>
              <p class="mt-1 text-sm text-slate-300">{{ item.details }}</p>
            </button>
          </div>

          <div v-if="selectedReservation" class="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-right text-sm text-slate-200">
            {{ selectedReservation.details }}
          </div>

          <Field v-slot="{ field, errorMessage }" name="teacher" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium">المدرس الجديد</label>
              <Select
                v-bind="field"
                v-model="form.teacher"
                :options="teacherOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="اختار مدرس تاني ▾"
                :class="{ 'p-invalid': errorMessage || fieldErrors.teacher }"
              />
              <ErrorMessage name="teacher" class="text-xs text-red-400" />
            </div>
          </Field>

          <div class="rounded-2xl border border-dashed border-white/20 bg-slate-950/60 p-4 text-right text-sm text-slate-300">
            عند التبديل: يتحدث الحجز بالمدرس الجديد + يتحدث مخزون الفرعين
          </div>

          <div class="flex justify-center">
            <Button type="submit" label="تأكيد تبديل الحجز" :loading="saving" severity="info" class="min-w-[180px]" />
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
    const text = `${item.label || ""} ${item.details || ""} ${item.phone || ""} ${item.value || ""}`.toLowerCase();
    return text.includes(term);
  });
});

const selectedReservation = computed(() =>
  reservationOptions.value.find((item) => item.value === form.reservation)
);

const loadOptions = async () => {
  try {
    const [reservations, teachers] = await Promise.all([
      reservationService.getReservations(),
      teacherService.getTeachers(),
    ]);

    const reservationList = Array.isArray(reservations) ? reservations : reservations?.data || [];
    const teacherList = Array.isArray(teachers) ? teachers : teachers?.data || [];

    reservationOptions.value = reservationList.map((item) => ({
      label: `حجز #${item.id}`,
      details: `حجز #${item.id} | طالب: ${item.student || item.student_name || "طالب"} | المدرس الحالي: ${item.teacher || "X"} | فرع: ${item.branch || item.branch_name || "Z"}`,
      phone: item.phone || "",
      value: item.id,
    }));

    teacherOptions.value = teacherList.map((item) => ({
      label: item.name || item.teacher_name || "مدرس",
      value: item.id,
    }));

    if (reservationOptions.value[0]) form.reservation = reservationOptions.value[0].value;
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
</script>

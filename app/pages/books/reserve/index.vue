<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">احجز كتاب</span>
      </template>
      <template #content>
        <Form v-slot="{ errors: fieldErrors }" @submit="submitReservation" :initial-values="initialValues" class="grid gap-4 md:grid-cols-2">
          <Field v-slot="{ field, errorMessage }" name="student" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">اسم الطالب</label>
              <InputText v-bind="field" v-model="form.student" :class="{ 'p-invalid': errorMessage || fieldErrors.student }" />
              <ErrorMessage name="student" class="text-xs text-red-500" />
            </div>
          </Field>

          <Field v-slot="{ field, errorMessage }" name="phone" rules="required|min:10">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">رقم الهاتف</label>
              <InputText v-bind="field" v-model="form.phone" :class="{ 'p-invalid': errorMessage || fieldErrors.phone }" />
              <ErrorMessage name="phone" class="text-xs text-red-500" />
            </div>
          </Field>

          <div v-if="loadingOptions" class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">الكتاب</label>
            <Skeleton height="2.9rem" border-radius="0.75rem" />
          </div>
          <Field v-else v-slot="{ field, errorMessage }" name="book" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">الكتاب</label>
              <Select v-bind="field" v-model="form.book" :options="bookOptions" optionLabel="label" optionValue="value" placeholder="اختر الكتاب" :class="{ 'p-invalid': errorMessage || fieldErrors.book }" />
              <ErrorMessage name="book" class="text-xs text-red-500" />
            </div>
          </Field>

          <div v-if="loadingOptions" class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">المدرس</label>
            <Skeleton height="2.9rem" border-radius="0.75rem" />
          </div>
          <Field v-else v-slot="{ field, errorMessage }" name="teacher" rules="required">
            <div class="flex flex-col gap-2 text-right">
              <label class="text-sm font-medium text-slate-700">المدرس</label>
              <Select v-bind="field" v-model="form.teacher" :options="teacherOptions" optionLabel="label" optionValue="value" placeholder="اختر المدرس" :class="{ 'p-invalid': errorMessage || fieldErrors.teacher }" />
              <ErrorMessage name="teacher" class="text-xs text-red-500" />
            </div>
          </Field>

          <div class="md:col-span-2 flex justify-end gap-3">
            <Button label="إلغاء" severity="secondary" text />
            <Button type="submit" label="تأكيد الحجز" :loading="saving" severity="info" />
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
import { bookService } from "~/services/bookService";
import { teacherService } from "~/services/teacherService";

const saving = ref(false);
const loadingOptions = ref(true);
const bookOptions = ref([
  { label: "كتاب X", value: "book-x" },
  { label: "كتاب Y", value: "book-y" },
  { label: "محاضرة Z", value: "lecture-z" },
]);
const teacherOptions = ref([
  { label: "أحمد محمد", value: "ahmed" },
  { label: "سارة علي", value: "sara" },
  { label: "محمود فهد", value: "mahmoud" },
]);

const form = reactive({ student: "", phone: "", book: "", teacher: "" });
const initialValues = { student: "", phone: "", book: "", teacher: "" };

const loadOptions = async () => {
  try {
    const [booksResponse, teachersResponse] = await Promise.all([
      bookService.getBooks(),
      teacherService.getTeachers(),
    ]);

    const books = Array.isArray(booksResponse) ? booksResponse : booksResponse?.data || [];
    const teachers = Array.isArray(teachersResponse) ? teachersResponse : teachersResponse?.data || [];

    bookOptions.value = books.map((book) => ({
      label: book.title || book.name || `كتاب ${book.id}`,
      value: book.id,
    }));

    teacherOptions.value = teachers.map((teacher) => ({
      label: teacher.name || teacher.full_name || `مدرس ${teacher.id}`,
      value: teacher.id,
    }));
  } catch (error) {
    console.error("Failed to load book and teacher options:", error);
  } finally {
    loadingOptions.value = false;
  }
};

const submitReservation = async () => {
  saving.value = true;

  try {
    const payload = {
      student_name: form.student,
      phone: form.phone,
      book_id: form.book,
      teacher_id: form.teacher,
      status: "pending",
    };

    await reservationService.createReservation(payload);
    Object.assign(form, initialValues);
  } catch (error) {
    console.error("Reservation failed:", error);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadOptions();
});

definePageMeta({ middleware: ["local-pages"] });
</script>

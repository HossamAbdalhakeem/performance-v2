<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">المدرسون</span>
          <Button
            label="إضافة مدرس جديد"
            icon="pi pi-plus"
            severity="info"
            @click="openCreate"
          />
        </div>
      </template>

      <template #content>
        <div class="mb-5 grid gap-3 md:grid-cols-2">
          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">بحث</label>
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="filters.searchInput"
                class="w-full"
                placeholder="ابحث باسم المدرس"
              />
            </IconField>
          </div>

          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-slate-700">الحالة</label>
            <Select
              v-model="filters.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="كل الحالات"
              showClear
              class="w-full"
              @update:modelValue="loadTeachers"
            />
          </div>
        </div>

        <TeachersTable
          :teachers="teachers"
          :loading="loading"
          @edit="openEdit"
        />
      </template>
    </Card>

    <Drawer
      v-model:visible="drawerVisible"
      :header="drawerTitle"
      position="right"
      class="!w-[400px] max-w-[400px]"
      :style="{ width: '400px' }"
      :blockScroll="true"
    >
      <TeacherForm
        v-if="drawerVisible"
        :teacher="editingTeacher"
        @saved="handleSaved"
        @cancel="closeDrawer"
      />
    </Drawer>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import Drawer from "primevue/drawer";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import TeachersTable from "~/components/dashboard/pages/teachers/TeachersTable.vue";
import TeacherForm from "~/components/dashboard/pages/teachers/TeacherForm.vue";
import { teacherService } from "~/services/teacherService";
import { useThrottledCallback } from "~/composables/useThrottledCallback";
import { useAppToast } from "~/composables/useAppToast";

const { showError, showSuccess } = useAppToast();
const loading = ref(true);
const drawerVisible = ref(false);
const editingTeacher = ref(null);
const teachers = ref([]);
const filters = reactive({
  searchInput: "",
  search: "",
  status: null,
});

const statusOptions = [
  { label: "نشط", value: "ACTIVE" },
  { label: "غير نشط", value: "INACTIVE" },
];

const drawerTitle = computed(() =>
  editingTeacher.value?.id ? "تعديل المدرس" : "إضافة مدرس جديد",
);

const normalizeTeacher = (teacher) => ({
  ...teacher,
  name: teacher.name || "-",
  statusLabel: teacher.status === "INACTIVE" ? "غير نشط" : "نشط",
  statusSeverity: teacher.status === "INACTIVE" ? "danger" : "success",
});

const buildQuery = () => {
  const params = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.status) params.status = filters.status;
  return params;
};

const loadTeachers = async () => {
  loading.value = true;
  try {
    const items = await teacherService.getTeachers(buildQuery());
    const list = Array.isArray(items) ? items : items?.data || [];
    teachers.value = list.map(normalizeTeacher);
  } catch (error) {
    showError(error?.message || "تعذر تحميل المدرسين.");
    teachers.value = [];
  } finally {
    loading.value = false;
  }
};

const { run: runThrottledSearch } = useThrottledCallback(() => {
  filters.search = filters.searchInput;
  loadTeachers();
}, 400);

watch(
  () => filters.searchInput,
  () => {
    runThrottledSearch();
  },
);

const openCreate = () => {
  editingTeacher.value = null;
  drawerVisible.value = true;
};

const openEdit = (teacher) => {
  editingTeacher.value = teacher;
  drawerVisible.value = true;
};

const closeDrawer = () => {
  drawerVisible.value = false;
  editingTeacher.value = null;
};

const handleSaved = async () => {
  closeDrawer();
  showSuccess("تم حفظ المدرس بنجاح.");
  await loadTeachers();
};

onMounted(() => {
  loadTeachers();
});
</script>

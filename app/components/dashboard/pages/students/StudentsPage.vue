<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">الطلاب</span>
          <Button label="إضافة طالب" icon="pi pi-plus" severity="info" @click="openCreate" />
        </div>
      </template>
      <template #content>
        <div class="mb-5">
          <div class="flex flex-col gap-2 text-right md:max-w-sm">
            <label class="text-sm font-medium text-slate-700">بحث</label>
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="filters.searchInput"
                class="w-full"
                placeholder="اسم / هاتف"
              />
            </IconField>
          </div>
        </div>

        <StudentsTable
          :students="students"
          :loading="loading"
          @edit="openEdit"
          @deactivate="handleDeactivate"
        />
      </template>
    </Card>

    <EntityDrawer v-model:visible="drawerVisible" :title="drawerTitle">
      <StudentForm
        v-if="drawerVisible"
        :student="editingItem"
        @saved="handleSaved"
        @cancel="drawerVisible = false"
      />
    </EntityDrawer>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import EntityDrawer from "~/components/dashboard/EntityDrawer.vue";
import StudentsTable from "~/components/dashboard/pages/students/StudentsTable.vue";
import StudentForm from "~/components/dashboard/pages/students/StudentForm.vue";
import { studentService } from "~/services/studentService";
import { useThrottledCallback } from "~/composables/useThrottledCallback";
import { useAppToast } from "~/composables/useAppToast";

const { showError, showSuccess } = useAppToast();
const loading = ref(true);
const drawerVisible = ref(false);
const editingItem = ref(null);
const students = ref([]);
const filters = reactive({
  searchInput: "",
  search: "",
});
const drawerTitle = computed(() =>
  editingItem.value?.id ? "تعديل الطالب" : "إضافة طالب",
);

const normalizeStudent = (student) => ({
  ...student,
  name: student.name || "-",
  phone: student.phone || "-",
  statusLabel: student.status === "INACTIVE" ? "غير نشط" : "نشط",
  statusSeverity: student.status === "INACTIVE" ? "danger" : "success",
});

const loadData = async () => {
  loading.value = true;
  try {
    const list = await studentService.searchStudents(filters.search);
    students.value = list.map(normalizeStudent);
  } catch (error) {
    showError(error?.message || "تعذر تحميل الطلاب.");
    students.value = [];
  } finally {
    loading.value = false;
  }
};

const { run: runThrottledSearch } = useThrottledCallback(() => {
  filters.search = filters.searchInput;
  loadData();
}, 400);

watch(
  () => filters.searchInput,
  () => {
    runThrottledSearch();
  },
);

const openCreate = () => {
  editingItem.value = null;
  drawerVisible.value = true;
};

const openEdit = (item) => {
  editingItem.value = item;
  drawerVisible.value = true;
};

const handleSaved = async () => {
  drawerVisible.value = false;
  editingItem.value = null;
  showSuccess("تم حفظ الطالب بنجاح.");
  await loadData();
};

const handleDeactivate = async (item) => {
  if (!item?.id) return;
  try {
    await studentService.deleteStudent(item.id);
    showSuccess("تم تعطيل الطالب بنجاح.");
    await loadData();
  } catch (error) {
    showError(error?.message || "تعذر تعطيل الطالب.");
  }
};

watch(drawerVisible, (visible) => {
  if (!visible) editingItem.value = null;
});

onMounted(loadData);
</script>

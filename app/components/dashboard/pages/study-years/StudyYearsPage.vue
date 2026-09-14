<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">السنوات الدراسية</span>
          <Button label="إضافة سنة دراسية" icon="pi pi-plus" severity="info" @click="openCreate" />
        </div>
      </template>
      <template #content>
        <p
          v-if="feedback.message"
          class="mb-4 rounded-xl px-3 py-2 text-sm"
          :class="feedback.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'"
        >
          {{ feedback.message }}
        </p>

        <div class="mb-5">
          <div class="flex flex-col gap-2 text-right md:max-w-sm">
            <label class="text-sm font-medium text-slate-700">بحث</label>
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText v-model="searchInput" class="w-full" placeholder="ابحث بالاسم" />
            </IconField>
          </div>
        </div>

        <StudyYearsTable :study-years="filteredYears" :loading="loading" @edit="openEdit" />
      </template>
    </Card>

    <EntityDrawer
      v-model:visible="drawerVisible"
      :title="drawerTitle"
    >
      <StudyYearForm
        v-if="drawerVisible"
        :study-year="editingItem"
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
import StudyYearsTable from "~/components/dashboard/pages/study-years/StudyYearsTable.vue";
import StudyYearForm from "~/components/dashboard/pages/study-years/StudyYearForm.vue";
import { studyYearService } from "~/services/studyYearService";

const loading = ref(true);
const drawerVisible = ref(false);
const editingItem = ref(null);
const studyYears = ref([]);
const searchInput = ref("");
const feedback = reactive({ type: "success", message: "" });

const drawerTitle = computed(() =>
  editingItem.value?.id ? "تعديل السنة الدراسية" : "إضافة سنة دراسية",
);

const filteredYears = computed(() => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return studyYears.value;
  return studyYears.value.filter((item) => String(item.name || "").toLowerCase().includes(q));
});

const loadData = async () => {
  loading.value = true;
  try {
    studyYears.value = await studyYearService.getStudyYears();
  } catch (error) {
    feedback.type = "error";
    feedback.message = error?.message || "تعذر تحميل السنوات الدراسية.";
    studyYears.value = [];
  } finally {
    loading.value = false;
  }
};

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
  feedback.type = "success";
  feedback.message = "تم حفظ السنة الدراسية بنجاح.";
  await loadData();
};

watch(drawerVisible, (visible) => {
  if (!visible) editingItem.value = null;
});

onMounted(loadData);
</script>

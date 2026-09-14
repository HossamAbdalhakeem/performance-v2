<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">إضافة للمخزن</span>
      </template>
      <template #content>
        <p
          v-if="feedback.message"
          class="mb-4 rounded-xl px-3 py-2 text-sm"
          :class="feedback.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'"
        >
          {{ feedback.message }}
        </p>
        <AddStockForm :show-cancel="false" @saved="handleSaved" />
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import AddStockForm from "~/components/dashboard/pages/inventory/AddStockForm.vue";

const feedback = reactive({ type: "success", message: "" });

const handleSaved = () => {
  feedback.type = "success";
  feedback.message = "تم تسليم المنتجات للفرع بنجاح.";
};
</script>

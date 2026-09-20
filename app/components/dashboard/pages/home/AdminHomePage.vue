<template>
  <div class="space-y-8 text-right" dir="rtl">
    <div>
      <h2 class="text-xl font-bold text-white">الرئيسية</h2>
      <p class="mt-1 text-sm text-slate-400">
        نظرة عامة على النظام مع اختصارات سريعة للصفحات والعمليات
      </p>
    </div>

    <AdminHomeKpiSection />
    <AdminHomeSalesTrendCard />
    <AdminHomeActionsSection />
    <AdminHomeInsightsSection />
    <AdminHomeRecentOperationsSection />
  </div>
</template>

<script setup>
defineOptions({ name: "AdminHomePage" });

const AdminHomeSalesTrendCard = defineAsyncComponent(() =>
  import("./AdminHomeSalesTrendCard/index.vue"),
);
const AdminHomeKpiSection = defineAsyncComponent(() =>
  import("./AdminHomeKpiSection/index.vue"),
);
const AdminHomeActionsSection = defineAsyncComponent(() =>
  import("./AdminHomeActionsSection/index.vue"),
);
const AdminHomeInsightsSection = defineAsyncComponent(() =>
  import("./AdminHomeInsightsSection/index.vue"),
);
const AdminHomeRecentOperationsSection = defineAsyncComponent(() =>
  import("./AdminHomeRecentOperationsSection/index.vue"),
);
</script>

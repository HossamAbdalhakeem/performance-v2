<template>
  <CreateProductPage />
</template>

<script setup>
import CreateProductPage from "~/components/dashboard/pages/products/create/CreateProductPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>

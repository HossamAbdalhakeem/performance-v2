<template>
  <BooksPage />
</template>

<script setup>
import BooksPage from "~/components/dashboard/pages/books/BooksPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>

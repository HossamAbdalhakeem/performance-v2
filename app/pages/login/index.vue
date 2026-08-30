<template>
  <login />
</template>
<script setup>
import login from "~/components/login/index.vue";

definePageMeta({
  middleware: ["local-auth-user"],
});
</script>
<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold">البيع المباشر</span>
      </template>
      <template #content>
        <BookingForm title="البيع المباشر" submit-label="تأكيد البيع" :submit-fn="submitSale" />
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import BookingForm from "~/components/dashboard/BookingForm.vue";
import { saleService } from "~/services/saleService";

const submitSale = async (payload) => {
  return await saleService.createSale({
    ...payload,
    type: "direct",
  });
};

definePageMeta({ middleware: ["local-pages"] });
</script>

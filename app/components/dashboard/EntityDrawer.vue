<template>
  <Drawer
    :visible="visible"
    position="right"
    :modal="true"
    :dismissable="true"
    :blockScroll="true"
    :baseZIndex="1400"
    :header="title"
    class="entity-form-drawer"
    :pt="{
      root: {
        class: 'entity-form-drawer-panel',
        style: { width: width, maxWidth: width },
      },
      header: { class: 'text-right' },
      content: { class: 'overflow-y-auto' },
      mask: { class: 'backdrop-blur-[1px]' },
    }"
    @update:visible="onVisibleChange"
  >
    <slot />
  </Drawer>
</template>

<script setup>
import Drawer from "primevue/drawer";

defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: "" },
  width: { type: String, default: "400px" },
});

const emit = defineEmits(["update:visible"]);

const onVisibleChange = (value) => {
  emit("update:visible", value);
};
</script>

<style scoped>
:deep(.entity-form-drawer-panel) {
  width: v-bind(width) !important;
  max-width: v-bind(width) !important;
}
</style>

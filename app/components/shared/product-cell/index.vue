<template>
  <div v-if="hasName" class="product-cell" dir="rtl">
    <div class="product-cell__title">
      <p class="product-cell__name">{{ product.name }}</p>
      <span
        v-if="hasPrice"
        class="product-cell__price tabular-nums"
        :style="priceStyle"
      >
        {{ product.price }}
      </span>
    </div>
    <p v-if="hasTeacher" class="product-cell__meta">
      {{ product.teacherName }}
    </p>
    <p v-if="hasStudyYear" class="product-cell__meta">
      {{ product.studyYearName }}
    </p>
  </div>
</template>

<script setup>
import {
  DEFAULT_METRIC_COLOR,
  STOCK_MOVEMENT_COLORS,
} from "~/utils/domainLabels";

defineOptions({ name: "ProductCell" });

/**
 * Parent tables must normalize first and pass:
 * { name, price?, teacherName?, studyYearName?, priceColor? }
 */
const props = defineProps({
  product: { type: Object, default: null },
});

const isSet = (value) => {
  if (value == null) return false;
  const text = String(value).trim();
  return text !== "" && text !== "-" && text !== "—";
};

const hasName = computed(() => isSet(props.product?.name));
const hasPrice = computed(() => isSet(props.product?.price));
const hasTeacher = computed(() => isSet(props.product?.teacherName));
const hasStudyYear = computed(() => isSet(props.product?.studyYearName));

const priceStyle = computed(() => {
  const c =
    props.product?.priceColor ||
    STOCK_MOVEMENT_COLORS.SALE ||
    DEFAULT_METRIC_COLOR;
  return {
    color: c,
    backgroundColor: `${c}22`,
    border: `1px solid ${c}55`,
  };
});
</script>

<style scoped>
.product-cell {
  display: flex;
  min-width: 8rem;
  max-width: 18rem;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}

.product-cell__title {
  display: flex;
  max-width: 100%;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.product-cell__name {
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  color: rgb(241 245 249);
}

.product-cell__price {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 9999px;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.25rem;
}

.product-cell__meta {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  line-height: 1.1;
  color: rgb(241 245 249);
  opacity: 0.7;
}
</style>

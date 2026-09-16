<template>
  <div class="space-y-6">
    <div class="grid gap-4 xl:grid-cols-3">
      <div
        class="rounded-2xl border border-white/10 bg-slate-900 p-5 xl:col-span-1"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="w-full space-y-3">
            <Skeleton width="8rem" height="0.9rem" border-radius="6px" />
            <Skeleton width="70%" height="2.25rem" border-radius="8px" />
          </div>
          <Skeleton width="2.75rem" height="2.75rem" border-radius="12px" />
        </div>
        <div class="mt-5 grid grid-cols-2 gap-3">
          <Skeleton width="100%" height="3.5rem" border-radius="12px" />
          <Skeleton width="100%" height="3.5rem" border-radius="12px" />
        </div>
      </div>

      <div
        class="rounded-2xl border border-white/10 bg-slate-900 p-5 xl:col-span-2"
      >
        <div class="mb-4 space-y-2">
          <Skeleton width="10rem" height="1.1rem" border-radius="6px" />
          <Skeleton width="16rem" height="0.75rem" border-radius="6px" />
        </div>
        <div class="grid gap-4 md:grid-cols-2 md:items-center">
          <div
            class="mx-auto flex h-52 w-full max-w-[240px] items-center justify-center"
          >
            <Skeleton shape="circle" size="11rem" />
          </div>
          <div class="space-y-2.5">
            <Skeleton
              v-for="i in 4"
              :key="`legend-skel-${i}`"
              width="100%"
              height="2.75rem"
              border-radius="12px"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-white/10 bg-slate-900 p-5">
      <div class="mb-4 space-y-2">
        <Skeleton width="8rem" height="1.1rem" border-radius="6px" />
        <Skeleton width="18rem" height="0.75rem" border-radius="6px" />
      </div>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton
          v-for="i in 4"
          :key="`inv-skel-${i}`"
          width="100%"
          height="5.5rem"
          border-radius="12px"
        />
      </div>
    </div>

    <div>
      <Skeleton class="mb-3" width="7rem" height="1rem" border-radius="6px" />
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="i in 8"
          :key="`card-skel-${i}`"
          class="rounded-2xl border border-white/10 bg-slate-900 p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="w-full space-y-3">
              <Skeleton width="55%" height="0.85rem" border-radius="6px" />
              <Skeleton width="40%" height="1.75rem" border-radius="8px" />
              <Skeleton width="70%" height="0.7rem" border-radius="6px" />
            </div>
            <Skeleton width="2.5rem" height="2.5rem" border-radius="12px" />
          </div>
          <Skeleton
            class="mt-3"
            width="5.5rem"
            height="0.7rem"
            border-radius="6px"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

defineOptions({ name: "DailyReportSkeleton" });
</script>

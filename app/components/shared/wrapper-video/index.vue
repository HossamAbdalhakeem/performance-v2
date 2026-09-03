<template>
  <div class="overflow-hidden rounded-lg border border-forest/40 bg-black">
    <Skeleton
      v-if="loading"
      width="100%"
      height="100%"
      border-radius="0px"
      class="aspect-video w-full"
    />
    <!-- Shaka player (client only) -->
    <div
      v-show="!loading && src"
      ref="uiContainer"
      class="relative aspect-video w-full bg-black"
    >
      <video
        ref="videoEl"
        playsinline
        crossorigin="anonymous"
        class="h-full w-full"
      />
    </div>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

const props = defineProps({
  src: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  // Optional DRM (Widevine / FairPlay / PlayReady via Shaka)
  licenseUrl: { type: String, default: "" },
  drmSystem: { type: String, default: "" }, // e.g. "com.widevine.alpha"
});

const videoEl = ref(null);
const uiContainer = ref(null);
const shakaPlayer = ref(null);
const shakaUi = ref(null);
const playbackError = ref(false);

const destroyPlayer = async () => {
  if (shakaUi.value) {
    try {
      shakaUi.value.destroy();
    } catch {
      // ignore destroy errors
    }
    shakaUi.value = null;
  }
  if (shakaPlayer.value) {
    try {
      await shakaPlayer.value.destroy();
    } catch {
      // ignore destroy errors
    }
    shakaPlayer.value = null;
  }
};

const initPlayer = async () => {
  await destroyPlayer();
  playbackError.value = false;

  if (!props.src || !videoEl.value || !uiContainer.value) return;

  try {
    const shaka = await import("shaka-player/dist/shaka-player.ui.js");
    // Install polyfills once (safe to call multiple times)
    shaka.polyfill.installAll();

    if (!shaka.Player.isBrowserSupported()) {
      // Fallback: plain <video src> still plays progressive formats
      console.log("if shaka not support");

      videoEl.value.controls = true;
      videoEl.value.src = props.src;
      return;
    }

    const player = new shaka.Player();
    await player.attach(videoEl.value);
    shakaPlayer.value = player;

    // DRM configuration (license server per system)
    if (props.licenseUrl && props.drmSystem) {
      player.configure({
        drm: {
          servers: { [props.drmSystem]: props.licenseUrl },
        },
      });
    }

    // Shaka UI control bar (play, time, mute, volume, fullscreen, settings)
    const ui = new shaka.ui.Overlay(player, uiContainer.value, videoEl.value);
    ui.configure({
      controlPanelElements: [
        "play_pause",
        "time_and_duration",
        "spacer",
        "mute",
        "fullscreen",
        "volume",
        "quality",
        "overflow_menu",
      ],
    });
    shakaUi.value = ui;

    await player.load(props.src);
  } catch (err) {
    console.error("Shaka player failed to load:", err);
    playbackError.value = true;
    // Fallback to native playback
    if (videoEl.value) {
      videoEl.value.controls = true;
      videoEl.value.src = props.src;
    }
  }
};

// (Re)load whenever the source changes
watch(
  () => props.src,
  (src) => {
    if (src) initPlayer();
    else destroyPlayer();
  },
  { immediate: false }
);

onMounted(() => {
  if (props.src) initPlayer();
});

onBeforeUnmount(() => {
  destroyPlayer();
});

defineExpose({ playbackError });
</script>

<style lang="scss" >
@import "shaka-player/dist/controls.css"; /* Shaka player CSS import */
</style>
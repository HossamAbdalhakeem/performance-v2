<template>
  <div class="overflow-hidden rounded-lg border border-forest/40 bg-black">
    <Skeleton
      v-if="loading"
      width="100%"
      height="100%"
      border-radius="0px"
      class="aspect-video w-full"
      :class="[aspectRatio]"
    />
    <!-- Shaka player (client only) -->
    <div
      v-show="!loading && src"
      ref="uiContainer"
      class="relative w-full bg-black"
      :class="[aspectRatio]"
    >
      <video
        ref="videoEl"
        playsinline
        crossorigin="anonymous"
        class="h-full w-full"
        :class="aspectRatio === 'aspect-video' ? '' : 'object-cover'"
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
  aspectRatio: { type: String, default: "aspect-video" },
  // Hide all player controls (autoplay loop-style preview)
  hideControls: { type: Boolean, default: false },
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

      videoEl.value.controls = !props.hideControls;
      videoEl.value.src = props.src;
      if (props.hideControls) {
        videoEl.value.loop = true;
        videoEl.value.muted = true;
        videoEl.value.play().catch(() => {});
      }
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

    if (props.hideControls) {
      // Bare player with NO Shaka UI overlay at all - this guarantees
      // no seek bar / controls are rendered (the seek bar lives outside
      // controlPanelElements). Auto-playing looped muted preview.
      videoEl.value.loop = true;
      videoEl.value.muted = true;
      shakaPlayer.value = player;

      await player.load(props.src);
      try {
        await videoEl.value.play();
      } catch {
        // autoplay may be rejected by the browser - ignore
      }
      return;
    }

    // Shaka UI control bar (play, time, mute, volume, fullscreen, settings)
    const ui = new shaka.ui.Overlay(player, uiContainer.value, videoEl.value);
    ui.configure({
      controlPanelElements: [
        "play_pause",
        "time_and_duration",
        "spacer",
        "mute",
        "volume",
        "fullscreen",
        "overflow_menu",
      ],
      // "quality" is an overflow-menu element, NOT a control-panel element
      overflowMenuButtons: ["quality", "playback_rate", "picture_in_picture"],
    });
    shakaUi.value = ui;

    await player.load(props.src);

    // DEBUG: verify how many quality variants the source exposes.
    // The "quality" menu button is hidden by Shaka when this count <= 1.
    try {
      console.log(
        "[wrapper-video] video tracks:",
        player.getVideoTracks?.().length ?? "n/a",
        "| variant tracks:",
        player.getVariantTracks?.().length ?? "n/a",
        player.getVideoTracks?.()
      );
    } catch {
      // ignore debug errors
    }
  } catch (err) {
    console.error("Shaka player failed to load:", err);
    playbackError.value = true;
    // Fallback to native playback
    if (videoEl.value) {
      videoEl.value.controls = !props.hideControls;
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
<script setup lang="ts">
import Dmr from './components/dmr.vue'
</script>

<template>
  <Dmr v-slot="{ x, y, width, height, cursor, register }">
    <div
      :ref="register"
      :style="{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        background: 'red',
        cursor,
        userSelect: 'none', // Prevent text selection during drag/resize
      }"
    >
      <p>Resizable Content</p>
    </div>
  </Dmr>
</template>

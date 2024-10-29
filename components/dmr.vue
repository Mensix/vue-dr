<script setup lang="ts">
const dnr = useTemplateRef('dnr')
const { x, y, width, height, cursor } = useResizable(dnr)
</script>

<template>
  <div :style="{ position: 'relative' }">
    <div
      ref="dnr"
      :style="{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        background: 'red',
        cursor
      }"
    >
      <slot />
    </div>
  </div>
</template>

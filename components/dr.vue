<script setup lang="ts">
// Create a ref for the resizable element
const dmr = useTemplateRef('dmr')

// Destructure reactive properties from the useResizable composable
const { x, y, width, height, cursor } = useResizable(dmr)
</script>

<template>
  <!--
    Render the resizable div with dynamic styles.
    Content passed to <Dmr> will be placed inside this div.
  -->
  <div ref="dmr" :style="{ position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${width}px`, height: `${height}px`, cursor }">
    <slot :x :y :width :height />
  </div>
</template>

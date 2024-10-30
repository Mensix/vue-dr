<template>
  <Dr v-slot="{ x, y, width, height }" :style="{ background: 'red' }">
    <p>Resizable Content</p>
    <p>Position: {{ x }}, {{ y }}</p>
    <p>Size: {{ width }} x {{ height }}</p>
  </Dr>
</template>

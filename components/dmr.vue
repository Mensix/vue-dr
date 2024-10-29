<script setup lang="ts">
// Create a ref for the resizable element
const dmr = ref<HTMLDivElement | null>(null)

// Destructure reactive properties from the useResizable composable
const { x, y, width, height, cursor } = useResizable(dmr)

/**
 * Function to register the DOM element for resizing.
 * Adjusted to accept a broader type and perform type assertion.
 *
 * @param el - The Element to be made resizable.
 */
function register(el: Element | ComponentPublicInstance | null) {
  dmr.value = el as HTMLDivElement | null
}
</script>

<template>
  <!--
    Render the default slot and pass resizable properties and the register function.
    This allows the parent component to attach them to the desired element.
  -->
  <slot
    :x="x"
    :y="y"
    :width="width"
    :height="height"
    :cursor="cursor"
    :register="register"
  />
</template>

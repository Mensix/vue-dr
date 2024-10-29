<script setup lang="ts">
const x = ref(0)
const y = ref(0)
const cursor = ref('default')

const dnr = useTemplateRef('dnr')
const edgeThreshold = 16

const width = ref(100)
const height = ref(100)

const initialX = ref(0)
const initialY = ref(0)

onMounted(() => {
  if (dnr.value) {
    const rect = dnr.value.getBoundingClientRect()
    width.value = rect.width
    height.value = rect.height
  }
})

function getPointerInfo(e: PointerEvent) {
  if (dnr.value) {
    const { clientX, clientY } = e
    const { left, top, width, height } = dnr.value.getBoundingClientRect()
    const offsetX = clientX - left
    const offsetY = clientY - top

    const distanceToLeft = offsetX
    const distanceToRight = width - offsetX
    const distanceToTop = offsetY
    const distanceToBottom = height - offsetY

    const nearLeft = distanceToLeft <= edgeThreshold
    const nearRight = distanceToRight <= edgeThreshold
    const nearTop = distanceToTop <= edgeThreshold
    const nearBottom = distanceToBottom <= edgeThreshold

    return {
      offsetX,
      offsetY,
      nearLeft,
      nearRight,
      nearTop,
      nearBottom,
    }
  }
  return null
}

function getCursor(nearLeft: boolean, nearRight: boolean, nearTop: boolean, nearBottom: boolean) {
  let cursor = 'default'

  if (nearTop && nearLeft) {
    cursor = 'nw-resize'
  }
  else if (nearTop && nearRight) {
    cursor = 'ne-resize'
  }
  else if (nearBottom && nearLeft) {
    cursor = 'sw-resize'
  }
  else if (nearBottom && nearRight) {
    cursor = 'se-resize'
  }
  else if (nearTop) {
    cursor = 'n-resize'
  }
  else if (nearBottom) {
    cursor = 's-resize'
  }
  else if (nearLeft) {
    cursor = 'w-resize'
  }
  else if (nearRight) {
    cursor = 'e-resize'
  }
  else {
    cursor = 'grab'
  }

  return cursor
}

// Add a generic resize handler
function createResizeHandler(
  directions: { horizontal?: 'left' | 'right', vertical?: 'top' | 'bottom' },
  startX: number,
  startY: number,
  startWidth: number,
  startHeight: number,
) {
  return (e: PointerEvent) => {
    if (directions.horizontal === 'left') {
      const deltaX = e.clientX - startX
      const newWidth = startWidth - deltaX
      width.value = newWidth
      x.value = initialX.value + deltaX
    }
    else if (directions.horizontal === 'right') {
      const deltaX = e.clientX - startX
      width.value = startWidth + deltaX
    }

    if (directions.vertical === 'top') {
      const deltaY = e.clientY - startY
      const newHeight = startHeight - deltaY
      height.value = newHeight
      y.value = initialY.value + deltaY
    }
    else if (directions.vertical === 'bottom') {
      const deltaY = e.clientY - startY
      height.value = startHeight + deltaY
    }
  }
}

useEventListener(dnr, 'pointerdown', (e: PointerEvent) => {
  const info = getPointerInfo(e)
  if (info) {
    const { nearLeft, nearRight, nearTop, nearBottom } = info

    const directions: { horizontal?: 'left' | 'right', vertical?: 'top' | 'bottom' } = {}
    if (nearLeft)
      directions.horizontal = 'left'
    if (nearRight)
      directions.horizontal = 'right'
    if (nearTop)
      directions.vertical = 'top'
    if (nearBottom)
      directions.vertical = 'bottom'

    if (directions.horizontal || directions.vertical) {
      initialX.value = x.value
      initialY.value = y.value

      const resizeHandler = createResizeHandler(directions, e.clientX, e.clientY, width.value, height.value)
      const disposePointerMove = useEventListener(window, 'pointermove', resizeHandler)
      useEventListener(window, 'pointerup', () => disposePointerMove(), { once: true })
    }
    else {
      const move = (e: PointerEvent) => {
        x.value = e.clientX - info.offsetX
        y.value = e.clientY - info.offsetY
      }

      const disposePointerMove = useEventListener(window, 'pointermove', move)
      useEventListener(window, 'pointerup', () => disposePointerMove(), { once: true })
    }
  }
})

useEventListener(dnr, 'pointermove', (e) => {
  const info = getPointerInfo(e)
  if (info) {
    const { nearLeft, nearRight, nearTop, nearBottom } = info
    cursor.value = getCursor(nearLeft, nearRight, nearTop, nearBottom)
  }
})
</script>

<template>
  <div :style="{ position: 'relative' }">
    <div ref="dnr" :style="{ position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${width}px`, height: `${height}px`, background: 'red', cursor }">
      <slot />
    </div>
  </div>
</template>

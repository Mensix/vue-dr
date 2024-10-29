import { useEventListener } from '@vueuse/core'
import { onMounted, ref } from 'vue'

/**
 * Composable to handle resizable logic for a DOM element.
 *
 * @param dnr - Reference to the DOM element to be resized.
 * @param edgeThreshold - Distance in pixels to detect edge proximity for resizing.
 * @returns An object containing reactive properties for position, size, and cursor.
 */
export function useResizable(dnr: Ref<HTMLDivElement | null>, edgeThreshold = 16) {
  const x = ref(0)
  const y = ref(0)
  const cursor = ref('default')
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

  /**
   * Retrieves pointer information relative to the target element.
   *
   * @param e - The pointer event.
   * @returns An object containing offset positions and proximity flags.
   */
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

  /**
   * Determines the cursor style based on pointer proximity to edges.
   *
   * @param nearLeft - Is pointer near the left edge.
   * @param nearRight - Is pointer near the right edge.
   * @param nearTop - Is pointer near the top edge.
   * @param nearBottom - Is pointer near the bottom edge.
   * @returns The appropriate cursor style.
   */
  function getCursor(
    nearLeft: boolean,
    nearRight: boolean,
    nearTop: boolean,
    nearBottom: boolean,
  ) {
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

  /**
   * Creates a handler for resizing based on the specified directions.
   *
   * @param directions - Directions indicating which edges are being resized.
   * @param directions.horizontal - Horizontal direction of resizing.
   * @param directions.vertical - Vertical direction of resizing.
   * @param startX - Initial X position of the pointer.
   * @param startY - Initial Y position of the pointer.
   * @param startWidth - Initial width of the element.
   * @param startHeight - Initial height of the element.
   * @returns A function handling the resize logic on pointer movement.
   */
  function createResizeHandler(
    directions: { horizontal?: 'left' | 'right', vertical?: 'top' | 'bottom' },
    startX: number,
    startY: number,
    startWidth: number,
    startHeight: number,
  ) {
    return (e: PointerEvent) => {
      // Handle horizontal resizing
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

      // Handle vertical resizing
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

  // Event listener for pointer down to initiate resize or move
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
        // Initialize for resizing
        initialX.value = x.value
        initialY.value = y.value

        const resizeHandler = createResizeHandler(
          directions,
          e.clientX,
          e.clientY,
          width.value,
          height.value,
        )
        const disposePointerMove = useEventListener(window, 'pointermove', resizeHandler)
        useEventListener(window, 'pointerup', () => disposePointerMove(), { once: true })
      }
      else {
        // Initialize for moving
        const move = (e: PointerEvent) => {
          x.value = e.clientX - info.offsetX
          y.value = e.clientY - info.offsetY
        }

        const disposePointerMove = useEventListener(window, 'pointermove', move)
        useEventListener(window, 'pointerup', () => disposePointerMove(), { once: true })
      }
    }
  })

  // Event listener to update cursor style based on pointer position
  useEventListener(dnr, 'pointermove', (e) => {
    const info = getPointerInfo(e)
    if (info) {
      const { nearLeft, nearRight, nearTop, nearBottom } = info
      cursor.value = getCursor(nearLeft, nearRight, nearTop, nearBottom)
    }
  })

  return { x, y, width, height, cursor }
}

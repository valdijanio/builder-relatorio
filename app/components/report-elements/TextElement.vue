<template>
  <div
    class="flex items-center px-2"
    :style="textStyle"
  >
    {{ element.properties.content }}
  </div>
</template>

<script setup lang="ts">
import type { TextElement } from '~/types/report'

const props = defineProps<{
  element: TextElement
}>()

const textStyle = computed(() => ({
  fontFamily: props.element.properties.fontFamily,
  fontSize: `${props.element.properties.fontSize}px`,
  fontWeight: props.element.properties.fontWeight,
  fontStyle: props.element.properties.fontStyle,
  textAlign: props.element.properties.textAlign,
  color: props.element.properties.color,
  lineHeight: props.element.properties.lineHeight,
}))
</script>

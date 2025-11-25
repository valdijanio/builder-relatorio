<template>
  <div
    class="flex items-center px-2"
    :style="numberStyle"
  >
    {{ formattedValue }}
  </div>
</template>

<script setup lang="ts">
import type { NumberElement } from '~/types/report'

const props = defineProps<{
  element: NumberElement
}>()

const numberStyle = computed(() => ({
  fontFamily: props.element.properties.fontFamily,
  fontSize: `${props.element.properties.fontSize}px`,
  fontWeight: props.element.properties.fontWeight,
  color: props.element.properties.color,
  textAlign: props.element.properties.textAlign,
  justifyContent: props.element.properties.textAlign === 'right' ? 'flex-end' :
                   props.element.properties.textAlign === 'center' ? 'center' : 'flex-start',
}))

const formattedValue = computed(() => {
  const value = props.element.properties.value ?? 0
  const { prefix, suffix, decimalPlaces, thousandsSeparator, decimalSeparator } = props.element.properties

  let formatted = value.toFixed(decimalPlaces)

  // Apply thousands separator
  const parts = formatted.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
  formatted = parts.join(decimalSeparator)

  return `${prefix || ''}${formatted}${suffix || ''}`
})
</script>

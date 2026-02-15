<template>
  <span class="animated-number">{{ display }}</span>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({ value: { type: Number, default: 0 } })

const display = ref('...')
let current = 0
let animFrame = null

function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return Math.round(n).toLocaleString('id-ID')
}

function animateTo(target) {
  if (animFrame) cancelAnimationFrame(animFrame)
  const start = current
  const diff = target - start
  if (diff === 0) return
  const duration = 600 // ms
  const startTime = performance.now()

  function step(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    // easeOutCubic
    const ease = 1 - Math.pow(1 - progress, 3)
    current = start + diff * ease
    display.value = fmt(current)
    if (progress < 1) {
      animFrame = requestAnimationFrame(step)
    } else {
      current = target
      display.value = fmt(target)
    }
  }
  animFrame = requestAnimationFrame(step)
}

watch(() => props.value, (newVal) => {
  if (newVal != null && newVal > 0) animateTo(newVal)
}, { immediate: false })

onMounted(() => {
  if (props.value > 0) {
    current = props.value
    display.value = fmt(props.value)
  }
})
</script>

<style scoped>
.animated-number {
  font-variant-numeric: tabular-nums;
}
</style>

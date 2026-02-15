<template>
  <div class="lb-card" :class="{ 'lb-card--gold': isFirst }">
    <div class="lb-card__rank-col">
      <div class="lb-card__rank" :class="'lb-card__rank--' + rank">{{ rank }}</div>
      <div class="lb-card__rank-change" v-if="rankChange">
        <svg v-if="rankChange === 'up'" width="12" height="12" viewBox="0 0 24 24" fill="#22c55e" stroke="none"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="#ef4444" stroke="none"><path d="M12 20l8-8h-5V4H9v8H4z"/></svg>
      </div>
    </div>
    <img v-if="!game.error" :src="game.thumbnail" :alt="game.name" class="lb-card__img">
    <div class="lb-card__info">
      <h4 class="lb-card__name">{{ game.error ? 'Error loading game' : game.name }}</h4>
      <div class="lb-card__stats" v-if="!game.error">
        <span class="lb-card__stat">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          {{ fmt(game.visits) }} visits
        </span>
        <span class="lb-card__stat lb-card__stat--online">
          <span class="pulse-dot pulse-dot--sm"></span>
          <AnimatedNumber :value="game.playing" /> online
        </span>
      </div>
      <div class="lb-card__bar" v-if="!game.error && maxVisits > 0">
        <div class="lb-card__bar-fill" :style="{ width: (game.visits / maxVisits * 100) + '%' }"></div>
      </div>
    </div>
    <div class="lb-card__live" v-if="game.playing > 1000">
      <span class="pulse-dot"></span> LIVE
    </div>
  </div>
</template>

<script setup>
import AnimatedNumber from './AnimatedNumber.vue'

defineProps({ game: Object, rank: Number, maxVisits: Number, rankChange: String, isFirst: Boolean })

function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n?.toLocaleString('id-ID') || '0'
}
</script>

<template>
  <div class="top-card" :class="{ 'top-card--first': index === 0 }">
    <div class="top-card__rank">
      <span v-if="index === 0">🥇</span>
      <span v-else-if="index === 1">🥈</span>
      <span v-else-if="index === 2">🥉</span>
      <span v-else>#{{ index + 1 }}</span>
    </div>
    <div class="top-card__live" v-if="game.playing >= 1000">
      <span class="pulse-dot"></span> LIVE
    </div>
    <img :src="game.thumbnail" :alt="game.name" class="top-card__img">
    <div class="top-card__body">
      <h4 class="top-card__name">{{ game.name }}</h4>
      <p class="top-card__stat">
        <svg v-if="type === 'visits'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        {{ type === 'visits' ? fmt(game.visits) + ' visits' : fmt(game.playing) + ' playing' }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({ game: Object, index: Number, type: String })

function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n?.toLocaleString('id-ID') || '0'
}
</script>

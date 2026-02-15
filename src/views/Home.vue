<template>
  <div class="home">
    <header class="hero">
      <div class="hero__bg"></div>
      <div class="hero__content">
        <div class="hero__badge"><span class="hero__badge-dot"></span> Real-time Tracking</div>
        <h1 class="hero__title">Roblox Game Visit<br><span>Leaderboard</span></h1>
        <p class="hero__desc">Pantau statistik kunjungan dan pemain online game Roblox favoritmu secara real-time. Data diperbarui otomatis setiap 10 detik.</p>
        <div class="hero__stats">
          <div class="hero__stat">
            <div class="hero__stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div>
              <div class="hero__stat-value"><AnimatedNumber :value="totalVisits" /></div>
              <div class="hero__stat-label">Total Kunjungan</div>
            </div>
          </div>
          <div class="hero__stat">
            <div class="hero__stat-icon hero__stat-icon--live">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div>
              <div class="hero__stat-value hero__stat-value--live"><span class="pulse-dot pulse-dot--sm"></span> <AnimatedNumber :value="totalPlayers" /></div>
              <div class="hero__stat-label">Pemain Online <span class="live-text">LIVE</span></div>
            </div>
          </div>
          <div class="hero__stat">
            <div class="hero__stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <div>
              <div class="hero__stat-value">{{ visitors !== null ? fmt(visitors) : '...' }}</div>
              <div class="hero__stat-label">Pengunjung Web</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="live-bubble" :class="{ 'live-bubble--syncing': isSyncing }">
      <span class="live-bubble__dot"></span>
      <span v-if="isSyncing">Memperbarui data...</span>
      <span v-else>Auto-refresh aktif · setiap 10 detik</span>
    </div>

    <section class="section" v-if="yt">
      <div class="container">
        <div class="yt-card" :class="{ 'yt-card--live': yt.youtubeLive }">
          <div class="yt-card__badge" v-if="yt.youtubeLive"><span class="yt-pulse"></span> LIVE NOW</div>
          <div class="yt-card__badge yt-card__badge--video" v-else-if="yt.latestVideoId">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Video Terbaru
          </div>
          <div class="yt-card__body">
            <img v-if="yt.thumbnail" :src="yt.thumbnail" class="yt-card__thumb">
            <div class="yt-card__info">
              <h3 class="yt-card__title">{{ yt.title || yt.latestVideoTitle || 'Tidak ada siaran' }}</h3>
              <p class="yt-card__channel">{{ yt.channelTitle || 'Aditya RB' }}</p>
              <a :href="ytLink" target="_blank" class="btn btn--primary btn--sm">Tonton Sekarang</a>
            </div>
          </div>
          <div class="yt-card__embed" v-if="ytEmbedId">
            <iframe :src="'https://www.youtube.com/embed/' + ytEmbedId" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--compact">
      <div class="container">
        <div class="toolbar">
          <div class="toolbar__search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="search" type="text" placeholder="Cari game..." class="toolbar__input">
            <button v-if="search" class="toolbar__clear" @click="search = ''">✕</button>
          </div>
          <button class="btn btn--outline btn--sm" @click="showModal = true">Kelola Place ID</button>
          <div class="toolbar__sort">
            <button class="btn btn--ghost btn--sm" :class="{ 'btn--active': sortBy === 'visits' }" @click="sortBy = 'visits'">Visits</button>
            <button class="btn btn--ghost btn--sm" :class="{ 'btn--active': sortBy === 'playing' }" @click="sortBy = 'playing'">Playing</button>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-header__title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" class="icon-green"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            Top Popular Games
          </h2>
          <div class="section-header__tabs">
            <button class="tab-btn" :class="{ 'tab-btn--active': topType === 'visits' }" @click="topType = 'visits'; loadTop()">Visits</button>
            <button class="tab-btn" :class="{ 'tab-btn--active': topType === 'playing' }" @click="topType = 'playing'; loadTop()">Playing</button>
          </div>
        </div>
        <div class="top-grid" v-if="topGames.length">
          <TopCard v-for="(game, i) in sortedTop" :key="game.placeId" :game="game" :index="i" :type="topType" />
        </div>
        <div class="skeleton-grid" v-else><div class="skeleton-card" v-for="n in 4" :key="n"></div></div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-header__title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" class="icon-green"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Leaderboard
          </h2>
          <div class="section-header__right">
            <span class="badge badge--green">{{ filtered.length }} game</span>
            <span class="badge badge--live" v-if="!loading"><span class="pulse-dot pulse-dot--xs"></span> Live</span>
          </div>
        </div>
        <div class="leaderboard-grid" v-if="loading && !games.length"><div class="skeleton-lb" v-for="n in 5" :key="n"></div></div>
        <div class="empty-state" v-else-if="!filtered.length && search"><p>Tidak ditemukan game "{{ search }}"</p></div>
        <TransitionGroup name="lb-list" tag="div" class="leaderboard-grid" v-else>
          <LeaderboardCard v-for="(game, i) in filtered" :key="game.placeId" :game="game" :rank="i + 1" :maxVisits="maxV" :rankChange="getRankChange(game.placeId, i + 1)" :isFirst="i === 0 && sortBy === 'visits'" />
        </TransitionGroup>
      </div>
    </section>

    <section class="section section--support">
      <div class="container">
        <div class="support-grid">
          <SupportCard icon="heart" color="green" title="Dukung Kami" desc="Website ini dikembangkan secara gratis. Dukung kami lewat donasi." btnText="Donasi via Saweria" btnClass="btn--primary" link="https://saweria.co/rakanaditya" />
          <SupportCard icon="discord" color="discord" title="Gabung Komunitas" desc="Bergabung di Discord untuk diskusi dan update terbaru." btnText="Join Discord" btnClass="btn--discord" link="https://discord.com/invite/qjnSUrv3aa" />
          <SupportCard icon="youtube" color="yt" title="YouTube Channel" desc="Subscribe ke Aditya RB untuk konten Roblox terbaru." btnText="Subscribe" btnClass="btn--yt" link="https://www.youtube.com/@AdityaRB" />
        </div>
      </div>
    </section>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal">
            <div class="modal__header">
              <h3>Kelola Place ID</h3>
              <button class="modal__close" @click="showModal = false">✕</button>
            </div>
            <div class="modal__body">
              <label class="modal__label">Masukkan Place ID (pisahkan dengan koma)</label>
              <textarea v-model="placeInput" class="modal__textarea" rows="3" placeholder="3187302798, 11399819772"></textarea>
              <p class="modal__hint">Maksimal 10 Place ID. Hanya angka.</p>
              <div class="modal__current" v-if="activeIds.length">
                <span class="modal__label">Place ID Aktif:</span>
                <div class="modal__tags"><span class="tag" v-for="id in activeIds" :key="id">{{ id }}</span></div>
              </div>
            </div>
            <div class="modal__footer">
              <button class="btn btn--ghost" @click="resetIds">Reset Default</button>
              <button class="btn btn--primary" @click="saveIds">Simpan</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import TopCard from '../components/TopCard.vue'
import LeaderboardCard from '../components/LeaderboardCard.vue'
import SupportCard from '../components/SupportCard.vue'
import AnimatedNumber from '../components/AnimatedNumber.vue'

const emit = defineEmits(['toast'])
const API = '/api/data'
const REFRESH_MS = 10_000
const DEFAULT_IDS = ['3187302798','11399819772','115326572683504','115958813741074','116925158649823']
const TOP_IDS = ['121864768012064','7041939546','3260590327','76558904092080']

const games = ref([]), topGames = ref([]), yt = ref(null)
const loading = ref(true), isSyncing = ref(false)
const search = ref(''), sortBy = ref('visits'), topType = ref('visits')
const visitors = ref(null), totalVisits = ref(0), totalPlayers = ref(0)
const prevRanks = ref({}), showModal = ref(false), placeInput = ref('')
const initToastShown = ref(false)

const activeIds = computed(() => {
  const s = localStorage.getItem('customPlaceIds')
  return s ? s.split(',').map(x => x.trim()).filter(Boolean) : DEFAULT_IDS
})
const filtered = computed(() => {
  let list = [...games.value].sort((a, b) => (b[sortBy.value] || 0) - (a[sortBy.value] || 0))
  if (search.value) { const kw = search.value.toLowerCase(); list = list.filter(g => g.name?.toLowerCase().includes(kw)) }
  return list
})
const sortedTop = computed(() => [...topGames.value].sort((a, b) => (b[topType.value] || 0) - (a[topType.value] || 0)).slice(0, 5))
const maxV = computed(() => games.value.length ? Math.max(...games.value.map(g => g.visits || 0)) : 0)
const ytLink = computed(() => {
  if (!yt.value) return '#'
  if (yt.value.youtubeLive && yt.value.youtubeVideoId) return `https://www.youtube.com/watch?v=${yt.value.youtubeVideoId}`
  if (yt.value.latestVideoId) return `https://www.youtube.com/watch?v=${yt.value.latestVideoId}`
  return 'https://www.youtube.com/@AdityaRB'
})
const ytEmbedId = computed(() => yt.value?.youtubeVideoId || yt.value?.latestVideoId || null)

function fmt(n) {
  if (n == null) return '...'
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString('id-ID')
}
function getRankChange(id, rank) { const p = prevRanks.value[id]; if (!p) return null; return rank < p ? 'up' : rank > p ? 'down' : null }

async function loadBoard(silent = false) {
  if (!silent) isSyncing.value = true
  try {
    const r = await fetch(`${API}?placeIds=${activeIds.value.join(',')}&ytLive=1`)
    const d = await r.json()
    if (d.youtube) yt.value = d.youtube
    if (d.games) {
      const newR = {}; const sorted = [...d.games].sort((a, b) => (b.visits || 0) - (a.visits || 0))
      sorted.forEach((g, i) => { newR[g.placeId] = i + 1 })
      games.value = d.games
      totalVisits.value = d.games.reduce((s, g) => s + (g.visits || 0), 0)
      totalPlayers.value = d.games.reduce((s, g) => s + (g.playing || 0), 0)
      nextTick(() => { prevRanks.value = newR })
    }
    loading.value = false
    if (!initToastShown.value) { initToastShown.value = true; emit('toast', 'Data otomatis diperbarui setiap 10 detik', 'info') }
  } catch (e) { console.error(e); loading.value = false }
  finally { isSyncing.value = false }
}
async function loadTop() { try { const r = await fetch(`${API}?placeIds=${TOP_IDS.join(',')}`); const d = await r.json(); if (d.games) topGames.value = d.games } catch (e) { console.error(e) } }
async function loadVisitors() { try { const r = await fetch('/api/visit-count'); const d = await r.json(); if (d?.visitors != null) visitors.value = d.visitors } catch (e) { console.error(e) } }

function saveIds() {
  const ids = placeInput.value.split(',').map(x => x.trim()).filter(Boolean)
  if (!ids.every(id => /^\d+$/.test(id))) { emit('toast', 'Place ID harus angka!', 'error'); return }
  if (!ids.length) { emit('toast', 'Masukkan minimal 1 Place ID!', 'error'); return }
  if (ids.length > 10) { emit('toast', 'Maksimal 10 Place ID!', 'error'); return }
  localStorage.setItem('customPlaceIds', ids.join(',')); loadBoard(); loadTop()
  showModal.value = false; emit('toast', 'Place IDs diperbarui!', 'success')
}
function resetIds() { localStorage.removeItem('customPlaceIds'); placeInput.value = ''; loadBoard(); loadTop(); showModal.value = false; emit('toast', 'Place IDs direset.', 'success') }

let autoTimer = null
onMounted(() => { loadBoard(); loadTop(); loadVisitors(); autoTimer = setInterval(() => { loadBoard(true); loadTop() }, REFRESH_MS) })
onUnmounted(() => { if (autoTimer) clearInterval(autoTimer) })
</script>

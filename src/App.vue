<template>
  <div class="app">
    <nav class="navbar" :class="{ 'navbar--scrolled': scrolled }">
      <div class="navbar__inner">
        <router-link to="/" class="navbar__brand">
          <div class="navbar__logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01M12 12h.01"/><path d="M16 10v4"/><path d="M14 12h4"/></svg>
          </div>
          <span class="navbar__title">RBX Leaderboard</span>
        </router-link>
        <div class="navbar__links" :class="{ 'navbar__links--open': mobileMenu }">
          <router-link to="/" class="navbar__link" @click="mobileMenu = false">Beranda</router-link>
          <router-link to="/about" class="navbar__link" @click="mobileMenu = false">Tentang</router-link>
          <router-link to="/privacy-policy" class="navbar__link" @click="mobileMenu = false">Privasi</router-link>
          <a href="https://discord.com/invite/qjnSUrv3aa" target="_blank" class="navbar__link">Discord</a>
        </div>
        <button class="navbar__burger" @click="mobileMenu = !mobileMenu" aria-label="Menu">
          <svg v-if="!mobileMenu" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </nav>

    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" @toast="showToast" />
      </transition>
    </router-view>

    <footer class="footer">
      <div class="container">
        <div class="footer__inner">
          <div class="footer__brand">
            <div class="navbar__logo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01M12 12h.01"/><path d="M16 10v4"/><path d="M14 12h4"/></svg></div>
            <span>RBX Leaderboard</span>
          </div>
          <div class="footer__links">
            <router-link to="/about">Tentang Kami</router-link>
            <router-link to="/privacy-policy">Kebijakan Privasi</router-link>
            <a href="https://discord.com/invite/qjnSUrv3aa" target="_blank">Discord</a>
            <a href="mailto:rakanadityabis@gmail.com">Email</a>
          </div>
          <p class="footer__copy">&copy; 2025 Roblox Game Visit Leaderboard.</p>
        </div>
      </div>
    </footer>

    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="'toast--' + toast.type">
        <span class="toast__icon" v-if="toast.type === 'success'">✓</span>
        <span class="toast__icon" v-else-if="toast.type === 'error'">✕</span>
        <span class="toast__icon" v-else>ℹ</span>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
const mobileMenu = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer = null

function handleScroll() { scrolled.value = window.scrollY > 20 }

function showToast(msg, type = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show: true, message: msg, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 4000)
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

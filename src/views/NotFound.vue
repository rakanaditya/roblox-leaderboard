<template>
  <div class="error-page">
    <div>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#A8DF8E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
      <h1>404</h1>
      <p>Halaman yang kamu cari tidak ditemukan.</p>
      <router-link to="/" class="btn btn--primary">Kembali ke Beranda</router-link>
    </div>
  </div>
</template>

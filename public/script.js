const endpoint = "https://roblox-leaderboard.vercel.app/api/data";
const defaultPlaceIds = ["3187302798", "11399819772", "115326572683504", "115958813741074", "116925158649823"];

// ===== TOP POPULAR GAMES (KHUSUS) =====
const topPopularPlaceIds = [
  "121864768012064",
  "7041939546",
  "3260590327",
  "76558904092080"
];

let previousRanks = {};
const refreshInterval = 30;
let countdown = 0;
let allGames = [];
let currentViewMode = 'grid';

// ===== UTILITY FUNCTIONS =====
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

// Ambil Place ID dari localStorage atau pakai default
function getCurrentPlaceIds() {
  const saved = localStorage.getItem("customPlaceIds");
  return saved ? saved.split(",").map(id => id.trim()).filter(Boolean) : defaultPlaceIds;
}

// ===== LOAD DATA =====
function loadLeaderboard() {
  const placeIds = getCurrentPlaceIds();
  fetch(`${endpoint}?placeIds=${placeIds.join(",")}&ytLive=1`)
    .then(res => res.json())
    .then(data => {
      allGames = data.games || [];
      handleYouTube(data.youtube || {});
      renderLeaderboard(allGames);
      updateHeroStats(allGames);
    })
    .catch(err => console.error("Gagal memuat leaderboard:", err));
}

function loadTopPopularGames() {
  fetch(`${endpoint}?placeIds=${topPopularPlaceIds.join(",")}`)
    .then(res => res.json())
    .then(data => {
      renderTopPopular(data.games || []);
    })
    .catch(err => console.error("Top Popular error:", err));
}

// ===== HERO STATS UPDATE =====
function updateHeroStats(games) {
  const totalVisits = games.reduce((sum, g) => sum + (g.visits || 0), 0);
  const totalPlayers = games.reduce((sum, g) => sum + (g.playing || 0), 0);
  const gamesCount = games.length;

  // Animate numbers
  animateValue('heroTotalPlayers', 0, totalPlayers, 1500);
  animateValue('heroTotalVisits', 0, totalVisits, 1500);
  animateValue('heroGamesTracked', 0, gamesCount, 1000);
}

function animateValue(id, start, end, duration) {
  const element = document.getElementById(id);
  if (!element) return;
  
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = formatNumber(Math.floor(current));
  }, 16);
}

// ===== YOUTUBE HANDLER =====
function handleYouTube(yt) {
  const ytNotice = document.getElementById("youtubeLiveNotice");
  const ytLink = document.getElementById("youtubeLiveLink");
  const ytThumb = document.getElementById("youtubeThumbnail");
  const ytVidTitle = document.getElementById("youtubeTitle");
  const ytChannel = document.getElementById("youtubeChannelName");

  if (yt.youtubeLive && yt.youtubeVideoId) {
    ytLink.href = `https://www.youtube.com/watch?v=${yt.youtubeVideoId}`;
    ytThumb.src = yt.thumbnail;
    ytVidTitle.textContent = yt.title;
    ytChannel.textContent = yt.channelTitle;
    ytNotice.style.display = "block";
  } else if (yt.latestVideoId) {
    ytLink.href = `https://www.youtube.com/watch?v=${yt.latestVideoId}`;
    ytThumb.src = yt.thumbnail;
    ytVidTitle.textContent = yt.latestVideoTitle || "Video terbaru Aditya RB";
    ytChannel.textContent = yt.channelTitle || "Aditya RB";
    ytNotice.style.display = "block";
  } else {
    ytNotice.style.display = "none";
  }
}

// ===== TOP POPULAR RENDERING =====
let currentTopType = "visits";

function renderTopPopular(games) {
  const container = document.getElementById("topPopularGames");
  if (!container) return;

  const sorted = [...games].sort((a, b) =>
    (b[currentTopType] || 0) - (a[currentTopType] || 0)
  );

  const top5 = sorted.slice(0, 5);
  container.innerHTML = "";

  top5.forEach((game, index) => {
    const rank = index + 1;
    const medal =
      rank === 1 ? "🥇" :
      rank === 2 ? "🥈" :
      rank === 3 ? "🥉" : "";

    const live = game.playing >= 1000
      ? `<div class="live-indicator">🔴 LIVE</div>`
      : "";

    const card = document.createElement('div');
    card.className = 'top-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
      <div class="top-rank">${medal} #${rank}</div>
      ${live}
      <img src="${game.thumbnail}" alt="${game.name}" loading="lazy">
      <div class="top-name">${game.name}</div>
      <div class="top-value">
        ${currentTopType === "visits"
          ? `${formatNumber(game.visits)} visits`
          : `${formatNumber(game.playing)} playing`}
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Tab switching for top popular
document.querySelectorAll(".top-tabs .tab-btn").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".top-tabs .tab-btn")
      .forEach(t => t.classList.remove("active"));

    tab.classList.add("active");
    currentTopType = tab.dataset.type;
    loadTopPopularGames();
  });
});

// ===== LEADERBOARD RENDERING =====
function renderLeaderboard(games) {
  const container = document.getElementById("leaderboard");
  if (!container) return;
  
  container.innerHTML = "";

  games.sort((a, b) => (b.visits || 0) - (a.visits || 0));
  
  games.forEach((game, index) => {
    const rank = index + 1;
    const previousRank = previousRanks[game.placeId];
    previousRanks[game.placeId] = rank;
    
    const rankChange = previousRank
      ? rank < previousRank ? `<span class="up">⬆️</span>` 
      : rank > previousRank ? `<span class="down">⬇️</span>` 
      : ""
      : "";

    const card = document.createElement("div");
    card.className = "game-card";
    card.style.animationDelay = `${index * 0.05}s`;

    if (game.error) {
      card.innerHTML = `<p style="color: var(--color-danger);">Error loading game ${game.placeId}</p>`;
    } else {
      const isLive = game.playing > 1000 ? `<div class="live-badge">🔴 LIVE</div>` : "";
      
      card.innerHTML = `
        <div class="rank-indicator">#${rank} ${rankChange}</div>
        ${isLive}
        <img src="${game.thumbnail}" alt="${game.name}" loading="lazy">
        <div class="game-name">${game.name}</div>
        <div class="visits">${formatNumber(game.visits)} visits</div>
        <div class="visits" style="color: var(--color-info); font-size: 0.9rem;">
          ${formatNumber(game.playing)} players online
        </div>
      `;
    }
    
    container.appendChild(card);
  });
}

// View toggle (grid/list)
document.querySelectorAll(".view-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    const view = btn.dataset.view;
    const container = document.getElementById("leaderboard");
    
    if (view === 'list') {
      container.classList.add('list-view');
    } else {
      container.classList.remove('list-view');
    }
  });
});

// ===== COUNTDOWN SYSTEM =====
function updateCountdownUI() {
  const text = document.getElementById("countdownText");
  const bar = document.getElementById("countdownBar");
  
  const secondsLeft = refreshInterval - countdown;
  text.textContent = `${secondsLeft}s`;
  
  const progress = (countdown / refreshInterval) * 100;
  bar.style.width = `${100 - progress}%`;
  
  countdown++;
  
  if (countdown > refreshInterval) {
    countdown = 0;
    loadLeaderboard();
    loadTopPopularGames();
  }
}

// ===== VISITOR COUNT =====
function loadVisitorCount() {
  const el = document.getElementById("visitorCount");
  if (!el) return;

  el.innerHTML = `<span class="spinner"></span> Loading...`;

  fetch("/api/visit-count")
    .then(async res => {
      if (!res.ok) {
        throw new Error(`Network error: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      if (data && typeof data.visitors === "number") {
        animateVisitorCount(el, data.visitors);
      } else {
        el.textContent = "Data tidak tersedia";
      }
    })
    .catch(err => {
      console.error("Fetch visitor error:", err.message);
      el.textContent = "Data tidak tersedia";
    });
}

function animateVisitorCount(element, target) {
  let current = 0;
  const increment = target / 50;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = `${Math.floor(current).toLocaleString()} visitors`;
  }, 20);
}

// ===== SEARCH FUNCTIONALITY =====
const searchInput = document.getElementById("searchInput");
const clearButton = document.getElementById("clearSearch");

searchInput.addEventListener("input", function () {
  const keyword = this.value.toLowerCase();
  clearButton.classList.toggle("visible", this.value.length > 0);

  document.querySelectorAll(".game-card, .top-card").forEach(card => {
    const name = card.querySelector(".game-name, .top-name")
      ?.textContent.toLowerCase() || "";
    
    if (name.includes(keyword)) {
      card.style.display = "block";
      card.style.animation = "fadeInUp 0.3s ease-out";
    } else {
      card.style.display = "none";
    }
  });
});

clearButton.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.dispatchEvent(new Event('input'));
  clearButton.classList.remove("visible");
});

// ===== MANUAL REFRESH =====
document.getElementById("manualRefreshBtn").addEventListener("click", () => {
  countdown = 0;
  loadLeaderboard();
  loadTopPopularGames();
  
  // Visual feedback
  const btn = document.getElementById("manualRefreshBtn");
  btn.style.transform = "rotate(360deg)";
  setTimeout(() => {
    btn.style.transform = "rotate(0deg)";
  }, 500);
});

// ===== PLACE ID MANAGEMENT =====
document.getElementById("savePlaceIdsBtn")?.addEventListener("click", () => {
  const input = document.getElementById("placeIdInput").value;
  const ids = input.split(",").map(id => id.trim()).filter(Boolean);
  
  const isValid = ids.every(id => /^\d+$/.test(id));
  if (!isValid) {
    alert("⚠️ Semua Place ID harus berupa angka!");
    return;
  }
  
  if (ids.length === 0) {
    alert("⚠️ Masukkan minimal satu Place ID yang valid.");
    return;
  }
  
  if (ids.length > 10) {
    alert("⚠️ Maksimal hanya boleh 10 Place ID!");
    return;
  }
  
  localStorage.setItem("customPlaceIds", ids.join(","));
  countdown = 0;
  loadLeaderboard();
  loadTopPopularGames();
  alert("✅ Place IDs diperbarui!");
  closeModal();
});

document.getElementById("resetPlaceIdsBtn")?.addEventListener("click", () => {
  if (!confirm("Yakin ingin reset ke Place IDs default?")) return;
  
  localStorage.removeItem("customPlaceIds");
  countdown = 0;
  loadLeaderboard();
  loadTopPopularGames();
  alert("🔄 Place IDs direset ke default.");
  closeModal();
});

// Modal functions
function openModal() {
  document.getElementById("placeIdModal").classList.add("active");
}

function closeModal() {
  document.getElementById("placeIdModal").classList.remove("active");
}

// Click outside modal to close
document.getElementById("placeIdModal")?.addEventListener("click", (e) => {
  if (e.target.id === "placeIdModal") {
    closeModal();
  }
});

// ===== MOBILE NAVIGATION =====
document.getElementById("navToggle")?.addEventListener("click", function() {
  this.classList.toggle("active");
  document.querySelector(".nav-links")?.classList.toggle("active");
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe cards when they come into view
function observeCards() {
  document.querySelectorAll(".game-card, .top-card, .community-card").forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(card);
  });
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.focus();
  }
  
  // Escape to clear search
  if (e.key === 'Escape' && searchInput.value) {
    clearButton.click();
  }
});

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  loadLeaderboard();
  loadTopPopularGames();
  loadVisitorCount();
  setInterval(updateCountdownUI, 1000);
  
  // Add subtle animations on load
  setTimeout(observeCards, 500);
});

// ===== ERROR HANDLING =====
window.addEventListener("error", (e) => {
  console.error("Global error:", e.message);
});

// ===== PERFORMANCE MONITORING =====
if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`Page load time: ${pageLoadTime}ms`);
  });
}

// Add CSS animation keyframes dynamically if needed
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .game-card, .top-card {
    animation: fadeInUp 0.5s ease-out backwards;
  }
  
  #manualRefreshBtn svg {
    transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
`;
document.head.appendChild(style);

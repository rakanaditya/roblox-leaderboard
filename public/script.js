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

// Ambil Place ID dari localStorage atau pakai default
function getCurrentPlaceIds() {
  const saved = localStorage.getItem("customPlaceIds");
  return saved ? saved.split(",").map(id => id.trim()).filter(Boolean) : defaultPlaceIds;
}

// Memuat leaderboard dan status YouTube Live
function loadLeaderboard() {
  const placeIds = getCurrentPlaceIds();
  fetch(`${endpoint}?placeIds=${placeIds.join(",")}&ytLive=1`)
    .then(res => res.json())
    .then(data => {
      
      handleYouTube(data.youtube || {});
      renderLeaderboard(data.games || []);
    })
    .catch(err => console.error("Gagal memuat leaderboard:", err));
}

// Menampilkan status live YouTube atau video terbaru
function handleYouTube(yt) {
  const ytNotice = document.getElementById("youtubeLiveNotice");
  const ytStatus = document.getElementById("youtubeStatusTitle");
  const ytLink = document.getElementById("youtubeLiveLink");
  const ytThumb = document.getElementById("youtubeThumbnail");
  const ytVidTitle = document.getElementById("youtubeTitle");
  const ytChannel = document.getElementById("youtubeChannelName");
  const ytEmbed = document.getElementById("youtubeEmbed");

  if (yt.youtubeLive && yt.youtubeVideoId) {
    ytStatus.textContent = "🔴 Aditya RB Sedang LIVE di YouTube";
    ytLink.href = `https://www.youtube.com/watch?v=${yt.youtubeVideoId}`;
    ytThumb.src = yt.thumbnail;
    ytVidTitle.textContent = yt.title;
    ytChannel.textContent = yt.channelTitle;
    ytEmbed.src = `https://www.youtube.com/embed/${yt.youtubeVideoId}?autoplay=1`;
  } else if (yt.latestVideoId) {
    ytStatus.textContent = "📺 Video Terbaru dari Aditya RB";
    ytLink.href = `https://www.youtube.com/watch?v=${yt.latestVideoId}`;
    ytThumb.src = yt.thumbnail;
    ytVidTitle.textContent = yt.latestVideoTitle || "Video terbaru Aditya RB";
    ytChannel.textContent = yt.channelTitle || "Aditya RB";
    ytEmbed.src = `https://www.youtube.com/embed/${yt.latestVideoId}?autoplay=1`;
  } else {
    ytStatus.textContent = "🔕 Aditya RB tidak sedang live saat ini";
    ytThumb.src = "https://img.freepik.com/premium-vector/ban-filming-live-sign-symbol-icon_204827-341.jpg";
    ytVidTitle.textContent = "Tidak ada siaran langsung ditemukan.";
    ytChannel.textContent = "Aditya RB";
    ytLink.href = "https://www.youtube.com/@AdityaRB";
    ytEmbed.src = "";
  }

  ytNotice.style.display = "block";
}


// ================= TOP POPULAR =================
function loadTopPopularGames() {
  fetch(`${endpoint}?placeIds=${topPopularPlaceIds.join(",")}`)
    .then(res => res.json())
    .then(data => {
      renderTopPopular(data.games || []);
    })
    .catch(err => console.error("Top Popular error:", err));
}

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

    const live =
      game.playing >= 1000
        ? `<div class="live-indicator">🔴 LIVE</div>`
        : "";

    container.innerHTML += `
      <div class="top-card">
        <div class="top-rank">${medal} #${rank}</div>
        ${live}
        <img src="${game.thumbnail}">
        <div class="top-name">${game.name}</div>
        <div class="top-value">
          ${currentTopType === "visits"
            ? `${game.visits.toLocaleString()} visits`
            : `${game.playing.toLocaleString()} playing`}
        </div>
      </div>
    `;
  });
}

document.querySelectorAll(".top-tabs .tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".top-tabs .tab")
      .forEach(t => t.classList.remove("active"));

    tab.classList.add("active");
    currentTopType = tab.dataset.type;

    loadTopPopularGames(); // 🔥 reload khusus top popular
  });
});


// Menampilkan leaderboard
function renderLeaderboard(games) {
  const container = document.getElementById("leaderboard");
  container.innerHTML = "";

  const totalVisits = games.reduce((sum, g) => sum + (g.visits || 0), 0);
  const totalPlayers = games.reduce((sum, g) => sum + (g.playing || 0), 0);
  document.getElementById("totalsDisplay").innerHTML =
    `🎯 Total semua kunjungan: ${totalVisits.toLocaleString()} visits<br>` +
    `🎮 Total pemain online saat ini: ${totalPlayers.toLocaleString()} players`;

  games.sort((a, b) => (b.visits || 0) - (a.visits || 0));
  games.forEach((game, index) => {
    const rank = index + 1;
    const previousRank = previousRanks[game.placeId];
    previousRanks[game.placeId] = rank;
    const rankChange = previousRank
      ? rank < previousRank ? `<span class="up">⬆️</span>` : rank > previousRank ? `<span class="down">⬇️</span>` : ""
      : "";

    const div = document.createElement("div");
    div.className = "game-card";

    if (game.error) {
      div.innerHTML = `<p>Error loading game ${game.placeId}</p>`;
    } else {
      const isLive = game.playing > 1000 ? `<div class="live-badge">🔴 LIVE</div>` : "";
      div.innerHTML = `
        <div class="rank-indicator">#${rank} ${rankChange}</div>
        ${isLive}
        <img src="${game.thumbnail}" alt="${game.name}">
        <div class="game-name">${game.name}</div>
        <div class="visits">${game.visits.toLocaleString()} visits</div>
        <div class="visits" style="color:#007bff">${game.playing.toLocaleString()} players online</div>`;
    }
    container.appendChild(div);
  });
}

// Menjalankan refresh countdown
function updateCountdownUI() {
  const text = document.getElementById("countdownText");
  const bar = document.getElementById("countdownBar");
  const secondsLeft = refreshInterval - countdown;
  text.textContent = `⏳ Refresh in: ${secondsLeft}s`;
  bar.style.width = (countdown / refreshInterval) * 100 + "%";
  countdown++;
  if (countdown > refreshInterval) {
    countdown = 0;
    loadLeaderboard();
    loadTopPopularGames();
  }
}

// Fungsi untuk memuat jumlah pengunjung website
 function loadVisitorCount() {
  const el = document.getElementById("visitorCount");
  if (!el) return;

  el.innerHTML = `<span class="loading-spinner"></span> Mengambil data pengunjung...`;

  fetch("/api/visit-count")
    .then(async res => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Network error: ${res.status} - ${text}`);
      }
      return res.json();
    })
    .then(data => {
      if (data && typeof data.visitors === "number") {
        el.innerHTML = `👁️ <strong>${data.visitors.toLocaleString()}</strong> Pengunjung Website`;
      } else {
        el.textContent = "👁️ Data pengunjung tidak tersedia 😢";
      }
    })
    .catch(err => {
      console.error("Fetch visitor error:", err.message);
      el.textContent = "👁️ Total Pengunjung Website: tidak tersedia 😢";
    });
}

// === Inisialisasi saat load ===
loadLeaderboard();
loadTopPopularGames();   // top popular KHUSUS
loadVisitorCount();
setInterval(updateCountdownUI, 1000);

// === Event Handler UI ===
document.getElementById("manualRefreshBtn").addEventListener("click", () => {
  countdown = 0;
  loadLeaderboard();
  loadTopPopularGames();
});

document.getElementById("savePlaceIdsBtn").addEventListener("click", () => {
  const input = document.getElementById("placeIdInput").value;
  const ids = input.split(",").map(id => id.trim()).filter(Boolean);
  const isValid = ids.every(id => /^\d+$/.test(id));
  if (!isValid) return alert("⚠️ Semua Place ID harus berupa angka!");
  if (ids.length === 0) return alert("⚠️ Masukkan minimal satu Place ID yang valid.");
  if (ids.length > 10) return alert("⚠️ Maksimal hanya boleh 10 Place ID!");
  localStorage.setItem("customPlaceIds", ids.join(","));
  countdown = 0;
  loadLeaderboard();
  loadTopPopularGames();
  alert("✅ Place IDs diperbarui!");
});

document.getElementById("resetPlaceIdsBtn").addEventListener("click", () => {
  localStorage.removeItem("customPlaceIds");
  countdown = 0;
  loadLeaderboard();
  loadTopPopularGames();
  alert("🔄 Place IDs direset ke default.");
});

const searchInput = document.getElementById("searchInput");
const clearButton = document.getElementById("clearSearch");

searchInput.addEventListener("input", function () {
  const keyword = this.value.toLowerCase();
  clearButton.classList.toggle("visible", this.value.length > 0);

  document.querySelectorAll(".game-card, .top-card").forEach(card => {
    const name =
      card.querySelector(".game-name, .top-name")
        ?.textContent.toLowerCase() || "";

    card.style.display = name.includes(keyword) ? "block" : "none";
  });
});


clearButton.addEventListener("click", () => {
  searchInput.value = "";
  document.querySelectorAll(".game-card").forEach(card => card.style.display = "block");
  clearButton.classList.remove("visible");
});

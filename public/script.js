// public/script.js

const endpoint = "https://roblox-leaderboard.vercel.app/api/data";
const defaultPlaceIds = ["3187302798", "11399819772", "115326572683504", "115958813741074"];
let previousRanks = {};
const refreshInterval = 30;
let countdown = 0;

function getCurrentPlaceIds() {
  const saved = localStorage.getItem("customPlaceIds");
  return saved ? saved.split(",").map(id => id.trim()).filter(Boolean) : defaultPlaceIds;
}

function loadLeaderboard() {
  const placeIds = getCurrentPlaceIds();
  fetch(`${endpoint}?placeIds=${placeIds.join(",")}&ytLive=1`)
    .then(res => res.json())
    .then(data => {
      const yt = data.youtube;
      const ytNotice = document.getElementById("youtubeLiveNotice");
      const ytStatus = document.getElementById("youtubeStatusTitle");
      const ytLink = document.getElementById("youtubeLiveLink");
      const ytThumb = document.getElementById("youtubeThumbnail");
      const ytVidTitle = document.getElementById("youtubeTitle");
      const ytChannel = document.getElementById("youtubeChannelName");
      const ytEmbed = document.getElementById("youtubeEmbed");

      if (yt && yt.youtubeLive && yt.youtubeVideoId) {
        ytStatus.textContent = "🔴 Aditya RB Sedang LIVE di YouTube";
        ytLink.href = `https://www.youtube.com/watch?v=${yt.youtubeVideoId}`;
        ytThumb.src = yt.thumbnail;
        ytVidTitle.textContent = yt.title;
        ytChannel.textContent = yt.channelTitle;
        const currentSrcId = ytEmbed.src.split("/embed/")[1]?.split("?")[0];
        if (currentSrcId !== yt.youtubeVideoId) {
          ytEmbed.src = `https://www.youtube.com/embed/${yt.youtubeVideoId}?autoplay=1`;
        }
        ytNotice.style.display = "block";
      } else if (yt && yt.latestVideoId) {
        ytStatus.textContent = "📺 Video Terbaru dari Aditya RB";
        ytLink.href = `https://www.youtube.com/watch?v=${yt.latestVideoId}`;
        ytThumb.src = `https://i.ytimg.com/vi/${yt.latestVideoId}/hqdefault.jpg`;
        ytVidTitle.textContent = yt.latestVideoTitle || "Video terbaru Aditya RB";
        ytChannel.textContent = yt.channelTitle || "Aditya RB";
        const currentSrcId = ytEmbed.src.split("/embed/")[1]?.split("?")[0];
        if (currentSrcId !== yt.latestVideoId) {
          ytEmbed.src = `https://www.youtube.com/embed/${yt.latestVideoId}?autoplay=1`;
        }
        ytNotice.style.display = "block";
      } else {
        ytStatus.textContent = "🔕 Aditya RB tidak sedang live saat ini";
        ytThumb.src = "https://img.freepik.com/premium-vector/ban-filming-live-sign-symbol-icon_204827-341.jpg";
        ytVidTitle.textContent = "Tidak ada siaran langsung ditemukan.";
        ytChannel.textContent = "Aditya RB";
        ytLink.href = "https://www.youtube.com/@AdityaRB";
        ytEmbed.src = "";
        ytNotice.style.display = "block";
      }

      const container = document.getElementById("leaderboard");
      container.innerHTML = "";
      const games = data.games || [];
      const totalVisits = games.reduce((sum, game) => sum + (game.visits || 0), 0);
      const totalPlayers = games.reduce((sum, game) => sum + (game.playing || 0), 0);
      document.getElementById("totalsDisplay").innerHTML =
        `🎯 Total semua kunjungan: ${totalVisits.toLocaleString()} visits<br>` +
        `🎮 Total pemain online saat ini: ${totalPlayers.toLocaleString()} players`;

      games.sort((a, b) => (b.visits || 0) - (a.visits || 0));
      games.forEach((game, index) => {
        const rank = index + 1;
        const previousRank = previousRanks[game.placeId];
        previousRanks[game.placeId] = rank;
        let rankChange = "";
        if (previousRank) {
          if (rank < previousRank) rankChange = `<span class="up">⬆️</span>`;
          else if (rank > previousRank) rankChange = `<span class="down">⬇️</span>`;
        }

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
    })
    .catch(err => console.error("Gagal memuat leaderboard:", err));
}

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
  }
}

loadLeaderboard();
setInterval(updateCountdownUI, 1000);

const searchInput = document.getElementById("searchInput");
const clearButton = document.getElementById("clearSearch");

searchInput.addEventListener("input", function () {
  const keyword = this.value.toLowerCase();
  if (this.value.length > 0) clearButton.classList.add("visible");
  else clearButton.classList.remove("visible");

  document.querySelectorAll(".game-card").forEach(card => {
    const name = card.querySelector(".game-name")?.textContent.toLowerCase() || "";
    card.style.display = name.includes(keyword) ? "block" : "none";
  });
});

clearButton.addEventListener("click", function () {
  searchInput.value = "";
  document.querySelectorAll(".game-card").forEach(card => card.style.display = "block");
  clearButton.classList.remove("visible");
});

document.getElementById("manualRefreshBtn").addEventListener("click", () => {
  countdown = 0;
  loadLeaderboard();
});

document.getElementById("savePlaceIdsBtn").addEventListener("click", function () {
  const input = document.getElementById("placeIdInput").value;
  const ids = input.split(",").map(id => id.trim()).filter(Boolean);
  const isValid = ids.every(id => /^\d+$/.test(id));
  if (!isValid) return alert("⚠️ Semua Place ID harus berupa angka!");
  if (ids.length === 0) return alert("⚠️ Masukkan minimal satu Place ID yang valid.");
  if (ids.length > 10) return alert("⚠️ Maksimal hanya boleh 10 Place ID!");

  localStorage.setItem("customPlaceIds", ids.join(","));
  countdown = 0;
  loadLeaderboard();
  alert("✅ Place IDs diperbarui!");
});

document.getElementById("resetPlaceIdsBtn").addEventListener("click", function () {
  localStorage.removeItem("customPlaceIds");
  countdown = 0;
  loadLeaderboard();
  alert("🔄 Place IDs direset ke default.");
});

let cache = {
  timestamp: 0,
  data: null,
};

const CACHE_DURATION = 1000 * 60 * 3; // 3 menit

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const now = Date.now();
  const allowedParams = ["placeIds", "ytLive"];
  const searchParams = new URLSearchParams();

  for (const key of allowedParams) {
    if (req.query[key]) {
      searchParams.append(key, req.query[key]);
    }
  }

  // === GAS Token ===
  const gasToken = process.env.GAS_TOKEN;
  if (!gasToken) {
    return res.status(500).json({ error: "GAS_TOKEN tidak tersedia di environment." });
  }
  searchParams.append("token", gasToken);

  const gasUrl = `https://script.google.com/macros/s/AKfycbyk3W-3rLAzMifmbYH0GF8CXsh9afHS8wJ9gZch2SZ7447M2FDKXsqr9CDk_588PrDRyg/exec?${searchParams.toString()}`;

  // === Kembalikan Cache jika masih berlaku
  if (cache.data && now - cache.timestamp < CACHE_DURATION) {
    return res.status(200).json(cache.data);
  }

  // === YouTube Setup ===
  const ytLiveRequested = req.query.ytLive === "1";
  const ytChannelId = "UCEw2LeYmh2XQG_pgcdfPqHA";

  const ytKeys = Object.entries(process.env)
    .filter(([key]) => key.startsWith("YT_API_KEY_"))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([_, val]) => val);

  const fetchYouTubeJSON = async (url, key) => {
    try {
      const response = await fetch(`${url}&key=${key}`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  };

  let youtube = null;

  if (ytLiveRequested && ytKeys.length > 0) {
    for (let i = 0; i < ytKeys.length; i++) {
      const key = ytKeys[i];

      // 1. Cek apakah sedang live
      const liveUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytChannelId}&eventType=live&type=video`;
      const liveData = await fetchYouTubeJSON(liveUrl, key);

      if (liveData?.items?.length > 0) {
        const videoId = liveData.items[0].id.videoId;
        const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}`;
        const detail = await fetchYouTubeJSON(detailUrl, key);
        const snippet = detail?.items?.[0]?.snippet;

        youtube = {
          youtubeLive: true,
          youtubeVideoId: videoId,
          title: snippet?.title || "Live Stream",
          channelTitle: snippet?.channelTitle || "Aditya RB",
          thumbnail: snippet?.thumbnails?.medium?.url || "",
          apiKeyUsed: `YT_API_KEY_${i + 1}`
        };
        break;
      }

      // 2. Jika tidak live, ambil video terbaru
      const latestUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytChannelId}&order=date&type=video&maxResults=1`;
      const latestData = await fetchYouTubeJSON(latestUrl, key);
      const v = latestData?.items?.[0];

      if (v) {
        youtube = {
          youtubeLive: false,
          latestVideoId: v.id.videoId,
          latestVideoTitle: v.snippet.title,
          channelTitle: v.snippet.channelTitle,
          thumbnail: v.snippet.thumbnails?.medium?.url || "",
          apiKeyUsed: `YT_API_KEY_${i + 1}`
        };
        break;
      }
    }

    if (!youtube) {
      youtube = { youtubeLiveError: "❌ Semua API Key YouTube gagal atau diblokir/limit." };
    }
  }

  // === Fetch dari Google Apps Script
  try {
    const gasRes = await fetch(gasUrl);
    const gasData = await gasRes.json();

    const result = {
      ...gasData,
      ...(youtube && { youtube }),
    };

    // Simpan ke cache
    cache = {
      timestamp: now,
      data: result,
    };

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Gagal mengambil data dari GAS", detail: err.message });
  }
}

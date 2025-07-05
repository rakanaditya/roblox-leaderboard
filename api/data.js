const cache = {
  youtube: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5 menit (ms)
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const allowedParams = ["placeIds", "ytLive"];
  const searchParams = new URLSearchParams();

  for (const key of allowedParams) {
    if (req.query[key]) searchParams.append(key, req.query[key]);
  }

  const gasToken = process.env.GAS_TOKEN;
  if (!gasToken) {
    return res.status(500).json({ error: "GAS_TOKEN tidak tersedia di environment." });
  }
  searchParams.append("token", gasToken);

  const gasUrl = `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?${searchParams.toString()}`;
  const ytLiveRequested = req.query.ytLive === "1";
  const ytChannelId = "UCEw2LeYmh2XQG_pgcdfPqHA";

  const ytKeys = Object.entries(process.env)
    .filter(([k]) => k.startsWith("YT_API_KEY_"))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([_, v]) => v);

  const fetchYouTube = async (url, key) => {
    try {
      const res = await fetch(`${url}&key=${key}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  // === YouTube Section with Caching ===
  let youtube = null;
  const now = Date.now();

  const isCacheValid = now - cache.timestamp < cache.ttl;
  if (ytLiveRequested && ytKeys.length > 0 && isCacheValid && cache.youtube) {
    youtube = cache.youtube;
  }

  if (ytLiveRequested && ytKeys.length > 0 && !isCacheValid) {
    for (let i = 0; i < ytKeys.length; i++) {
      const key = ytKeys[i];

      // Cek Live
      const liveUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytChannelId}&eventType=live&type=video`;
      const liveData = await fetchYouTube(liveUrl, key);

      if (liveData?.items?.length > 0) {
        const videoId = liveData.items[0].id.videoId;
        const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}`;
        const detail = await fetchYouTube(detailUrl, key);
        const snippet = detail?.items?.[0]?.snippet;

        if (snippet) {
          youtube = {
            youtubeLive: true,
            youtubeVideoId: videoId,
            title: snippet.title,
            channelTitle: snippet.channelTitle,
            thumbnail: snippet.thumbnails?.medium?.url || "",
            apiKeyUsed: `YT_API_KEY_${i + 1}`
          };
          cache.youtube = youtube;
          cache.timestamp = now;
          break;
        }
      }
    }

    // Jika tidak live → Ambil video terbaru
    if (!youtube) {
      for (let i = 0; i < ytKeys.length; i++) {
        const key = ytKeys[i];
        const latestUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytChannelId}&order=date&type=video&maxResults=1`;
        const latestData = await fetchYouTube(latestUrl, key);

        const item = latestData?.items?.[0];
        if (item) {
          youtube = {
            youtubeLive: false,
            latestVideoId: item.id.videoId,
            latestVideoTitle: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails?.medium?.url || "",
            apiKeyUsed: `YT_API_KEY_${i + 1}`
          };
          cache.youtube = youtube;
          cache.timestamp = now;
          break;
        }
      }
    }

    if (!youtube) {
      youtube = { youtubeLiveError: "❌ Semua YouTube API Key gagal (limit/invalid)." };
      cache.youtube = youtube;
      cache.timestamp = now;
    }
  }

  // === Fetch Google Apps Script
  try {
    const gasRes = await fetch(gasUrl);
    const gasData = await gasRes.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({
      ...gasData,
      ...(youtube && { youtube })
    });
  } catch (err) {
    return res.status(500).json({ error: "Gagal fetch dari GAS", detail: err.message });
  }
}

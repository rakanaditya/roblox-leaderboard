export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const allowedParams = ["placeIds", "ytLive"];
  const searchParams = new URLSearchParams();

  for (const key of allowedParams) {
    if (req.query[key]) {
      searchParams.append(key, req.query[key]);
    }
  }

  // === Token GAS ===
  const gasToken = process.env.GAS_TOKEN;
  if (!gasToken) {
    return res.status(500).json({ error: "GAS_TOKEN tidak tersedia di environment." });
  }
  searchParams.append("token", gasToken);

  // === GAS URL ===
  const gasUrl = `https://script.google.com/macros/s/YOUR_GAS_DEPLOYMENT_ID/exec?${searchParams.toString()}`;

  // === YouTube API Setup ===
  const ytLiveRequested = req.query.ytLive === "1";
  const ytChannelId = "UCEw2LeYmh2XQG_pgcdfPqHA";
  const ytKeys = Object.entries(process.env)
    .filter(([key]) => key.startsWith("YT_API_KEY_"))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([_, val]) => val);

  const fetchYouTubeJSON = async (url, key) => {
    const fullUrl = `${url}&key=${key}`;
    try {
      const res = await fetch(fullUrl);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  };

  let youtube = null;

  if (ytLiveRequested && ytKeys.length > 0) {
    for (const key of ytKeys) {
      // Cek live
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
          thumbnail: snippet?.thumbnails?.medium?.url || ""
        };
        break;
      }

      // Ambil video terbaru
      const latestUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytChannelId}&order=date&type=video&maxResults=1`;
      const latestData = await fetchYouTubeJSON(latestUrl, key);
      const v = latestData?.items?.[0];

      if (v) {
        youtube = {
          youtubeLive: false,
          latestVideoId: v.id.videoId,
          latestVideoTitle: v.snippet.title,
          channelTitle: v.snippet.channelTitle,
          thumbnail: v.snippet.thumbnails?.medium?.url || ""
        };
        break;
      }
    }

    if (!youtube) {
      youtube = { youtubeLiveError: "❌ Semua API Key YouTube gagal atau kuota habis." };
    }
  }

  // === Fetch dari Google Apps Script ===
  try {
    const gasRes = await fetch(gasUrl);
    const gasData = await gasRes.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({
      ...gasData,
      ...(youtube && { youtube })
    });
  } catch (err) {
    return res.status(500).json({ error: "Gagal fetch data dari Google Apps Script", detail: err.message });
  }
}

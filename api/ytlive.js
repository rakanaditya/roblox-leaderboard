let cache = {
  data: null,
  timestamp: 0
};

export default async function handler(req, res) {
  const API_KEY = process.env.YT_API_KEY;
  const CHANNEL_ID = 'UCEw2LeYmh2XQG_pgcdfPqHA'; // Ganti dengan channel ID kamu
  const CACHE_DURATION = 60 * 1000; // 60 detik

  const now = Date.now();
  if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
    return res.status(200).json(cache.data); // ✅ Gunakan data cache
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`;

  try {
    const ytRes = await fetch(url);

    // 🔴 Cek jika API YouTube gagal
    if (!ytRes.ok) {
      const text = await ytRes.text();
      return res.status(ytRes.status).json({
        youtube: {
          youtubeLiveError: `YouTube API error: ${ytRes.statusText}`,
          details: text
        }
      });
    }

    const ytData = await ytRes.json();

    let response;
    if (ytData.items && ytData.items.length > 0) {
      const item = ytData.items[0];
      response = {
        youtube: {
          youtubeLive: true,
          youtubeVideoId: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.medium.url
        }
      };
    } else {
      response = {
        youtube: {
          youtubeLive: false
        }
      };
    }

    // ✅ Simpan ke cache
    cache.data = response;
    cache.timestamp = now;

    return res.status(200).json(response);

  } catch (err) {
    return res.status(500).json({
      youtube: {
        youtubeLiveError: err.message
      }
    });
  }
}

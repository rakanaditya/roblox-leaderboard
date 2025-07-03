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

  const gasUrl = `https://script.google.com/macros/s/AKfycbyk3W-3rLAzMifmbYH0GF8CXsh9afHS8wJ9gZch2SZ7447M2FDKXsqr9CDk_588PrDRyg/exec?${searchParams.toString()}`;

  const ytApiKey = process.env.YT_API_KEY;
  const ytChannelId = "UCEw2LeYmh2XQG_pgcdfPqHA";

  const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytChannelId}&eventType=live&type=video&key=${ytApiKey}`;

  try {
    const [gasRes, ytRes] = await Promise.all([
      fetch(gasUrl),
      fetch(ytUrl)
    ]);

    const gasData = await gasRes.json();
    let youtube = { youtubeLive: false };

    // Jika sedang live
    if (ytRes.ok) {
      const ytData = await ytRes.json();
      if (ytData.items && ytData.items.length > 0) {
        const item = ytData.items[0];
        youtube = {
          youtubeLive: true,
          youtubeVideoId: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.medium.url
        };
      }
    } else {
      const errText = await ytRes.text();
      youtube = {
        youtubeLiveError: `YouTube API error: ${ytRes.statusText}`,
        details: errText
      };
    }

   // Jika tidak sedang live, ambil video terbaru
if (!youtube.youtubeLive) {
  const latestUrl =
    `https://www.googleapis.com/youtube/v3/search?part=snippet` +
    `&channelId=${ytChannelId}` +
    `&order=date&type=video&maxResults=1&key=${ytApiKey}`;
  
  const latestRes = await fetch(latestUrl);
  if (latestRes.ok) {
    const l = await latestRes.json();
    if (l.items?.length) {
      const v = l.items[0];
      youtube.latestVideoId = v.id.videoId;
      youtube.latestVideoTitle = v.snippet.title;
      youtube.channelTitle = v.snippet.channelTitle;
      youtube.youtubeLive = false;
    }
  }
}


    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");

    res.status(200).json({
      ...gasData,
      youtube
    });

  } catch (err) {
    res.status(500).json({
      error: "Gagal fetch data",
      detail: err.message
    });
  }
}

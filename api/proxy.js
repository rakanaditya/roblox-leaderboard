
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const allowedParams = ["placeIds", "ytLive"]; // Tambah parameter yang kamu izinkan
  const searchParams = new URLSearchParams();

  for (const key of allowedParams) {
    if (req.query[key]) {
      searchParams.append(key, req.query[key]);
    }
  }

  const targetURL = `https://script.google.com/macros/s/AKfycbyk3W-3rLAzMifmbYH0GF8CXsh9afHS8wJ9gZch2SZ7447M2FDKXsqr9CDk_588PrDRyg/exec?${searchParams.toString()}`;

  try {
    const response = await fetch(targetURL);
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return res.status(502).json({
        error: "Invalid response from Google Apps Script",
        status: response.status,
        contentType,
      });
    }

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: "Proxy gagal fetch",
      detail: err.message,
    });
  }
}
roblox-leaderboard – Logs – Vercel
20kB
0

export default async function handler(req, res) {
  const baseUrl = process.env.COUNT_TOKEN;
  const secret = process.env.VISITOR_SECRET_TOKEN || "RAHASIA123";

  if (!baseUrl) {
    return res.status(500).json({ error: "COUNT_TOKEN tidak tersedia." });
  }

  const fullUrl = `${baseUrl}?token=${secret}`;

  try {
    const response = await fetch(fullUrl);
    const contentType = response.headers.get("content-type");

    if (!response.ok || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text}`);
    }

    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: "Gagal mengambil visitor count",
      detail: err.message,
    });
  }
}

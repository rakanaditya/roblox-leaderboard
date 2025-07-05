export default async function handler(req, res) {
  const baseUrl = process.env.COUNT_TOKEN;
  const token = process.env.VISITOR_SECRET_TOKEN;

  if (!baseUrl || !token) {
    return res.status(500).json({ error: "COUNT_TOKEN atau VISITOR_SECRET_TOKEN tidak tersedia." });
  }

  const url = `${baseUrl}?token=${token}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);
  } catch (err) {
    console.error("Gagal fetch visitor count:", err);
    return res.status(500).json({ error: "Gagal mengambil visitor count", detail: err.message });
  }
}

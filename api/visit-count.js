export default async function handler(req, res) {
  const baseUrl = process.env.COUNT_TOKEN;
  const token = "COUNTVISIT123";

  if (!baseUrl) {
    return res.status(500).json({ error: "COUNT_TOKEN belum tersedia di environment." });
  }

  const url = `${baseUrl}?token=${token}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(200).json(data);
    } catch (parseError) {
      return res.status(500).json({ error: "Gagal parse JSON", raw: text });
    }

  } catch (err) {
    return res.status(500).json({ error: "Gagal mengambil visitor count", detail: err.message });
  }
}

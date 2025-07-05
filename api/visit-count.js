export default async function handler(req, res) {
  const url = process.env.COUNT_TOKEN;
  if (!url) {
    return res.status(500).json({ error: "COUNT_TOKEN belum tersedia di environment." });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);
  } catch (err) {
    console.error("Gagal fetch data dari GAS:", err);
    return res.status(500).json({ error: "Gagal mengambil visitor count", detail: err.message });
  }
}

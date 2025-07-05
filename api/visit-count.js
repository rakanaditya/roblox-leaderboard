export default async function handler(req, res) {
  const baseUrl = process.env.COUNT_TOKEN;
  const token = "COUNTVISIT123"; // Sama persis dengan yang di GAS kamu

  if (!baseUrl) {
    return res.status(500).json({ error: "COUNT_TOKEN belum tersedia di environment." });
  }

  const url = `${baseUrl}?token=${token}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // Coba parse JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: "Response bukan JSON", raw: text });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);

  } catch (err) {
    console.error("Fetch gagal:", err);
    return res.status(500).json({ error: "Gagal mengambil visitor count", detail: err.message });
  }
}

// api/visit-count.js
export default async function handler(req, res) {
const token = process.env.VISITOR_SECRET_TOKEN || "COUNTVISIT123";
const url = `${process.env.COUNT_TOKEN}?token=${token}`;
  if (!url) {
    return res.status(500).json({ error: "COUNT_TOKEN belum tersedia di environment." });
  }

  try {
    const response = await fetch(`${url}?token=${process.env.COUNT_SECRET}`);
    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);
  } catch (err) {
    console.error("Gagal fetch data dari GAS:", err);
    return res.status(500).json({ error: "Gagal mengambil visitor count", detail: err.message });
  }
}

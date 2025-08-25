const express = require("express");
const app = express();
app.use(express.json());

let playerStats = {}; // simpan sementara di memory

// endpoint simpan data dari Roblox
app.post("/savestats", (req, res) => {
  const { userId, username, points, survivals } = req.body;
  playerStats[userId] = { username, points, survivals };
  res.json({ status: "ok", userId, username });
});

// endpoint ambil data
app.get("/getstats/:username", (req, res) => {
  const username = req.params.username;
  const data = Object.values(playerStats).find(p => p.username.toLowerCase() === username.toLowerCase());
  if (data) {
    res.json(data);
  } else {
    res.json({ error: "not found" });
  }
});

app.listen(3000, () => console.log("🌐 API running on port 3000"));

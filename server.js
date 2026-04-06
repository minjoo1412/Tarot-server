require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});

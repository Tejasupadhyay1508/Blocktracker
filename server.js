const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Welcome to BlockTracker. All AI calls now happen directly from the client.");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

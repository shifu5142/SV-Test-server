require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const { generateText, gateway } = require("ai");
const { v4: uuidv4 } = require("uuid");
const movieSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅Connected to MongoDB");
  })
  .catch((err) => {
    console.log(`❌ ${err}`);
  });
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.post("/add-movie", async (req, res) => {
  try {
    const { name, genre, description } = req.body || {};

    if (!name || !genre || !description) {
      return res.status(400).json({
        error: "name, genre, and description are required",
      });
    }

    const movie = await Movie.create({
      id: uuidv4(),
      name: name.trim(),
      genre: genre.trim(),
      description: description.trim(),
    });

    return res.status(201).json({
      message: "Movie added successfully",
      movie,
    });
  } catch (error) {
    console.error("add-movie error:", error);
    return res.status(500).json({
      error: "Failed to add movie",
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅Server running at http://localhost:${PORT}/`);
});

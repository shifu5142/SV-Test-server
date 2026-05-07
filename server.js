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
      success: true,
      movie,
    });
  } catch (error) {
    console.error("add-movie error:", error);
    return res.status(500).json({
      error: "Failed to add movie",
      success: false,
    });
  }
});

app.get("/all-movies", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error("get-movies error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch movies",
    });
  }
});

app.get("/search-movie", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });//אני יודע בודק לפי סדר של יצירה
    return res.status(200).json(movies);
  } catch (error) {
    console.error("search-movie error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch movies",
    });
  }
});

app.delete("/delete-movie", async (req, res) => {
  try {
    const { movieId } = req.body || {};

    if (!movieId) {
      return res.status(400).json({
        success: false,
        error: "movieId is required",
      });
    }

    const deletedMovie = await Movie.findByIdAndDelete(movieId);

    if (!deletedMovie) {
      return res.status(404).json({
        success: false,
        error: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
      deletedMovie,
    });
  } catch (error) {
    console.error("delete-movie error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete movie",
    });
  }
});



app.listen(PORT, () => {
  console.log(`✅Server running at http://localhost:${PORT}/`);
});

"use client";

import React, { useState, useEffect } from "react";
import { Film } from "lucide-react";

const TMDB_API_KEY = "5792c693eccc10a144cad3c08930ecdb"; // 🔑 Put your TMDB key here

export default function MovieTracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [person1Movies, setPerson1Movies] = useState([]);
  const [person2Movies, setPerson2Movies] = useState([]);
  const [compatibilityData, setCompatibilityData] = useState({});
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);

  // -------------------------
  // Fetch Movies
  // -------------------------
  const fetchMovies = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          searchQuery
        )}`
      );

      const data = await res.json();
      setMovies(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      console.error("TMDB error:", err);
      setMovies([]);
    }

    setLoading(false);
  };

  // -------------------------
  // Add Movie To Person
  // -------------------------
  const addMovie = (movie, person) => {
    if (person === 1) {
      setPerson1Movies((prev) => [...prev, movie]);
    } else {
      setPerson2Movies((prev) => [...prev, movie]);
    }
  };

  // -------------------------
  // Compatibility Logic
  // -------------------------
  const calculateCompatibility = (movie) => {
    const g1 = person1Movies.flatMap((m) => m.genre_ids || []);
    const g2 = person2Movies.flatMap((m) => m.genre_ids || []);
    const movieGenres = movie.genre_ids || [];

    if (movieGenres.length === 0) return 0;

    const shared = movieGenres.filter(
      (g) => g1.includes(g) && g2.includes(g)
    ).length;

    return Math.round((shared / movieGenres.length) * 100);
  };

  const explainRecommendation = (movie) => {
    const g1 = person1Movies.flatMap((m) => m.genre_ids || []);
    const g2 = person2Movies.flatMap((m) => m.genre_ids || []);
    const movieGenres = movie.genre_ids || [];

    const shared = movieGenres.filter(
      (g) => g1.includes(g) && g2.includes(g)
    ).length;

    if (shared > 0) return `Matches both tastes (${shared} shared genres)`;
    if (g1.some((g) => movieGenres.includes(g)))
      return "Matches Person 1 taste";
    if (g2.some((g) => movieGenres.includes(g)))
      return "Matches Person 2 taste";

    return "New genre for both";
  };

  // -------------------------
  // Mock Streaming Availability (safe — no CORS)
  // -------------------------
  const mockAvailability = (movieId) => {
    const providers = ["Netflix", "Prime", "Hulu", "Disney+", "Max"];
    const pick = providers[Math.floor(Math.random() * providers.length)];

    setAvailability((prev) => ({
      ...prev,
      [movieId]: pick,
    }));
  };

  // -------------------------
  // Effects
  // -------------------------
  useEffect(() => {
    const map = {};

    movies.forEach((m) => {
      map[m.id] = calculateCompatibility(m);

      if (!availability[m.id]) {
        mockAvailability(m.id);
      }
    });

    setCompatibilityData(map);
  }, [movies, person1Movies, person2Movies]);

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 flex gap-2 items-center">
        <Film /> MovieMatch Tracker
      </h1>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <input
          className="border p-3 rounded w-full"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button
          onClick={fetchMovies}
          className="bg-blue-600 text-white px-5 rounded"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading movies...</p>}

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="border rounded-lg p-4 shadow hover:shadow-xl transition"
          >
            <h2 className="font-semibold text-lg">{movie.title}</h2>

            <p className="text-sm mt-1">
              {explainRecommendation(movie)}
            </p>

            <p className="text-sm font-bold mt-1">
              Compatibility: {compatibilityData[movie.id] || 0}%
            </p>

            <p className="text-sm italic mt-1">
              Streaming: {availability[movie.id] || "Checking..."}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => addMovie(movie, 1)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Add Person 1
              </button>

              <button
                onClick={() => addMovie(movie, 2)}
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
              >
                Add Person 2
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

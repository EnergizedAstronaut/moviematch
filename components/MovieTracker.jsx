"use client";

import React, { useState, useEffect } from "react";
import { Film } from "lucide-react";

const TMDB_API_KEY = "5792c693eccc10a144cad3c08930ecdb";
const JUSTWATCH_API = "https://apis.justwatch.com/content/titles/en_US/popular";

const MovieTracker = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [person1Movies, setPerson1Movies] = useState([]);
  const [person2Movies, setPerson2Movies] = useState([]);
  const [compatibilityData, setCompatibilityData] = useState({});
  const [loading, setLoading] = useState(false);
  const [justWatchData, setJustWatchData] = useState({}); // New state

  // Fetch movies from TMDB
  const fetchMovies = async (query) => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setMovies(data.results || []);
    } catch (err) {
      console.error("TMDB fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate compatibility %
  const calculateCompatibility = (movie) => {
    const p1Genres = person1Movies.map((m) => m.genre_ids).flat();
    const p2Genres = person2Movies.map((m) => m.genre_ids).flat();
    const shared = movie.genre_ids?.filter((g) => p1Genres.includes(g) && p2Genres.includes(g)).length || 0;
    const total = movie.genre_ids?.length || 1;
    return Math.round((shared / total) * 100);
  };

  // Generate recommendation explanation
  const whyRecommended = (movie) => {
    const p1Genres = person1Movies.map((m) => m.genre_ids).flat();
    const p2Genres = person2Movies.map((m) => m.genre_ids).flat();
    const sharedGenres = movie.genre_ids?.filter((g) => p1Genres.includes(g) && p2Genres.includes(g)) || [];
    if (sharedGenres.length > 0) return `Matches both your tastes in ${sharedGenres.length} genre(s)`;
    return "Matches at least one of your tastes";
  };

  // Fetch JustWatch availability for a single movie
  const fetchJustWatchAvailability = async (title, movieId) => {
    try {
      const res = await fetch(`${JUSTWATCH_API}?query=${encodeURIComponent(title)}`);
      const data = await res.json();
      const offers = data.items?.[0]?.offers?.map((o) => o.provider_id) || [];
      setJustWatchData((prev) => ({ ...prev, [movieId]: offers.join(", ") || "Not available" }));
    } catch (err) {
      console.error("JustWatch fetch error:", err);
      setJustWatchData((prev) => ({ ...prev, [movieId]: "Unknown" }));
    }
  };

  // Handle movie selection
  const addMovieToPerson = (movie, person) => {
    if (person === 1) setPerson1Movies([...person1Movies, movie]);
    else setPerson2Movies([...person2Movies, movie]);
  };

  // Update compatibility whenever lists or movies change
  useEffect(() => {
    const compData = {};
    movies.forEach((m) => {
      compData[m.id] = calculateCompatibility(m);
    });
    setCompatibilityData(compData);

    // Fetch JustWatch data for all movies
    movies.forEach((m) => {
      if (!justWatchData[m.id]) fetchJustWatchAvailability(m.title, m.id);
    });
  }, [person1Movies, person2Movies, movies]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Film /> MovieMatch Tracker
      </h1>

      {/* Search */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search movies..."
          className="border rounded p-2 flex-grow"
        />
        <button
          onClick={() => fetchMovies(searchQuery)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {/* Loading */}
      {loading && <p>Loading movies...</p>}

      {/* Movie Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <div key={movie.id} className="border rounded p-3 shadow hover:shadow-lg transition">
            <h2 className="font-semibold">{movie.title}</h2>
            <p className="text-sm">{whyRecommended(movie)}</p>
            <p className="text-sm font-bold">Compatibility: {compatibilityData[movie.id] || 0}%</p>
            <p className="text-sm italic">
              Streaming: {justWatchData[movie.id] || "Checking..."}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => addMovieToPerson(movie, 1)}
                className="bg-green-500 text-white px-2 py-1 rounded text-sm"
              >
                Add to Person 1
              </button>
              <button
                onClick={() => addMovieToPerson(movie, 2)}
                className="bg-purple-500 text-white px-2 py-1 rounded text-sm"
              >
                Add to Person 2
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieTracker;

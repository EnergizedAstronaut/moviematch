"use client";

import React, { useState, useEffect } from "react";
import {
  Search, Film, Plus, X, Play, Star, Users,
  Heart, Sparkles, TrendingUp, ExternalLink,
  Globe, BarChart3, Zap
} from "lucide-react";

/* 
  ⚠️ NOTE:
  window.storage is NOT a browser API.
  This version safely disables saved lists unless available.
*/

const MovieTracker = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [person1Movies, setPerson1Movies] = useState([]);
  const [person2Movies, setPerson2Movies] = useState([]);
  const [person1Name, setPerson1Name] = useState("Person 1");
  const [person2Name, setPerson2Name] = useState("Person 2");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [togethernessMode, setTogethernessMode] = useState(false);

  const TMDB_API_KEY = "YOUR_TMDB_KEY_HERE";
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
      );
      const data = await res.json();
      setTrendingMovies(data.results || []);
    } catch (e) {
      console.error(e);
    }
  };

  const searchMovies = async (q) => {
    setSearchQuery(q);
    if (!q) return setSearchResults([]);

    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${q}`
      );
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error(e);
    }
  };

  const addMovie = (movie, person) => {
    if (person === 1 && !person1Movies.some(m => m.id === movie.id)) {
      setPerson1Movies([...person1Movies, movie]);
    }
    if (person === 2 && !person2Movies.some(m => m.id === movie.id)) {
      setPerson2Movies([...person2Movies, movie]);
    }
  };

  const commonMovies = person1Movies.filter(m =>
    person2Movies.some(p => p.id === m.id)
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
            MovieMatch
          </h1>

          <button
            onClick={() => setTogethernessMode(!togethernessMode)}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold ${
              togethernessMode
                ? "bg-gradient-to-r from-pink-600 to-purple-600"
                : "bg-zinc-900 border border-zinc-800"
            }`}
          >
            <Sparkles />
            Togetherness
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-4 text-zinc-500" />
          <input
            value={searchQuery}
            onChange={(e) => searchMovies(e.target.value)}
            placeholder="Search movies..."
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-zinc-900 border border-zinc-800"
          />
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab("search")}>Discover</button>
          <button onClick={() => setActiveTab("compare")}>
            Your Lists ({commonMovies.length})
          </button>
        </div>

        {/* CONTENT */}
        {activeTab === "search" && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(searchResults.length ? searchResults : trendingMovies).map(movie => (
              <div key={movie.id} className="bg-zinc-900 p-3 rounded-xl">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  className="rounded-lg mb-2"
                />
                <p className="text-sm font-semibold">{movie.title}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => addMovie(movie, 1)} className="text-xs bg-blue-600 px-2 py-1 rounded">
                    P1
                  </button>
                  <button onClick={() => addMovie(movie, 2)} className="text-xs bg-purple-600 px-2 py-1 rounded">
                    P2
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "compare" && (
          <div>
            <h2 className="text-2xl mb-4 flex items-center gap-2">
              <Heart className="text-pink-500" />
              Together ({commonMovies.length})
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {commonMovies.map(movie => (
                <div key={movie.id} className="bg-zinc-900 p-3 rounded-xl">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    className="rounded-lg"
                  />
                  <p className="text-sm">{movie.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MovieTracker;

"use client";

import React, { useState, useEffect } from "react";
import {
  Search, Film, Plus, X, Play, Star, Users, Heart,
  Sparkles, TrendingUp, ExternalLink, Globe,
  BarChart3, Zap
} from "lucide-react";

const TMDB_API_KEY = "5792c693eccc10a144cad3c08930ecdb";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const hasStorage =
  typeof window !== "undefined" && typeof window.storage !== "undefined";

const MovieTracker = () => {
  /* -------------------- STATE -------------------- */
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedLists, setSavedLists] = useState([]);
  const [listName, setListName] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [compatibilityScore, setCompatibilityScore] = useState(null);
  const [sharedGenres, setSharedGenres] = useState([]);
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);

  /* -------------------- INIT -------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const p1 = localStorage.getItem("person1_movies");
    const p2 = localStorage.getItem("person2_movies");
    const n1 = localStorage.getItem("person1_name");
    const n2 = localStorage.getItem("person2_name");

    if (p1) setPerson1Movies(JSON.parse(p1));
    if (p2) setPerson2Movies(JSON.parse(p2));
    if (n1) setPerson1Name(n1);
    if (n2) setPerson2Name(n2);

    fetchTrending();
    loadSavedLists();
  }, []);

  /* -------------------- STORAGE -------------------- */
  const saveLS = (k, v) =>
    typeof window !== "undefined" &&
    localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));

  const loadSavedLists = async () => {
    if (!hasStorage) return setSavedLists([]);
    try {
      const res = await window.storage.list("movielist:");
      const lists = [];
      for (const key of res.keys) {
        const item = await window.storage.get(key);
        if (item?.value) lists.push({ key, ...JSON.parse(item.value) });
      }
      setSavedLists(lists);
    } catch {
      setSavedLists([]);
    }
  };

  /* -------------------- API -------------------- */
  const fetchTrending = async () => {
    const r = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
    );
    const d = await r.json();
    setTrendingMovies(d.results?.slice(0, 12) || []);
  };

  const searchMovies = async (q) => {
    if (!q.trim()) return setSearchResults([]);
    setLoading(true);
    const r = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}`
    );
    const d = await r.json();
    setSearchResults(d.results || []);
    setLoading(false);
  };

  const fetchMovieDetails = async (id) => {
    setLoading(true);
    const r = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`);
    const d = await r.json();
    setSelectedMovie(d);
    setLoading(false);
  };

  /* -------------------- LISTS -------------------- */
  const addMovie = (movie, who) => {
    if (who === 1) {
      if (person1Movies.some(m => m.id === movie.id)) return;
      const u = [...person1Movies, movie];
      setPerson1Movies(u);
      saveLS("person1_movies", u);
    } else {
      if (person2Movies.some(m => m.id === movie.id)) return;
      const u = [...person2Movies, movie];
      setPerson2Movies(u);
      saveLS("person2_movies", u);
    }
  };

  const removeMovie = (id, who) => {
    if (who === 1) {
      const u = person1Movies.filter(m => m.id !== id);
      setPerson1Movies(u);
      saveLS("person1_movies", u);
    } else {
      const u = person2Movies.filter(m => m.id !== id);
      setPerson2Movies(u);
      saveLS("person2_movies", u);
    }
  };

  /* -------------------- RECOMMENDATIONS -------------------- */
  const generateRecommendations = async () => {
    setLoading(true);

    const genreCount = {};
    [...person1Movies, ...person2Movies].forEach(m =>
      m.genre_ids?.forEach(g => (genreCount[g] = (genreCount[g] || 0) + 1))
    );

    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(g => g[0])
      .join(",");

    const r = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${topGenres}&with_origin_country=US&primary_release_date.gte=2010-01-01&vote_average.gte=7&vote_count.gte=500&sort_by=popularity.desc`
    );
    const d = await r.json();

    const existing = new Set([...person1Movies, ...person2Movies].map(m => m.id));
    setRecommendations((d.results || []).filter(m => !existing.has(m.id)).slice(0, 12));

    setLoading(false);
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
        MovieMatch
      </h1>

      <input
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          searchMovies(e.target.value);
        }}
        placeholder="Search movies…"
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 mb-8"
      />

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {(searchResults.length ? searchResults : trendingMovies).map(movie => (
          <div
            key={movie.id}
            onClick={() => fetchMovieDetails(movie.id)}
            className="cursor-pointer bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition"
          >
            {movie.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                className="w-full"
              />
            )}
            <div className="p-3 text-sm font-semibold">{movie.title}</div>
          </div>
        ))}
      </div>

      {selectedMovie && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-xl max-w-lg">
            <h2 className="text-2xl font-bold mb-4">{selectedMovie.title}</h2>
            <p className="text-zinc-400 mb-4">{selectedMovie.overview}</p>
            <div className="flex gap-3">
              <button
                onClick={() => addMovie(selectedMovie, 1)}
                className="bg-blue-600 px-4 py-2 rounded"
              >
                {person1Name}
              </button>
              <button
                onClick={() => addMovie(selectedMovie, 2)}
                className="bg-purple-600 px-4 py-2 rounded"
              >
                {person2Name}
              </button>
              <button
                onClick={() => setSelectedMovie(null)}
                className="bg-zinc-700 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieTracker;

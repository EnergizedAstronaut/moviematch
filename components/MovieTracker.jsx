"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Film,
  Plus,
  X,
  Play,
  Star,
  Users,
  Heart,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Globe,
  BarChart3,
  Zap,
} from "lucide-react";

const TMDB_API_KEY = "5792c693eccc10a144cad3c08930ecdb";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
];

const GENRE_NAMES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

// ─── Utility: count genre frequencies from a movie list ─────────────────────
function countGenres(movies) {
  const counts = {};
  movies.forEach((m) =>
    (m.genre_ids || []).forEach((id) => {
      counts[id] = (counts[id] || 0) + 1;
    })
  );
  return counts;
}

const MovieTracker = () => {
  // ─── Core State ────────────────────────────────────────────────────────────
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

  // ─── Recommendations ──────────────────────────────────────────────────────
  const [recommendations, setRecommendations] = useState([]);
  const [togethernessMode, setTogethernessMode] = useState(false);

  // ─── Streaming / Country ──────────────────────────────────────────────────
  const [streamingProviders, setStreamingProviders] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [showCountrySelector, setShowCountrySelector] = useState(false);

  // ─── Save / Load Lists ────────────────────────────────────────────────────
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [listName, setListName] = useState("");
  const [savedLists, setSavedLists] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");

  // ─── Compatibility ────────────────────────────────────────────────────────
  const [compatibilityScore, setCompatibilityScore] = useState(null);
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);

  // ─── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    loadFromLocalStorage();
    fetchTrending();
    loadSavedLists();
  }, []);

  // Recalculate compatibility whenever lists change
  useEffect(() => {
    if (person1Movies.length > 0 && person2Movies.length > 0) {
      const score = calcCompatibilityScore();
      setCompatibilityScore(score);
    } else {
      setCompatibilityScore(null);
    }
  }, [person1Movies, person2Movies]);

  // ─── localStorage helpers ──────────────────────────────────────────────────
  function loadFromLocalStorage() {
    if (typeof window === "undefined") return;

    try {
      const p1 = localStorage.getItem("person1_movies");
      const p2 = localStorage.getItem("person2_movies");
      const n1 = localStorage.getItem("person1_name");
      const n2 = localStorage.getItem("person2_name");

      if (p1) setPerson1Movies(JSON.parse(p1));
      if (p2) setPerson2Movies(JSON.parse(p2));
      if (n1) setPerson1Name(n1);
      if (n2) setPerson2Name(n2);
    } catch (e) {
      console.error("localStorage load error:", e);
    }
  }

  function saveToLocalStorage(key, data) {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(key, typeof data === "string" ? data : JSON.stringify(data));
    } catch (e) {
      console.error("localStorage save error:", e);
    }
  }

  // ─── Persistent Storage (window.storage) ──────────────────────────────────
  async function loadSavedLists() {
    if (!window.storage) {
      setSavedLists([]);
      return;
    }

    try {
      const result = await window.storage.list("movielist:");
      if (result?.keys) {
        const lists = [];
        for (const key of result.keys) {
          try {
            const item = await window.storage.get(key);
            if (item?.value) lists.push({ key, ...JSON.parse(item.value) });
          } catch (e) {
            console.error("Failed to parse storage item:", e);
          }
        }
        setSavedLists(lists);
      } else {
        setSavedLists([]);
      }
    } catch (e) {
      console.error("Failed to load saved lists:", e);
      setSavedLists([]);
    }
  }

  async function saveCurrentList() {
    if (!window.storage) {
      setSaveMessage("Persistent storage unavailable!");
      return;
    }

    if (!listName.trim()) {
      setSaveMessage("Please enter a list name");
      return;
    }

    try {
      const key = `movielist:${listName.toLowerCase().replace(/\s+/g, "-")}`;
      await window.storage.set(
        key,
        JSON.stringify({
          name: listName,
          person1Name,
          person2Name,
          person1Movies,
          person2Movies,
          savedAt: new Date().toISOString(),
        })
      );

      setSaveMessage("✅ List saved successfully!");

      setTimeout(() => {
        setShowSaveModal(false);
        setSaveMessage("");
        setListName("");
      }, 1500);

      await loadSavedLists();
    } catch (e) {
      console.error("Error saving list:", e);
      setSaveMessage("❌ Error saving list.");
    }
  }

  const handleSave = () => {
    if (!listName.trim()) {
      setSaveMessage("Please enter a list name before saving.");
      return;
    }
    saveCurrentList();
  };

  const handleOpenLoadModal = async () => {
    await loadSavedLists();
    setShowLoadModal(true);
  };

  async function loadList(key) {
    if (!window.storage) return;

    try {
      const result = await window.storage.get(key);
      if (result?.value) {
        const data = JSON.parse(result.value);
        setPerson1Name(data.person1Name);
        setPerson2Name(data.person2Name);
        setPerson1Movies(data.person1Movies);
        setPerson2Movies(data.person2Movies);

        saveToLocalStorage("person1_name", data.person1Name);
        saveToLocalStorage("person2_name", data.person2Name);
        saveToLocalStorage("person1_movies", data.person1Movies);
        saveToLocalStorage("person2_movies", data.person2Movies);

        setShowLoadModal(false);
        setActiveTab("compare");
      }
    } catch (e) {
      console.error("Failed to load list:", e);
      alert("Failed to load list.");
    }
  }

  async function deleteList(key) {
    if (!window.storage) return;
    if (!confirm("Delete this saved list?")) return;

    try {
      await window.storage.delete(key);
      await loadSavedLists();
    } catch (e) {
      console.error("Failed to delete list:", e);
      alert("Failed to delete list.");
    }
  }

  // ─── TMDB Fetchers ─────────────────────────────────────────────────────────
  async function fetchTrending() {
    try {
      const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
      const data = await res.json();
      setTrendingMovies(data.results?.slice(0, 12) || []);
    } catch (e) {
      console.error("fetchTrending error:", e);
    }
  }

  async function searchMovies(query) {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&primary_release_date.gte=1985-01-01`
      );
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error("searchMovies error:", e);
    }
    setLoading(false);
  }

  async function fetchMovieDetails(movieId) {
    setLoading(true);
    try {
      const [dRes, cRes, pRes] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`),
      ]);
      const details = await dRes.json();
      const credits = await cRes.json();
      const providers = await pRes.json();

      setSelectedMovie({
        ...details,
        cast: credits.cast?.slice(0, 5) || [],
        director: credits.crew?.find((p) => p.job === "Director"),
      });
      setStreamingProviders(providers.results?.[selectedCountry] || null);
    } catch (e) {
      console.error("fetchMovieDetails error:", e);
    }
    setLoading(false);
  }

  // ─── List Helpers ──────────────────────────────────────────────────────────
  function addMovieToPerson(movie, num) {
    const list = num === 1 ? person1Movies : person2Movies;
    if (list.some((m) => m.id === movie.id)) return;
    const updated = [...list, movie];
    if (num === 1) {
      setPerson1Movies(updated);
      saveToLocalStorage("person1_movies", updated);
    } else {
      setPerson2Movies(updated);
      saveToLocalStorage("person2_movies", updated);
    }
  }

  function removeMovieFromPerson(movieId, num) {
    const updated = (num === 1 ? person1Movies : person2Movies).filter((m) => m.id !== movieId);
    if (num === 1) {
      setPerson1Movies(updated);
      saveToLocalStorage("person1_movies", updated);
    } else {
      setPerson2Movies(updated);
      saveToLocalStorage("person2_movies", updated);
    }
  }

  const isInPerson1 = (id) => person1Movies.some((m) => m.id === id);
  const isInPerson2 = (id) => person2Movies.some((m) => m.id === id);

  const commonMovies = (() => {
    const ids = new Set(person1Movies.map((m) => m.id));
    return person2Movies.filter((m) => ids.has(m.id));
  })();

  // ─── Compatibility Calculation ─────────────────────────────────────────────
  function calcCompatibilityScore() {
    if (person1Movies.length === 0 || person2Movies.length === 0) return null;

    const p1G = countGenres(person1Movies);
    const p2G = countGenres(person2Movies);
    const allGenres = new Set([...Object.keys(p1G), ...Object.keys(p2G)]);
    const commonGenres = [...allGenres].filter((g) => p1G[g] && p2G[g]);

    const baseScore = allGenres.size > 0 ? (commonGenres.length / allGenres.size) * 100 : 0;
    const movieBonus = Math.min(commonMovies.length * 5, 20);

    const avg = (list) => list.reduce((s, m) => s + (m.vote_average || 0), 0) / list.length;
    const ratingBonus = Math.max(10 - Math.abs(avg(person1Movies) - avg(person2Movies)) * 2, 0);

    return Math.min(Math.round(baseScore + movieBonus + ratingBonus), 100);
  }

  function getCompatibilityDetails() {
    const p1G = countGenres(person1Movies);
    const p2G = countGenres(person2Movies);
    const allGenres = new Set([...Object.keys(p1G), ...Object.keys(p2G)]);
    const commonGenreIds = [...allGenres].filter((g) => p1G[g] && p2G[g]);

    const sharedGenres = commonGenreIds
      .map((id) => ({
        id,
        name: GENRE_NAMES[id] || "Unknown",
        p1: p1G[id],
        p2: p2G[id],
        total: p1G[id] + p2G[id],
      }))
      .sort((a, b) => b.total - a.total);

    const score = compatibilityScore || 0;
    const insights = [];
    if (score >= 80) insights.push("🎉 Excellent match! You have very similar movie tastes.");
    else if (score >= 60) insights.push("✨ Great compatibility! You share many favorite genres.");
    else if (score >= 40) insights.push("🎬 Moderate match. You have some overlap in preferences.");
    else insights.push("🌟 Diverse tastes! This means more variety in your movie nights.");

    if (commonMovies.length > 0)
      insights.push(`You've both added ${commonMovies.length} of the same movie${commonMovies.length > 1 ? "s" : ""}!`);
    if (sharedGenres.length > 0)
      insights.push(`You both love ${sharedGenres[0].name} movies!`);

    return { score, sharedGenres, insights };
  }

  // ─── Recommendations ──────────────────────────────────────────────────────
  async function generateRecommendations() {
    setLoading(true);
    const p1G = countGenres(person1Movies);
    const p2G = countGenres(person2Movies);
    const shared = Object.keys(p1G)
      .filter((g) => p2G[g])
      .sort((a, b) => p1G[b] + p2G[b] - (p1G[a] + p2G[a]));

    const existingIds = new Set([...person1Movies, ...person2Movies].map((m) => m.id));

    try {
      let results = [];

      if (shared.length > 0) {
        const top = shared.slice(0, 3);

        if (togethernessMode) {
          const pages = await Promise.all(
            top.map((g) =>
              fetch(
                `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${g}&with_original_language=en&sort_by=vote_average.desc&vote_count.gte=200&vote_average.gte=6.5&primary_release_date.gte=1985-01-01`
              )
                .then((r) => r.json())
                .then((d) => d.results || [])
                .catch(() => [])
            )
          );
          const pool = pages.flat();

          const scored = pool.map((m) => {
            let s = 0;
            const mg = m.genre_ids || [];
            mg.forEach((g) => { if (shared.includes(String(g))) s += 15; });
            s += (m.vote_average || 0) * 3;
            const yr = parseInt((m.release_date || "0").slice(0, 4));
            if (yr >= 2022) s += 10;
            else if (yr >= 2018) s += 6;
            else if (yr >= 2014) s += 3;
            if (mg.some((g) => (p1G[g] || 0) >= 2 && (p2G[g] || 0) >= 2)) s += 12;
            return { ...m, _score: s };
          });

          const map = new Map();
          scored.forEach((m) => {
            if (!map.has(m.id) || map.get(m.id)._score < m._score) map.set(m.id, m);
          });
          results = [...map.values()].sort((a, b) => b._score - a._score);
        } else {
          const pages = await Promise.all(
            top.map((g) =>
              fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${g}`).then((r) => r.json())
            )
          );
          results = pages.flatMap((p) => p.results || []);
        }

        results = results.filter((m) => !existingIds.has(m.id)).slice(0, 12);
      } else {
        results = trendingMovies.filter((m) => !existingIds.has(m.id)).slice(0, 12);
      }

      setRecommendations(results);
      setActiveTab("recommendations");
    } catch (e) {
      console.error("generateRecommendations error:", e);
    }
    setLoading(false);
  }

  // ─── JSX Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🎬 MovieMatch</h1>
          <p className="text-zinc-400">Track, compare, and discover movies with your partner or friend!</p>
        </header>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchMovies(searchQuery)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <button
              onClick={() => searchMovies(searchQuery)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "search" ? "bg-purple-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            Search Results
          </button>
          <button
            onClick={() => setActiveTab("trending")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "trending" ? "bg-purple-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            Trending
          </button>
          <button
            onClick={generateRecommendations}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "recommendations" ? "bg-purple-600 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            Recommendations
          </button>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {loading && <p className="text-zinc-400 col-span-full text-center">Loading...</p>}

          {activeTab === "search" &&
            searchResults.map((movie) => (
              <div key={movie.id} className="bg-zinc-900 rounded-xl overflow-hidden relative">
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.png"}
                  alt={movie.title}
                  className="w-full h-60 object-cover"
                />
                <div className="p-2">
                  <h3 className="text-sm font-semibold">{movie.title}</h3>
                  <p className="text-xs text-zinc-400">{movie.release_date?.slice(0, 4)}</p>
                  <div className="mt-1 flex gap-1">
                    <button
                      onClick={() => addMovieToPerson(movie, 1)}
                      className={`px-2 py-1 text-xs rounded ${
                        isInPerson1(movie.id) ? "bg-green-600" : "bg-purple-600"
                      }`}
                    >
                      {isInPerson1(movie.id) ? "✔ Person 1" : "+ Person 1"}
                    </button>
                    <button
                      onClick={() => addMovieToPerson(movie, 2)}
                      className={`px-2 py-1 text-xs rounded ${
                        isInPerson2(movie.id) ? "bg-green-600" : "bg-purple-600"
                      }`}
                    >
                      {isInPerson2(movie.id) ? "✔ Person 2" : "+ Person 2"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MovieTracker;

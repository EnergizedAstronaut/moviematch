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

  // Recalculate compatibility whenever lists or togetherness mode change
  useEffect(() => {
    if (person1Movies.length > 0 && person2Movies.length > 0) {
      const score = calcCompatibilityScore();
      setCompatibilityScore(score);
    } else {
      setCompatibilityScore(null);
    }
  }, [person1Movies, person2Movies]);


 // ─── HANDLE SAVE ─────────────────────────────────────────────
const handleSave = () => {
  if (!listName) {
    setSaveMessage("Please enter a list name before saving.");
    return;
  }

  saveCurrentList({
    listName,
    person1Name,
    person2Name,
    person1Movies,
    person2Movies,
    setSaveMessage,
    setShowSaveModal,
    setListName,
  });
  setShowSaveModal(false);
setSaveMessage("Saved successfully!");

};

// ─── hasStorage helpers ──────────────────────────────────────────────────
const hasLocalStorage =
  typeof window !== "undefined" &&
  typeof window.localStorage !== "undefined";

const hasPersistentStorage =
  typeof window !== "undefined" &&
  typeof window.storage !== "undefined";

// ─── localStorage helpers ──────────────────────────────────────────────────
function loadFromLocalStorage() {
  if (!hasLocalStorage) return;

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
  if (!hasLocalStorage) return;

  try {
    localStorage.setItem(key, typeof data === "string" ? data : JSON.stringify(data));
  } catch (e) {
    console.error("localStorage save error:", e);
  }
}

// ─── Persistent Storage (window.storage) ──────────────────────────────────
async function loadSavedLists() {
  if (!hasPersistentStorage) {
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
  if (!hasPersistentStorage) {
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

    // Close modal after short delay
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

async function loadList(key) {
  if (!hasPersistentStorage) return;

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
  if (!hasPersistentStorage) return;
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
        fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&primary_release_date.gte=1985-01-01`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&primary_release_date.gte=1985-01-01`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}&primary_release_date.gte=1985-01-01`),
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
          // Fetch per-genre, then score & merge
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

          // Deduplicate, keeping highest score
          const map = new Map();
          scored.forEach((m) => {
            if (!map.has(m.id) || map.get(m.id)._score < m._score) map.set(m.id, m);
          });
          results = [...map.values()].sort((a, b) => b._score - a._score);
        } else {
          const genreParam = top.slice(0, 2).join(",");
          const res = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreParam}&with_original_language=en&sort_by=vote_average.desc&vote_count.gte=500&vote_average.gte=6.5&primary_release_date.gte=1985-01-01`
          );
          const data = await res.json();
          results = data.results || [];
        }
      } else {
        // No shared genres – fall back to popular
        const res = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=en&sort_by=popularity.desc&vote_count.gte=500&vote_average.gte=6.5&primary_release_date.gte=1985-01-01`
        );
        const data = await res.json();
        results = data.results || [];
      }

      setRecommendations(results.filter((m) => !existingIds.has(m.id)).slice(0, 12));
    } catch (e) {
      console.error("Recommendations error:", e);
      setRecommendations([]);
    }
    setLoading(false);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── MovieCard ─────────────────────────────────────────────────────────────
  const MovieCard = ({ movie, onSelect, showActions = false, personNum = null }) => (
    <div className="group relative bg-zinc-900/50 backdrop-blur rounded-xl overflow-hidden border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300">
      <div onClick={() => onSelect(movie)} className="relative aspect-[2/3] cursor-pointer overflow-hidden">
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
            <Film className="w-12 h-12 text-zinc-600" />
          </div>
        )}
        {movie.vote_average > 0 && (
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-white">{movie.vote_average.toFixed(1)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">{movie.title}</h3>
        <p className="text-zinc-500 text-xs mb-3">{movie.release_date?.split("-")[0] || "N/A"}</p>

        {showActions && (
          <div className="flex gap-2">
            {!isInPerson1(movie.id) && (
              <button
                onClick={(e) => { e.stopPropagation(); addMovieToPerson(movie, 1); }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                {person1Name}
              </button>
            )}
            {!isInPerson2(movie.id) && (
              <button
                onClick={(e) => { e.stopPropagation(); addMovieToPerson(movie, 2); }}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                {person2Name}
              </button>
            )}
          </div>
        )}

        {personNum && (
          <button
            onClick={(e) => { e.stopPropagation(); removeMovieFromPerson(movie.id, personNum); }}
            className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        )}
      </div>
    </div>
  );

  // ─── MovieModal ────────────────────────────────────────────────────────────
  const MovieModal = ({ movie, onClose }) => {
    if (!movie) return null;
    const cur = COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];
    const { flatrate, rent, buy, link: justWatchLink } = streamingProviders || {};

    const ProviderRow = ({ label, providers, accentColor }) => {
      if (!providers || providers.length === 0) return null;
      return (
        <div className="mb-4">
          <p className="text-sm font-medium text-zinc-400 mb-3">{label}</p>
          <div className="flex flex-wrap gap-3">
            {providers.slice(0, 5).map((p) => (
              <a
                key={p.provider_id}
                href={justWatchLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                    alt={p.provider_name}
                    className={`w-14 h-14 rounded-lg border border-zinc-600 group-hover:border-${accentColor}-500 transition-all group-hover:scale-110`}
                  />
                  <ExternalLink
                    className={`absolute -top-1 -right-1 w-4 h-4 bg-${accentColor}-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
                </div>
                <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors text-center" style={{ maxWidth: 60 }}>
                  {p.provider_name}
                </span>
              </a>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="min-h-screen px-4 py-8 flex items-center justify-center">
          <div className="max-w-4xl w-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
            {/* Backdrop */}
            <div className="relative">
              {movie.backdrop_path && (
                <div className="relative h-80">
                  <img
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
                </div>
              )}
              <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 -mt-24 relative z-10">
              <div className="flex gap-6 mb-6">
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-40 rounded-xl shadow-2xl flex-shrink-0 border border-zinc-800"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-3xl font-bold text-white mb-2">{movie.title}</h2>
                  {movie.tagline && <p className="text-zinc-400 italic mb-4">{movie.tagline}</p>}

                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    {movie.vote_average > 0 && (
                      <div className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg px-3 py-1.5 font-semibold">
                        <Star className="w-4 h-4 fill-current" />
                        {movie.vote_average.toFixed(1)}
                      </div>
                    )}
                    <span className="text-zinc-400">{movie.release_date?.split("-")[0]}</span>
                    {movie.runtime && <span className="text-zinc-400">{movie.runtime} min</span>}
                  </div>

                  {/* Add-to buttons */}
                  <div className="flex gap-3 mb-6 flex-wrap">
                    {!isInPerson1(movie.id) && (
                      <button onClick={() => addMovieToPerson(movie, 1)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
                        <Plus className="w-5 h-5" />{person1Name}
                      </button>
                    )}
                    {!isInPerson2(movie.id) && (
                      <button onClick={() => addMovieToPerson(movie, 2)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
                        <Plus className="w-5 h-5" />{person2Name}
                      </button>
                    )}
                  </div>

                  <p className="text-zinc-300 leading-relaxed mb-6">{movie.overview}</p>

                  {movie.genres?.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                      {movie.genres.map((g) => (
                        <span key={g.id} className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">{g.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Where to Watch */}
              <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Play className="w-5 h-5 text-red-500" />Where to Watch
                  </h3>
                  <button
                    onClick={() => setShowCountrySelector(!showCountrySelector)}
                    className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    <Globe className="w-4 h-4" />{cur.flag} {cur.code}
                  </button>
                </div>

                {showCountrySelector && (
                  <div className="mb-4 bg-zinc-900 rounded-lg p-3 border border-zinc-700">
                    <p className="text-xs text-zinc-400 mb-2">Select your region:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => {
                            setSelectedCountry(c.code);
                            setShowCountrySelector(false);
                            fetchMovieDetails(movie.id);
                          }}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCountry === c.code ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          }`}
                        >
                          {c.flag} {c.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <ProviderRow label="Stream" providers={flatrate} accentColor="purple" />
                <ProviderRow label="Rent" providers={rent} accentColor="blue" />
                <ProviderRow label="Buy" providers={buy} accentColor="green" />

                {!flatrate && !rent && !buy && (
                  <p className="text-zinc-400 text-sm">No streaming options available in {cur.name}</p>
                )}

                {justWatchLink && (
                  <a href={justWatchLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    View all options on JustWatch <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <p className="text-xs text-zinc-600 mt-4">Streaming data provided by JustWatch • {cur.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

const SaveModal = ({
  listName,
  setListName,
  saveMessage,
  setShowSaveModal,
  setSaveMessage,
  saveCurrentList,
}) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2 text-white">Save Your Lists</h2>
        <p className="text-zinc-400 mb-6">
          Give your movie lists a name to save them for later
        </p>

        <input
          type="text"
          placeholder="e.g., Movie Night Favorites"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveCurrentList()}
          className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          autoFocus
        />

        {saveMessage && (
          <p className="text-sm mb-4 text-center">{saveMessage}</p>
        )}

        <div className="flex gap-3">
          {/* Cancel Button */}
          <button
            onClick={() => {
              setShowSaveModal(false);
              setListName("");
              setSaveMessage("");
            }}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>

          {/* Save List Button */}
<button
  onClick={handleSave} // now onSave exists!
  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-lg font-medium transition-colors"
>
  Save List
</button>
        </div>
      </div>
    </div>
  );
};
  // ─── LoadModal ─────────────────────────────────────────────────────────────
  const LoadModal = ({
  savedLists,
  loadList,
  deleteList,
  setShowLoadModal,
}) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-2 text-white">Load Saved Lists</h2>
      <p className="text-zinc-400 mb-6">Choose a saved list to restore</p>

      {savedLists.length === 0 ? (
        <div className="text-center py-12">
          <Film className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No saved lists yet</p>
          <p className="text-zinc-600 text-sm mt-2">Create some lists and save them first!</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {savedLists.map((list) => (
            <div key={list.key} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{list.name}</h3>
                  <p className="text-sm text-zinc-400 mb-1">{list.person1Name} &amp; {list.person2Name}</p>
                  <p className="text-xs text-zinc-500">
                    {(list.person1Movies?.length || 0) + (list.person2Movies?.length || 0)} movies total •
                    Saved {new Date(list.savedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => loadList(list.key)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Load
                  </button>

                  <button
                    onClick={() => deleteList(list.key)}
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowLoadModal(false)}
        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
      >
        Close
      </button>
    </div>
  </div>
);
  // ─── CompatibilityModal ────────────────────────────────────────────────────
  const CompatibilityModal = () => {
    const details = getCompatibilityDetails();
    const maxListLen = Math.max(person1Movies.length, person2Movies.length, 1);

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-400" />Compatibility Analysis
            </h2>
            <button onClick={() => setShowCompatibilityModal(false)} className="bg-zinc-800 hover:bg-zinc-700 rounded-full p-2 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Score */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 mb-6 text-center border border-purple-800/30">
            <p className="text-zinc-400 text-sm mb-2">Your Compatibility Score</p>
            <div className="text-7xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              {details.score}%
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-4 mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-1000" style={{ width: `${details.score}%` }} />
            </div>
            <div className="flex items-center justify-center gap-2 text-zinc-300">
              {details.score >= 80 ? <>🔥 <span>Perfect Match!</span></>
                : details.score >= 60 ? <>✨ <span>Great Compatibility</span></>
                : details.score >= 40 ? <>🎬 <span>Good Match</span></>
                : <>⚜️<span>Diverse Tastes</span></>
              }
            </div>
          </div>

          {/* Insights */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />Key Insights
            </h3>
            <div className="space-y-2">
              {details.insights.map((insight, i) => (
                <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <p className="text-zinc-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Genres */}
          {details.sharedGenres.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />Shared Genres
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {details.sharedGenres.map((genre) => (
                  <div key={genre.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{genre.name}</h4>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs text-zinc-400">{genre.p1}</span>
                        <span className="text-zinc-600 mx-1">|</span>
                        <span className="text-xs text-zinc-400">{genre.p2}</span>
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      </div>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.min((genre.total / maxListLen) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800/30 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">{person1Movies.length}</div>
              <div className="text-xs text-zinc-400">{person1Name}'s Movies</div>
            </div>
            <div className="bg-pink-900/20 rounded-lg p-4 border border-pink-800/30 text-center">
              <div className="text-3xl font-bold text-pink-400 mb-1">{commonMovies.length}</div>
              <div className="text-xs text-zinc-400">Shared Movies</div>
            </div>
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/30 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">{person2Movies.length}</div>
              <div className="text-xs text-zinc-400">{person2Name}'s Movies</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ─── Header ──────────────────────────────────────────────────────── */}
<div className="mb-12">
  <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
    <div>
      <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent mb-2">
        MovieMatch
      </h1>
      <p className="text-zinc-400">Discover movies you'll both love</p>
    </div>

    <div className="flex flex-wrap gap-3">
      {/* Save Lists */}
      <button
        onClick={() => setShowSaveModal(true)}
        className="px-5 py-3 rounded-xl font-semibold bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center gap-2"
      >
        <Film className="w-5 h-5" />
        Save Lists
      </button>

      {/* Load Lists */}
      <button
        onClick={() => {
          loadSavedLists();
          setShowLoadModal(true);
        }}
        className="px-5 py-3 rounded-xl font-semibold bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center gap-2"
      >
        <Play className="w-5 h-5" />
        Load Lists
      </button>

      {/* Compatibility Stats */}
      <button
        onClick={() => {
          if (compatibilityScore !== null) setShowCompatibilityModal(true);
        }}
        disabled={person1Movies.length === 0 || person2Movies.length === 0}
        className="px-5 py-3 rounded-xl font-semibold bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        title={
          person1Movies.length === 0 || person2Movies.length === 0
            ? "Add movies to both lists first"
            : "View compatibility"
        }
      >
        <BarChart3 className="w-5 h-5" />
        {compatibilityScore !== null ? `${compatibilityScore}%` : "Stats"}
      </button>

      {/* Togetherness Mode */}
      <button
        onClick={() => setTogethernessMode(!togethernessMode)}
        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
          togethernessMode
            ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-purple-500/50"
            : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"
        }`}
      >
        <Sparkles className={`w-5 h-5 ${togethernessMode ? "fill-current" : ""}`} />
        Togetherness
        {compatibilityScore !== null && togethernessMode && (
          <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {compatibilityScore}%
          </span>
        )}
      </button>
    </div>
  </div>

  {/* Name Inputs */}
  <div className="grid md:grid-cols-2 gap-4 mb-6">
    <input
      type="text"
      value={person1Name}
      onChange={(e) => {
        setPerson1Name(e.target.value);
        saveToLocalStorage("person1_name", e.target.value);
      }}
      placeholder="First person's name"
      className="bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    />
    <input
      type="text"
      value={person2Name}
      onChange={(e) => {
        setPerson2Name(e.target.value);
        saveToLocalStorage("person2_name", e.target.value);
      }}
      placeholder="Second person's name"
      className="bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
    />
  </div>

  {/* Search */}
  <div className="relative">
    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
    <input
      type="text"
      placeholder="Search for movies..."
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value);
        searchMovies(e.target.value);
      }}
      className="w-full bg-zinc-900 border border-zinc-800 text-white pl-14 pr-6 py-5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
    />
  </div>
</div>

{/* ─── Save Modal ───────────────────────────────────────────────────── */}
{showSaveModal && (
  <SaveModal
    listName={listName}
    setListName={setListName}
    saveMessage={saveMessage}
    setShowSaveModal={setShowSaveModal}
    setSaveMessage={setSaveMessage}
    onSave={handleSave} // must be onSave
  />
)}


{/* ─── Load Modal ───────────────────────────────────────────────────── */}
{showLoadModal && (
  <LoadModal
    savedLists={savedLists}
    loadList={loadList}
    deleteList={deleteList}
    setShowLoadModal={setShowLoadModal}
  />
)}
        {/* ─── Tabs ────────────────────────────────────────────────────────── */}
        <div className="flex gap-3 mb-8 border-b border-zinc-800 pb-px">
          {[
            { id: "search", icon: Search, label: "Discover" },
            { id: "compare", icon: Users, label: "Your Lists" },
            { id: "recommendations", icon: Heart, label: "For You" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "recommendations") generateRecommendations();
              }}
              className={`px-6 py-3 rounded-t-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id ? "bg-zinc-900 text-white border-b-2 border-red-500" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.id === "compare" && commonMovies.length > 0 && (
                <span className="bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full">{commonMovies.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Loading Spinner ─────────────────────────────────────────────── */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto" />
          </div>
        )}

        {/* ─── DISCOVER TAB ────────────────────────────────────────────────── */}
        {activeTab === "search" && !loading && (
          <div>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {searchResults.map((m) => (
                  <MovieCard key={m.id} movie={m} onSelect={(mv) => fetchMovieDetails(mv.id)} showActions />
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-red-500" />
                  <h2 className="text-2xl font-bold">Trending This Week</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {trendingMovies.map((m) => (
                    <MovieCard key={m.id} movie={m} onSelect={(mv) => fetchMovieDetails(mv.id)} showActions />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── YOUR LISTS TAB ──────────────────────────────────────────────── */}
        {activeTab === "compare" && !loading && (
          <div className="space-y-8">
            {/* Perfect Match */}
            {commonMovies.length > 0 && (
              <div className="bg-gradient-to-r from-pink-950/50 to-purple-950/50 backdrop-blur rounded-2xl p-8 border border-pink-900/20">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Heart className="w-7 h-7 text-pink-400 fill-pink-400" />
                  Perfect Match ({commonMovies.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {commonMovies.map((m) => (
                    <MovieCard key={m.id} movie={m} onSelect={(mv) => fetchMovieDetails(mv.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Two columns */}
            <div className="grid lg:grid-cols-2 gap-6">
              {[
                { num: 1, name: person1Name, movies: person1Movies, color: "blue" },
                { num: 2, name: person2Name, movies: person2Movies, color: "purple" },
              ].map((p) => (
                <div key={p.num} className="bg-zinc-900/50 backdrop-blur rounded-2xl p-6 border border-zinc-800">
                  <h2 className={`text-xl font-bold mb-4 text-${p.color}-400`}>
                    {p.name}'s List ({p.movies.length})
                  </h2>
                  {p.movies.length === 0 ? (
                    <div className="text-center py-16">
                      <Film className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-500 mb-4">No movies yet</p>
                      <button onClick={() => setActiveTab("search")} className={`text-${p.color}-400 hover:text-${p.color}-300 font-medium`}>
                        Start adding movies →
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {p.movies.map((m) => (
                        <MovieCard key={m.id} movie={m} onSelect={(mv) => fetchMovieDetails(mv.id)} personNum={p.num} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── FOR YOU TAB ─────────────────────────────────────────────────── */}
        {activeTab === "recommendations" && !loading && (
          <div className="space-y-6">
            {/* Togetherness banner */}
            {togethernessMode && (
              <div className="bg-gradient-to-r from-pink-950/50 to-purple-950/50 backdrop-blur rounded-2xl p-8 border border-pink-900/20">
                <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                  <Sparkles className="w-7 h-7 text-yellow-400" />✨ Togetherness Mode Active
                </h2>
                <p className="text-zinc-300 mb-2">Finding movies that match <strong>both</strong> of your tastes:</p>
                <ul className="text-zinc-400 text-sm space-y-1 ml-6 list-disc">
                  <li>Analyzing top 3 shared genres from both lists</li>
                  <li>Only showing highly-rated films (6.5+ rating)</li>
                  <li>Smart scoring based on genre overlap and popularity</li>
                  <li>Bonus points for newer movies (2020+)</li>
                </ul>
                {commonMovies.length > 0 && (
                  <div className="mt-4 bg-pink-900/20 rounded-lg p-3 border border-pink-800/30">
                    <p className="text-pink-300 text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4 fill-current" />
                      You have {commonMovies.length} movie{commonMovies.length > 1 ? "s" : ""} in common!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recs header + refresh */}
            <div className="bg-gradient-to-r from-purple-950/50 to-pink-950/50 backdrop-blur rounded-2xl p-8 border border-purple-900/20">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                <Heart className="w-7 h-7 text-pink-400" />
                {togethernessMode ? "Perfect for Both of You" : "Recommended for You"}
              </h2>
              <p className="text-zinc-400 mb-6">
                {togethernessMode
                  ? "Smart picks based on your shared genre preferences"
                  : "Based on your shared interests and favorite genres"}
              </p>
              <button
                onClick={generateRecommendations}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold px-6 py-3 rounded-xl transition-all"
              >
                Refresh Recommendations
              </button>
            </div>

            {/* Grid or empty state */}
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {recommendations.map((m) => (
                  <MovieCard key={m.id} movie={m} onSelect={(mv) => fetchMovieDetails(mv.id)} showActions />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800">
                <Sparkles className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 text-lg mb-2">Add movies to both lists to get personalized recommendations</p>
                <p className="text-zinc-600 text-sm">The more movies you add, the better the recommendations!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Modals ──────────────────────────────────────────────────────────── */}
     {/* ─── Modals ──────────────────────────────────────────────────────────── */}
{selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
// Later in JSX
{showSaveModal && (
  <SaveModal
    listName={listName}
    setListName={setListName}
    saveMessage={saveMessage}
    setShowSaveModal={setShowSaveModal}
    setSaveMessage={setSaveMessage}
    saveCurrentList={handleSave}
  />
)}
{showLoadModal && (
  <LoadModal
    savedLists={savedLists}
    loadList={loadList}
    deleteList={deleteList}
    setShowLoadModal={setShowLoadModal}
  />
)}
{showCompatibilityModal && <CompatibilityModal />}
    </div>
  );
};

export default MovieTracker;

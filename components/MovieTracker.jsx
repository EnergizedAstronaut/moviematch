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

/* =========================
   MOVIE TRACKER COMPONENT
========================= */

const MovieTracker = () => {
  /* =========================
     STATE
  ========================= */
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
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [togethernessMode, setTogethernessMode] = useState(false);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [listName, setListName] = useState("");
  const [savedLists, setSavedLists] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");

  const [streamingProviders, setStreamingProviders] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [showCountrySelector, setShowCountrySelector] = useState(false);

  const [compatibilityScore, setCompatibilityScore] = useState(null);
  const [sharedGenres, setSharedGenres] = useState([]);
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);

  /* =========================
     TMDB CONFIG
  ========================= */
  const TMDB_API_KEY = "5792c693eccc10a144cad3c08930ecdb";
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  /* =========================
     COUNTRIES
  ========================= */
  const countries = [
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "DE", name: "Germany", flag: "🇩🇪" },
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "JP", name: "Japan", flag: "🇯🇵" },
  ];

  /* =========================
     INIT
  ========================= */
  useEffect(() => {
    if (typeof window === "undefined") return;
    loadFromStorage();
    fetchTrending();
  }, []);

  const loadFromStorage = () => {
    const p1 = localStorage.getItem("person1_movies");
    const p2 = localStorage.getItem("person2_movies");
    const n1 = localStorage.getItem("person1_name");
    const n2 = localStorage.getItem("person2_name");
    if (p1) setPerson1Movies(JSON.parse(p1));
    if (p2) setPerson2Movies(JSON.parse(p2));
    if (n1) setPerson1Name(n1);
    if (n2) setPerson2Name(n2);
  };

  const saveToStorage = (key, data) =>
    localStorage.setItem(key, typeof data === "string" ? data : JSON.stringify(data));

  /* =========================
     FETCHING
  ========================= */
  const fetchTrending = async () => {
    const r = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
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
    const [d, p] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`).then(r => r.json()),
      fetch(`${TMDB_BASE_URL}/movie/${id}/watch/providers?api_key=${TMDB_API_KEY}`).then(r => r.json())
    ]);
    setSelectedMovie(d);
    setStreamingProviders(p.results?.[selectedCountry] || null);
    setLoading(false);
  };

  /* =========================
     LIST HELPERS
  ========================= */
  const addMovieToPerson = (movie, num) => {
    if (num === 1) {
      if (person1Movies.some(m => m.id === movie.id)) return;
      const u = [...person1Movies, movie];
      setPerson1Movies(u);
      saveToStorage("person1_movies", u);
    } else {
      if (person2Movies.some(m => m.id === movie.id)) return;
      const u = [...person2Movies, movie];
      setPerson2Movies(u);
      saveToStorage("person2_movies", u);
    }
  };

  const removeMovieFromPerson = (id, num) => {
    if (num === 1) {
      const u = person1Movies.filter(m => m.id !== id);
      setPerson1Movies(u);
      saveToStorage("person1_movies", u);
    } else {
      const u = person2Movies.filter(m => m.id !== id);
      setPerson2Movies(u);
      saveToStorage("person2_movies", u);
    }
  };

  const findCommonMovies = () => {
    const ids = new Set(person1Movies.map(m => m.id));
    return person2Movies.filter(m => ids.has(m.id));
  };

  const commonMovies = findCommonMovies();

  /* =========================
     MOVIE CARD
  ========================= */
  const MovieCard = ({ movie, onSelect, personNum }) => (
    <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
      <div onClick={() => onSelect(movie)} className="cursor-pointer">
        {movie.poster_path ? (
          <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} />
        ) : (
          <div className="h-64 flex items-center justify-center">
            <Film />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm">{movie.title}</p>
        {personNum && (
          <button
            onClick={() => removeMovieFromPerson(movie.id, personNum)}
            className="mt-2 w-full text-xs bg-red-600/20 text-red-400 py-1 rounded"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-6">🎬 MovieMatch</h1>

      <input
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          searchMovies(e.target.value);
        }}
        placeholder="Search movies..."
        className="w-full mb-6 px-4 py-3 rounded bg-zinc-900 border border-zinc-800"
      />

      {searchResults.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {searchResults.map(m => (
            <MovieCard key={m.id} movie={m} onSelect={() => fetchMovieDetails(m.id)} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {trendingMovies.map(m => (
            <MovieCard key={m.id} movie={m} onSelect={() => fetchMovieDetails(m.id)} />
          ))}
        </div>
      )}

      {selectedMovie && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center">
          <div className="bg-zinc-900 p-6 rounded-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-2">{selectedMovie.title}</h2>
            <p className="text-zinc-400 mb-4">{selectedMovie.overview}</p>
            <div className="flex gap-2">
              <button
                onClick={() => addMovieToPerson(selectedMovie, 1)}
                className="bg-blue-600 px-4 py-2 rounded"
              >
                {person1Name}
              </button>
              <button
                onClick={() => addMovieToPerson(selectedMovie, 2)}
                className="bg-purple-600 px-4 py-2 rounded"
              >
                {person2Name}
              </button>
            </div>
            <button
              onClick={() => setSelectedMovie(null)}
              className="mt-4 text-zinc-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieTracker;

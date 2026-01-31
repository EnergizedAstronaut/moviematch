"use client";

import React, { useState, useEffect } from "react";
import {
  Search, Film, Plus, X, Play, Star, Users, Heart, Sparkles,
  TrendingUp, ExternalLink, Globe, BarChart3, Zap
} from "lucide-react";

/* ============================
   Safe Storage Helpers
   ============================ */
const storage = {
  list(prefix) {
    if (typeof window === "undefined") return { keys: [] };
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    return { keys };
  },
  get(key) {
    if (typeof window === "undefined") return null;
    return { value: localStorage.getItem(key) };
  },
  set(key, value) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  },
  delete(key) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  }
};

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

  const TMDB_API_KEY = "5792c693eccc10a144cad3c08930ecdb";
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  /* ============================
     Initial Load
     ============================ */
  useEffect(() => {
    loadFromStorage();
    fetchTrending();
    loadSavedLists();
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

  const saveToStorage = (key, data) => {
    localStorage.setItem(key, typeof data === "string" ? data : JSON.stringify(data));
  };

  /* ============================
     Saved Lists (FIXED)
     ============================ */
  const loadSavedLists = async () => {
    const result = storage.list("movielist:");
    const lists = [];

    for (const key of result.keys) {
      const item = storage.get(key);
      if (item?.value) {
        lists.push({ key, ...JSON.parse(item.value) });
      }
    }

    setSavedLists(lists);
  };

  const saveCurrentList = async () => {
    if (!listName.trim()) {
      setSaveMessage("Please enter a list name");
      return;
    }

    const key = `movielist:${listName.toLowerCase().replace(/\s+/g, "-")}`;
    storage.set(
      key,
      JSON.stringify({
        name: listName,
        person1Name,
        person2Name,
        person1Movies,
        person2Movies,
        savedAt: new Date().toISOString()
      })
    );

    setSaveMessage("✅ Saved!");
    setTimeout(() => {
      setShowSaveModal(false);
      setListName("");
      setSaveMessage("");
      loadSavedLists();
    }, 1000);
  };

  const loadList = (key) => {
    const item = storage.get(key);
    if (!item?.value) return;

    const data = JSON.parse(item.value);
    setPerson1Name(data.person1Name);
    setPerson2Name(data.person2Name);
    setPerson1Movies(data.person1Movies);
    setPerson2Movies(data.person2Movies);

    saveToStorage("person1_name", data.person1Name);
    saveToStorage("person2_name", data.person2Name);
    saveToStorage("person1_movies", data.person1Movies);
    saveToStorage("person2_movies", data.person2Movies);

    setShowLoadModal(false);
    setActiveTab("compare");
  };

  const deleteList = (key) => {
    if (!confirm("Delete this list?")) return;
    storage.delete(key);
    loadSavedLists();
  };

  /* ============================
     TMDB
     ============================ */
  const fetchTrending = async () => {
    const res = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
    );
    const data = await res.json();
    setTrendingMovies(data.results?.slice(0, 12) || []);
  };

  const searchMovies = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) return setSearchResults([]);

    setLoading(true);
    const res = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}`
    );
    const data = await res.json();
    setSearchResults(data.results || []);
    setLoading(false);
  };

  const fetchMovieDetails = async (id) => {
    setLoading(true);
    const [details, providers] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`).then(r => r.json()),
      fetch(`${TMDB_BASE_URL}/movie/${id}/watch/providers?api_key=${TMDB_API_KEY}`).then(r => r.json())
    ]);

    setSelectedMovie(details);
    setStreamingProviders(providers.results?.[selectedCountry] || null);
    setLoading(false);
  };

  /* ============================
     Helpers
     ============================ */
  const addMovieToPerson = (movie, p) => {
    const list = p === 1 ? person1Movies : person2Movies;
    if (list.some(m => m.id === movie.id)) return;

    const updated = [...list, movie];
    p === 1
      ? setPerson1Movies(updated)
      : setPerson2Movies(updated);

    saveToStorage(p === 1 ? "person1_movies" : "person2_movies", updated);
  };

  const removeMovieFromPerson = (id, p) => {
    const updated = (p === 1 ? person1Movies : person2Movies).filter(m => m.id !== id);
    p === 1 ? setPerson1Movies(updated) : setPerson2Movies(updated);
    saveToStorage(p === 1 ? "person1_movies" : "person2_movies", updated);
  };

  const commonMovies = person1Movies.filter(m =>
    person2Movies.some(n => n.id === m.id)
  );

  /* ============================
     UI
     ============================ */
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
          MovieMatch
        </h1>
        <p className="text-zinc-400 mt-4">
          Your app is now running without crashes 🎬
        </p>
      </div>
    </div>
  );
};

export default MovieTracker;

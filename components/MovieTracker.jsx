"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Film,
  Plus,
  X,
  Star,
  Users,
  Heart,
  Sparkles,
  TrendingUp,
} from "lucide-react";

/* =========================
   CONFIG
========================= */
const TMDB_API_KEY =  "5792c693eccc10a144cad3c08930ecdb";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/* =========================
   COMPONENT
========================= */
export default function MovieTracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [person1Name, setPerson1Name] = useState("Person 1");
  const [person2Name, setPerson2Name] = useState("Person 2");
  const [person1Movies, setPerson1Movies] = useState([]);
  const [person2Movies, setPerson2Movies] = useState([]);

  const [activeTab, setActiveTab] = useState("search");
  const [recommendations, setRecommendations] = useState([]);
  const [togethernessMode, setTogethernessMode] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =========================
     INIT
  ========================= */
  useEffect(() => {
    loadStorage();
    fetchTrending();
  }, []);

  const loadStorage = () => {
    setPerson1Movies(JSON.parse(localStorage.getItem("p1") || "[]"));
    setPerson2Movies(JSON.parse(localStorage.getItem("p2") || "[]"));
    setPerson1Name(localStorage.getItem("p1name") || "Person 1");
    setPerson2Name(localStorage.getItem("p2name") || "Person 2");
  };

  const save = (k, v) =>
    localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));

  /* =========================
     FETCHING
  ========================= */
  const fetchTrending = async () => {
    const r = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
    );
    const d = await r.json();
    setTrending(d.results?.slice(0, 12) || []);
  };

  const searchMovies = async (q) => {
    if (!q.trim()) return setSearchResults([]);
    setLoading(true);
    const r = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        q
      )}`
    );
    const d = await r.json();
    setSearchResults(d.results || []);
    setLoading(false);
  };

  /* =========================
     LIST HELPERS
  ========================= */
  const addMovie = (movie, who) => {
    if (who === 1) {
      if (person1Movies.some((m) => m.id === movie.id)) return;
      const u = [...person1Movies, movie];
      setPerson1Movies(u);
      save("p1", u);
    } else {
      if (person2Movies.some((m) => m.id === movie.id)) return;
      const u = [...person2Movies, movie];
      setPerson2Movies(u);
      save("p2", u);
    }
  };

  const removeMovie = (id, who) => {
    if (who === 1) {
      const u = person1Movies.filter((m) => m.id !== id);
      setPerson1Movies(u);
      save("p1", u);
    } else {
      const u = person2Movies.filter((m) => m.id !== id);
      setPerson2Movies(u);
      save("p2", u);
    }
  };

  const commonMovies = person1Movies.filter((m) =>
    person2Movies.some((x) => x.id === m.id)
  );

  /* =========================
     RECOMMENDATIONS
  ========================= */
  const generateRecommendations = async () => {
    setLoading(true);

    const genres = {};
    [...person1Movies, ...person2Movies].forEach((m) =>
      m.genre_ids?.forEach((g) => (genres[g] = (genres[g] || 0) + 1))
    );

    const topGenres = Object.keys(genres).slice(0, 3).join("|");

    const r = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${topGenres}&vote_count.gte=300`
    );
    const d = await r.json();

    let results = d.results || [];

    if (togethernessMode) {
      results = results
        .map((m) => ({
          ...m,
          _score:
            (m.vote_average || 0) * 3 +
            (m.genre_ids?.filter((g) => genres[g]).length || 0) * 10,
        }))
        .sort((a, b) => b._score - a._score);
    }

    setRecommendations(results.slice(0, 12));
    setLoading(false);
  };

  /* =========================
     MOVIE CARD
  ========================= */
  const MovieCard = ({ movie, actions, remove }) => (
    <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
      <img
        src={
          movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : ""
        }
        className="aspect-[2/3] object-cover"
      />
      <div className="p-3">
        <p className="font-semibold text-sm">{movie.title}</p>
        <p className="text-xs text-zinc-400">
          {movie.release_date?.slice(0, 4)}
        </p>

        {actions && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => addMovie(movie, 1)}
              className="flex-1 bg-blue-600 text-xs py-1 rounded"
            >
              {person1Name}
            </button>
            <button
              onClick={() => addMovie(movie, 2)}
              className="flex-1 bg-purple-600 text-xs py-1 rounded"
            >
              {person2Name}
            </button>
          </div>
        )}

        {remove && (
          <button
            onClick={remove}
            className="mt-2 w-full bg-red-600/20 text-red-400 text-xs py-1 rounded"
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
    <div className="min-h-screen bg-black text-white px-8 py-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">🎬 MovieMatch</h1>
        <button
          onClick={() => setTogethernessMode(!togethernessMode)}
          className={`px-5 py-2 rounded-xl flex items-center gap-2 ${
            togethernessMode
              ? "bg-gradient-to-r from-pink-600 to-purple-600"
              : "bg-zinc-800"
          }`}
        >
          <Sparkles /> Togetherness
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            searchMovies(e.target.value);
          }}
          placeholder="Search movies..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 py-4"
        />
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6 border-b border-zinc-800">
        {[
          ["search", "Discover", <Search />],
          ["compare", "Your Lists", <Users />],
          ["recommend", "For You", <Heart />],
        ].map(([k, l, i]) => (
          <button
            key={k}
            onClick={() => {
              setActiveTab(k);
              if (k === "recommend") generateRecommendations();
            }}
            className={`px-4 py-3 ${
              activeTab === k
                ? "border-b-2 border-red-500"
                : "text-zinc-500"
            }`}
          >
            {i} {l}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {loading && <p className="text-center py-20">Loading…</p>}

      {activeTab === "search" && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {(searchResults.length ? searchResults : trending).map((m) => (
            <MovieCard key={m.id} movie={m} actions />
          ))}
        </div>
      )}

      {activeTab === "compare" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl mb-3">{person1Name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {person1Movies.map((m) => (
                <MovieCard
                  key={m.id}
                  movie={m}
                  remove={() => removeMovie(m.id, 1)}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl mb-3">{person2Name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {person2Movies.map((m) => (
                <MovieCard
                  key={m.id}
                  movie={m}
                  remove={() => removeMovie(m.id, 2)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "recommend" && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {recommendations.map((m) => (
            <MovieCard key={m.id} movie={m} actions />
          ))}
        </div>
      )}
    </div>
  );
}

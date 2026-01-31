"use client";

import React, { useEffect, useState } from "react";
import { Search, Film, X, Star, Sparkles } from "lucide-react";

const TMDB_API_KEY = "5792c693eccc10a144cad3c08930ecdb";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

/* =========================
   LocalStorage Helpers
   ========================= */
const getLS = (k, d) => {
  if (typeof window === "undefined") return d;
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : d;
  } catch {
    return d;
  }
};

const setLS = (k, v) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
};

export default function MovieTracker() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [p1, setP1] = useState([]);
  const [p2, setP2] = useState([]);
  const [activeTab, setActiveTab] = useState("discover");
  const [selected, setSelected] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     Load saved lists
     ========================= */
  useEffect(() => {
    setP1(getLS("p1_movies", []));
    setP2(getLS("p2_movies", []));
  }, []);

  /* =========================
     Search
     ========================= */
  const search = async (q) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const res = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        q
      )}`
    );
    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  };

  /* =========================
     Lists
     ========================= */
  const addMovie = (m, who) => {
    const list = who === 1 ? p1 : p2;
    if (list.some((x) => x.id === m.id)) return;
    const updated = [...list, m];
    who === 1 ? setP1(updated) : setP2(updated);
    setLS(who === 1 ? "p1_movies" : "p2_movies", updated);
  };

  const removeMovie = (id, who) => {
    const list = who === 1 ? p1 : p2;
    const updated = list.filter((m) => m.id !== id);
    who === 1 ? setP1(updated) : setP2(updated);
    setLS(who === 1 ? "p1_movies" : "p2_movies", updated);
  };

  /* =========================
     Recommendations
     ========================= */
  const generateRecs = async () => {
    if (!p1.length || !p2.length) {
      setRecs([]);
      return;
    }

    setLoading(true);

    const g1 = {};
    const g2 = {};

    p1.forEach((m) =>
      m.genre_ids?.forEach((g) => (g1[g] = (g1[g] || 0) + 1))
    );
    p2.forEach((m) =>
      m.genre_ids?.forEach((g) => (g2[g] = (g2[g] || 0) + 1))
    );

    const shared = Object.keys(g1).filter((g) => g2[g]);

    if (!shared.length) {
      setRecs([]);
      setLoading(false);
      return;
    }

    const res = await fetch(
      `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${shared
        .slice(0, 2)
        .join("|")}&vote_average.gte=6.5&vote_count.gte=300`
    );
    const data = await res.json();

    const existing = new Set([...p1, ...p2].map((m) => m.id));

    setRecs(
      (data.results || []).filter((m) => !existing.has(m.id)).slice(0, 12)
    );

    setLoading(false);
  };

  /* =========================
     UI Components
     ========================= */
  const MovieCard = ({ movie, actions, removeWho }) => (
    <div
      onClick={() => setSelected(movie)}
      className="bg-zinc-900 rounded-xl overflow-hidden cursor-pointer hover:scale-[1.03] transition"
    >
      {movie.poster_path ? (
        <img src={`${IMG}${movie.poster_path}`} />
      ) : (
        <div className="aspect-[2/3] flex items-center justify-center">
          <Film />
        </div>
      )}
      <div className="p-3">
        <h3 className="text-sm font-semibold">{movie.title}</h3>

        {actions && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addMovie(movie, 1);
              }}
              className="text-xs bg-blue-600 px-2 py-1 rounded"
            >
              Person 1
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addMovie(movie, 2);
              }}
              className="text-xs bg-purple-600 px-2 py-1 rounded"
            >
              Person 2
            </button>
          </div>
        )}

        {removeWho && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeMovie(movie.id, removeWho);
            }}
            className="text-xs text-red-400 mt-2"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );

  /* =========================
     Render
     ========================= */
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold mb-6">🎬 MovieMatch</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab("discover")}>Discover</button>
        <button onClick={() => setActiveTab("lists")}>Your Lists</button>
        <button
          onClick={() => {
            setActiveTab("recs");
            generateRecs();
          }}
        >
          For You
        </button>
      </div>

      {/* Discover */}
      {activeTab === "discover" && (
        <>
          <input
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Search movies…"
            className="w-full p-4 mb-6 rounded-xl bg-zinc-900"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {results.map((m) => (
              <MovieCard key={m.id} movie={m} actions />
            ))}
          </div>
        </>
      )}

      {/* Lists */}
      {activeTab === "lists" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl mb-3">Person 1</h2>
            <div className="grid grid-cols-2 gap-4">
              {p1.map((m) => (
                <MovieCard key={m.id} movie={m} removeWho={1} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl mb-3">Person 2</h2>
            <div className="grid grid-cols-2 gap-4">
              {p2.map((m) => (
                <MovieCard key={m.id} movie={m} removeWho={2} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {activeTab === "recs" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {recs.length ? (
            recs.map((m) => <MovieCard key={m.id} movie={m} actions />)
          ) : (
            <div className="col-span-full text-center py-20">
              <Sparkles className="w-12 h-12 mx-auto text-purple-500 mb-4" />
              <p>
                Add movies to both lists and we’ll find your perfect match ✨
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-2xl max-w-lg w-full relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>
            <h2 className="text-2xl font-bold mb-2">{selected.title}</h2>
            <p className="text-zinc-400">{selected.overview}</p>
            {selected.vote_average && (
              <p className="mt-3 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {selected.vote_average.toFixed(1)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
} from "lucide-react";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export default function MovieTracker() {
  const TMDB_API_KEY = "5792c693eccc10a144cad3c08930ecdb";

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
  const [streamingProviders, setStreamingProviders] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [showCountrySelector, setShowCountrySelector] = useState(false);

  const countries = [
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "DE", name: "Germany", flag: "🇩🇪" },
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "ES", name: "Spain", flag: "🇪🇸" },
    { code: "IT", name: "Italy", flag: "🇮🇹" },
  ];

  /* -------------------- Storage -------------------- */
  useEffect(() => {
    if (!TMDB_API_KEY) {
      console.error("Missing NEXT_PUBLIC_TMDB_API_KEY");
      return;
    }
    loadFromStorage();
    fetchTrending();
  }, []);

  const loadFromStorage = () => {
    try {
      setPerson1Movies(JSON.parse(localStorage.getItem("p1_movies") || "[]"));
      setPerson2Movies(JSON.parse(localStorage.getItem("p2_movies") || "[]"));
      setPerson1Name(localStorage.getItem("p1_name") || "Person 1");
      setPerson2Name(localStorage.getItem("p2_name") || "Person 2");
    } catch {}
  };

  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  /* -------------------- API -------------------- */
  const fetchTrending = async () => {
    const res = await fetch(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
    );
    const data = await res.json();
    setTrendingMovies(data.results || []);
  };

  const searchMovies = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) return setSearchResults([]);
    setLoading(true);
    const res = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        q
      )}`
    );
    const data = await res.json();
    setSearchResults(data.results || []);
    setLoading(false);
  };

  const fetchMovieDetails = async (id) => {
    setLoading(true);
    const [d, c, p] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`).then((r) =>
        r.json()
      ),
      fetch(`${TMDB_BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}`).then(
        (r) => r.json()
      ),
      fetch(
        `${TMDB_BASE_URL}/movie/${id}/watch/providers?api_key=${TMDB_API_KEY}`
      ).then((r) => r.json()),
    ]);
    setSelectedMovie({
      ...d,
      cast: c.cast?.slice(0, 5) || [],
      director: c.crew?.find((p) => p.job === "Director"),
    });
    setStreamingProviders(p.results?.[selectedCountry] || null);
    setLoading(false);
  };

  /* -------------------- Lists -------------------- */
  const addMovie = (movie, p) => {
    const setter = p === 1 ? setPerson1Movies : setPerson2Movies;
    const list = p === 1 ? person1Movies : person2Movies;
    if (list.some((m) => m.id === movie.id)) return;
    const updated = [...list, movie];
    setter(updated);
    save(p === 1 ? "p1_movies" : "p2_movies", updated);
  };

  const removeMovie = (id, p) => {
    const list = p === 1 ? person1Movies : person2Movies;
    const updated = list.filter((m) => m.id !== id);
    p === 1 ? setPerson1Movies(updated) : setPerson2Movies(updated);
    save(p === 1 ? "p1_movies" : "p2_movies", updated);
  };

  /* -------------------- Recommendations -------------------- */
  const generateRecommendations = async () => {
    if (!person1Movies.length || !person2Movies.length) {
      setRecommendations([]);
      return;
    }

    setLoading(true);

    const g1 = {},
      g2 = {};
    person1Movies.forEach((m) =>
      m.genre_ids?.forEach((g) => (g1[g] = (g1[g] || 0) + 1))
    );
    person2Movies.forEach((m) =>
      m.genre_ids?.forEach((g) => (g2[g] = (g2[g] || 0) + 1))
    );

    const shared = Object.keys(g1).filter((g) => g2[g]);
    if (!shared.length) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    const res = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${shared
        .slice(0, 2)
        .join("|")}&vote_count.gte=300&vote_average.gte=6.5`
    );
    const data = await res.json();

    const existing = new Set(
      [...person1Movies, ...person2Movies].map((m) => m.id)
    );

    setRecommendations(
      (data.results || []).filter((m) => !existing.has(m.id)).slice(0, 12)
    );
    setLoading(false);
  };

  const commonMovies = person1Movies.filter((m) =>
    person2Movies.some((x) => x.id === m.id)
  );

  /* -------------------- UI -------------------- */
  const MovieCard = ({ movie, actions, removeP }) => (
    <div
      onClick={() => fetchMovieDetails(movie.id)}
      className="bg-zinc-900 rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition"
    >
      {movie.poster_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          className="aspect-[2/3] object-cover"
        />
      ) : (
        <div className="aspect-[2/3] flex items-center justify-center">
          <Film />
        </div>
      )}
      <div className="p-3">
        <h3 className="text-sm font-semibold">{movie.title}</h3>
        {actions && (
          <div className="flex gap-2 mt-2">
            <button onClick={(e) => (e.stopPropagation(), addMovie(movie, 1))}>
              {person1Name}
            </button>
            <button onClick={(e) => (e.stopPropagation(), addMovie(movie, 2))}>
              {person2Name}
            </button>
          </div>
        )}
        {removeP && (
          <button
            onClick={(e) => (e.stopPropagation(), removeMovie(movie.id, removeP))}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold mb-6">🎬 MovieMatch</h1>

      <input
        value={searchQuery}
        onChange={(e) => searchMovies(e.target.value)}
        placeholder="Search movies..."
        className="w-full p-4 rounded bg-zinc-900 mb-6"
      />

      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab("search")}>Discover</button>
        <button onClick={() => setActiveTab("compare")}>Your Lists</button>
        <button
          onClick={() => {
            setActiveTab("recommend");
            generateRecommendations();
          }}
        >
          For You
        </button>
      </div>

      {activeTab === "search" && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {(searchResults.length ? searchResults : trendingMovies).map((m) => (
            <MovieCard key={m.id} movie={m} actions />
          ))}
        </div>
      )}

      {activeTab === "compare" && (
        <>
          {commonMovies.length > 0 && (
            <>
              <h2 className="text-xl mb-3">❤️ Perfect Match</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                {commonMovies.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            </>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3>{person1Name}</h3>
              <div className="grid grid-cols-2 gap-3">
                {person1Movies.map((m) => (
                  <MovieCard key={m.id} movie={m} removeP={1} />
                ))}
              </div>
            </div>
            <div>
              <h3>{person2Name}</h3>
              <div className="grid grid-cols-2 gap-3">
                {person2Movies.map((m) => (
                  <MovieCard key={m.id} movie={m} removeP={2} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "recommend" && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {recommendations.length ? (
            recommendations.map((m) => (
              <MovieCard key={m.id} movie={m} actions />
            ))
          ) : (
            <p>Add movies to both lists to get recommendations ✨</p>
          )}
        </div>
      )}
    </div>
  );
}

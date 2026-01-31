"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  X,
  Users,
  Sparkles,
  Heart,
  TrendingUp,
} from "lucide-react";

const TMDB_API_KEY = "5792c693eccc10a144cad3c08930ecdb";
const TMDB_BASE = "https://api.themoviedb.org/3";

export default function MovieTracker() {
  /* ---------------- STATE ---------------- */
  const [activeTab, setActiveTab] = useState("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);

  const [p1Name, setP1Name] = useState("Person 1");
  const [p2Name, setP2Name] = useState("Person 2");
  const [p1Movies, setP1Movies] = useState([]);
  const [p2Movies, setP2Movies] = useState([]);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [togethernessMode, setTogethernessMode] = useState(false);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    fetchTrending();
    const a = localStorage.getItem("p1");
    const b = localStorage.getItem("p2");
    if (a) setP1Movies(JSON.parse(a));
    if (b) setP2Movies(JSON.parse(b));
  }, []);

  useEffect(() => {
    localStorage.setItem("p1", JSON.stringify(p1Movies));
    localStorage.setItem("p2", JSON.stringify(p2Movies));
  }, [p1Movies, p2Movies]);

  /* ---------------- API ---------------- */
  const fetchTrending = async () => {
    const r = await fetch(
      `${TMDB_BASE}/trending/movie/week?api_key=${TMDB_API_KEY}`
    );
    const d = await r.json();
    setTrending(d.results?.slice(0, 12) || []);
  };

  const searchMovies = async (q) => {
    if (!q.trim()) return setResults([]);
    const r = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        q
      )}`
    );
    const d = await r.json();
    setResults(d.results || []);
  };

  /* ---------------- LIST OPS ---------------- */
  const addMovie = (movie, who) => {
    if (who === 1 && !p1Movies.some((m) => m.id === movie.id))
      setP1Movies([...p1Movies, movie]);
    if (who === 2 && !p2Movies.some((m) => m.id === movie.id))
      setP2Movies([...p2Movies, movie]);
  };

  const removeMovie = (id, who) => {
    who === 1
      ? setP1Movies(p1Movies.filter((m) => m.id !== id))
      : setP2Movies(p2Movies.filter((m) => m.id !== id));
  };

  const sharedMovies = p1Movies.filter((m) =>
    p2Movies.some((x) => x.id === m.id)
  );

  /* ---------------- RECOMMENDATIONS ---------------- */
  const generateRecommendations = async () => {
    const genreCount = {};
    [...p1Movies, ...p2Movies].forEach((m) =>
      m.genre_ids?.forEach(
        (g) => (genreCount[g] = (genreCount[g] || 0) + 1)
      )
    );

    const topGenres = Object.keys(genreCount).slice(0, 3).join(",");

    const r = await fetch(
      `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${topGenres}&with_origin_country=US&primary_release_date.gte=2010-01-01&vote_average.gte=7`
    );
    const d = await r.json();

    const existing = new Set([...p1Movies, ...p2Movies].map((m) => m.id));
    setRecommendations(d.results.filter((m) => !existing.has(m.id)).slice(0, 12));
  };

  /* ---------------- UI ---------------- */
  const MovieGrid = ({ movies, onClick }) => (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      {movies.map((m) => (
        <div
          key={m.id}
          onClick={() => onClick(m)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-600"
        >
          {m.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
              className="rounded-t-xl"
            />
          )}
          <div className="p-3 text-sm font-semibold">{m.title}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
        MovieMatch
      </h1>

      {/* TABS */}
      <div className="flex gap-3 mb-6">
        {[
          ["search", "Search", Search],
          ["compare", "Compare", Users],
          ["recommend", "Recommendations", Sparkles],
          ["together", "Watch Together", Heart],
        ].map(([k, label, Icon]) => (
          <button
            key={k}
            onClick={() => setActiveTab(k)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeTab === k ? "bg-zinc-800" : "bg-zinc-900"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      {activeTab === "search" && (
        <>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              searchMovies(e.target.value);
            }}
            placeholder="Search movies…"
            className="w-full mb-6 bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4"
          />
          <MovieGrid
            movies={results.length ? results : trending}
            onClick={setSelectedMovie}
          />
        </>
      )}

      {/* COMPARE */}
      {activeTab === "compare" && (
        <div className="grid md:grid-cols-2 gap-6">
          {[p1Movies, p2Movies].map((list, i) => (
            <div key={i}>
              <h2 className="text-xl font-bold mb-4">
                {i === 0 ? p1Name : p2Name}
              </h2>
              {list.map((m) => (
                <div
                  key={m.id}
                  className="flex justify-between items-center bg-zinc-900 px-4 py-2 rounded mb-2"
                >
                  {m.title}
                  <button onClick={() => removeMovie(m.id, i + 1)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* RECOMMEND */}
      {activeTab === "recommend" && (
        <>
          <button
            onClick={generateRecommendations}
            className="mb-6 bg-purple-600 px-6 py-3 rounded-xl"
          >
            Generate Recommendations
          </button>
          <MovieGrid movies={recommendations} onClick={setSelectedMovie} />
        </>
      )}

      {/* WATCH TOGETHER */}
      {activeTab === "together" && (
        <>
          <h2 className="text-2xl font-bold mb-4">
            Movies You Both Like ❤️
          </h2>
          <MovieGrid movies={sharedMovies} onClick={setSelectedMovie} />
        </>
      )}

      {/* MODAL */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl max-w-lg">
            <h2 className="text-xl font-bold mb-2">
              {selectedMovie.title}
            </h2>
            <p className="text-zinc-400 mb-4">
              {selectedMovie.overview}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => addMovie(selectedMovie, 1)}
                className="bg-blue-600 px-4 py-2 rounded"
              >
                Add to {p1Name}
              </button>
              <button
                onClick={() => addMovie(selectedMovie, 2)}
                className="bg-purple-600 px-4 py-2 rounded"
              >
                Add to {p2Name}
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
}

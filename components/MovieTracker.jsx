"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Film,
  Plus,
  X,
  Star,
  Heart,
  Sparkles,
} from "lucide-react";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export default function MovieTracker() {
  const TMDB_API_KEY = "5792c693eccc10a144cad3c08930ecdb";

  /* -------------------- State -------------------- */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [person1Movies, setPerson1Movies] = useState([]);
  const [person2Movies, setPerson2Movies] = useState([]);
  const [person1Name, setPerson1Name] = useState("Person 1");
  const [person2Name, setPerson2Name] = useState("Person 2");
  const [activeTab, setActiveTab] = useState("search");
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  /* -------------------- Init -------------------- */
  useEffect(() => {
    if (!TMDB_API_KEY) {
      console.error("Missing NEXT_PUBLIC_TMDB_API_KEY");
      return;
    }
    loadFromStorage();
  }, []);

  /* -------------------- Storage -------------------- */
  const loadFromStorage = () => {
    try {
      setPerson1Movies(JSON.parse(localStorage.getItem("p1_movies")) || []);
      setPerson2Movies(JSON.parse(localStorage.getItem("p2_movies")) || []);
      setPerson1Name(localStorage.getItem("p1_name") || "Person 1");
      setPerson2Name(localStorage.getItem("p2_name") || "Person 2");
    } catch {}
  };

  const save = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value));

  /* -------------------- API -------------------- */
  const searchMovies = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    const res = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}`
    );
    const data = await res.json();
    setSearchResults(data.results || []);
    setLoading(false);
  };

  const fetchMovieDetails = async (id) => {
    setLoading(true);
    const [details, credits] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`).then((r) =>
        r.json()
      ),
      fetch(`${TMDB_BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}`).then(
        (r) => r.json()
      ),
    ]);

    setSelectedMovie({
      ...details,
      director: credits.crew?.find((p) => p.job === "Director"),
      cast: credits.cast?.slice(0, 5) || [],
    });
    setLoading(false);
  };

  /* -------------------- Lists -------------------- */
  const addMovie = (movie, person) => {
    const list = person === 1 ? person1Movies : person2Movies;
    if (list.some((m) => m.id === movie.id)) return;
    const updated = [...list, movie];
    person === 1 ? setPerson1Movies(updated) : setPerson2Movies(updated);
    save(person === 1 ? "p1_movies" : "p2_movies", updated);
  };

  const removeMovie = (id, person) => {
    const list = person === 1 ? person1Movies : person2Movies;
    const updated = list.filter((m) => m.id !== id);
    person === 1 ? setPerson1Movies(updated) : setPerson2Movies(updated);
    save(person === 1 ? "p1_movies" : "p2_movies", updated);
  };

  /* -------------------- Recommendations -------------------- */
  const generateRecommendations = async () => {
    if (!person1Movies.length || !person2Movies.length) {
      setRecommendations([]);
      return;
    }

    setLoading(true);

    const g1 = {};
    const g2 = {};

    person1Movies.forEach((m) =>
      m.genre_ids?.forEach((g) => (g1[g] = (g1[g] || 0) + 1))
    );
    person2Movies.forEach((m) =>
      m.genre_ids?.forEach((g) => (g2[g] = (g2[g] || 0) + 1))
    );

    const sharedGenres = Object.keys(g1).filter((g) => g2[g]);

    if (!sharedGenres.length) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    const res = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${sharedGenres
        .slice(0, 2)
        .join("|")}&vote_average.gte=6.5&vote_count.gte=300`
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

  /* -------------------- UI Components -------------------- */
  const MovieCard = ({ movie, showActions, removePerson }) => (
    <div
      onClick={() => fetchMovieDetails(movie.id)}
      className="bg-zinc-900 rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition"
    >
      {movie.poster_path ? (
        <img
          src={`${IMAGE_BASE}${movie.poster_path}`}
          alt={movie.title}
          className="aspect-[2/3] object-cover"
        />
      ) : (
        <div className="aspect-[2/3] flex items-center justify-center">
          <Film />
        </div>
      )}

      <div className="p-3">
        <h3 className="text-sm font-semibold">{movie.title}</h3>

        {showActions && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={(e) => (e.stopPropagation(), addMovie(movie, 1))}
              className="text-xs bg-blue-600 px-2 py-1 rounded"
            >
              {person1Name}
            </button>
            <button
              onClick={(e) => (e.stopPropagation(), addMovie(movie, 2))}
              className="text-xs bg-purple-600 px-2 py-1 rounded"
            >
              {person2Name}
            </button>
          </div>
        )}

        {removePerson && (
          <button
            onClick={(e) => (e.stopPropagation(), removeMovie(movie.id, removePerson))}
            className="text-xs text-red-400 mt-2"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );

  const MovieModal = ({ movie, onClose }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          <X />
        </button>

        <div className="flex gap-6">
          {movie.poster_path && (
            <img
              src={`${IMAGE_BASE}${movie.poster_path}`}
              className="w-40 rounded-xl"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
            <p className="text-zinc-400 mb-2">{movie.overview}</p>
            {movie.director && (
              <p className="text-sm">🎬 {movie.director.name}</p>
            )}
            {movie.vote_average && (
              <p className="text-sm flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {movie.vote_average.toFixed(1)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* -------------------- Render -------------------- */
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold mb-6">🎬 MovieMatch</h1>

      <input
        value={searchQuery}
        onChange={(e) => searchMovies(e.target.value)}
        placeholder="Search movies..."
        className="w-full p-4 rounded-xl bg-zinc-900 mb-6"
      />

      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab("search")}>Discover</button>
        <button onClick={() => setActiveTab("lists")}>Your Lists</button>
        <button
          onClick={() => {
            setActiveTab("recommendations");
            generateRecommendations();
          }}
        >
          For You
        </button>
      </div>

      {activeTab === "search" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {searchResults.map((m) => (
            <MovieCard key={m.id} movie={m} showActions />
          ))}
        </div>
      )}

      {activeTab === "lists" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl mb-3">{person1Name}</h2>
            <div className="grid grid-cols-2 gap-4">
              {person1Movies.map((m) => (
                <MovieCard key={m.id} movie={m} removePerson={1} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl mb-3">{person2Name}</h2>
            <div className="grid grid-cols-2 gap-4">
              {person2Movies.map((m) => (
                <MovieCard key={m.id} movie={m} removePerson={2} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "recommendations" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {recommendations.length ? (
            recommendations.map((m) => (
              <MovieCard key={m.id} movie={m} showActions />
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <Sparkles className="w-12 h-12 mx-auto text-purple-500 mb-4" />
              <p>Add movies to both lists and we’ll find your perfect match ✨</p>
            </div>
          )}
        </div>
      )}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}

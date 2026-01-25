"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Film,
  Check,
  Plus,
  X,
  Play,
  Star,
  TrendingUp,
  ExternalLink,
  Users,
  Heart,
  Sparkles
} from "lucide-react";

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

  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  useEffect(() => {
    // Only run in browser
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

  const saveToStorage = (key, data) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, typeof data === "string" ? data : JSON.stringify(data));
  };

  const fetchTrending = async () => {
    if (!TMDB_API_KEY) return;

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
      );
      const data = await response.json();
      setTrendingMovies(data.results?.slice(0, 6) || []);
    } catch (error) {
      console.error("Error fetching trending:", error);
    }
  };

  const searchMovies = async (query) => {
    if (!query.trim() || !TMDB_API_KEY) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Error searching movies:", error);
    }
    setLoading(false);
  };

  const fetchMovieDetails = async (movieId) => {
    if (!TMDB_API_KEY) return;

    setLoading(true);
    try {
      const [detailsResponse, creditsResponse, externalIdsResponse] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/external_ids?api_key=${TMDB_API_KEY}`)
      ]);

      const details = await detailsResponse.json();
      const credits = await creditsResponse.json();
      const externalIds = await externalIdsResponse.json();

      setSelectedMovie({
        ...details,
        cast: credits.cast?.slice(0, 5) || [],
        director: credits.crew?.find(person => person.job === "Director"),
        imdb_id: externalIds.imdb_id
      });
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
    setLoading(false);
  };

  const addMovieToPerson = (movie, personNum) => {
    const list = personNum === 1 ? person1Movies : person2Movies;
    if (list.some(m => m.id === movie.id)) return;

    if (personNum === 1) {
      const updated = [...person1Movies, movie];
      setPerson1Movies(updated);
      saveToStorage("person1_movies", updated);
    } else {
      const updated = [...person2Movies, movie];
      setPerson2Movies(updated);
      saveToStorage("person2_movies", updated);
    }
  };

  const removeMovieFromPerson = (movieId, personNum) => {
    if (personNum === 1) {
      const updated = person1Movies.filter(m => m.id !== movieId);
      setPerson1Movies(updated);
      saveToStorage("person1_movies", updated);
    } else {
      const updated = person2Movies.filter(m => m.id !== movieId);
      setPerson2Movies(updated);
      saveToStorage("person2_movies", updated);
    }
  };

  const isInPerson1 = (movieId) => person1Movies.some(m => m.id === movieId);
  const isInPerson2 = (movieId) => person2Movies.some(m => m.id === movieId);

  const generateRecommendations = async () => {
    if (!TMDB_API_KEY) return;

    setLoading(true);
    setShowRecommendations(true);

    const p1Genres = {};
    const p2Genres = {};

    person1Movies.forEach(movie => {
      movie.genre_ids?.forEach(id => {
        p1Genres[id] = (p1Genres[id] || 0) + 1;
      });
    });

    person2Movies.forEach(movie => {
      movie.genre_ids?.forEach(id => {
        p2Genres[id] = (p2Genres[id] || 0) + 1;
      });
    });

    const commonGenres = Object.keys(p1Genres).filter(g => p2Genres[g]);

    try {
      let recommendedMovies = [];

      if (commonGenres.length > 0) {
        const topGenre = commonGenres.sort((a, b) =>
          (p1Genres[b] + p2Genres[b]) - (p1Genres[a] + p2Genres[a])
        )[0];

        const response = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${topGenre}&sort_by=vote_average.desc&vote_count.gte=1000`
        );
        const data = await response.json();
        recommendedMovies = data.results?.slice(0, 12) || [];
      } else {
        const response = await fetch(
          `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`
        );
        const data = await response.json();
        recommendedMovies = data.results?.slice(0, 12) || [];
      }

      const allMovieIds = [...person1Movies, ...person2Movies].map(m => m.id);

      let filtered = recommendedMovies.filter(m => !allMovieIds.includes(m.id));

      if (togethernessMode && commonGenres.length > 0) {
        filtered = filtered
          .filter(m => m.vote_average >= 7)
          .sort((a, b) => b.vote_average - a.vote_average);
      }

      setRecommendations(filtered);
    } catch (error) {
      console.error("Error generating recommendations:", error);
    }

    setLoading(false);
  };

  const findCommonMovies = () => {
    const p1Ids = new Set(person1Movies.map(m => m.id));
    return person2Movies.filter(m => p1Ids.has(m.id));
  };

  const commonMovies = findCommonMovies();

  const MovieCard = ({ movie, onSelect, showActions = false, personNum = null }) => (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div
        onClick={() => onSelect(movie)}
        className="relative aspect-[2/3] cursor-pointer transform transition hover:scale-105"
      >
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <Film className="w-16 h-16 text-gray-500" />
          </div>
        )}

        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black rounded-full px-2 py-1 text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            {movie.vote_average.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">{movie.title}</h3>
        <p className="text-gray-400 text-xs mb-2">
          {movie.release_date?.split("-")[0] || "N/A"}
        </p>

        {showActions && (
          <div className="flex gap-2">
            {!isInPerson1(movie.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addMovieToPerson(movie, 1);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
              >
                + {person1Name}
              </button>
            )}
            {!isInPerson2(movie.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addMovieToPerson(movie, 2);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded"
              >
                + {person2Name}
              </button>
            )}
          </div>
        )}

        {personNum && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeMovieFromPerson(movie.id, personNum);
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded flex items-center justify-center gap-1"
          >
            <X className="w-3 h-3" />
            Remove
          </button>
        )}
      </div>
    </div>
  );

  const StreamingServices = ({ info }) => {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Play className="w-5 h-5" />
          Where to Watch
        </h3>
        <a
          href={`https://www.justwatch.com/us/movie/${info?.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "movie"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 underline"
        >
          View on JustWatch <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  };

  const MovieModal = ({ movie, onClose }) => {
    if (!movie) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg overflow-hidden">
            <div className="relative">
              {movie.backdrop_path && (
                <div className="relative h-96">
                  <img
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                </div>
              )}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6 -mt-32 relative z-10">
              <div className="flex gap-6 mb-6">
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-48 rounded-lg shadow-2xl flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-3xl font-bold text-white mb-2">{movie.title}</h2>
                  {movie.tagline && (
                    <p className="text-gray-400 italic mb-4">{movie.tagline}</p>
                  )}

                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    {movie.vote_average > 0 && (
                      <div className="flex items-center gap-1 bg-yellow-500 text-black rounded-full px-3 py-1 font-bold">
                        <Star className="w-4 h-4 fill-current" />
                        {movie.vote_average.toFixed(1)}
                      </div>
                    )}
                    <span className="text-gray-400">{movie.release_date?.split("-")[0]}</span>
                    {movie.runtime && <span className="text-gray-400">{movie.runtime} min</span>}
                  </div>

                  <div className="flex gap-2 mb-4 flex-wrap">
                    {!isInPerson1(movie.id) && (
                      <button
                        onClick={() => addMovieToPerson(movie, 1)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                      >
                        <Plus className="w-5 h-5" />
                        Add to {person1Name}
                      </button>
                    )}
                    {!isInPerson2(movie.id) && (
                      <button
                        onClick={() => addMovieToPerson(movie, 2)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
                      >
                        <Plus className="w-5 h-5" />
                        Add to {person2Name}
                      </button>
                    )}
                  </div>

                  <p className="text-gray-300 mb-4">{movie.overview}</p>

                  {movie.genres && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {movie.genres.map(genre => (
                          <span key={genre.id} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {movie.director && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-400 mb-1">Director</h3>
                      <p className="text-gray-300">{movie.director.name}</p>
                    </div>
                  )}

                  {movie.cast?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Cast</h3>
                      <p className="text-gray-300 text-sm">
                        {movie.cast.map(actor => actor.name).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <StreamingServices info={{ title: movie.title }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-10 h-10 text-red-500" />
            <h1 className="text-4xl font-bold">MovieMatch</h1>
          </div>
          <p className="text-gray-400 text-sm mb-6">Compare tastes & get movie recommendations for two people</p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Person 1 Name</label>
              <input
                type="text"
                value={person1Name}
                onChange={(e) => {
                  setPerson1Name(e.target.value);
                  saveToStorage("person1_name", e.target.value);
                }}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Person 2 Name</label>
              <input
                type="text"
                value={person2Name}
                onChange={(e) => {
                  setPerson2Name(e.target.value);
                  saveToStorage("person2_name", e.target.value);
                }}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for movies to add..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchMovies(e.target.value);
              }}
              className="w-full bg-gray-800 text-white pl-12 pr-4 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </header>

        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-6 py-2 rounded-lg transition ${
              activeTab === "search"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Search className="w-5 h-5 inline mr-2" />
            Search
          </button>
          <button
            onClick={() => setActiveTab("compare")}
            className={`px-6 py-2 rounded-lg transition ${
              activeTab === "compare"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Compare Lists
          </button>
          <button
            onClick={() => {
              setActiveTab("recommendations");
              if (!showRecommendations) generateRecommendations();
            }}
            className={`px-6 py-2 rounded-lg transition ${
              activeTab === "recommendations"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            Recommendations
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setTogethernessMode(!togethernessMode)}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2
              ${
                togethernessMode
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }
            `}
          >
            <Heart className={`w-5 h-5 ${togethernessMode ? "fill-current" : ""}`} />
            ✨ Togetherness Mode
          </button>

          {togethernessMode && (
            <span className="text-sm text-pink-300 italic">
              Prioritizing shared vibes & mutual favorites
            </span>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          </div>
        )}

        {activeTab === "search" && !loading && (
          <div>
            {searchResults.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">Search Results</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {searchResults.map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={(m) => fetchMovieDetails(m.id)}
                      showActions={true}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp classNam

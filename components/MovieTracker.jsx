"use client";

import React, { useState, useEffect } from "react";
import {
  Search, Film, Plus, X, Play, Star, Users, Heart, Sparkles, TrendingUp, ExternalLink, Globe
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [listName, setListName] = useState("");
  const [savedLists, setSavedLists] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [streamingProviders, setStreamingProviders] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [showCountrySelector, setShowCountrySelector] = useState(false);

  const TMDB_API_KEY = "5792c693eccc10a144cad3c08930ecdb";
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  const countries = [
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
    { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
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
    if (typeof window === "undefined") return;
    localStorage.setItem(key, typeof data === "string" ? data : JSON.stringify(data));
  };

  const loadSavedLists = async () => {
    try {
      const result = await window.storage.list("movielist:");
      if (result && result.keys) {
        const lists = [];
        for (const key of result.keys) {
          const listData = await window.storage.get(key);
          if (listData && listData.value) {
            const parsed = JSON.parse(listData.value);
            lists.push({ key, ...parsed });
          }
        }
        setSavedLists(lists);
      }
    } catch (error) {
      console.log("No saved lists yet");
    }
  };

  const saveCurrentList = async () => {
    if (!listName.trim()) {
      setSaveMessage("Please enter a list name");
      return;
    }

    try {
      const listData = {
        name: listName,
        person1Name,
        person2Name,
        person1Movies,
        person2Movies,
        savedAt: new Date().toISOString()
      };

      const key = `movielist:${listName.toLowerCase().replace(/\s+/g, '-')}`;
      await window.storage.set(key, JSON.stringify(listData));
      
      setSaveMessage("✅ List saved successfully!");
      setTimeout(() => {
        setShowSaveModal(false);
        setSaveMessage("");
        setListName("");
      }, 1500);
      
      loadSavedLists();
    } catch (error) {
      setSaveMessage("❌ Error saving list");
      console.error(error);
    }
  };

  const loadList = async (key) => {
    try {
      const result = await window.storage.get(key);
      if (result && result.value) {
        const data = JSON.parse(result.value);
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
      }
    } catch (error) {
      console.error("Error loading list:", error);
    }
  };

  const deleteList = async (key) => {
    if (!confirm("Delete this saved list?")) return;
    
    try {
      await window.storage.delete(key);
      loadSavedLists();
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  const fetchTrending = async () => {
    if (!TMDB_API_KEY) return;
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
      );
      const data = await response.json();
      setTrendingMovies(data.results?.slice(0, 12) || []);
    } catch (error) {
      console.error("Error fetching trending:", error);
    }
  };

  const searchMovies = async (query) => {
    if (!query.trim()) {
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
    setLoading(true);
    try {
      const [detailsResponse, creditsResponse, providersResponse] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`)
      ]);

      const details = await detailsResponse.json();
      const credits = await creditsResponse.json();
      const providers = await providersResponse.json();

      setSelectedMovie({
        ...details,
        cast: credits.cast?.slice(0, 5) || [],
        director: credits.crew?.find(person => person.job === "Director")
      });
      
      setStreamingProviders(providers.results?.[selectedCountry] || null);
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

      if (togethernessMode && commonGenres.length > 0) {
        // TOGETHERNESS MODE: Focus on shared preferences
        // Get top 3 common genres weighted by both people's preferences
        const topCommonGenres = commonGenres
          .sort((a, b) => (p1Genres[b] + p2Genres[b]) - (p1Genres[a] + p2Genres[a]))
          .slice(0, 3);

        // Fetch movies from each common genre
        const genrePromises = topCommonGenres.map(genre =>
          fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genre}&sort_by=vote_average.desc&vote_count.gte=500&vote_average.gte=7.0`
          ).then(r => r.json())
        );

        const genreResults = await Promise.all(genrePromises);
        const allResults = genreResults.flatMap(data => data.results || []);

        // Score movies based on how well they match BOTH people's tastes
        const scoredMovies = allResults.map(movie => {
          let score = 0;
          
          // Bonus for genres both people like
          const movieGenres = movie.genre_ids || [];
          const sharedGenreCount = movieGenres.filter(g => 
            commonGenres.includes(g.toString())
          ).length;
          score += sharedGenreCount * 10;
          
          // Bonus for high ratings
          score += movie.vote_average * 2;
          
          // Bonus for popularity (but not too much)
          score += Math.min(movie.popularity / 100, 5);
          
          return { ...movie, matchScore: score };
        });

        // Remove duplicates and sort by match score
        const uniqueMovies = Array.from(
          new Map(scoredMovies.map(m => [m.id, m])).values()
        );
        
        recommendedMovies = uniqueMovies
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 12);

      } else if (commonGenres.length > 0) {
        // NORMAL MODE: Just use top shared genre
        const topGenre = commonGenres.sort((a, b) =>
          (p1Genres[b] + p2Genres[b]) - (p1Genres[a] + p2Genres[a])
        )[0];

        const response = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${topGenre}&sort_by=vote_average.desc&vote_count.gte=1000`
        );
        const data = await response.json();
        recommendedMovies = data.results?.slice(0, 12) || [];
      } else {
        // No common genres - show popular movies
        const response = await fetch(
          `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`
        );
        const data = await response.json();
        recommendedMovies = data.results?.slice(0, 12) || [];
      }

      const allMovieIds = [...person1Movies, ...person2Movies].map(m => m.id);
      const filtered = recommendedMovies.filter(m => !allMovieIds.includes(m.id));

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
    <div className="group relative bg-zinc-900/50 backdrop-blur rounded-xl overflow-hidden border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300">
      <div
        onClick={() => onSelect(movie)}
        className="relative aspect-[2/3] cursor-pointer overflow-hidden"
      >
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
        <p className="text-zinc-500 text-xs mb-3">
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
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                {person1Name}
              </button>
            )}
            {!isInPerson2(movie.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addMovieToPerson(movie, 2);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
              >
                {person2Name}
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
            className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Remove
          </button>
        )}
      </div>
    </div>
  );

  const MovieModal = ({ movie, onClose }) => {
    if (!movie) return null;

    const currentCountry = countries.find(c => c.code === selectedCountry) || countries[0];

    const renderStreamingProviders = () => {
      if (!streamingProviders) {
        return (
          <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-red-500" />
                Where to Watch
              </h3>
              <button
                onClick={() => setShowCountrySelector(!showCountrySelector)}
                className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <Globe className="w-4 h-4" />
                {currentCountry.flag} {currentCountry.code}
              </button>
            </div>

            {showCountrySelector && (
              <div className="mb-4 bg-zinc-900 rounded-lg p-3 border border-zinc-700">
                <p className="text-xs text-zinc-400 mb-2">Select your region:</p>
                <div className="grid grid-cols-3 gap-2">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setSelectedCountry(country.code);
                        setShowCountrySelector(false);
                        fetchMovieDetails(movie.id);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCountry === country.code
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {country.flag} {country.code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-zinc-400 text-sm">Streaming info not available in {currentCountry.name}</p>
          </div>
        );
      }

      const { flatrate, rent, buy, link } = streamingProviders;
      
      // Use the JustWatch link from TMDB for all providers
      const justWatchLink = link || `https://www.justwatch.com`;

      return (
        <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-red-500" />
              Where to Watch
            </h3>
            <button
              onClick={() => setShowCountrySelector(!showCountrySelector)}
              className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              <Globe className="w-4 h-4" />
              {currentCountry.flag} {currentCountry.code}
            </button>
          </div>

          {showCountrySelector && (
            <div className="mb-4 bg-zinc-900 rounded-lg p-3 border border-zinc-700">
              <p className="text-xs text-zinc-400 mb-2">Select your region:</p>
              <div className="grid grid-cols-3 gap-2">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => {
                      setSelectedCountry(country.code);
                      setShowCountrySelector(false);
                      fetchMovieDetails(movie.id);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCountry === country.code
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {country.flag} {country.code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {flatrate && flatrate.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-zinc-400 mb-3">Stream</p>
              <div className="flex flex-wrap gap-3">
                {flatrate.map((provider) => (
                  <a
                    key={provider.provider_id}
                    href={justWatchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                    title={`Watch ${movie.title} on ${provider.provider_name} via JustWatch`}
                  >
                    <div className="relative">
                      <img
                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="w-14 h-14 rounded-lg border border-zinc-600 group-hover:border-purple-500 transition-all group-hover:scale-110"
                      />
                      <ExternalLink className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs text-zinc-400 group-hover:text-purple-400 transition-colors text-center max-w-[60px]">
                      {provider.provider_name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {rent && rent.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-zinc-400 mb-3">Rent</p>
              <div className="flex flex-wrap gap-3">
                {rent.slice(0, 4).map((provider) => (
                  <a
                    key={provider.provider_id}
                    href={justWatchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                    title={`Rent ${movie.title} on ${provider.provider_name} via JustWatch`}
                  >
                    <div className="relative">
                      <img
                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="w-14 h-14 rounded-lg border border-zinc-600 group-hover:border-blue-500 transition-all group-hover:scale-110"
                      />
                      <ExternalLink className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs text-zinc-400 group-hover:text-blue-400 transition-colors text-center max-w-[60px]">
                      {provider.provider_name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {buy && buy.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-zinc-400 mb-3">Buy</p>
              <div className="flex flex-wrap gap-3">
                {buy.slice(0, 4).map((provider) => (
                  <a
                    key={provider.provider_id}
                    href={justWatchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                    title={`Buy ${movie.title} on ${provider.provider_name} via JustWatch`}
                  >
                    <div className="relative">
                      <img
                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="w-14 h-14 rounded-lg border border-zinc-600 group-hover:border-green-500 transition-all group-hover:scale-110"
                      />
                      <ExternalLink className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs text-zinc-400 group-hover:text-green-400 transition-colors text-center max-w-[60px]">
                      {provider.provider_name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {!flatrate && !rent && !buy && (
            <p className="text-zinc-400 text-sm">No streaming options available in {currentCountry.name}</p>
          )}

          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              View all options on JustWatch
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <p className="text-xs text-zinc-600 mt-4">
            Streaming data provided by JustWatch • {currentCountry.name}
          </p>
        </div>
      );
    };

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="min-h-screen px-4 py-8 flex items-center justify-center">
          <div className="max-w-4xl w-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
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
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

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
                  {movie.tagline && (
                    <p className="text-zinc-400 italic mb-4">{movie.tagline}</p>
                  )}

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

                  <div className="flex gap-3 mb-6">
                    {!isInPerson1(movie.id) && (
                      <button
                        onClick={() => addMovieToPerson(movie, 1)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        {person1Name}
                      </button>
                    )}
                    {!isInPerson2(movie.id) && (
                      <button
                        onClick={() => addMovieToPerson(movie, 2)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        {person2Name}
                      </button>
                    )}
                  </div>

                  <p className="text-zinc-300 leading-relaxed mb-6">{movie.overview}</p>

                  {movie.genres && movie.genres.length > 0 && (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {movie.genres.map(genre => (
                          <span key={genre.id} className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {renderStreamingProviders()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SaveModal = () => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-white">Save Your Lists</h2>
        <p className="text-zinc-400 mb-6">Give your movie lists a name to save them for later</p>
        
        <input
          type="text"
          placeholder="e.g., Date Night Favorites"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onKeyPress={(e) => e.key === 'Enter' && saveCurrentList()}
        />
        
        {saveMessage && (
          <p className="text-sm mb-4 text-center">{saveMessage}</p>
        )}
        
        <div className="flex gap-3">
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
          <button
            onClick={saveCurrentList}
            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Save List
          </button>
        </div>
      </div>
    </div>
  );

  const LoadModal = () => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-white">Load Saved Lists</h2>
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
              <div
                key={list.key}
                className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-750 transition-colors border border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{list.name}</h3>
                    <p className="text-sm text-zinc-400 mb-2">
                      {list.person1Name} & {list.person2Name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {list.person1Movies.length + list.person2Movies.length} movies total • 
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent mb-2">
                MovieMatch
              </h1>
              <p className="text-zinc-400">Discover movies you'll both love</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-5 py-3 rounded-xl font-semibold bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center gap-2"
              >
                <Film className="w-5 h-5" />
                Save Lists
              </button>
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
              <button
                onClick={() => setTogethernessMode(!togethernessMode)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  togethernessMode
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-purple-500/50"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"
                }`}
              >
                <Sparkles className={`w-5 h-5 ${togethernessMode ? "fill-current" : ""}`} />
                Togetherness Mode
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
                saveToStorage("person1_name", e.target.value);
              }}
              placeholder="First person's name"
              className="bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <input
              type="text"
              value={person2Name}
              onChange={(e) => {
                setPerson2Name(e.target.value);
                saveToStorage("person2_name", e.target.value);
              }}
              placeholder="Second person's name"
              className="bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
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

        {/* Tabs */}
        <div className="flex gap-3 mb-8 border-b border-zinc-800 pb-px">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-6 py-3 rounded-t-lg font-medium transition-all ${
              activeTab === "search"
                ? "bg-zinc-900 text-white border-b-2 border-red-500"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Search className="w-5 h-5 inline mr-2" />
            Discover
          </button>
          <button
            onClick={() => setActiveTab("compare")}
            className={`px-6 py-3 rounded-t-lg font-medium transition-all ${
              activeTab === "compare"
                ? "bg-zinc-900 text-white border-b-2 border-red-500"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Your Lists
            {commonMovies.length > 0 && (
              <span className="ml-2 bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                {commonMovies.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("recommendations");
              if (!showRecommendations) generateRecommendations();
            }}
            className={`px-6 py-3 rounded-t-lg font-medium transition-all ${
              activeTab === "recommendations"
                ? "bg-zinc-900 text-white border-b-2 border-red-500"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Heart className="w-5 h-5 inline mr-2" />
            For You
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          </div>
        )}

        {activeTab === "search" && !loading && (
          <div>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {searchResults.map(movie => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelect={(m) => fetchMovieDetails(m.id)}
                    showActions={true}
                  />
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-red-500" />
                  <h2 className="text-2xl font-bold">Trending This Week</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {trendingMovies.map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={(m) => fetchMovieDetails(m.id)}
                      showActions={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "compare" && (
          <div className="space-y-8">
            {commonMovies.length > 0 && (
              <div className="bg-gradient-to-r from-pink-950/50 to-purple-950/50 backdrop-blur rounded-2xl p-8 border border-pink-900/20">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Heart className="w-7 h-7 text-pink-400 fill-pink-400" />
                  Perfect Match ({commonMovies.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {commonMovies.map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={(m) => fetchMovieDetails(m.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900/50 backdrop-blur rounded-2xl p-6 border border-zinc-800">
                <h2 className="text-xl font-bold mb-4 text-blue-400">
                  {person1Name}'s List ({person1Movies.length})
                </h2>
                {person1Movies.length === 0 ? (
                  <div className="text-center py-16">
                    <Film className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 mb-4">No movies yet</p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Start adding movies →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {person1Movies.map(movie => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onSelect={(m) => fetchMovieDetails(m.id)}
                        personNum={1}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-zinc-900/50 backdrop-blur rounded-2xl p-6 border border-zinc-800">
                <h2 className="text-xl font-bold mb-4 text-purple-400">
                  {person2Name}'s List ({person2Movies.length})
                </h2>
                {person2Movies.length === 0 ? (
                  <div className="text-center py-16">
                    <Film className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 mb-4">No movies yet</p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="text-purple-400 hover:text-purple-300 font-medium"
                    >
                      Start adding movies →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {person2Movies.map(movie => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onSelect={(m) => fetchMovieDetails(m.id)}
                        personNum={2}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="space-y-6">
            {togethernessMode && (
              <div className="bg-gradient-to-r from-pink-950/50 to-purple-950/50 backdrop-blur rounded-2xl p-8 border border-pink-900/20">
                <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                  <Sparkles className="w-7 h-7 text-yellow-400" />
                  ✨ Togetherness Mode Active
                </h2>
                <p className="text-zinc-300 mb-2">
                  Finding movies that match <strong>both</strong> of your tastes:
                </p>
                <ul className="text-zinc-400 text-sm space-y-1 ml-6 list-disc">
                  <li>Prioritizing genres you both enjoy</li>
                  <li>Only showing highly-rated films (7.0+)</li>
                  <li>Scoring based on shared preferences</li>
                  <li>Filtering for movies you'll both love</li>
                </ul>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-950/50 to-pink-950/50 backdrop-blur rounded-2xl p-8 border border-purple-900/20">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                <Heart className="w-7 h-7 text-pink-400" />
                {togethernessMode ? "Perfect for Both of You" : "Recommended for You"}
              </h2>
              <p className="text-zinc-400 mb-6">
                {togethernessMode 
                  ? "These picks are optimized for maximum compatibility"
                  : "Based on your shared interests and favorite genres"
                }
              </p>
              <button
                onClick={generateRecommendations}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 disabled:from-zinc-700 disabled:to-zinc-800 text-white font-semibold px-6 py-3 rounded-xl transition-all"
              >
                Refresh Recommendations
              </button>
            </div>

            {recommendations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {recommendations.map(movie => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelect={(m) => fetchMovieDetails(m.id)}
                    showActions={true}
                  />
                ))}
              </div>
            ) : !loading && (
              <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800">
                <Sparkles className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 text-lg">
                  Add movies to both lists to get personalized recommendations
                </p>
              </div>
            )}
          </div>
        )}

        {selectedMovie && (
          <MovieModal
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
          />
        )}

        {showSaveModal && <SaveModal />}
        {showLoadModal && <LoadModal />}
      </div>
    </div>
  );
};

export default MovieTracker;

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
  const [togethernessMode, setTogethernessMode] = useState(false);
  const [streamingProviders, setStreamingProviders] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [showCountrySelector, setShowCountrySelector] = useState(false);

  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
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
  }, []);

  const loadFromStorage = () => {
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
      console.error("Error loading from localStorage:", e);
    }
  };

  const saveToStorage = (key, data) => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, typeof data === "string" ? data : JSON.stringify(data));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  };

  const fetchTrending = async () => {
    if (!TMDB_API_KEY) return;
    try {
      const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
      const data = await res.json();
      setTrendingMovies(data.results?.slice(0, 12) || []);
    } catch (e) {
      console.error("Error fetching trending:", e);
    }
  };

  const searchMovies = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error("Error searching:", e);
    }
    setLoading(false);
  };

  const fetchMovieDetails = async (movieId) => {
    setLoading(true);
    try {
      const [dRes, cRes, pRes] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`)
      ]);
      const details = await dRes.json();
      const credits = await cRes.json();
      const providers = await pRes.json();

      setSelectedMovie({
        ...details,
        cast: credits.cast?.slice(0, 5) || [],
        director: credits.crew?.find(p => p.job === "Director")
      });
      setStreamingProviders(providers.results?.[selectedCountry] || null);
    } catch (e) {
      console.error("Error fetching details:", e);
    }
    setLoading(false);
  };

  const addMovieToPerson = (movie, num) => {
    const list = num === 1 ? person1Movies : person2Movies;
    if (list.some(m => m.id === movie.id)) return;
    const updated = [...list, movie];
    if (num === 1) {
      setPerson1Movies(updated);
      saveToStorage("person1_movies", updated);
    } else {
      setPerson2Movies(updated);
      saveToStorage("person2_movies", updated);
    }
  };

  const removeMovieFromPerson = (movieId, num) => {
    if (num === 1) {
      const updated = person1Movies.filter(m => m.id !== movieId);
      setPerson1Movies(updated);
      saveToStorage("person1_movies", updated);
    } else {
      const updated = person2Movies.filter(m => m.id !== movieId);
      setPerson2Movies(updated);
      saveToStorage("person2_movies", updated);
    }
  };

  const isInPerson1 = (id) => person1Movies.some(m => m.id === id);
  const isInPerson2 = (id) => person2Movies.some(m => m.id === id);

  const generateRecommendations = async () => {
    setLoading(true);

    const p1G = {}, p2G = {};
    person1Movies.forEach(m => m.genre_ids?.forEach(id => { p1G[id] = (p1G[id] || 0) + 1; }));
    person2Movies.forEach(m => m.genre_ids?.forEach(id => { p2G[id] = (p2G[id] || 0) + 1; }));

    const shared = Object.keys(p1G)
      .filter(g => p2G[g])
      .sort((a, b) => (p1G[b] + p2G[b]) - (p1G[a] + p2G[a]));

    const existingIds = new Set([...person1Movies, ...person2Movies].map(m => m.id));

    try {
      let results = [];

      if (shared.length > 0) {
        const top = shared.slice(0, 3);

        if (togethernessMode) {
          const fetches = top.map(g =>
            fetch(
              `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}` +
              `&with_genres=${g}&with_original_language=en` +
              `&sort_by=vote_average.desc&vote_count.gte=200&vote_average.gte=6.5`
            ).then(r => r.json()).then(d => d.results || []).catch(() => [])
          );
          const pages = await Promise.all(fetches);
          const pool = pages.flat();

          const scored = pool.map(m => {
            let s = 0;
            const mg = m.genre_ids || [];
            mg.forEach(g => { if (shared.includes(String(g))) s += 15; });
            s += (m.vote_average || 0) * 3;
            const yr = parseInt((m.release_date || "0").slice(0, 4));
            if (yr >= 2022) s += 10;
            else if (yr >= 2018) s += 6;
            else if (yr >= 2014) s += 3;
            if (mg.some(g => (p1G[g] || 0) >= 2 && (p2G[g] || 0) >= 2)) s += 12;
            return { ...m, _score: s };
          });

          const map = new Map();
          scored.forEach(m => { if (!map.has(m.id) || map.get(m.id)._score < m._score) map.set(m.id, m); });
          results = [...map.values()].sort((a, b) => b._score - a._score);

        } else {
          const genreParam = top.slice(0, 2).join("%7C");
          const res = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}` +
            `&with_genres=${genreParam}&with_original_language=en` +
            `&sort_by=vote_average.desc&vote_count.gte=500&vote_average.gte=6.5`
          );
          const data = await res.json();
          results = data.results || [];
        }
      } else {
        const res = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}` +
          `&with_original_language=en&sort_by=popularity.desc` +
          `&vote_count.gte=500&vote_average.gte=6.5`
        );
        const data = await res.json();
        results = data.results || [];
      }

      const filtered = results.filter(m => !existingIds.has(m.id)).slice(0, 12);
      setRecommendations(filtered);

    } catch (e) {
      console.error("Recommendation error:", e);
      setRecommendations([]);
    }
    setLoading(false);
  };

  const commonMovies = (() => {
    const ids = new Set(person1Movies.map(m => m.id));
    return person2Movies.filter(m => ids.has(m.id));
  })();

  const MovieCard = ({ movie, onSelect, showActions = false, personNum = null }) => (
    <div className="group relative bg-zinc-900/50 backdrop-blur rounded-xl overflow-hidden border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300">
      <div onClick={() => onSelect(movie)} className="relative aspect-[2/3] cursor-pointer overflow-hidden">
        {movie.poster_path ? (
          <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><Film className="w-12 h-12 text-zinc-600" /></div>
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
              <button onClick={(e) => { e.stopPropagation(); addMovieToPerson(movie, 1); }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">{person1Name}</button>
            )}
            {!isInPerson2(movie.id) && (
              <button onClick={(e) => { e.stopPropagation(); addMovieToPerson(movie, 2); }} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">{person2Name}</button>
            )}
          </div>
        )}
        {personNum && (
          <button onClick={(e) => { e.stopPropagation(); removeMovieFromPerson(movie.id, personNum); }} className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
            <X className="w-3 h-3" /> Remove
          </button>
        )}
      </div>
    </div>
  );

  const MovieModal = ({ movie, onClose }) => {
    if (!movie) return null;
    const cur = countries.find(c => c.code === selectedCountry) || countries[0];
    const justWatchLink = streamingProviders?.link || null;
    const { flatrate, rent, buy } = streamingProviders || {};

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="min-h-screen px-4 py-8 flex items-center justify-center">
          <div className="max-w-4xl w-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
            <div className="relative">
              {movie.backdrop_path && (
                <div className="relative h-80">
                  <img src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} alt={movie.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
                </div>
              )}
              <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-colors"><X className="w-5 h-5 text-white" /></button>
            </div>

            <div className="p-8 -mt-24 relative z-10">
              <div className="flex gap-6 mb-6">
                {movie.poster_path && <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-40 rounded-xl shadow-2xl flex-shrink-0 border border-zinc-800" />}
                <div className="flex-1 min-w-0">
                  <h2 className="text-3xl font-bold text-white mb-2">{movie.title}</h2>
                  {movie.tagline && <p className="text-zinc-400 italic mb-4">{movie.tagline}</p>}
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    {movie.vote_average > 0 && (
                      <div className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg px-3 py-1.5 font-semibold">
                        <Star className="w-4 h-4 fill-current" />{movie.vote_average.toFixed(1)}
                      </div>
                    )}
                    <span className="text-zinc-400">{movie.release_date?.split("-")[0]}</span>
                    {movie.runtime && <span className="text-zinc-400">{movie.runtime} min</span>}
                  </div>
                  <div className="flex gap-3 mb-6 flex-wrap">
                    {!isInPerson1(movie.id) && <button onClick={() => addMovieToPerson(movie, 1)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"><Plus className="w-5 h-5" />{person1Name}</button>}
                    {!isInPerson2(movie.id) && <button onClick={() => addMovieToPerson(movie, 2)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"><Plus className="w-5 h-5" />{person2Name}</button>}
                  </div>
                  <p className="text-zinc-300 leading-relaxed mb-6">{movie.overview}</p>
                  {movie.genres?.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                      {movie.genres.map(g => <span key={g.id} className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">{g.name}</span>)}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Play className="w-5 h-5 text-red-500" />Where to Watch</h3>
                  <button onClick={() => setShowCountrySelector(!showCountrySelector)} className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg text-sm transition-colors">
                    <Globe className="w-4 h-4" />{cur.flag} {cur.code}
                  </button>
                </div>
                {showCountrySelector && (
                  <div className="mb-4 bg-zinc-900 rounded-lg p-3 border border-zinc-700">
                    <p className="text-xs text-zinc-400 mb-2">Select your region:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {countries.map(c => (
                        <button key={c.code} onClick={() => { setSelectedCountry(c.code); setShowCountrySelector(false); fetchMovieDetails(movie.id); }} className={`px-3 py-2 rounded-lg text-sm transition-colors ${selectedCountry === c.code ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                          {c.flag} {c.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {flatrate?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-zinc-400 mb-3">Stream</p>
                    <div className="flex flex-wrap gap-3">
                      {flatrate.slice(0, 5).map(p => (
                        <a key={p.provider_id} href={justWatchLink || "#"} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group cursor-pointer">
                          <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} className="w-14 h-14 rounded-lg border border-zinc-600 group-hover:border-purple-500 transition-all group-hover:scale-110" />
                          <span className="text-xs text-zinc-400 group-hover:text-purple-400 transition-colors text-center" style={{ maxWidth: 60 }}>{p.provider_name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {!flatrate && !rent && !buy && <p className="text-zinc-400 text-sm">No streaming options available in {cur.name}</p>}
                {justWatchLink && (
                  <a href={justWatchLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    View all options on JustWatch <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent mb-2">
                MovieMatch
              </h1>
              <p className="text-zinc-400">Discover movies you'll both love</p>
            </div>
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
            </button>
          </div>

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
              generateRecommendations();
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

        {activeTab === "recommendations" && !loading && (
          <div>
            {recommendations.length === 0 ? (
              <div className="text-center py-24">
                <Sparkles className="w-14 h-14 text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No recommendations yet</h2>
                <p className="text-zinc-400 mb-6">
                  Add some movies to both lists and we’ll find your perfect match ✨
                </p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Discover movies
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                  <h2 className="text-2xl font-bold">
                    Recommended for both of you
                  </h2>
                </div>
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
              </div>
            )}
          </div>
        )}
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
};

export default MovieTracker;

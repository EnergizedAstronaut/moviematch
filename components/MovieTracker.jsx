"use client";
// MovieMatch v3.1 - X button cache break test

import { useState, useEffect } from "react";

// --- Inline SVG Icons --------------------------------------------------------
const iconBase = { width:24, height:24, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:2, strokeLinecap:"round", strokeLinejoin:"round" };
const Search = (p) => <svg {...iconBase} {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const Film = (p) => <svg {...iconBase} {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="22" y2="15"/><line x1="7" y1="4" x2="7" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/></svg>;
const Plus = (p) => <svg {...iconBase} {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const X = (p) => <svg {...iconBase} {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const Play = (p) => <svg {...iconBase} {...p}><polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none"/></svg>;
const Star = (p) => { const {fill:f,...rest}=p||{}; return <svg {...iconBase} {...rest}><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={f||"none"} stroke="currentColor"/></svg>; };
const Users = (p) => <svg {...iconBase} {...p}><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="17" cy="9" r="2"/><path d="M23 21v-1a3 3 0 0 0-3-3h-.5"/></svg>;
const Heart = (p) => { const {fill:f,...rest}=p||{}; return <svg {...iconBase} {...rest}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={f||"none"}/></svg>; };
const Sparkles = (p) => { const {fill:f,...rest}=p||{}; return <svg {...iconBase} {...rest}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" fill={f||"none"}/><path d="M19 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill={f||"none"}/><path d="M5 19l.5 1.5 1.5.5-1.5.5L5 23l-.5-1.5L3 21l1.5-.5z" fill={f||"none"}/></svg>; };
const TrendingUp = (p) => <svg {...iconBase} {...p}><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>;
const ExternalLink = (p) => <svg {...iconBase} {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
const Globe = (p) => <svg {...iconBase} {...p}><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>;
const BarChart3 = (p) => <svg {...iconBase} {...p}><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="2" width="4" height="19"/></svg>;
const Zap = (p) => { const {fill:f,...rest}=p||{}; return <svg {...iconBase} {...rest}><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill={f||"none"}/></svg>; };

// --- Constants ---------------------------------------------------------------
const TMDB_API_KEY = "5792c693eccc10a144cad3c08930ecdb";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// --- API CONFIG -----------------------------------------------------------
const TASTEDIVE_KEY = "1068398-Moviemat-42500EF7";
const TASTEDIVE_BASE = "https://tastedive.com/api/similar";

// Helper fetch
const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("API error");
  return res.json();
};

const COUNTRIES = [
  {code:"US",name:"United States",flag:"🇺🇸"},{code:"GB",name:"United Kingdom",flag:"🇬🇧"},
  {code:"CA",name:"Canada",flag:"🇨🇦"},{code:"AU",name:"Australia",flag:"🇦🇺"},
  {code:"DE",name:"Germany",flag:"🇩🇪"},{code:"FR",name:"France",flag:"🇫🇷"},
  {code:"ES",name:"Spain",flag:"🇪🇸"},{code:"IT",name:"Italy",flag:"🇮🇹"},
  {code:"MX",name:"Mexico",flag:"🇲🇽"},{code:"BR",name:"Brazil",flag:"🇧🇷"},
  {code:"IN",name:"India",flag:"🇮🇳"},{code:"JP",name:"Japan",flag:"🇯🇵"},
];

const GENRE_NAMES = {
  28:"Action",12:"Adventure",16:"Animation",35:"Comedy",80:"Crime",99:"Documentary",
  18:"Drama",10751:"Family",14:"Fantasy",36:"History",27:"Horror",10402:"Music",
  9648:"Mystery",10749:"Romance",878:"Science Fiction",10770:"TV Movie",53:"Thriller",10752:"War",37:"Western"
};
const searchTMDBMovie = async (title) => {
  const url =
    `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}` +
    `&query=${encodeURIComponent(title)}`;

  const data = await fetchJSON(url);
  return data.results?.[0] || null;
};

const ANIMATION_GENRE_ID = 16;

function normalizeTitle(t) {
  return (t || "").toLowerCase().replace(/[\u2018\u2019\u201C\u201D]/g, "'").trim();
}

const BLOCKED_SUBSTRINGS = [
  "gabriel",
  "quieres ser mi",
  "lgbt",
  "lgbtq",
  "lesbian",
  "gay",
  "pride",
  "queer",
  "transgender",
];

function isAllowed(movie) {
  if (movie.original_language !== "en") return false;
  // Block Animation genre globally
  if ((movie.genre_ids || []).includes(ANIMATION_GENRE_ID)) return false;
  const t = normalizeTitle(movie.title);
  for (const block of BLOCKED_SUBSTRINGS) {
    if (t.includes(block)) return false;
  }
  if (/^[^\x20-\x7E]/.test(t)) return false;
  return true;
}

function countGenres(movies) {
  const counts = {};
  movies.forEach(m => (m.genre_ids || []).forEach(id => { counts[id] = (counts[id] || 0) + 1; }));
  return counts;
}

// --- Streaming helper --------------------------------------------------------
async function getStreamingInfo(movieId, country = "US") {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    const r = data.results?.[country] || {};
    return { flatrate: r.flatrate || [], rent: r.rent || [], buy: r.buy || [] };
  } catch {
    return { flatrate: [], rent: [], buy: [] };
  }
}

// Score boost when both persons' lists share a streaming platform
function sharedProviderBonus(p1Flatrate, p2Flatrate) {
  const s1 = new Set(p1Flatrate.map(p => p.provider_id));
  let bonus = 0;
  p2Flatrate.forEach(p => { if (s1.has(p.provider_id)) bonus += 25; });
  return bonus;
}

// --- Main Component ----------------------------------------------------------
export default function MovieTracker() {
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [listName, setListName] = useState("");
  const [savedLists, setSavedLists] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [compatibilityScore, setCompatibilityScore] = useState(null);
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [recsKey, setRecsKey] = useState(0);
  const [hiddenMovieIds, setHiddenMovieIds] = useState(new Set());

  // NEW: streaming toggle
  const [streamingOnly, setStreamingOnly] = useState(false);

  // --- Bootstrap -----------------------------------------------------------
  useEffect(() => { fetchTrending(); }, [selectedCountry, streamingOnly]);

  useEffect(() => {
    if (person1Movies.length > 0 && person2Movies.length > 0) setCompatibilityScore(calcCompatibilityScore());
    else setCompatibilityScore(null);
  }, [person1Movies, person2Movies]);

  // --- Save/Load -----------------------------------------------------------
  function saveCurrentList() {
    if (!listName.trim()) { setSaveMessage("Please enter a list name"); return; }
    const key = listName.toLowerCase().replace(/\s+/g, "-");
    const entry = { key, name: listName, person1Name, person2Name, person1Movies, person2Movies, savedAt: new Date().toISOString() };
    const idx = savedLists.findIndex(l => l.key === key);
    const updated = [...savedLists];
    if (idx >= 0) updated[idx] = entry; else updated.push(entry);
    setSavedLists(updated);
    setSaveMessage("Saved!");
    setTimeout(() => { setShowSaveModal(false); setSaveMessage(""); setListName(""); }, 2000);
  }
  const handleSave = () => { if (!listName.trim()) { setSaveMessage("Please enter a list name."); return; } saveCurrentList(); };
  function loadList(key) {
    const d = savedLists.find(l => l.key === key);
    if (d) { setPerson1Name(d.person1Name); setPerson2Name(d.person2Name); setPerson1Movies(d.person1Movies); setPerson2Movies(d.person2Movies); setShowLoadModal(false); setActiveTab("compare"); }
  }
  function deleteList(key) { if (!confirm("Delete this saved list?")) return; setSavedLists(savedLists.filter(l => l.key !== key)); }

  // --- Export/Import -------------------------------------------------------
  function exportData() {
    const data = { person1Name, person2Name, person1Movies, person2Movies, savedLists, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `moviematch-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url); setShowExportModal(false);
  }
  function handleImport(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result);
        if (data.person1Name) setPerson1Name(data.person1Name);
        if (data.person2Name) setPerson2Name(data.person2Name);
        if (data.person1Movies) setPerson1Movies(data.person1Movies);
        if (data.person2Movies) setPerson2Movies(data.person2Movies);
        if (data.savedLists) setSavedLists(data.savedLists);
        alert("Data imported successfully!");
        setActiveTab("compare");
      } catch { alert("Error importing file."); }
    };
    reader.readAsText(file); event.target.value = "";
  }

  // --- TMDB ----------------------------------------------------------------
  async function shouldExcludeMovie(movieId) {
    try {
      const [ratingRes, keywordRes] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/release_dates?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/keywords?api_key=${TMDB_API_KEY}`)
      ]);
      
      // Check G/PG rating
      const ratingData = await ratingRes.json();
      const usRelease = ratingData.results?.find(r => r.iso_3166_1 === "US");
      if (usRelease?.release_dates) {
        const certs = usRelease.release_dates.map(rd => rd.certification).filter(c => c && c.trim());
        if (certs.some(c => c === "G" || c === "PG")) return true;
      }
      
      // Check LGBTQ keywords
      const keywordData = await keywordRes.json();
      const keywords = (keywordData.keywords || []).map(k => k.name.toLowerCase());
      const lgbtqKeywords = [
        "lgbt", "lgbtq", "gay", "lesbian", "bisexual", "transgender", "queer",
        "homosexuality", "gay romance", "lesbian romance", "coming out",
        "gay parent", "lesbian parent", "same-sex marriage", "gay theme",
        "drag queen", "gay couple", "lesbian couple", "lgbtq+", "gay man",
        "lesbian relationship", "gay relationship"
      ];
      if (keywords.some(kw => lgbtqKeywords.some(lk => kw.includes(lk)))) return true;
      
      return false;
    } catch { return false; }
  }

  async function fetchTrending() {
    setLoading(true);
    try {
      const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
      const data = await res.json();
      const filtered = (data.results || []).filter(m => {
        const year = parseInt((m.release_date || "0").slice(0, 4));
        return year >= 1985 && isAllowed(m);
      });
      // Check rating + streaming in parallel per movie
      const checked = await Promise.all(filtered.slice(0, 24).map(async m => {
        const [ex, stream] = await Promise.all([
          shouldExcludeMovie(m.id),
          getStreamingInfo(m.id, selectedCountry)
        ]);
        return { ...m, _ex: ex, _hasStream: stream.flatrate.length > 0 };
      }));
      setTrendingMovies(
        checked
          .filter(m => !m._ex && (!streamingOnly || m._hasStream))
          .slice(0, 12)
      );
    } catch(e) {}
    setLoading(false);
  }

  async function searchMovies(query) {
    if (!query.trim()) { setSearchResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`);
      const data = await res.json();
      const filtered = (data.results || []).filter(m => {
        const year = parseInt((m.release_date || "0").slice(0, 4));
        return year >= 1985 && isAllowed(m);
      });
      const checked = await Promise.all(filtered.slice(0, 24).map(async m => {
        const [ex, stream] = await Promise.all([
          shouldExcludeMovie(m.id),
          getStreamingInfo(m.id, selectedCountry)
        ]);
        return { ...m, _ex: ex, _hasStream: stream.flatrate.length > 0 };
      }));
      setSearchResults(checked.filter(m => !m._ex && (!streamingOnly || m._hasStream)));
    } catch(e) {}
    setLoading(false);
  }

  async function fetchMovieDetails(movieId) {
    setLoading(true);
    try {
      const [dR,cR,rR,pR,vR,eR] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/release_dates?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/external_ids?api_key=${TMDB_API_KEY}`),
      ]);
      const details=await dR.json(), credits=await cR.json(), relDates=await rR.json();
      const providers=await pR.json(), videos=await vR.json(), extIds=await eR.json();
      const usRating = relDates.results?.find(r=>r.iso_3166_1==="US")?.release_dates?.[0]?.certification || "N/A";
      const trailers = (videos.results||[]).filter(v=>v.site==="YouTube"&&v.type==="Trailer");
      const teasers  = (videos.results||[]).filter(v=>v.site==="YouTube"&&v.type==="Teaser");
      const trailer = trailers.find(v=>v.name.toLowerCase().includes("official")) || trailers[0] || teasers[0] || null;
      setSelectedMovie({ ...details, cast:credits.cast?.slice(0,5)||[], director:credits.crew?.find(p=>p.job==="Director"), maturity:usRating, trailer:trailer?`https://www.youtube.com/watch?v=${trailer.key}`:null, imdb_id:extIds.imdb_id||null });
      setStreamingProviders(providers.results?.[selectedCountry]||null);
    } catch(e) {}
    setLoading(false);
  }

  // --- List Helpers --------------------------------------------------------
  function addMovieToPerson(movie, num) {
    const list = num===1?person1Movies:person2Movies;
    if (list.some(m=>m.id===movie.id)) return;
    if (num===1) setPerson1Movies([...list,movie]); else setPerson2Movies([...list,movie]);
  }
  function removeMovieFromPerson(id, num) {
    const updated = (num===1?person1Movies:person2Movies).filter(m=>m.id!==id);
    if (num===1) setPerson1Movies(updated); else setPerson2Movies(updated);
  }
  const isInPerson1 = id => person1Movies.some(m=>m.id===id);
  const isInPerson2 = id => person2Movies.some(m=>m.id===id);
  const commonMovies = (() => { const s = new Set(person1Movies.map(m=>m.id)); return person2Movies.filter(m=>s.has(m.id)); })();
  
  function removeFromRecommendations(id) {
    // Mark this movie as hidden permanently
    setHiddenMovieIds(prev => new Set([...prev, id]));
    // Remove from current recommendations
    setRecommendations(recommendations.filter(m => m.id !== id));
  }

  // --- Compatibility -------------------------------------------------------
  function calcCompatibilityScore() {
    if (!person1Movies.length||!person2Movies.length) return null;
    const p1G=countGenres(person1Movies), p2G=countGenres(person2Movies);
    const all = new Set([...Object.keys(p1G),...Object.keys(p2G)]);
    const common = [...all].filter(g=>p1G[g]&&p2G[g]);
    const base = all.size>0?(common.length/all.size)*100:0;
    const movieBonus = Math.min(commonMovies.length*5,20);
    const avg = l => l.reduce((s,m)=>s+(m.vote_average||0),0)/l.length;
    const ratingBonus = Math.max(10-Math.abs(avg(person1Movies)-avg(person2Movies))*2,0);
    return Math.min(Math.round(base+movieBonus+ratingBonus),100);
  }
  function getCompatibilityDetails() {
    const p1G=countGenres(person1Movies), p2G=countGenres(person2Movies);
    const all = new Set([...Object.keys(p1G),...Object.keys(p2G)]);
    const sharedGenres = [...all].filter(g=>p1G[g]&&p2G[g]).map(id=>({id,name:GENRE_NAMES[id]||"Unknown",p1:p1G[id],p2:p2G[id],total:p1G[id]+p2G[id]})).sort((a,b)=>b.total-a.total);
    const score = compatibilityScore||0;
    const insights = [];
    if (score>=80) insights.push("🎉 Excellent match! You have very similar movie tastes.");
    else if (score>=60) insights.push("✨ Great compatibility! You share many favorite genres.");
    else if (score>=40) insights.push("🎬 Moderate match. You have some overlap in preferences.");
    else insights.push("🌟 Diverse tastes! This means more variety in your movie nights.");
    if (commonMovies.length>0) insights.push(`You've both added ${commonMovies.length} of the same movie${commonMovies.length>1?"s":""}!`);
    if (sharedGenres.length>0) insights.push(`You both love ${sharedGenres[0].name} movies!`);
    return {score,sharedGenres,insights};
  }

  function getRecommendationMatch(movie) {
    if (!movie.genre_ids) return null;
    const p1G = countGenres(person1Movies);
    const p2G = countGenres(person2Movies);
    let p1Score = 0, p2Score = 0;
    movie.genre_ids.forEach(g => {
      if (p1G[g]) p1Score += p1G[g];
      if (p2G[g]) p2Score += p2G[g];
    });
    if (p1Score === 0 && p2Score === 0) return null;
    return Math.abs(p1Score - p2Score) <= 1 ? "both" : (p1Score > p2Score ? "person1" : "person2");
  }
  const getGenreRecommendations = async (genreIds) => {
  if (!genreIds.length) return [];

  const url =
    `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}` +
    `&with_genres=${genreIds.join(",")}` +
    `&sort_by=popularity.desc`;

  const data = await fetchJSON(url);
  return data.results || [];
}


  // --- Recommendations -----------------------------------------------------
const generateRecommendations = async ({
  person1Movies,
  person2Movies,
  togethernessMode,
  hiddenMovieIds,
  setRecommendations,
  setLoading
}) => {
  try {
    setLoading(true);

    const p1Titles = person1Movies.map(m => m.title);
    const p2Titles = person2Movies.map(m => m.title);

    // --- TOGETHERNESS MODE (shared genres) -------------------------------
    if (togethernessMode) {
      const p1Genres = person1Movies.flatMap(m => m.genre_ids || []);
      const p2Genres = person2Movies.flatMap(m => m.genre_ids || []);

      const sharedGenres = [...new Set(
        p1Genres.filter(g => p2Genres.includes(g))
      )];

      const genreRecs = await getGenreRecommendations(sharedGenres);

      setRecommendations(
        genreRecs.filter(m => !hiddenMovieIds.has(m.id)).slice(0, 24)
      );
      return;
    }

    // --- NORMAL MODE (TasteDive + TMDB) ---------------------------------
    const seedTitles = [...new Set([...p1Titles, ...p2Titles])];

    const tasteDiveTitles = await getTasteDiveMovies(seedTitles);

    const tmdbResults = await Promise.all(
      tasteDiveTitles.map(title => searchTMDBMovie(title))
    );

    const cleaned = tmdbResults
      .filter(Boolean)
      .filter(m => !hiddenMovieIds.has(m.id));

    setRecommendations(cleaned.slice(0, 24));

  } catch (err) {
    console.error("Recommendation error:", err);
  } finally {
    setLoading(false);
  }
};
;

  // ===========================================================================
  // SUB-COMPONENTS
  // ===========================================================================

  const MovieCard = ({movie,onSelect,showActions=false,personNum=null,matchIndicator=null,removeFromRecs=null}) => (
    <div className="group relative bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300">
      <div onClick={()=>onSelect(movie)} className="relative cursor-pointer overflow-hidden bg-zinc-800" style={{aspectRatio:"2/3"}}>
        {movie.poster_path
          ? <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
          : <div className="w-full h-full flex items-center justify-center"><Film className="w-12 h-12 text-zinc-600"/></div>
        }
        {movie.vote_average>0 && !removeFromRecs && (
          <div className="absolute top-3 right-3 bg-black/80 rounded-lg px-2 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" fill="#facc15"/>
            <span className="text-xs font-semibold text-white">{movie.vote_average.toFixed(1)}</span>
          </div>
        )}
        {/* X button for hiding recommendations - replaces rating badge */}
        {removeFromRecs && (
          <button 
            onClick={e=>{e.stopPropagation();removeFromRecs(movie.id);}} 
            className="absolute top-3 right-3 bg-red-600 hover:bg-red-500 rounded-full p-2 transition-all shadow-lg hover:scale-110"
            title="Hide this recommendation"
          >
            <X className="w-4 h-4 text-white stroke-[3]"/>
          </button>
        )}
        {/* Streaming badge */}
        {movie._hasStream && !removeFromRecs && (
          <div className="absolute top-3 left-3 bg-green-600/90 rounded-lg px-2 py-0.5">
            <span className="text-xs font-semibold text-white">▶ Stream</span>
          </div>
        )}
        {/* Match indicator badge */}
        {matchIndicator && (
          <div className={`absolute bottom-3 left-3 rounded-lg px-2 py-0.5 ${ 
            matchIndicator === "person1" ? "bg-blue-600/90" :
            matchIndicator === "person2" ? "bg-purple-600/90" :
            "bg-pink-600/90"
          }`}>
            <span className="text-xs font-semibold text-white">
              {matchIndicator === "person1" ? person1Name.split(" ")[0] :
               matchIndicator === "person2" ? person2Name.split(" ")[0] :
               "Both"}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        {/* Show match indicator as text label too for clarity */}
        {matchIndicator && (
          <div className={`text-xs font-semibold mb-2 ${
            matchIndicator === "person1" ? "text-blue-400" :
            matchIndicator === "person2" ? "text-purple-400" :
            "text-pink-400"
          }`}>
            {matchIndicator === "person1" ? `For ${person1Name.split(" ")[0]}` :
             matchIndicator === "person2" ? `For ${person2Name.split(" ")[0]}` :
             "For Both"}
          </div>
        )}
        <h3 className="font-semibold text-white text-sm mb-1" style={{display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{movie.title}</h3>
        <p className="text-zinc-500 text-xs mb-3">{movie.release_date?.split("-")[0]||"N/A"}</p>
        {showActions && (
          <div className="flex gap-2">
            {!isInPerson1(movie.id) && <button onClick={e=>{e.stopPropagation();addMovieToPerson(movie,1);}} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">{person1Name}</button>}
            {!isInPerson2(movie.id) && <button onClick={e=>{e.stopPropagation();addMovieToPerson(movie,2);}} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">{person2Name}</button>}
          </div>
        )}
        {personNum && (
          <button onClick={e=>{e.stopPropagation();removeMovieFromPerson(movie.id,personNum);}} className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
            <X className="w-3 h-3"/> Remove
          </button>
        )}
      </div>
    </div>
  );

  // --- MovieModal ----------------------------------------------------------
  const MovieModal = ({movie,onClose}) => {
    if (!movie) return null;
    const cur = COUNTRIES.find(c=>c.code===selectedCountry)||COUNTRIES[0];
    const {flatrate,rent,buy,link:jwLink} = streamingProviders||{};
    const ProviderRow = ({label,providers}) => {
      if (!providers?.length) return null;
      return (
        <div className="mb-5">
          <p className="text-sm font-medium text-zinc-400 mb-3">{label}</p>
          <div className="flex flex-wrap gap-3">
            {providers.slice(0,6).map(p=>(
              <a key={p.provider_id} href={jwLink||"#"} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
                <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} className="w-14 h-14 rounded-lg border border-zinc-600 group-hover:scale-105 transition"/>
                <span className="text-xs text-zinc-400 text-center" style={{maxWidth:60}}>{p.provider_name}</span>
              </a>
            ))}
          </div>
        </div>
      );
    };
    const maturityColor = movie.maturity==="R"?"border-red-500/60 text-red-400":movie.maturity==="PG-13"?"border-orange-500/60 text-orange-400":movie.maturity==="NC-17"?"border-purple-500/60 text-purple-400":"border-zinc-600 text-zinc-300";
    return (
      <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto" style={{backdropFilter:"blur(4px)"}}>
        <div className="min-h-screen px-3 md:px-6 py-8 flex items-center justify-center">
          <div className="max-w-5xl w-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
            <div className="relative">
              {movie.backdrop_path && (
                <div className="relative" style={{minHeight:320}}>
                  <img src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} alt={movie.title} className="w-full h-full object-cover"/>
                  <div className="absolute inset-0" style={{background:"linear-gradient(to top, #18181b, rgba(24,24,27,0.7) 50%, transparent)"}}/>
                </div>
              )}
              <button onClick={onClose} className="absolute top-4 right-4 bg-black/60 rounded-full p-2 hover:bg-black/80 transition"><X className="w-5 h-5 text-white"/></button>
            </div>
            <div className="relative z-10 px-5 md:px-8 pb-8" style={{marginTop:-32}}>
              <div className="flex flex-col md:flex-row gap-6">
                {movie.poster_path && (
                  <div className="w-32 md:w-44 flex-shrink-0 mx-auto md:mx-0">
                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-full rounded-xl shadow-xl border border-zinc-800" style={{aspectRatio:"2/3",objectFit:"cover"}}/>
                  </div>
                )}
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">{movie.title}</h2>
                  {movie.tagline && <p className="text-zinc-400 italic mb-4">{movie.tagline}</p>}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-5">
                    {movie.vote_average>0 && <div className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg px-3 py-1.5 font-semibold"><Star className="w-4 h-4" fill="currentColor"/> {movie.vote_average.toFixed(1)}</div>}
                    <span className="text-zinc-400">{movie.release_date?.split("-")[0]}</span>
                    {movie.runtime && <span className="text-zinc-400">{movie.runtime} min</span>}
                    {movie.maturity&&movie.maturity!=="N/A" && <span className={`text-xs font-semibold border px-2 py-0.5 rounded ${maturityColor}`}>{movie.maturity}</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                    {movie.trailer && <a href={movie.trailer} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg font-medium transition"><Play className="w-5 h-5"/>Watch Trailer</a>}
                    {movie.imdb_id && <a href={`https://www.imdb.com/title/${movie.imdb_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white px-5 py-2.5 rounded-lg font-medium transition"><ExternalLink className="w-5 h-5"/>IMDb</a>}
                    {!isInPerson1(movie.id) && <button onClick={()=>addMovieToPerson(movie,1)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition">+ {person1Name}</button>}
                    {!isInPerson2(movie.id) && <button onClick={()=>addMovieToPerson(movie,2)} className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg font-medium transition">+ {person2Name}</button>}
                  </div>
                  <p className="text-zinc-300 leading-relaxed mb-6 max-w-3xl">{movie.overview}</p>
                  {movie.genres?.length>0 && <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">{movie.genres.map(g=><span key={g.id} className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">{g.name}</span>)}</div>}
                </div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700 mt-4">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Play className="w-5 h-5 text-red-500"/>Where to Watch</h3>
                  <button onClick={()=>setShowCountrySelector(!showCountrySelector)} className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg text-sm text-white transition"><Globe className="w-4 h-4"/>{cur.flag} {cur.code}</button>
                </div>
                {showCountrySelector && (
                  <div className="mb-4 bg-zinc-900 rounded-lg p-3 border border-zinc-700">
                    <p className="text-xs text-zinc-400 mb-2">Select your region:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {COUNTRIES.map(c=>(
                        <button key={c.code} onClick={()=>{setSelectedCountry(c.code);setShowCountrySelector(false);fetchMovieDetails(movie.id);}} className={`px-3 py-2 rounded-lg text-sm transition ${selectedCountry===c.code?"bg-purple-600 text-white":"bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>{c.flag} {c.code}</button>
                      ))}
                    </div>
                  </div>
                )}
                <ProviderRow label="Stream" providers={flatrate}/>
                <ProviderRow label="Rent" providers={rent}/>
                <ProviderRow label="Buy" providers={buy}/>
                {!flatrate&&!rent&&!buy && <p className="text-zinc-400 text-sm">No streaming options available in {cur.name}</p>}
                {jwLink && <a href={jwLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition">View all options on JustWatch <ExternalLink className="w-4 h-4"/></a>}
                <p className="text-xs text-zinc-600 mt-4">Streaming data provided by JustWatch</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- SaveModal -----------------------------------------------------------
  const SaveModal = () => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" style={{backdropFilter:"blur(4px)"}}>
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2 text-white">Save Your Lists</h2>
        <p className="text-zinc-400 mb-2">Give your movie lists a name</p>
        <p className="text-yellow-500 text-sm mb-6">Note: Lists are only saved for this session</p>
        <input type="text" placeholder="e.g., Movie Night Favorites" value={listName} onChange={e=>setListName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSave()} className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500" autoFocus/>
        {saveMessage && <p className="text-sm mb-4 text-center text-zinc-300">{saveMessage}</p>}
        <div className="flex gap-3">
          <button onClick={()=>{setShowSaveModal(false);setListName("");setSaveMessage("");}} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-lg font-medium">Cancel</button>
          <button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-lg font-medium">Save List</button>
        </div>
      </div>
    </div>
  );

  // --- LoadModal -----------------------------------------------------------
  const LoadModal = () => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" style={{backdropFilter:"blur(4px)"}}>
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2 text-white">Load Saved Lists</h2>
        <p className="text-zinc-400 mb-6">Choose a saved list to restore</p>
        {savedLists.length===0 ? (
          <div className="text-center py-12"><Film className="w-16 h-16 text-zinc-700 mx-auto mb-4"/><p className="text-zinc-500">No saved lists yet</p></div>
        ) : (
          <div className="space-y-3 mb-6">
            {savedLists.map(list=>(
              <div key={list.key} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-start justify-between">
                  <div><h3 className="font-semibold text-white mb-1">{list.name}</h3><p className="text-sm text-zinc-400">{list.person1Name} &amp; {list.person2Name}</p><p className="text-xs text-zinc-500">{(list.person1Movies?.length||0)+(list.person2Movies?.length||0)} movies</p></div>
                  <div className="flex gap-2">
                    <button onClick={()=>loadList(list.key)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Load</button>
                    <button onClick={()=>deleteList(list.key)} className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-2 rounded-lg text-sm"><X className="w-4 h-4"/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={()=>setShowLoadModal(false)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-lg font-medium">Close</button>
      </div>
    </div>
  );

  // --- CompatibilityModal --------------------------------------------------
  const CompatibilityModal = () => {
    const details = getCompatibilityDetails();
    const maxListLen = Math.max(person1Movies.length,person2Movies.length,1);
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" style={{backdropFilter:"blur(4px)"}}>
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3"><BarChart3 className="w-8 h-8 text-purple-400"/>Compatibility Analysis</h2>
            <button onClick={()=>setShowCompatibilityModal(false)} className="bg-zinc-800 hover:bg-zinc-700 rounded-full p-2"><X className="w-5 h-5 text-white"/></button>
          </div>
          <div className="rounded-xl p-8 mb-6 text-center border border-purple-800/30" style={{background:"linear-gradient(to right, rgba(88,28,135,0.5), rgba(134,25,83,0.5))"}}>
            <p className="text-zinc-400 text-sm mb-2">Your Compatibility Score</p>
            <div className="text-7xl font-bold mb-2" style={{background:"linear-gradient(to right, #a78bfa, #f472b6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{details.score}%</div>
            <div className="w-full bg-zinc-800 rounded-full h-4 mb-4"><div className="h-4 rounded-full" style={{width:`${details.score}%`,background:"linear-gradient(to right, #7c3aed, #db2777)"}}/></div>
            <div className="flex items-center justify-center gap-2 text-zinc-300">
              {details.score>=80?<>🔥 <span>Perfect Match!</span></>:details.score>=60?<>✨ <span>Great Compatibility</span></>:details.score>=40?<>🎬 <span>Good Match</span></>:<>⚜️ <span>Diverse Tastes</span></>}
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400"/>Key Insights</h3>
            <div className="space-y-2">{details.insights.map((i,idx)=><div key={idx} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700"><p className="text-zinc-300">{i}</p></div>)}</div>
          </div>
          {details.sharedGenres.length>0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-pink-400"/>Shared Genres</h3>
              <div className="grid grid-cols-2 gap-3">
                {details.sharedGenres.map(g=>(
                  <div key={g.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{g.name}</h4>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/><span className="text-xs text-zinc-400">{g.p1}</span><span className="text-zinc-600 mx-1">|</span><span className="text-xs text-zinc-400">{g.p2}</span><div className="w-2 h-2 rounded-full bg-purple-500"/></div>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2"><div className="h-2 rounded-full" style={{width:`${Math.min((g.total/maxListLen)*100,100)}%`,background:"linear-gradient(to right, #2563eb, #7c3aed)"}}/></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg p-4 text-center border border-blue-800/30" style={{background:"rgba(30,58,138,0.2)"}}><div className="text-3xl font-bold text-blue-400 mb-1">{person1Movies.length}</div><div className="text-xs text-zinc-400">{person1Name}'s Movies</div></div>
            <div className="rounded-lg p-4 text-center border border-pink-800/30" style={{background:"rgba(131,24,67,0.2)"}}><div className="text-3xl font-bold text-pink-400 mb-1">{commonMovies.length}</div><div className="text-xs text-zinc-400">Shared Movies</div></div>
            <div className="rounded-lg p-4 text-center border border-purple-800/30" style={{background:"rgba(88,28,135,0.2)"}}><div className="text-3xl font-bold text-purple-400 mb-1">{person2Movies.length}</div><div className="text-xs text-zinc-400">{person2Name}'s Movies</div></div>
          </div>
        </div>
      </div>
    );
  };

  // --- ExportModal ---------------------------------------------------------
  const ExportModal = () => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" style={{backdropFilter:"blur(4px)"}}>
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2 text-white">Export Your Data</h2>
        <p className="text-zinc-400 mb-6">Download your movie lists as a file you can import later.</p>
        <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 border border-zinc-700">
          <h3 className="text-white font-semibold mb-2">What will be exported:</h3>
          <ul className="text-zinc-300 text-sm space-y-1">
            <li>• {person1Name}'s list ({person1Movies.length} movies)</li>
            <li>• {person2Name}'s list ({person2Movies.length} movies)</li>
            <li>• All saved lists ({savedLists.length})</li>
          </ul>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>setShowExportModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-lg font-medium">Cancel</button>
          <button onClick={exportData} className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2"><ExternalLink className="w-5 h-5"/>Download</button>
        </div>
      </div>
    </div>
  );

  // ===========================================================================
  // MAIN RENDER
  // ===========================================================================
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div>
              <h1 className="text-5xl font-bold mb-2" style={{background:"linear-gradient(to right, #ef4444, #a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>MovieMatch</h1>
              <p className="text-zinc-400">Discover movies you'll both love</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="px-5 py-3 rounded-xl font-semibold bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center gap-2 cursor-pointer">
                <Plus className="w-5 h-5"/> Import
                <input type="file" accept=".json" onChange={handleImport} className="hidden"/>
              </label>
              <button onClick={()=>setShowExportModal(true)} className="px-5 py-3 rounded-xl font-semibold bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center gap-2"><ExternalLink className="w-5 h-5"/> Export</button>
              <button onClick={()=>setShowSaveModal(true)} className="px-5 py-3 rounded-xl font-semibold bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center gap-2"><Film className="w-5 h-5"/> Save Lists</button>
              <button onClick={()=>setShowLoadModal(true)} className="px-5 py-3 rounded-xl font-semibold bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center gap-2"><Play className="w-5 h-5"/> Load Lists</button>
              <button onClick={()=>{if(compatibilityScore!==null)setShowCompatibilityModal(true);}} disabled={!person1Movies.length||!person2Movies.length} className="px-5 py-3 rounded-xl font-semibold bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"><BarChart3 className="w-5 h-5"/> {compatibilityScore!==null?`${compatibilityScore}%`:"Stats"}</button>

              {/* Streaming Only toggle */}
              <button onClick={()=>setStreamingOnly(v=>!v)} className={`px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${streamingOnly?"text-white shadow-lg shadow-green-500/40":"bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`} style={streamingOnly?{background:"linear-gradient(to right, #16a34a, #15803d)"}:{}}>
                <Play className="w-5 h-5"/> Streaming Only
              </button>

              {/* Togetherness toggle */}
              <button onClick={()=>setTogethernessMode(!togethernessMode)} className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${togethernessMode?"text-white shadow-lg shadow-purple-500/50":"bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`} style={togethernessMode?{background:"linear-gradient(to right, #db2777, #7c3aed)"}:{}}>
                <Sparkles className="w-5 h-5" fill={togethernessMode?"currentColor":undefined}/> Togetherness
                {compatibilityScore!==null&&togethernessMode && <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">{compatibilityScore}%</span>}
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input type="text" value={person1Name} onChange={e=>setPerson1Name(e.target.value)} placeholder="First person's name" className="bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
            <input type="text" value={person2Name} onChange={e=>setPerson2Name(e.target.value)} placeholder="Second person's name" className="bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"/>
          </div>
          <div className="relative">
            <Search className="absolute left-6 text-zinc-500 w-5 h-5" style={{top:"50%",transform:"translateY(-50%)"}}/>
            <input type="text" placeholder="Search for movies..." value={searchQuery} onChange={e=>{setSearchQuery(e.target.value);searchMovies(e.target.value);}} className="w-full bg-zinc-900 border border-zinc-800 text-white pl-14 pr-6 py-5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"/>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 border-b border-zinc-800">
          {[
            {id:"search",icon:Search,label:"Discover"},
            {id:"compare",icon:Users,label:"Your Lists"},
            {id:"recommendations",icon:Heart,label:"For You"},
          ].map(tab=>(
            <button key={tab.id} onClick={()=>{
              setActiveTab(tab.id);
              if (tab.id==="recommendations") { setRecommendations([]); setRecsKey(k=>k+1); }
            }} className={`px-6 py-3 rounded-t-lg font-medium transition-all flex items-center gap-2 ${activeTab===tab.id?"bg-zinc-900 text-white border-b-2 border-red-500":"text-zinc-500 hover:text-zinc-300"}`}>
              <tab.icon className="w-5 h-5"/> {tab.label}
              {tab.id==="compare"&&commonMovies.length>0 && <span className="bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full">{commonMovies.length}</span>}
            </button>
          ))}
        </div>

        {/* Spinner */}
        {loading && <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"/></div>}

        {/* DISCOVER */}
        {activeTab==="search"&&!loading && (
          <div>
            {searchResults.length>0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">{searchResults.map(m=><MovieCard key={m.id} movie={m} onSelect={mv=>fetchMovieDetails(mv.id)} showActions/>)}</div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6"><TrendingUp className="w-6 h-6 text-red-500"/><h2 className="text-2xl font-bold">Trending This Week</h2></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">{trendingMovies.map(m=><MovieCard key={m.id} movie={m} onSelect={mv=>fetchMovieDetails(mv.id)} showActions/>)}</div>
              </div>
            )}
          </div>
        )}

        {/* YOUR LISTS */}
        {activeTab==="compare"&&!loading && (
          <div className="space-y-8">
            {commonMovies.length>0 && (
              <div className="rounded-2xl p-8 border border-pink-900/20" style={{background:"linear-gradient(to right, rgba(162,17,76,0.15), rgba(88,28,135,0.15))"}}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Heart className="w-7 h-7 text-pink-400" fill="#f472b6"/> Perfect Match ({commonMovies.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">{commonMovies.map(m=><MovieCard key={m.id} movie={m} onSelect={mv=>fetchMovieDetails(mv.id)}/>)}</div>
              </div>
            )}
            <div className="grid lg:grid-cols-2 gap-6">
              {[{num:1,name:person1Name,movies:person1Movies,color:"blue"},{num:2,name:person2Name,movies:person2Movies,color:"purple"}].map(p=>(
                <div key={p.num} className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                  <h2 className={`text-xl font-bold mb-4 ${p.color==="blue"?"text-blue-400":"text-purple-400"}`}>{p.name}'s List ({p.movies.length})</h2>
                  {p.movies.length===0 ? (
                    <div className="text-center py-16"><Film className="w-12 h-12 text-zinc-700 mx-auto mb-3"/><p className="text-zinc-500 mb-4">No movies yet</p><button onClick={()=>setActiveTab("search")} className={`${p.color==="blue"?"text-blue-400 hover:text-blue-300":"text-purple-400 hover:text-purple-300"} font-medium`}>Start adding movies →</button></div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{p.movies.map(m=><MovieCard key={m.id} movie={m} onSelect={mv=>fetchMovieDetails(mv.id)} personNum={p.num}/>)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOR YOU */}
        {activeTab==="recommendations"&&!loading && (
          <div className="space-y-6">
            {togethernessMode && (
              <div className="rounded-2xl p-8 border border-pink-900/20" style={{background:"linear-gradient(to right, rgba(162,17,76,0.15), rgba(88,28,135,0.15))"}}>
                <h2 className="text-2xl font-bold mb-3 flex items-center gap-3"><Sparkles className="w-7 h-7 text-yellow-400"/>Togetherness Mode Active</h2>
                <p className="text-zinc-300">Finding movies that match genres you <strong>both</strong> enjoy.</p>
              </div>
            )}
            {!togethernessMode && person1Movies.length>0 && person2Movies.length>0 && (
              <div className="rounded-2xl p-6 border border-zinc-800/50 bg-zinc-900/30">
                <p className="text-zinc-400 text-sm">💡 <strong>Tip:</strong> Turn on Togetherness Mode for stricter recommendations based on genres you both like.</p>
              </div>
            )}
            <div className="rounded-2xl p-8 border border-purple-900/20" style={{background:"linear-gradient(to right, rgba(88,28,135,0.15), rgba(162,17,76,0.15))"}}>
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-3"><Heart className="w-7 h-7 text-pink-400"/>{togethernessMode?"Perfect for Both of You":"Recommended for You"}</h2>
              <p className="text-zinc-400 mb-2">{togethernessMode?"Based on shared genres":"Based on genres from both lists"} {recommendations.length > 0 && `• ${recommendations.length} movies`}</p>
              {streamingOnly && <p className="text-green-400 text-sm mb-4">🎬 Showing only movies available to stream</p>}
              <button onClick={()=>{ 
                setRecommendations([]);
                setHiddenMovieIds(new Set()); // Clear hidden list for fresh start
                setLoading(true);
                setRecsKey(k => k+1);
              }} <button
  onClick={() => {
    setRecommendations([]);
    setHiddenMovieIds(new Set());
    generateRecommendations({
      person1Movies,
      person2Movies,
      togethernessMode,
      hiddenMovieIds,
      setRecommendations,
      setLoading
    });
  }}
>
  Refresh Recommendations
</button>
;

        {/* Modals */}
        {selectedMovie && <MovieModal movie={selectedMovie} onClose={()=>setSelectedMovie(null)}/>}
        {showSaveModal && <SaveModal/>}
        {showLoadModal && <LoadModal/>}
        {showCompatibilityModal && <CompatibilityModal/>}
        {showExportModal && <ExportModal/>}
      </div>
    </div>
  );
}

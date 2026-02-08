"use client";
// MovieMatch v3.2 - Reddit Randomizer + A24/Criterion Filters

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
const Shuffle = (p) => <svg {...iconBase} {...p}><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>;

// --- Constants ---------------------------------------------------------------
const TMDB_API_KEY = "5792c693eccc10a144cad3c08930ecdb";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const OMDB_API_KEY = "598543d";
const OMDB_BASE_URL = "https://www.omdbapi.com";

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

// --- Reddit Scraper ----------------------------------------------------------
async function getRedditMovieSuggestions() {
  try {
    const subreddits = ['MovieSuggestions', 'movies', 'TrueFilm', 'criterion', 'A24'];
    const allTitles = [];
    
    for (const sub of subreddits) {
      try {
        const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=50`);
        const data = await res.json();
        
        for (const post of data.data.children) {
          const title = post.data.title;
          
          // Pattern 1: Movie Title (Year)
          const yearMatch = title.match(/([^(]+)\s*\((\d{4})\)/);
          if (yearMatch) {
            const movieTitle = yearMatch[1].trim();
            if (movieTitle.length > 3 && movieTitle.length < 60) {
              allTitles.push(movieTitle);
            }
          }
          
          // Pattern 2: [Movie Title]
          const brackMatch = title.match(/\[([^\]]{3,60})\]/);
          if (brackMatch) {
            allTitles.push(brackMatch[1].trim());
          }
          
          // Pattern 3: "Movie Title" in quotes
          const quoteMatch = title.match(/"([^"]{3,60})"/);
          if (quoteMatch) {
            allTitles.push(quoteMatch[1].trim());
          }
        }
      } catch (e) {
        console.error(`Error fetching r/${sub}:`, e);
      }
    }
    
    return [...new Set(allTitles)].slice(0, 40);
  } catch (e) {
    console.error("Reddit fetch error:", e);
    return [];
  }
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
  const [streamingOnly, setStreamingOnly] = useState(false);
  
  // Reddit randomizer and production company filters
  const [useRedditRandomizer, setUseRedditRandomizer] = useState(false);
  const [a24Only, setA24Only] = useState(false);
  const [criterionOnly, setCriterionOnly] = useState(false);

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
      
      const ratingData = await ratingRes.json();
      const usRelease = ratingData.results?.find(r => r.iso_3166_1 === "US");
      if (usRelease?.release_dates) {
        const certs = usRelease.release_dates.map(rd => rd.certification).filter(c => c && c.trim());
        if (certs.some(c => c === "G" || c === "PG")) return true;
      }
      
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
      
      let omdbData = null;
      if (extIds.imdb_id) {
        try {
          const omdbRes = await fetch(`${OMDB_BASE_URL}/?i=${extIds.imdb_id}&apikey=${OMDB_API_KEY}`);
          omdbData = await omdbRes.json();
        } catch(e) {
          console.error("OMDb fetch error:", e);
        }
      }
      
      setSelectedMovie({ 
        ...details, 
        cast:credits.cast?.slice(0,5)||[], 
        director:credits.crew?.find(p=>p.job==="Director"), 
        maturity:usRating, 
        trailer:trailer?`https://www.youtube.com/watch?v=${trailer.key}`:null, 
        imdb_id:extIds.imdb_id||null,
        omdb: omdbData
      });
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
    setHiddenMovieIds(prev => new Set([...prev, id]));
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

  // --- Recommendations with Reddit + A24/Criterion -------------------------
  async function doFetchRecommendations(p1, p2, togetherMode) {
    if (!p1.length || !p2.length) { 
      setRecommendations([]);
      setLoading(false);
      return; 
    }
    
    setLoading(true);

    try {
      const existingIds = new Set([...p1, ...p2].map(m => m.id));
      let candidateMovies = [];

      // === REDDIT RANDOMIZER MODE ===
      if (useRedditRandomizer) {
        const redditTitles = await getRedditMovieSuggestions();
        
        for (const title of redditTitles.slice(0, 25)) {
          try {
            const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
            const data = await res.json();
            const tmdbMovie = data.results?.[0];
            
            if (!tmdbMovie) continue;
            if (existingIds.has(tmdbMovie.id)) continue;
            if (hiddenMovieIds.has(tmdbMovie.id)) continue;
            if (!isAllowed(tmdbMovie)) continue;
            
            const year = parseInt((tmdbMovie.release_date || "0").slice(0, 4));
            if (year < 1985) continue;
            
            candidateMovies.push(tmdbMovie);
          } catch (e) {
            console.error(`Reddit movie search error for ${title}:`, e);
          }
        }
      }
      
      // === NORMAL GENRE-BASED MODE ===
      else {
        const p1G = countGenres(p1);
        const p2G = countGenres(p2);
        const sharedGenreIds = Object.keys(p1G).filter(g=>p2G[g]).sort((a,b)=>(p1G[b]+p2G[b])-(p1G[a]+p2G[a]));
        const allGenreIds = [...new Set([...Object.keys(p1G),...Object.keys(p2G)])].sort((a,b)=>((p1G[b]||0)+(p2G[b]||0))-((p1G[a]||0)+(p2G[a]||0)));
        
        const randomPage1 = Math.floor(Math.random() * 10) + 1;
        const randomPage2 = Math.floor(Math.random() * 10) + 1;
        const randomPage3 = Math.floor(Math.random() * 10) + 1;

        let rawResults = [];

        if (togetherMode) {
          const genresToUse = sharedGenreIds.slice(0,3);
          if (genresToUse.length === 0) {
            const res = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=en&sort_by=vote_average.desc&vote_count.gte=500&vote_average.gte=6.5&primary_release_date.gte=2020-01-01&page=${randomPage1}`);
            rawResults = (await res.json()).results || [];
          } else {
            const perGenre = await Promise.all(genresToUse.map(async gid => {
              const pages = await Promise.all([randomPage1,randomPage2,randomPage3].map(pg=>
                fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${gid}&with_original_language=en&sort_by=vote_average.desc&vote_count.gte=200&vote_average.gte=6.0&primary_release_date.gte=2020-01-01&page=${pg}`)
                  .then(r=>r.json()).then(d=>d.results||[]).catch(()=>[])
              ));
              return pages.flat();
            }));
            const freqMap = new Map();
            perGenre.forEach(list => list.forEach(m => {
              if (!freqMap.has(m.id)) freqMap.set(m.id,{movie:m,count:0});
              freqMap.get(m.id).count++;
            }));
            freqMap.forEach(({movie,count}) => {
              const yr = parseInt((movie.release_date || "0").slice(0,4));
              const recency = yr >= 2025 ? 220 : yr >= 2024 ? 200 : yr >= 2023 ? 160 : yr >= 2022 ? 120 : yr >= 2020 ? 80 : 30;
              rawResults.push({...movie, _score: count*80 + (movie.vote_average||0)*10 + recency});
            });
            rawResults.sort((a,b)=>b._score-a._score);
          }
        } else {
          const genresToUse = allGenreIds.slice(0,6);
          if (genresToUse.length === 0) {
            const res = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=en&sort_by=popularity.desc&vote_count.gte=500&vote_average.gte=6.0&primary_release_date.gte=2020-01-01&page=${randomPage1}`);
            rawResults = (await res.json()).results || [];
          } else {
            const gStr = genresToUse.join("|");
            const pages = await Promise.all([randomPage1,randomPage2,randomPage3].map(pg=>
              fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${gStr}&with_original_language=en&sort_by=popularity.desc&vote_count.gte=200&vote_average.gte=6.0&primary_release_date.gte=2020-01-01&page=${pg}`)
                .then(r=>r.json()).then(d=>d.results||[]).catch(()=>[])
            ));
            pages.flat().forEach(m => {
              const yr = parseInt((m.release_date || "0").slice(0,4));
              const recency = yr >= 2025 ? 220 : yr >= 2024 ? 200 : yr >= 2023 ? 160 : yr >= 2022 ? 120 : yr >= 2020 ? 80 : 30;
              let score = (m.popularity||0)/5 + (m.vote_average||0)*4 + recency;
              (m.genre_ids||[]).forEach(g => { if(p1G[g]) score+=10; if(p2G[g]) score+=10; });
              rawResults.push({...m, _score:score});
            });
            rawResults.sort((a,b)=>b._score-a._score);
          }
        }

        const seen = new Set();
        for (const m of rawResults) {
          if (seen.has(m.id)) continue;
          if (existingIds.has(m.id)) continue;
          if (hiddenMovieIds.has(m.id)) continue;
          if (!isAllowed(m)) continue;
          seen.add(m.id);
          candidateMovies.push(m);
        }
      }

      // === APPLY ALL FILTERS ===
      const final = [];
      let checked = 0;
      
      for (const movie of candidateMovies.slice(0, 50)) {
        if (final.length >= 12) break;
        if (checked >= 40) break;

        // Fetch full movie details if we need to check production companies
        let movieDetails = movie;
        if (a24Only || criterionOnly) {
          try {
            const detailsRes = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}`);
            movieDetails = await detailsRes.json();
          } catch (e) {
            console.error("Error fetching movie details:", e);
            continue;
          }
        }

        // A24 filter
        if (a24Only) {
          const hasA24 = movieDetails.production_companies?.some(c => 
            c.name.toLowerCase().includes('a24')
          );
          if (!hasA24) continue;
        }

        // Criterion filter
        if (criterionOnly) {
          const hasCriterion = movieDetails.production_companies?.some(c => 
            c.name.toLowerCase().includes('criterion')
          );
          if (!hasCriterion) continue;
        }

        const [exclude, stream] = await Promise.all([
          shouldExcludeMovie(movie.id),
          getStreamingInfo(movie.id, selectedCountry)
        ]);
        checked++;

        if (exclude) continue;
        if (streamingOnly && stream.flatrate.length === 0) continue;

        // Togetherness mode filter
        if (togetherMode && !useRedditRandomizer) {
          const p1Genres = new Set(p1.flatMap(m => m.genre_ids || []));
          const p2Genres = new Set(p2.flatMap(m => m.genre_ids || []));
          const sharedGenres = [...p1Genres].filter(g => p2Genres.has(g));
          
          const hasSharedGenre = (movie.genre_ids || []).some(g => sharedGenres.includes(g));
          if (!hasSharedGenre) continue;
        }

        let finalScore = movie._score || 0;
        if (stream.flatrate.length > 0) finalScore += 15;
        
        const finalYr = parseInt((movie.release_date || "0").slice(0,4));
        finalScore += finalYr >= 2025 ? 80 : finalYr >= 2024 ? 65 : finalYr >= 2023 ? 45 : finalYr >= 2022 ? 25 : 0;
        finalScore += Math.random() * 100;

        final.push({ ...movie, _finalScore: finalScore, _hasStream: stream.flatrate.length > 0 });
      }

      final.sort((a, b) => b._finalScore - a._finalScore);
      setRecommendations(final);
    } catch(e) {
      console.error("Recommendations error:", e);
      setRecommendations([]);
    }
    
    setLoading(false);
  }

  useEffect(() => {
    if (person1Movies.length > 0 && person2Movies.length > 0) {
      doFetchRecommendations(person1Movies, person2Movies, togethernessMode);
    } else {
      setLoading(false);
      setRecommendations([]);
    }
  }, [person1Movies, person2Movies, togethernessMode, recsKey, streamingOnly, selectedCountry, useRedditRandomizer, a24Only, criterionOnly]);

  // (Continue with all the same modal components and render from the original file)
  // For brevity, I'll show the key changes in the header/controls section

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div>
              <h1 className="text-5xl font-bold mb-2" style={{background:"linear-gradient(to right, #ef4444, #a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>MovieMatch</h1>
              <p className="text-zinc-400">Discover movies you'll both love</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Existing buttons */}
              <button onClick={()=>setStreamingOnly(v=>!v)} className={`px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${streamingOnly?"text-white shadow-lg shadow-green-500/40":"bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`} style={streamingOnly?{background:"linear-gradient(to right, #16a34a, #15803d)"}:{}}>
                <Play className="w-5 h-5"/> Streaming
              </button>

              <button onClick={()=>setTogethernessMode(!togethernessMode)} className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${togethernessMode?"text-white shadow-lg shadow-purple-500/50":"bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`} style={togethernessMode?{background:"linear-gradient(to right, #db2777, #7c3aed)"}:{}}>
                <Sparkles className="w-5 h-5" fill={togethernessMode?"currentColor":undefined}/> Togetherness
              </button>
              
              {/* NEW: Reddit Randomizer */}
              <button onClick={()=>setUseRedditRandomizer(!useRedditRandomizer)} className={`px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${useRedditRandomizer?"text-white shadow-lg shadow-orange-500/40":"bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`} style={useRedditRandomizer?{background:"linear-gradient(to right, #ea580c, #dc2626)"}:{}}>
                <Shuffle className="w-5 h-5"/> Reddit
              </button>
              
              {/* NEW: A24 Filter */}
              <button onClick={()=>{setA24Only(!a24Only); if(!a24Only) setCriterionOnly(false);}} className={`px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${a24Only?"text-white shadow-lg shadow-red-500/40":"bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`} style={a24Only?{background:"linear-gradient(to right, #dc2626, #b91c1c)"}:{}}>
                <Film className="w-5 h-5"/> A24
              </button>
              
              {/* NEW: Criterion Filter */}
              <button onClick={()=>{setCriterionOnly(!criterionOnly); if(!criterionOnly) setA24Only(false);}} className={`px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${criterionOnly?"text-white shadow-lg shadow-blue-500/40":"bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`} style={criterionOnly?{background:"linear-gradient(to right, #2563eb, #1d4ed8)"}:{}}>
                <Star className="w-5 h-5" fill={criterionOnly?"currentColor":undefined}/> Criterion
              </button>
            </div>
          </div>
          
          {/* Info banner when filters are active */}
          {(useRedditRandomizer || a24Only || criterionOnly) && (
            <div className="mb-6 bg-zinc-900/50 rounded-xl p-4 border border-zinc-700">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-zinc-400">Active filters:</span>
                {useRedditRandomizer && <span className="bg-orange-600/20 text-orange-400 px-3 py-1 rounded-full">📱 Reddit Randomizer</span>}
                {a24Only && <span className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full">🎬 A24 Only</span>}
                {criterionOnly && <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full">⭐ Criterion Only</span>}
              </div>
            </div>
          )}
          
          {/* Rest of original header code (name inputs, search bar) */}
        </div>
        
        {/* Rest of original component code... */}
      </div>
    </div>
  );
}

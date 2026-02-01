import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════
   INLINE SVG ICONS — no external icon library needed
   ═══════════════════════════════════════════════════════════════ */
function SvgIcon({ viewBox = "0 0 24 24", className = "", children, fill = "none", stroke = "currentColor" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill={fill}
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}
function IcoSearch({ className }) {
  return <SvgIcon className={className}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></SvgIcon>;
}
function IcoFilm({ className }) {
  return <SvgIcon className={className}><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="2" y1="8" x2="22" y2="8"/><line x1="2" y1="14" x2="22" y2="14"/></SvgIcon>;
}
function IcoPlus({ className }) {
  return <SvgIcon className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></SvgIcon>;
}
function IcoX({ className }) {
  return <SvgIcon className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></SvgIcon>;
}
function IcoPlay({ className }) {
  return <SvgIcon className={className} fill="currentColor" stroke="none"><polygon points="5,3 19,12 5,21"/></SvgIcon>;
}
function IcoStar({ className, filled }) {
  return (
    <SvgIcon className={className} fill={filled ? "currentColor" : "none"}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </SvgIcon>
  );
}
function IcoUsers({ className }) {
  return <SvgIcon className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></SvgIcon>;
}
function IcoHeart({ className, filled }) {
  return (
    <SvgIcon className={className} fill={filled ? "currentColor" : "none"}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </SvgIcon>
  );
}
function IcoSparkles({ className, filled }) {
  return (
    <SvgIcon className={className} fill={filled ? "currentColor" : "none"}>
      <path d="M12 2 L13.5 6.5 L18 8 L13.5 9.5 L12 14 L10.5 9.5 L6 8 L10.5 6.5 Z"/>
      <path d="M19 15 L20 18 L23 19 L20 20 L19 23 L18 20 L15 19 L18 18 Z"/>
      <path d="M5 20 L5.5 21.5 L7 22 L5.5 22.5 L5 24 L4.5 22.5 L3 22 L4.5 21.5 Z"/>
    </SvgIcon>
  );
}
function IcoTrending({ className }) {
  return <SvgIcon className={className}><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></SvgIcon>;
}
function IcoExternal({ className }) {
  return <SvgIcon className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></SvgIcon>;
}
function IcoGlobe({ className }) {
  return <SvgIcon className={className}><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><line x1="2" y1="12" x2="22" y2="12"/></SvgIcon>;
}
function IcoBarChart({ className }) {
  return <SvgIcon className={className}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></SvgIcon>;
}
function IcoZap({ className }) {
  return <SvgIcon className={className} fill="currentColor" stroke="none"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></SvgIcon>;
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const API_KEY = "5792c693eccc10a144cad3c08930ecdb";
const BASE = "https://api.themoviedb.org/3";
const COUNTRIES = [
  { code:"US", name:"United States", flag:"🇺🇸" },
  { code:"GB", name:"United Kingdom", flag:"🇬🇧" },
  { code:"CA", name:"Canada",        flag:"🇨🇦" },
  { code:"AU", name:"Australia",     flag:"🇦🇺" },
  { code:"DE", name:"Germany",       flag:"🇩🇪" },
  { code:"FR", name:"France",        flag:"🇫🇷" },
  { code:"ES", name:"Spain",         flag:"🇪🇸" },
  { code:"IT", name:"Italy",         flag:"🇮🇹" },
  { code:"MX", name:"Mexico",        flag:"🇲🇽" },
  { code:"BR", name:"Brazil",        flag:"🇧🇷" },
  { code:"IN", name:"India",         flag:"🇮🇳" },
  { code:"JP", name:"Japan",         flag:"🇯🇵" },
];
const GENRES = {28:"Action",12:"Adventure",16:"Animation",35:"Comedy",80:"Crime",99:"Documentary",18:"Drama",10751:"Family",14:"Fantasy",36:"History",27:"Horror",10402:"Music",9648:"Mystery",10749:"Romance",878:"Sci-Fi",53:"Thriller",10752:"War",37:"Western"};

function countGenres(movies) {
  const c = {};
  movies.forEach(m => (m.genre_ids || []).forEach(id => { c[id] = (c[id] || 0) + 1; }));
  return c;
}

/* ═══════════════════════════════════════════════════════════════
   ROOT COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function MovieMatch() {
  /* ── state ────────────────────────────────────────────────── */
  const [query, setQuery]             = useState("");
  const [results, setResults]         = useState([]);
  const [p1, setP1]                   = useState([]);
  const [p2, setP2]                   = useState([]);
  const [n1, setN1]                   = useState("Person 1");
  const [n2, setN2]                   = useState("Person 2");
  const [detail, setDetail]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [tab, setTab]                 = useState("discover");
  const [trending, setTrending]       = useState([]);
  const [recs, setRecs]               = useState([]);
  const [together, setTogether]       = useState(false);
  const [streaming, setStreaming]     = useState(null);
  const [country, setCountry]         = useState("US");
  const [showCPicker, setShowCPicker] = useState(false);
  const [showSave, setShowSave]       = useState(false);
  const [showLoad, setShowLoad]       = useState(false);
  const [listName, setListName]       = useState("");
  const [saved, setSaved]             = useState([]);
  const [saveMsg, setSaveMsg]         = useState("");
  const [compat, setCompat]           = useState(null);
  const [showCompat, setShowCompat]   = useState(false);

  /* ── boot ─────────────────────────────────────────────────── */
  useEffect(() => {
    try {
      const a = localStorage.getItem("mm_p1"); if (a) setP1(JSON.parse(a));
      const b = localStorage.getItem("mm_p2"); if (b) setP2(JSON.parse(b));
      const c = localStorage.getItem("mm_n1"); if (c) setN1(c);
      const d = localStorage.getItem("mm_n2"); if (d) setN2(d);
    } catch {}
    fetchTrending();
    loadSaved();
  }, []);

  useEffect(() => {
    if (p1.length && p2.length) setCompat(calcCompat());
    else setCompat(null);
  }, [p1, p2]);

  /* ── helpers ──────────────────────────────────────────────── */
  const sLS = (k, v) => { try { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); } catch {} };

  async function fetchTrending() {
    try {
      const r = await fetch(`${BASE}/trending/movie/week?api_key=${API_KEY}`);
      setTrending((await r.json()).results?.slice(0, 12) || []);
    } catch {}
  }

  async function doSearch(q) {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&language=en-US`);
      setResults((await r.json()).results || []);
    } catch {}
    setLoading(false);
  }

  async function fetchDetail(id) {
    setLoading(true);
    try {
      const [dR, cR, pR] = await Promise.all([
        fetch(`${BASE}/movie/${id}?api_key=${API_KEY}&language=en-US`),
        fetch(`${BASE}/movie/${id}/credits?api_key=${API_KEY}`),
        fetch(`${BASE}/movie/${id}/watch/providers?api_key=${API_KEY}`)
      ]);
      const det = await dR.json(), cr = await cR.json(), pr = await pR.json();
      setDetail({ ...det, cast: cr.cast?.slice(0,5) || [], director: cr.crew?.find(x => x.job === "Director") });
      setStreaming(pr.results?.[country] || null);
    } catch {}
    setLoading(false);
  }

  function addMovie(movie, which) {
    const list = which === 1 ? p1 : p2;
    if (list.some(m => m.id === movie.id)) return;
    const up = [...list, movie];
    if (which === 1) { setP1(up); sLS("mm_p1", up); }
    else             { setP2(up); sLS("mm_p2", up); }
  }

  function rmMovie(id, which) {
    const up = (which === 1 ? p1 : p2).filter(m => m.id !== id);
    if (which === 1) { setP1(up); sLS("mm_p1", up); }
    else             { setP2(up); sLS("mm_p2", up); }
  }

  const inP1 = id => p1.some(m => m.id === id);
  const inP2 = id => p2.some(m => m.id === id);
  const common = (() => { const s = new Set(p1.map(m => m.id)); return p2.filter(m => s.has(m.id)); })();

  /* ── compatibility ────────────────────────────────────────── */
  function calcCompat() {
    const g1 = countGenres(p1), g2 = countGenres(p2);
    const all = new Set([...Object.keys(g1), ...Object.keys(g2)]);
    const cm = [...all].filter(g => g1[g] && g2[g]);
    const base = all.size ? (cm.length / all.size) * 100 : 0;
    const mb = Math.min(common.length * 5, 20);
    const avg = l => l.reduce((s, m) => s + (m.vote_average || 0), 0) / l.length;
    const rb = Math.max(10 - Math.abs(avg(p1) - avg(p2)) * 2, 0);
    return Math.min(Math.round(base + mb + rb), 100);
  }

  function compatDetails() {
    const g1 = countGenres(p1), g2 = countGenres(p2);
    const all = new Set([...Object.keys(g1), ...Object.keys(g2)]);
    const shared = [...all].filter(g => g1[g] && g2[g])
      .map(id => ({ id, name: GENRES[id] || "Other", p1: g1[id], p2: g2[id], total: g1[id] + g2[id] }))
      .sort((a, b) => b.total - a.total);
    const sc = compat || 0;
    const ins = [];
    if (sc >= 80) ins.push("🎉 Excellent match! Very similar tastes.");
    else if (sc >= 60) ins.push("✨ Great compatibility! Many shared genres.");
    else if (sc >= 40) ins.push("🎬 Moderate match with some overlap.");
    else ins.push("🌟 Diverse tastes — more variety in movie nights!");
    if (common.length) ins.push(`You've both added ${common.length} movie${common.length > 1 ? "s" : ""}!`);
    if (shared.length) ins.push(`You both love ${shared[0].name} movies!`);
    return { score: sc, shared, ins };
  }

  /* ── recommendations ──────────────────────────────────────── */
  async function genRecs() {
    setLoading(true);
    const g1 = countGenres(p1), g2 = countGenres(p2);
    const sh = Object.keys(g1).filter(g => g2[g]).sort((a,b) => (g1[b]+g2[b]) - (g1[a]+g2[a]));
    const exist = new Set([...p1, ...p2].map(m => m.id));
    try {
      let res = [];
      if (sh.length) {
        const top = sh.slice(0, 3);
        if (together) {
          const pages = await Promise.all(top.map(g =>
            fetch(`${BASE}/discover/movie?api_key=${API_KEY}&with_genres=${g}&with_original_language=en&sort_by=vote_average.desc&vote_count.gte=200&vote_average.gte=6.5`)
              .then(r => r.json()).then(d => d.results || []).catch(() => [])
          ));
          const pool = pages.flat();
          const scored = pool.map(m => {
            let s = 0;
            (m.genre_ids || []).forEach(g => { if (sh.includes(String(g))) s += 15; });
            s += (m.vote_average || 0) * 3;
            const yr = parseInt((m.release_date || "0").slice(0,4));
            if (yr >= 2022) s += 10; else if (yr >= 2018) s += 6; else if (yr >= 2014) s += 3;
            if ((m.genre_ids||[]).some(g => (g1[g]||0) >= 2 && (g2[g]||0) >= 2)) s += 12;
            return { ...m, _s: s };
          });
          const map = new Map();
          scored.forEach(m => { if (!map.has(m.id) || map.get(m.id)._s < m._s) map.set(m.id, m); });
          res = [...map.values()].sort((a,b) => b._s - a._s);
        } else {
          const r = await fetch(`${BASE}/discover/movie?api_key=${API_KEY}&with_genres=${top.slice(0,2).join(",")}&with_original_language=en&sort_by=vote_average.desc&vote_count.gte=500&vote_average.gte=6.5`);
          res = (await r.json()).results || [];
        }
      } else {
        const r = await fetch(`${BASE}/discover/movie?api_key=${API_KEY}&with_original_language=en&sort_by=popularity.desc&vote_count.gte=500&vote_average.gte=6.5`);
        res = (await r.json()).results || [];
      }
      setRecs(res.filter(m => !exist.has(m.id)).slice(0, 12));
    } catch { setRecs([]); }
    setLoading(false);
  }

  /* ── persistent storage ───────────────────────────────────── */
  async function loadSaved() {
    try {
      const r = await window.storage.list("ml:");
      if (r?.keys) {
        const out = [];
        for (const k of r.keys) {
          try { const i = await window.storage.get(k); if (i?.value) out.push({ key: k, ...JSON.parse(i.value) }); } catch {}
        }
        setSaved(out);
      }
    } catch { setSaved([]); }
  }

  async function doSave() {
    if (!listName.trim()) { setSaveMsg("Please enter a name"); return; }
    try {
      await window.storage.set(`ml:${listName.toLowerCase().replace(/\s+/g,"-")}`, JSON.stringify({ name: listName, n1, n2, p1, p2, savedAt: new Date().toISOString() }));
      setSaveMsg("✅ Saved!");
      setTimeout(() => { setShowSave(false); setSaveMsg(""); setListName(""); }, 1400);
      await loadSaved();
    } catch { setSaveMsg("❌ Error saving."); }
  }

  async function doLoad(key) {
    try {
      const r = await window.storage.get(key);
      if (!r?.value) return;
      const d = JSON.parse(r.value);
      setN1(d.n1); setN2(d.n2); setP1(d.p1); setP2(d.p2);
      sLS("mm_n1",d.n1); sLS("mm_n2",d.n2); sLS("mm_p1",d.p1); sLS("mm_p2",d.p2);
      setShowLoad(false); setTab("lists");
    } catch { alert("Failed to load."); }
  }

  async function doDelete(key) {
    if (!confirm("Delete this list?")) return;
    try { await window.storage.delete(key); await loadSaved(); } catch {}
  }

  /* ═══════════════════════════════════════════════════════════
     SUB-COMPONENTS
     ═══════════════════════════════════════════════════════════ */

  /* ── MovieCard ─────────────────────────────────────────────── */
  function MovieCard({ movie, showActions, personNum }) {
    return (
      <div className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-300">
        <div onClick={() => fetchDetail(movie.id)} className="relative cursor-pointer overflow-hidden" style={{ aspectRatio: "2/3" }}>
          {movie.poster_path
            ? <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            : <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><IcoFilm className="w-10 h-10 text-zinc-600" /></div>
          }
          {movie.vote_average > 0 && (
            <div className="absolute top-2 right-2 bg-black/80 rounded-lg px-2 py-0.5 flex items-center gap-1">
              <IcoStar className="w-3 h-3 text-yellow-400" filled /><span className="text-xs font-semibold text-white">{movie.vote_average.toFixed(1)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-white text-xs leading-tight mb-0.5 line-clamp-2">{movie.title}</h3>
          <p className="text-zinc-500 text-xs mb-2">{movie.release_date?.split("-")[0] || "N/A"}</p>
          {showActions && (
            <div className="flex gap-1.5">
              {!inP1(movie.id) && <button onClick={e => { e.stopPropagation(); addMovie(movie, 1); }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-2 py-1.5 rounded-lg transition-colors truncate">{n1}</button>}
              {!inP2(movie.id) && <button onClick={e => { e.stopPropagation(); addMovie(movie, 2); }} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-2 py-1.5 rounded-lg transition-colors truncate">{n2}</button>}
            </div>
          )}
          {personNum && (
            <button onClick={e => { e.stopPropagation(); rmMovie(movie.id, personNum); }} className="w-full mt-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium px-2 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors">
              <IcoX className="w-3 h-3" /> Remove
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── Detail Modal ─────────────────────────────────────────── */
  function DetailModal() {
    if (!detail) return null;
    const cur = COUNTRIES.find(c => c.code === country) || COUNTRIES[0];
    const { flatrate, rent, buy, link: jwLink } = streaming || {};

    function ProviderRow({ label, items }) {
      if (!items?.length) return null;
      return (
        <div className="mb-3">
          <p className="text-xs font-medium text-zinc-500 mb-2">{label}</p>
          <div className="flex flex-wrap gap-2">
            {items.slice(0,5).map(pr => (
              <a key={pr.provider_id} href={jwLink || "#"} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
                <img src={`https://image.tmdb.org/t/p/original${pr.logo_path}`} alt={pr.provider_name} className="w-11 h-11 rounded-lg border border-zinc-600 group-hover:border-purple-500 group-hover:scale-110 transition-all" />
                <span className="text-xs text-zinc-500 group-hover:text-zinc-300 text-center leading-tight" style={{ maxWidth: 52 }}>{pr.provider_name}</span>
              </a>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(4px)" }}>
        <div className="min-h-full px-4 py-8 flex items-start justify-center">
          <div className="max-w-4xl w-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 relative">
            {detail.backdrop_path && (
              <div className="relative h-64">
                <img src={`https://image.tmdb.org/t/p/original${detail.backdrop_path}`} alt={detail.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgb(39 39 42), rgba(39,39,42,0.4), transparent)" }} />
              </div>
            )}
            <button onClick={() => setDetail(null)} className="absolute top-3 right-3 bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition-colors z-10">
              <IcoX className="w-5 h-5 text-white" />
            </button>
            <div className="p-6 relative z-10" style={{ marginTop: detail.backdrop_path ? "-4rem" : 0 }}>
              <div className="flex gap-5 mb-5">
                {detail.poster_path && <img src={`https://image.tmdb.org/t/p/w500${detail.poster_path}`} alt={detail.title} className="w-32 rounded-xl shadow-2xl flex-shrink-0 border border-zinc-800" />}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-white mb-0.5">{detail.title}</h2>
                  {detail.tagline && <p className="text-zinc-400 italic text-sm mb-1">{detail.tagline}</p>}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {detail.vote_average > 0 && (
                      <div className="flex items-center gap-1 rounded-lg px-2 py-0.5 font-semibold text-sm" style={{ background: "rgba(234,179,8,0.15)", color: "#facc15" }}>
                        <IcoStar className="w-4 h-4" filled />{detail.vote_average.toFixed(1)}
                      </div>
                    )}
                    <span className="text-zinc-400 text-sm">{detail.release_date?.split("-")[0]}</span>
                    {detail.runtime && <span className="text-zinc-400 text-sm">{detail.runtime} min</span>}
                  </div>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {!inP1(detail.id) && <button onClick={() => addMovie(detail, 1)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-medium text-sm transition-colors"><IcoPlus className="w-4 h-4" />{n1}</button>}
                    {!inP2(detail.id) && <button onClick={() => addMovie(detail, 2)} className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 rounded-lg font-medium text-sm transition-colors"><IcoPlus className="w-4 h-4" />{n2}</button>}
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed mb-3">{detail.overview}</p>
                  {detail.genres?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {detail.genres.map(g => <span key={g.id} className="bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full text-xs">{g.name}</span>)}
                    </div>
                  )}
                </div>
              </div>
              {/* Where to watch */}
              <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-1.5"><IcoPlay className="w-4 h-4 text-red-500" /> Where to Watch</h3>
                  <button onClick={() => setShowCPicker(!showCPicker)} className="flex items-center gap-1 bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded text-xs transition-colors">
                    <IcoGlobe className="w-3.5 h-3.5" />{cur.flag} {cur.code}
                  </button>
                </div>
                {showCPicker && (
                  <div className="mb-3 bg-zinc-900 rounded-lg p-2.5 border border-zinc-700">
                    <p className="text-xs text-zinc-500 mb-1.5">Region:</p>
                    <div className="grid grid-cols-4 gap-1">
                      {COUNTRIES.map(c => (
                        <button key={c.code} onClick={() => { setCountry(c.code); setShowCPicker(false); fetchDetail(detail.id); }}
                          className={`px-1.5 py-1 rounded text-xs transition-colors ${country === c.code ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
                          {c.flag} {c.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <ProviderRow label="Stream" items={flatrate} />
                <ProviderRow label="Rent" items={rent} />
                <ProviderRow label="Buy" items={buy} />
                {!flatrate && !rent && !buy && <p className="text-zinc-500 text-xs">No streaming options in {cur.name}</p>}
                {jwLink && (
                  <a href={jwLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    View all on JustWatch <IcoExternal className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Save Modal ───────────────────────────────────────────── */
  function SaveModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(4px)" }}>
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-md w-full">
          <h2 className="text-lg font-bold text-white mb-1">Save Your Lists</h2>
          <p className="text-zinc-400 text-sm mb-3">Give your lists a name</p>
          <input type="text" placeholder='e.g. "Date Night Picks"' value={listName} onChange={e => setListName(e.target.value)} onKeyDown={e => e.key === "Enter" && doSave()}
            className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
          {saveMsg && <p className="text-sm mb-2 text-center">{saveMsg}</p>}
          <div className="flex gap-2">
            <button onClick={() => { setShowSave(false); setListName(""); setSaveMsg(""); }} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">Cancel</button>
            <button onClick={doSave} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">Save</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Load Modal ───────────────────────────────────────────── */
  function LoadModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(4px)" }}>
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-lg w-full" style={{ maxHeight: "75vh", overflowY: "auto" }}>
          <h2 className="text-lg font-bold text-white mb-1">Load Saved Lists</h2>
          <p className="text-zinc-400 text-sm mb-3">Choose a list to restore</p>
          {!saved.length ? (
            <div className="text-center py-8"><IcoFilm className="w-10 h-10 text-zinc-700 mx-auto mb-2" /><p className="text-zinc-500 text-sm">No saved lists yet</p></div>
          ) : (
            <div className="space-y-2 mb-3">
              {saved.map(l => (
                <div key={l.key} className="bg-zinc-800 rounded-lg p-3 border border-zinc-700 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm">{l.name}</h3>
                    <p className="text-xs text-zinc-400">{l.n1} &amp; {l.n2} • {(l.p1?.length||0)+(l.p2?.length||0)} movies • {new Date(l.savedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => doLoad(l.key)} className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded text-xs font-medium transition-colors">Load</button>
                    <button onClick={() => doDelete(l.key)} className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-2 py-1 rounded text-xs transition-colors"><IcoX className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setShowLoad(false)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">Close</button>
        </div>
      </div>
    );
  }

  /* ── Compat Modal ─────────────────────────────────────────── */
  function CompatModal() {
    const d = compatDetails();
    const maxL = Math.max(p1.length, p2.length, 1);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(4px)" }}>
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-2xl w-full" style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><IcoBarChart className="w-5 h-5 text-purple-400" /> Compatibility</h2>
            <button onClick={() => setShowCompat(false)} className="bg-zinc-800 hover:bg-zinc-700 rounded-full p-1.5 transition-colors"><IcoX className="w-4 h-4 text-white" /></button>
          </div>
          {/* Score */}
          <div className="rounded-xl p-5 mb-4 text-center border border-purple-800/30" style={{ background: "linear-gradient(135deg, rgba(88,28,135,0.4), rgba(157,23,77,0.4))" }}>
            <p className="text-zinc-400 text-xs mb-1">Compatibility Score</p>
            <div className="text-6xl font-bold mb-2" style={{ background: "linear-gradient(90deg,#a78bfa,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{d.score}%</div>
            <div className="w-full bg-zinc-800 rounded-full h-3 mb-2">
              <div className="h-3 rounded-full" style={{ width: `${d.score}%`, background: "linear-gradient(90deg,#7c3aed,#db2777)" }} />
            </div>
            <p className="text-zinc-300 text-sm">{d.score >= 80 ? "🔥 Perfect Match!" : d.score >= 60 ? "✨ Great Compatibility" : d.score >= 40 ? "🎬 Good Match" : "🌈 Diverse Tastes"}</p>
          </div>
          {/* Insights */}
          <div className="mb-4">
            <h3 className="font-bold text-white mb-2 flex items-center gap-1.5 text-sm"><IcoZap className="w-4 h-4 text-yellow-400" /> Insights</h3>
            <div className="space-y-1.5">{d.ins.map((t, i) => <div key={i} className="bg-zinc-800/50 rounded-lg px-3 py-2 border border-zinc-700"><p className="text-zinc-300 text-sm">{t}</p></div>)}</div>
          </div>
          {/* Shared genres */}
          {d.shared.length > 0 && (
            <div className="mb-4">
              <h3 className="font-bold text-white mb-2 flex items-center gap-1.5 text-sm"><IcoHeart className="w-4 h-4 text-pink-400" /> Shared Genres</h3>
              <div className="grid grid-cols-2 gap-2">
                {d.shared.map(g => (
                  <div key={g.id} className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-semibold">{g.name}</span>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:"#2563eb" }} />{g.p1}<span className="text-zinc-600">|</span>{g.p2}<span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:"#7c3aed" }} />
                      </div>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${Math.min((g.total/maxL)*100, 100)}%`, background: "linear-gradient(90deg,#2563eb,#7c3aed)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: p1.length, l: `${n1}'s`, c: "#60a5fa" },
              { v: common.length, l: "Shared", c: "#f472b6" },
              { v: p2.length, l: `${n2}'s`, c: "#c084fc" },
            ].map((s, i) => (
              <div key={i} className="bg-zinc-800/40 rounded-lg p-3 border border-zinc-700 text-center">
                <div className="text-2xl font-bold" style={{ color: s.c }}>{s.v}</div>
                <div className="text-xs text-zinc-400">{s.l} Movies</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════════════════════ */
  const gridCls = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
            <div>
              <h1 className="text-4xl font-bold" style={{ background:"linear-gradient(90deg,#ef4444,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>MovieMatch</h1>
              <p className="text-zinc-400 text-sm">Discover movies you'll both love</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowSave(true)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center gap-1.5"><IcoFilm className="w-3.5 h-3.5" /> Save</button>
              <button onClick={() => { loadSaved(); setShowLoad(true); }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center gap-1.5"><IcoPlay className="w-3.5 h-3.5" /> Load</button>
              <button onClick={() => { if (compat !== null) setShowCompat(true); }} disabled={compat === null}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                <IcoBarChart className="w-3.5 h-3.5" />{compat !== null ? `${compat}%` : "Stats"}
              </button>
              <button onClick={() => setTogether(!together)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${together ? "text-white shadow-lg shadow-purple-500/30" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`}
                style={together ? { background:"linear-gradient(90deg,#db2777,#7c3aed)" } : {}}>
                <IcoSparkles className="w-3.5 h-3.5" filled={together} /> Togetherness
                {compat !== null && together && <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{compat}%</span>}
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 mb-3">
            <input type="text" value={n1} onChange={e => { setN1(e.target.value); sLS("mm_n1", e.target.value); }} placeholder="First person's name"
              className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" />
            <input type="text" value={n2} onChange={e => { setN2(e.target.value); sLS("mm_n2", e.target.value); }} placeholder="Second person's name"
              className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm" />
          </div>
          <div className="relative">
            <IcoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input type="text" placeholder="Search for movies..." value={query} onChange={e => { setQuery(e.target.value); doSearch(e.target.value); }}
              className="w-full bg-zinc-900 border border-zinc-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm" />
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-5 border-b border-zinc-800">
          {[
            { id:"discover", Icon: IcoSearch,  label:"Discover" },
            { id:"lists",    Icon: IcoUsers,   label:"Your Lists" },
            { id:"foryou",   Icon: IcoHeart,   label:"For You" },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === "foryou") genRecs(); }}
              className={`px-4 py-2 rounded-t-lg text-xs font-medium transition-all flex items-center gap-1.5 ${tab === t.id ? "bg-zinc-900 text-white border-b-2 border-red-500" : "text-zinc-500 hover:text-zinc-300"}`}>
              <t.Icon className="w-4 h-4" />{t.label}
              {t.id === "lists" && common.length > 0 && <span className="bg-pink-600 text-white text-xs px-1.5 py-0.5 rounded-full">{common.length}</span>}
            </button>
          ))}
        </div>

        {/* ── Spinner ───────────────────────────────────────────── */}
        {loading && <div className="text-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto" /></div>}

        {/* ── DISCOVER ──────────────────────────────────────────── */}
        {tab === "discover" && !loading && (
          <div>
            {results.length > 0
              ? <div className={gridCls}>{results.map(m => <MovieCard key={m.id} movie={m} showActions />)}</div>
              : (
                <div>
                  <div className="flex items-center gap-2 mb-3"><IcoTrending className="w-5 h-5 text-red-500" /><h2 className="text-base font-bold">Trending This Week</h2></div>
                  <div className={gridCls}>{trending.map(m => <MovieCard key={m.id} movie={m} showActions />)}</div>
                </div>
              )
            }
          </div>
        )}

        {/* ── YOUR LISTS ────────────────────────────────────────── */}
        {tab === "lists" && !loading && (
          <div className="space-y-5">
            {common.length > 0 && (
              <div className="rounded-2xl p-5 border border-pink-900/30" style={{ background:"linear-gradient(135deg,rgba(255,20,147,0.07),rgba(128,0,128,0.07))" }}>
                <h2 className="text-base font-bold mb-3 flex items-center gap-2"><IcoHeart className="w-5 h-5 text-pink-400" filled /> Perfect Match ({common.length})</h2>
                <div className={gridCls}>{common.map(m => <MovieCard key={m.id} movie={m} />)}</div>
              </div>
            )}
            <div className="grid lg:grid-cols-2 gap-4">
              {[
                { num:1, name:n1, movies:p1, color:"text-blue-400" },
                { num:2, name:n2, movies:p2, color:"text-purple-400" },
              ].map(person => (
                <div key={person.num} className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800">
                  <h2 className={`text-sm font-bold mb-3 ${person.color}`}>{person.name}'s List ({person.movies.length})</h2>
                  {!person.movies.length
                    ? (
                      <div className="text-center py-10">
                        <IcoFilm className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                        <p className="text-zinc-500 text-sm mb-1">No movies yet</p>
                        <button onClick={() => setTab("discover")} className={`${person.color} text-sm font-medium hover:opacity-70 transition-opacity`}>Add movies →</button>
                      </div>
                    )
                    : <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{person.movies.map(m => <MovieCard key={m.id} movie={m} personNum={person.num} />)}</div>
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FOR YOU ───────────────────────────────────────────── */}
        {tab === "foryou" && !loading && (
          <div className="space-y-4">
            {together && (
              <div className="rounded-2xl p-5 border border-pink-900/30" style={{ background:"linear-gradient(135deg,rgba(255,20,147,0.07),rgba(128,0,128,0.07))" }}>
                <h2 className="text-sm font-bold mb-2 flex items-center gap-2"><IcoSparkles className="w-4 h-4 text-yellow-400" filled /> ✨ Togetherness Mode Active</h2>
                <ul className="text-zinc-400 text-xs space-y-0.5 ml-4 list-disc">
                  <li>Analyzing top shared genres</li>
                  <li>Only highly-rated films (6.5+)</li>
                  <li>Smart scoring &amp; recency bonus</li>
                </ul>
                {common.length > 0 && (
                  <div className="mt-2 bg-pink-900/20 rounded px-3 py-1.5 border border-pink-800/30">
                    <p className="text-pink-300 text-xs flex items-center gap-1"><IcoHeart className="w-3 h-3" filled /> {common.length} movie{common.length > 1 ? "s" : ""} in common!</p>
                  </div>
                )}
              </div>
            )}
            <div className="rounded-2xl p-5 border border-purple-900/30" style={{ background:"linear-gradient(135deg,rgba(128,0,128,0.07),rgba(255,20,147,0.07))" }}>
              <h2 className="text-sm font-bold mb-1 flex items-center gap-2"><IcoHeart className="w-4 h-4 text-pink-400" /> {together ? "Perfect for Both" : "Recommended for You"}</h2>
              <p className="text-zinc-500 text-xs mb-2">{together ? "Smart picks from shared preferences" : "Based on shared interests"}</p>
              <button onClick={genRecs} className="text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-all hover:opacity-85" style={{ background:"linear-gradient(90deg,#ca8a04,#ea580c)" }}>Refresh</button>
            </div>
            {recs.length > 0
              ? <div className={gridCls}>{recs.map(m => <MovieCard key={m.id} movie={m} showActions />)}</div>
              : (
                <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800">
                  <IcoSparkles className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">Add movies to both lists for personalized picks</p>
                </div>
              )
            }
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      {detail     && <DetailModal />}
      {showSave   && <SaveModal />}
      {showLoad   && <LoadModal />}
      {showCompat && <CompatModal />}
    </div>
  );
}

import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, BookOpen, ExternalLink, Mail, Phone, MapPin, Award, CheckCircle, GraduationCap, Briefcase, RefreshCw } from "lucide-react";
import { Alumni } from "../types";

// --- Trie Data-Structure implementation for Optimized Directory Indexing ---
class TrieNode {
  children: { [char: string]: TrieNode } = {};
  itemIds: Set<string> = new Set();
}

class SearchTrie {
  root = new TrieNode();

  // Insert a index token mapping to a specific Alumni record ID
  insert(token: string, alumId: string) {
    const cleanToken = token.trim().toLowerCase();
    if (!cleanToken) return;
    
    // We also index substrings/suffixes of search items so that partial matches (e.g., "Google" match "gle") function flawlessly
    for (let start = 0; start < cleanToken.length; start++) {
      let node = this.root;
      const subToken = cleanToken.slice(start);
      for (const char of subToken) {
        if (!node.children[char]) {
          node.children[char] = new TrieNode();
        }
        node = node.children[char];
        node.itemIds.add(alumId);
      }
    }
  }

  // Searches prefix and returns set of matching Alumni IDs
  search(query: string): Set<string> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return new Set();
    
    let node = this.root;
    for (const char of cleanQuery) {
      if (!node.children[char]) {
        return new Set(); // no match
      }
      node = node.children[char];
    }
    return node.itemIds;
  }
}

const RichMediaProjectCard = ({ item, index }: { item: string; index: number; key?: any }) => {
  const [showDemo, setShowDemo] = useState(false);
  const isAI = item.toLowerCase().includes("ai") || item.toLowerCase().includes("learning") || item.toLowerCase().includes("neural") || item.toLowerCase().includes("model") || item.toLowerCase().includes("intelligence");
  const isWeb = item.toLowerCase().includes("web") || item.toLowerCase().includes("server") || item.toLowerCase().includes("platform") || item.toLowerCase().includes("blockchain") || item.toLowerCase().includes("app") || item.toLowerCase().includes("database");

  const backdropGradient = isAI 
    ? "from-emerald-500/10 to-teal-950/20 border-emerald-500/20"
    : (isWeb ? "from-red-650/10 to-stone-900/40 border-red-950/20" : "from-amber-600/10 to-neutral-900/40 border-amber-950/20");

  const techBadge = isAI ? "PyTorch • CUDA • Python" : (isWeb ? "TypeScript • Tailwind • React" : "C++ • Embedded RTOS • ESP32");

  return (
    <div className={`p-3.5 rounded-xl border bg-gradient-to-br ${backdropGradient} text-left flex flex-col justify-between transition-all duration-300 hover:scale-[1.01]`} id={`rich-project-${index}`}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8.5px] font-mono font-bold tracking-wider text-red-400 bg-red-950/20 border border-red-950/35 px-1.5 py-0.5 rounded uppercase">
            {isAI ? "AI System" : (isWeb ? "Cloud Web" : "Collegiate Research")}
          </span>
          <span className="text-[8.5px] font-mono text-zinc-500">{techBadge}</span>
        </div>
        <h5 className="text-[11.5px] font-bold text-stone-100 font-display leading-snug">{item}</h5>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-1 border-t border-white/5 pt-2.5">
        <button
          onClick={() => setShowDemo(!showDemo)}
          className="text-[9.5px] bg-white/5 border border-white/5 px-2.5 py-1 rounded text-stone-300 hover:text-white transition cursor-pointer"
        >
          {showDemo ? "Hide Interactive Blueprint" : "Launch Interactive Demo"}
        </button>
      </div>

      {showDemo && (
        <div className="mt-2.5 p-3.5 bg-black/95 rounded-lg border border-red-950/30 text-left font-mono text-[9px] text-emerald-400 space-y-1.5 animate-fade-in-up uppercase">
          <div className="text-stone-550 font-semibold mb-1 border-b border-white/5 pb-1">CONSOLE DEMO OUTPUT</div>
          <div>&gt; cce-portal-sandbox start prototype --target="{item}"</div>
          <div>&gt; loading modular weights... SUCCESS!</div>
          <div className="text-white">&gt; accuracy index: 98.43% | latency: 8ms</div>
          <div className="flex gap-1.5 items-center mt-1 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Collegiate Prototype Online</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface AlumniSectionProps {
  alumniList: Alumni[];
  onSelectContact: (person: any) => void;
  chatFilter: {
    query?: string;
    batch?: string;
    topic?: string;
    occupation?: string;
  } | null;
  onClearChatFilter: () => void;
  activeTheme: string;
}

export function AlumniSection({
  alumniList,
  onSelectContact,
  chatFilter,
  onClearChatFilter,
  activeTheme,
}: AlumniSectionProps) {
  const [selectedAlumnus, setSelectedAlumnus] = useState<Alumni | null>(null);
  
  // Advanced Filter state variables
  const [textSearch, setTextSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [occupationFilter, setOccupationFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [papersOnly, setPapersOnly] = useState(false);

  // Virtualizer - items to render slice to sustain 60fps performance
  const [visibleCount, setVisibleCount] = useState(12);

  // Synchronize AI Chat Bubble Search Suggestions
  useEffect(() => {
    if (chatFilter) {
      if (chatFilter.query) setTextSearch(chatFilter.query);
      if (chatFilter.batch) setBatchFilter(chatFilter.batch);
      if (chatFilter.topic) setTopicFilter(chatFilter.topic);
      if (chatFilter.occupation) setOccupationFilter(chatFilter.occupation);
    }
  }, [chatFilter]);

  // Construct Search Trie dynamically when list of alumni changes
  const searchTrie = useMemo(() => {
    const trie = new SearchTrie();
    alumniList.forEach((alum) => {
      // Index Name
      const nameParts = alum.name.split(/\s+/);
      nameParts.forEach((part) => trie.insert(part, alum.id));
      trie.insert(alum.name, alum.id);

      // Index Company
      trie.insert(alum.company, alum.id);
      
      // Index Designation
      const desigParts = alum.designation.split(/\s+/);
      desigParts.forEach((part) => trie.insert(part, alum.id));

      // Index Skills
      alum.skills.forEach((skill) => trie.insert(skill, alum.id));

      // Index Batch
      trie.insert(alum.batch, alum.id);
    });
    return trie;
  }, [alumniList]);

  // Handle filtered outputs cleanly
  const filteredAlumni = useMemo(() => {
    let baseList = alumniList;

    // Use Trie search if textSearch is populated!
    if (textSearch.trim() !== "") {
      const matchedIds = searchTrie.search(textSearch);
      
      // Secondary fallback filter in case user inputs multi-word combinations not fully indexed
      baseList = baseList.filter((alum) => {
        if (matchedIds.has(alum.id)) return true;
        
        // standard regex or string matching as a safe fallback
        const searchLow = textSearch.toLowerCase();
        return (
          alum.name.toLowerCase().includes(searchLow) ||
          alum.company.toLowerCase().includes(searchLow) ||
          alum.designation.toLowerCase().includes(searchLow) ||
          alum.skills.some((s) => s.toLowerCase().includes(searchLow))
        );
      });
    }

    // Apply batch criteria
    if (batchFilter !== "All") {
      baseList = baseList.filter((a) => a.batch === batchFilter);
    }

    // Apply occupation criteria
    if (occupationFilter !== "All") {
      baseList = baseList.filter((a) => a.currentOccupation === occupationFilter);
    }

    // Apply Mentorship topics
    if (topicFilter !== "All") {
      baseList = baseList.filter((a) => a.mentorTopics?.includes(topicFilter));
    }

    // Filter by academic publications
    if (papersOnly) {
      baseList = baseList.filter((a) => a.papers && a.papers.length > 0);
    }

    return baseList;
  }, [alumniList, textSearch, batchFilter, occupationFilter, topicFilter, papersOnly, searchTrie]);

  // Extract filter sets dynamically
  const batchesList = useMemo(() => {
    const set = new Set(alumniList.map((a) => a.batch));
    return Array.from(set).sort((a,b) => {
      // simple batch sorter
      const numA = parseInt(a.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.replace(/\D/g, "")) || 0;
      return numA - numB;
    });
  }, [alumniList]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (batchFilter !== "All") count++;
    if (occupationFilter !== "All") count++;
    if (topicFilter !== "All") count++;
    if (papersOnly) count++;
    if (textSearch !== "") count++;
    return count;
  }, [batchFilter, occupationFilter, topicFilter, papersOnly, textSearch]);

  const handleResetFilters = () => {
    setTextSearch("");
    setBatchFilter("All");
    setOccupationFilter("All");
    setTopicFilter("All");
    setPapersOnly(false);
    onClearChatFilter();
  };

  const loadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  // Custom 3D mouse tracking tilt effect for premium cards
  const handleMouseMove3D = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((centerY - y) / centerY) * 5; // max 5 degrees tilt
    const rotateY = ((x - centerX) / centerX) * 5;
    
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const handleMouseLeave3D = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" id="alumni-directory-section">
      
      {/* Search Header Info */}
      <div className="mb-6 text-left">
        <h2 className="font-display font-bold text-2xl text-white tracking-wide">CCE Alumni Directory</h2>
        <p className="text-xs text-stone-400">
          Find, match, and request direct counseling from CCE graduates across Batch 5 to Batch 23+.
        </p>
      </div>

      {/* AI suggested active filter banner */}
      {chatFilter && (
        <div className="mb-4 bg-emerald-600/10 border border-emerald-500/20 p-3 rounded-lg flex items-center justify-between text-left text-xs text-emerald-300">
          <span>
            <strong>Smart Assist Alert:</strong> Filter parameters customized by active AI Assistant context!
          </span>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-700/30 hover:bg-emerald-700/50 rounded-md font-semibold cursor-pointer text-[10px]"
          >
            <RefreshCw className="w-3 h-3 animate-spin-slow" /> Reset
          </button>
        </div>
      )}

      {/* Grid Layout: Left sidebar filters, Right Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Advanced Filters sidebar panel */}
        <div className="lg:col-span-1 flex flex-col gap-4 text-left">
          <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-display font-semibold text-xs tracking-wide text-white uppercase flex items-center gap-2">
                <Filter className="w-4 h-4 text-red-500" /> Advanced Filter ({activeFiltersCount})
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] text-red-400 hover:text-red-300 font-mono font-bold cursor-pointer transition select-none"
                >
                  RESET ALL
                </button>
              )}
            </div>

            {/* Global instant search bar input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold">Trie Search Directory</label>
              <div className="relative">
                <input
                  type="text"
                  id="alumni-trie-search"
                  value={textSearch}
                  onChange={(e) => setTextSearch(e.target.value)}
                  placeholder="Seach by name, skill, key..."
                  className="w-full bg-stone-950 border border-white/5 hover:border-white/10 focus:border-red-650/40 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-200 outline-none transition"
                />
                <Search className="w-4 h-4 text-stone-550 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Batch Selector Dropdowns */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold">Academics Batch</label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                id="batch-dropdown-filter"
                className="bg-stone-955 border border-white/5 rounded-lg p-2 text-xs text-stone-200 outline-none hover:border-white/10 transition cursor-pointer"
              >
                <option value="All">All CCE Batches</option>
                {batchesList.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>

            {/* Occupation Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold">Employment / Path</label>
              <select
                value={occupationFilter}
                onChange={(e) => setOccupationFilter(e.target.value)}
                id="occupation-dropdown-filter"
                className="bg-stone-955 border border-white/5 rounded-lg p-2 text-xs text-stone-200 outline-none hover:border-white/10 transition cursor-pointer"
              >
                <option value="All">All Occupations</option>
                <option value="Job">Industry Job Holders</option>
                <option value="Higher Studies">Higher Studies Candidates</option>
              </select>
            </div>

            {/* Mentoring selection topics */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold">Available for Mentoring</label>
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                id="mentoring-dropdown-filter"
                className="bg-stone-955 border border-white/5 rounded-lg p-2 text-xs text-stone-200 outline-none hover:border-white/10 transition cursor-pointer"
              >
                <option value="All">All Mentor Fields</option>
                <option value="Programming">Programming</option>
                <option value="AI/ML">AI/ML</option>
                <option value="SQA">SQA</option>
                <option value="Career Guidance">Career Guidance</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Apps">Mobile Apps</option>
              </select>
            </div>

            {/* Academic papers checkbox filter */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <input
                type="checkbox"
                id="academic-papers-only-checkbox"
                checked={papersOnly}
                onChange={(e) => setPapersOnly(e.target.checked)}
                className="rounded border-white/10 accent-red-600 focus:ring-0 cursor-pointer text-red-600 bg-black/40 h-4 w-4"
              />
              <label htmlFor="academic-papers-only-checkbox" className="text-[11px] text-stone-300 select-none cursor-pointer flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-red-400 shrink-0" /> Has Published Papers
              </label>
            </div>
          </div>
        </div>

        {/* Directory Listings panel */}
        <div className="lg:col-span-3">
          
          {selectedAlumnus ? (
            /* Detailed Profile Page */
            <div className="animate-fade-in-up glass-card rounded-[2rem] p-6 text-left relative overflow-hidden shadow-2xl" id="alumni-detail-card">
              
              <button
                onClick={() => setSelectedAlumnus(null)}
                id="close-alum-detail-btn"
                className="absolute top-4 right-4 text-xs font-semibold bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-md text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                Back to Grid
              </button>

              <div className="flex flex-col sm:flex-row gap-6 items-start pb-6 border-b border-white/5">
                <img
                  src={selectedAlumnus.profileImage}
                  alt={selectedAlumnus.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-full object-cover border-2 border-red-700/80 shadow-lg shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
                  }}
                />
                <div className="flex-1 mt-2">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <h3 className="font-display font-bold text-2xl text-white tracking-wide">{selectedAlumnus.name}</h3>
                    <span className="px-2 py-0.5 text-[9px] font-mono select-none bg-red-650/20 text-red-400 rounded border border-red-950/20 uppercase font-bold">
                      {selectedAlumnus.batch}
                    </span>
                  </div>
                  <p className="text-stone-400 text-sm mt-1">{selectedAlumnus.designation}</p>
                  <p className="text-stone-300 font-semibold text-xs mt-0.5">{selectedAlumnus.company}</p>
                  
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-450 mt-3 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>{selectedAlumnus.location || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Grid content attributes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                
                {/* Academic Identity Details */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-stone-400 border-b border-white/5 pb-1">Academic Identity</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-left">
                      <span className="block text-[10px] text-stone-500 uppercase font-mono font-semibold">STUDENT ID</span>
                      <span className="text-xs text-stone-200 font-mono select-all font-medium">{selectedAlumnus.studentId || "N/A"}</span>
                    </div>
                    <div className="text-left">
                      <span className="block text-[10px] text-stone-500 uppercase font-mono font-semibold">CCE ALUMNI BATCH</span>
                      <span className="text-xs text-stone-200 font-mono font-medium">{selectedAlumnus.batch}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="block text-[10px] text-stone-500 uppercase font-mono font-semibold mb-1">SKILLSET & SPECIALIZATIONS</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedAlumnus.skills.length > 0 ? (
                        selectedAlumnus.skills.map((s, i) => (
                          <span key={i} className="text-[10px] bg-stone-950 px-2 py-0.5 text-stone-300 rounded border border-white/5 font-mono">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-stone-500 italic">None logged</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="block text-[10px] text-stone-500 uppercase font-mono font-semibold mb-1.5 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" /> ACTIVE MENTOR AREAS
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedAlumnus.mentorTopics && selectedAlumnus.mentorTopics.length > 0 ? (
                        selectedAlumnus.mentorTopics.map((t, i) => (
                          <span key={i} className="text-[10px] bg-emerald-950/20 text-emerald-400 border border-emerald-950/45 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-stone-550 italic">None logged for mentorship availability</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Featured Lab & Industry Portfolios */}
                <div className="space-y-4 border-b border-white/5 pb-4">
                  <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-stone-400 border-b border-white/5 pb-1">Collegiate Handcrafted Portfolios & Demos</h4>
                  <div className="grid grid-cols-1 gap-3 max-h-[190px] overflow-y-auto scrollbar-thin">
                    {selectedAlumnus.projects && selectedAlumnus.projects.length > 0 ? (
                      selectedAlumnus.projects.map((proj, idx) => (
                        <RichMediaProjectCard key={idx} item={proj} index={idx} />
                      ))
                    ) : (
                      <p className="text-xs text-stone-550 italic leading-normal text-left py-2">No active engineering project portfolio items available here yet.</p>
                    )}
                  </div>
                </div>

                {/* Research papers and publications */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-stone-400 border-b border-white/5 pb-1">Academic Publications</h4>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto scrollbar-thin">
                    {selectedAlumnus.papers && selectedAlumnus.papers.length > 0 ? (
                      selectedAlumnus.papers.map((paper, idx) => (
                        <div key={idx} className="flex gap-2 text-left bg-black/25 p-2 rounded border border-white/5">
                          <BookOpen className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-stone-300 font-sans italic tracking-wide leading-normal">"{paper}"</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-500 italic py-2 text-left">No scientific publications uploaded for this record yet.</p>
                    )}
                  </div>

                  {/* LinkedIn profiles button */}
                  <div className="pt-2 flex flex-col gap-3">
                    {selectedAlumnus.linkedinUrl && (
                      <a
                        href={selectedAlumnus.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition"
                      >
                        <ExternalLink className="w-4 h-4" /> View Connected LinkedIn Profile
                      </a>
                    )}

                    <button
                      onClick={() => onSelectContact({ ...selectedAlumnus, type: "alumni" })}
                      id="submit-detail-contact"
                      className="w-full text-center font-semibold text-white bg-red-700 hover:bg-red-650 p-2.5 rounded-lg text-xs shadow-lg shadow-red-950/20 active:scale-95 transition cursor-pointer"
                    >
                      Request Advising Hub Contact
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Directory listings index grid with incremental display slices (virtualizer) */
            <div className="space-y-6">
              {filteredAlumni.length === 0 ? (
                <div className="glass-card rounded-[2rem] p-12 text-center" id="empty-alumni-filters">
                  <span className="text-3xl text-stone-500 select-none mb-2 block font-extrabold font-mono">X</span>
                  <p className="text-sm font-medium text-stone-300 tracking-wide">No matched CCE Hub Alumni</p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-normal">
                    Try adjusting filters or clear search term keywords index.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 text-xs font-semibold px-4 py-2 bg-red-700 hover:bg-red-650 text-white rounded-lg transition active:scale-95 cursor-pointer"
                  >
                    Clear Search State
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" id="alumni-cards-grid">
                    {filteredAlumni.slice(0, visibleCount).map((alum) => (
                      <div
                        key={alum.id}
                        id={`alum-card-${alum.id}`}
                        onMouseMove={handleMouseMove3D}
                        onMouseLeave={handleMouseLeave3D}
                        style={{ perspective: "600px" }}
                        className="glass-card glass-card-hover p-5 rounded-2xl text-left cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          {/* Top Row: profile placeholder image, batch tag */}
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <img
                              src={alum.profileImage}
                              alt={alum.name}
                              referrerPolicy="no-referrer"
                              className="w-13 h-13 rounded-full object-cover border border-white/10 shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
                              }}
                            />
                            <span className="px-2 py-0.5 text-[8px] font-mono font-bold uppercase select-none bg-red-650/10 text-red-400 rounded border border-red-950/20">
                              {alum.batch}
                            </span>
                          </div>

                          {/* Profile metadata headings */}
                          <h4 className="font-display font-semibold text-stone-100 text-[14px] leading-tight group-hover:text-white truncate">
                            {alum.name}
                          </h4>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-sans leading-tight">
                            {alum.designation}
                          </p>
                          <p className="text-[10px] text-stone-500 font-mono font-semibold truncate uppercase mt-0.5 tracking-tight">
                            {alum.company || "University Affiliated"}
                          </p>

                          {/* Mentor tags tracker */}
                          <div className="flex flex-wrap gap-1 mt-3">
                            {alum.mentorTopics && alum.mentorTopics.slice(0, 2).map((topic, i) => (
                              <span key={i} className="text-[8.5px] font-bold tracking-wide uppercase px-1.5 py-0.5 bg-emerald-950/30 text-emerald-400 border border-emerald-950/50 rounded">
                                {topic}
                              </span>
                            ))}
                            {alum.skills && alum.skills.slice(0, 1).map((skill, i) => (
                              <span key={i} className="text-[8.5px] font-mono bg-stone-950 px-1.5 py-0.5 rounded border border-white/5 text-stone-400">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* View Profile triggering anchor */}
                        <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5 flex-wrap gap-2">
                          <span className="text-[9px] text-zinc-550 font-mono tracking-wider font-semibold">ID: {alum.studentId}</span>
                          <button
                            onClick={() => setSelectedAlumnus(alum)}
                            id={`view-alum-btn-${alum.id}`}
                            className="text-[10px] text-red-400 hover:text-red-300 font-bold tracking-wide uppercase cursor-pointer"
                          >
                            Explore Profile &rarr;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Virtual/Incremental slice Trigger */}
                  {filteredAlumni.length > visibleCount && (
                    <div className="pt-4 text-center">
                      <button
                        onClick={loadMore}
                        id="load-more-alumni-btn"
                        className="px-6 py-2 rounded-xl text-stone-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold tracking-wide transition active:scale-95 cursor-pointer shadow"
                      >
                        Load More Graduates ({filteredAlumni.length - visibleCount} hidden)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

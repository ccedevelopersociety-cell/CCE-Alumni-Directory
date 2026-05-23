import { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  Users,
  Search,
  Bell,
  ArrowUp,
  ArrowDown,
  Info,
  Calendar as CalendarIcon,
  Sparkles,
  Shield,
  Menu,
  X,
  Palette
} from "lucide-react";
import { Alumni, Student, NotificationItem, ThemeType } from "./types";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { CalendarClockWidget } from "./components/CalendarClockWidget";
import { AIChatBubble } from "./components/AIChatBubble";
import { AlumniSection } from "./components/AlumniSection";
import { StudentsSection } from "./components/StudentsSection";
import { ContactPage } from "./components/ContactPage";
import { AdminPanel } from "./components/AdminPanel";
import { NetworkHub } from "./components/NetworkHub";
import { fallbackAlumni, fallbackStudents, fallbackNotifications } from "./data/fallbackData";

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "alumni" | "students" | "admin" | "contact" | "network">("home");
  const [theme, setTheme] = useState<ThemeType>("dark-red-black");
  
  // Search state prefilled in Navbar
  const [globalSearch, setGlobalSearch] = useState("");

  // Directory lists
  const [alumniList, setAlumniList] = useState<Alumni[]>(fallbackAlumni);
  const [studentsList, setStudentsList] = useState<Student[]>(fallbackStudents);
  const [notifications, setNotifications] = useState<NotificationItem[]>(fallbackNotifications);

  // Navigation targets
  const [selectedContactPerson, setSelectedContactPerson] = useState<any | null>(null);

  // Smart Nav Scroll triggers
  const lastScrollY = useRef(0);
  const [navVisible, setNavVisible] = useState(true);

  // AI filtered cache triggers
  const [chatFilterTrigger, setChatFilterTrigger] = useState<any | null>(null);

  // Notification Permissions banners
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync / Fetch initial dataset from Node.js API routes
  const loadDirectoryData = async () => {
    try {
      const [alResponse, stResponse, ntResponse] = await Promise.all([
        fetch("/api/alumni"),
        fetch("/api/students"),
        fetch("/api/notifications"),
      ]);

      if (alResponse.ok) setAlumniList(await alResponse.json());
      if (stResponse.ok) setStudentsList(await stResponse.json());
      if (ntResponse.ok) setNotifications(await ntResponse.json());
    } catch (err) {
      console.warn("Express server offline, fallback list empty", err);
    }
  };

  // Poll data in real-time to pick up CRUD updates and push notifications instantly
  useEffect(() => {
    loadDirectoryData();
    const interval = setInterval(loadDirectoryData, 5000);
    
    // Register Service Worker in main browser context
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("Service worker registration skipped", err);
      });
    }

    // Check Notification API permission status on mount
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        setShowNotificationBanner(true);
      }
    }

    return () => clearInterval(interval);
  }, []);

  // Scroll visibility check for the navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 70) {
        // Scrolling down -> hide navbar smoothly
        setNavVisible(false);
      } else {
        // Scrolling up -> expose navbar instantly
        setNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Request browser Notification permissions
  const requestPushPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((status) => {
        setShowNotificationBanner(false);
        if (status === "granted") {
          new Notification("Welcome to the CCE Hub!", {
            body: "You will now receive instant announcements, project updates, and alumni advisements.",
            icon: "https://cdn-icons-png.flaticon.com/512/5087/5087579.png"
          });
          fetch("/api/register-push", { method: "POST" });
        }
      });
    } else {
      setShowNotificationBanner(false);
    }
  };

  // Apply filter recommended by chatbot AI
  const handleApplyAIChatFilter = (filter: any) => {
    setChatFilterTrigger(filter);
    if (filter.type === "alumni" || filter.type === "all") {
      setActiveTab("alumni");
    } else if (filter.type === "student") {
      setActiveTab("students");
    }
  };

  const handleClearAIChatFilter = () => {
    setChatFilterTrigger(null);
  };

  // Nav scroll targets
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });

  // Select profile key to redirect straight to custom inquiries
  const handleOpenContactPage = (entity: any) => {
    setSelectedContactPerson(entity);
    setActiveTab("contact");
  };

  // Resolve global styles matching user selection
  const getThemeClass = (): string => {
    switch (theme) {
      case "black-dark-red":
        return "liquid-bg-2 text-white transition-all duration-700";
      case "dark-red-green":
        return "liquid-bg-3 text-[#f0fdf4] transition-all duration-700";
      default:
        return "liquid-bg-1 text-[#f3f4f6] transition-all duration-700";
    }
  };

  // Retrieve current heading styled accents
  const getAccentColor = (): string => {
    switch (theme) {
      case "dark-red-green":
        return "text-emerald-400";
      default:
        return "text-red-500 animate-pulse-slow";
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className={`min-h-screen flex flex-col font-sans relative ${getThemeClass()}`} id="cce-app-container">
      {/* Immersive Frosted Glass Ambient Light Backdrop Nodes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-transparent" id="frosted-glass-ambient-system">
        <div className="absolute top-[-10vw] left-[-10vw] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-[#8B0000] rounded-full blur-[110px] sm:blur-[130px] opacity-25"></div>
        <div className="absolute bottom-[-10vw] right-[-10vw] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#4a0000] rounded-full blur-[130px] sm:blur-[150px] opacity-20"></div>
      </div>
      
      {/* Smart Scrolling Navbar Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b border-white/10 backdrop-blur-xl ${
          navVisible ? "translate-y-0 opacity-100 bg-white/5" : "-translate-y-full opacity-0"
        }`}
        id="cce-smart-header"
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Brand/Logo text */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveTab("home")}
            id="brand-header-logo"
          >
            <div className="p-1.5 rounded bg-red-700 text-white">
              <GraduationCap className="w-5.5 h-5.5" />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-sm tracking-widest text-white uppercase block leading-none">
                CCE IIUC HUB
              </span>
              <span className="text-[9px] font-mono tracking-wider text-stone-400">CONNECTING FUTURES</span>
            </div>
          </div>

          {/* Core Desktop Navigation options */}
          <nav className="hidden md:flex items-center gap-1.5" id="desktop-navbar-nav">
            {[
              { id: "home", label: "Overview Panel" },
              { id: "alumni", label: "Alumni Directory" },
              { id: "students", label: "Students List" },
              { id: "network", label: "Networking Hub" },
              { id: "admin", label: "Management Panel" },
            ].map((t) => (
              <button
                key={t.id}
                id={`nav-btn-${t.id}`}
                onClick={() => {
                  setActiveTab(t.id as any);
                  setGlobalSearch("");
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg tracking-wide hover:bg-white/5 active:scale-95 transition cursor-pointer select-none ${
                  activeTab === t.id ? "bg-red-700/20 text-red-400 border border-red-750/30 font-bold" : "text-stone-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* Quick inline search input connected straight into active database panels */}
          <div className="hidden sm:flex items-center gap-2 relative">
            <input
              type="text"
              id="navbar-trie-global-search"
              value={globalSearch}
              onChange={(e) => {
                const val = e.target.value;
                setGlobalSearch(val);
                // Pre-fill existing active directories
                if (activeTab === "home" || activeTab === "admin" || activeTab === "contact") {
                  setActiveTab("alumni");
                }
                setChatFilterTrigger({ query: val });
              }}
              placeholder="Instant Search Hub..."
              className="bg-black/45 border border-white/5 focus:border-red-650/45 text-xs text-stone-200 outline-none rounded-lg pl-8 pr-3 py-1.5 w-44 hover:w-56 transition-all duration-300"
            />
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-2.5" />
          </div>

          {/* Mobile Hamburg Trigger icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            id="mobile-hamburg-toggle"
            className="md:hidden p-2 rounded text-zinc-300 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile slide drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-neutral-950/95 py-3 px-4 flex flex-col gap-2 shadow-2xl animate-fade-in-up" id="mobile-menu-drawer">
            {[
              { id: "home", label: "Overview panel" },
              { id: "alumni", label: "Alumni Directory" },
              { id: "students", label: "Students directory" },
              { id: "network", label: "Networking Hub" },
              { id: "admin", label: "Management control" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id as any);
                  setIsMobileMenuOpen(false);
                  setGlobalSearch("");
                }}
                className={`text-left p-2 rounded-lg text-xs font-semibold w-full cursor-pointer hover:bg-white/5 ${
                  activeTab === t.id ? "bg-red-750/15 text-red-400 border border-red-950/20" : "text-stone-300"
                }`}
              >
                {t.label}
              </button>
            ))}

            <div className="relative mt-2">
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  if (activeTab === "home") setActiveTab("alumni");
                  setChatFilterTrigger({ query: e.target.value });
                }}
                placeholder="Search database..."
                className="bg-black/45 border border-white/10 text-xs text-stone-200 w-full rounded px-8 py-2 outline-none"
              />
              <Search className="w-4 h-4 text-stone-550 absolute left-2.5 top-2.5" />
            </div>
          </div>
        )}
      </header>

      {/* Floating Theme Controller */}
      <ThemeSwitcher currentTheme={theme} onChangeTheme={setTheme} />

      {/* Push announcement request permission banner overlays */}
      {showNotificationBanner && (
        <div
          className="fixed top-20 left-4 right-4 sm:left-auto sm:max-w-md z-50 bg-neutral-900 border border-red-900/40 p-4 rounded-xl shadow-2xl text-left animate-bounce"
          id="push-permission-banner-container"
        >
          <div className="flex gap-3">
            <div className="p-2 rounded-md bg-red-650/10 text-red-400 shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="font-display font-bold text-xs text-stone-200 tracking-wide">BROADCAST NOTIFICATIONS REQUEST</h4>
              <p className="text-[11px] text-zinc-400 leading-normal mt-1">
                Subscribing allows instant pushes when CCE Alumni submit job mentorship requests or when deadline extension directives release!
              </p>
              <div className="flex gap-2.5 mt-3">
                <button
                  onClick={requestPushPermission}
                  id="grant-notif-btn"
                  className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-650 text-white font-semibold text-[10px] uppercase cursor-pointer relative"
                >
                  Enable Channels
                </button>
                <button
                  onClick={() => setShowNotificationBanner(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-stone-400 hover:text-white font-semibold text-[10px] uppercase cursor-pointer"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Core Main View Container with spacing fitting the fixed smart navbar */}
      <main className="flex-1 pt-24 pb-16 relative z-10">
        
        {activeTab === "home" && (
          <div className="max-w-7xl mx-auto px-4 space-y-8 animate-fade-in-up" id="overview-pane">
            
            {/* Header clock date widget wrapper */}
            <div className="max-w-4xl mx-auto">
              <CalendarClockWidget />
            </div>

            {/* Department Hero layout */}
            <div className="glass-card rounded-[2rem] p-6 sm:p-10 text-left relative overflow-hidden shadow-2xl">
              {/* Subtle 3D background visual accents */}
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-red-800/20 rounded-full blur-3xl opacity-40" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-800/10 rounded-full blur-3xl opacity-30" />

              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-1.5 text-xs text-red-500 font-mono tracking-widest font-bold uppercase mb-2">
                  <Sparkles className="w-4 h-4" /> IIUC Academic Network Hub
                </div>
                <h1 className="font-display font-black text-3xl sm:text-5xl text-white leading-tight tracking-tight">
                  Welcome to the <span className={getAccentColor()}>CCE Faculty</span> Portal
                </h1>
                <p className="text-zinc-300 font-sans mt-3 text-xs leading-relaxed sm:text-sm">
                  Connecting undergraduate students of Batch 23-25+ directly with seasoned graduates from early Batch 5 onwards working across premium networks: Google, Samsung, Therap and European research universities coordinates.
                </p>
                <div className="flex flex-wrap gap-2.5 mt-6">
                  <button
                    onClick={() => setActiveTab("alumni")}
                    className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold text-xs transition uppercase tracking-wide cursor-pointer shadow-lg shadow-red-950/25"
                  >
                    Examine Alumni
                  </button>
                  <button
                    onClick={() => setActiveTab("students")}
                    className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-stone-300 font-semibold text-xs uppercase tracking-wide cursor-pointer transition"
                  >
                    View Students
                  </button>
                </div>
              </div>
            </div>

            {/* Hub statistics counters row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="stat-counters">
              {[
                { count: `${alumniList.length || 10}+`, label: "Registered Graduates", spec: "Batch 5 to 23" },
                { count: `${studentsList.length || 5}+`, label: "Enrolled Undergraduates", spec: "Semesters 1 to 8" },
                { count: `${(alumniList.reduce((acc, a) => acc + (a.papers?.length || 0), 0) + studentsList.reduce((acc, s) => acc + (s.papers?.length || 0), 0)) || 5}+`, label: "Archived Publications", spec: "IEEE & International Journals" },
                { count: "6+", label: "Academic Specialities", spec: "AI, Web, SQA, Cellular, OS" }
              ].map((s, idx) => (
                <div key={idx} className="glass-card p-5 rounded-2xl text-left transition-all duration-300 hover:border-red-500/40 hover:-translate-y-0.5" id={`stat-box-${idx}`}>
                  <span className="block font-display font-extrabold text-2xl text-white tracking-widest">{s.count}</span>
                  <span className="block text-[11px] font-bold text-stone-200 mt-1 uppercase tracking-wider">{s.label}</span>
                  <span className="block text-[9px] text-zinc-550 font-mono mt-0.5">{s.spec}</span>
                </div>
              ))}
            </div>

            {/* Live Campus Broadcast announcements board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              {/* Left Column: Interactive guide alerts */}
              <div className="md:col-span-1 glass-card p-5 rounded-2xl text-left">
                <span className="text-[10px] font-mono font-bold tracking-widest text-stone-400 uppercase block mb-3">Academic Charter</span>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  The CCE Portal serves as a bridges. Students seeking job referrals should check specific "Available Mentor Areas" before triggering secure inquiries.
                </p>
                <div className="p-3 bg-red-950/20 border border-red-900/20 text-[11px] text-zinc-400 uppercase rounded-xl mt-4 space-y-2">
                  <div className="flex gap-2 text-stone-300">
                    <Shield className="w-4.5 h-4.5 text-red-500 shrink-0" />
                    <span className="font-semibold text-[9.5px]">Double Checked Security</span>
                  </div>
                  <p className="text-[10px] leading-normal text-zinc-500 normal-case">
                    Credentials encryption is managed over full-stack layers. Privacy guidelines protect phone numbers unless authorization triggers.
                  </p>
                </div>
              </div>

              {/* Right Column: Dynamic announcements push feed list */}
              <div className="md:col-span-2 glass-card p-6 rounded-2xl text-left">
                <h3 className="font-display font-semibold text-white text-md tracking-wider flex items-center gap-2 border-b border-white/5 pb-2 mb-4">
                  <Bell className="w-4 h-4 text-red-500 animate-pulse" />
                  Live Announcements & Web-Push Broadcasts
                </h3>

                <div className="space-y-4 max-h-[290px] overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <p className="text-stone-500 italic text-xs py-4 text-center">No announcements recorded. Admin can compose messages on the control panel.</p>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="border-l-2 border-red-700 bg-white/5 p-4 rounded-r-lg" id={`notif-card-${notif.id}`}>
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                          <h4 className="font-display font-bold text-xs text-stone-150 leading-snug tracking-wide">{notif.title}</h4>
                          <span className="text-[9px] text-stone-500 font-mono">
                            {new Date(notif.timestamp).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-zinc-400 font-sans text-[11px] leading-normal">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Directory listings, detailed profile, queries routing */}
        {activeTab === "alumni" && (
          <AlumniSection
            alumniList={alumniList}
            onSelectContact={handleOpenContactPage}
            chatFilter={chatFilterTrigger}
            onClearChatFilter={handleClearAIChatFilter}
            activeTheme={theme}
          />
        )}

        {/* Current Students directory tab */}
        {activeTab === "students" && (
          <StudentsSection
            studentsList={studentsList}
            onSelectContact={handleOpenContactPage}
            chatFilter={chatFilterTrigger}
            activeTheme={theme}
          />
        )}

        {/* Academic Networking Hub */}
        {activeTab === "network" && (
          <NetworkHub
            alumniList={alumniList}
            studentsList={studentsList}
            activeTheme={theme}
          />
        )}

        {/* Admin controls CRUD terminal */}
        {activeTab === "admin" && (
          <AdminPanel
            alumniList={alumniList}
            studentsList={studentsList}
            onRefreshData={loadDirectoryData}
            activeTheme={theme}
          />
        )}

        {/* Direct referrals message center */}
        {activeTab === "contact" && (
          <ContactPage
            contactPerson={selectedContactPerson}
            onBack={() => {
              // go back to matching tab based on profile
              if (selectedContactPerson?.type === "alumni") {
                setActiveTab("alumni");
              } else {
                setActiveTab("students");
              }
            }}
            activeTheme={theme}
          />
        )}

      </main>

      {/* Embedded Intelligent AI Chat assistant bubble bubble triggers */}
      <AIChatBubble onApplyFilter={handleApplyAIChatFilter} activeTheme={theme} />

      {/* Fixed bottom-right helper scrolls controls */}
      <div className="fixed bottom-6 right-24 z-40 flex flex-col md:flex-row gap-2" id="scroll-controls-button-group">
        <button
          onClick={scrollToTop}
          id="scroll-to-top-btn"
          className="p-2.5 rounded-lg bg-black/45 hover:bg-black/60 border border-white/5 text-white hover:text-red-500 active:scale-95 transition cursor-pointer"
          title="Scroll To Top"
        >
          <ArrowUp className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={scrollToBottom}
          id="scroll-to-bottom-btn"
          className="p-2.5 rounded-lg bg-black/45 hover:bg-black/60 border border-white/5 text-white hover:text-red-500 active:scale-95 transition cursor-pointer"
          title="Scroll To Bottom"
        >
          <ArrowDown className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Footer copyright */}
      <footer className="border-t border-white/5 py-6 bg-black/45 text-center text-[10px] text-stone-550 relative z-30" id="cce-app-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans leading-normal">
            &copy; {currentYear} Department of CCE - International Islamic University Chittagong (IIUC). All rights Reserved.
          </p>
          <div className="flex gap-4 font-mono">
            <span>COMPATIBLE WITH CAPACITOR.JS FOR IOS AND ANDROID WRAPPERS</span>
            <span>STANDALONE PWA READY</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

import { useState, useMemo } from "react";
import { Search, MapPin, GraduationCap, Award, BookOpen, Heart, Eye, Mail, Phone, ExternalLink, Sparkles } from "lucide-react";
import { Student } from "../types";

const RichMediaProjectCard = ({ item, index }: { item: string; index: number; key?: any }) => {
  const [showDemo, setShowDemo] = useState(false);
  const isAI = item.toLowerCase().includes("ai") || item.toLowerCase().includes("learning") || item.toLowerCase().includes("neural") || item.toLowerCase().includes("model") || item.toLowerCase().includes("intelligence");
  const isWeb = item.toLowerCase().includes("web") || item.toLowerCase().includes("server") || item.toLowerCase().includes("platform") || item.toLowerCase().includes("blockchain") || item.toLowerCase().includes("app") || item.toLowerCase().includes("database");

  const backdropGradient = isAI 
    ? "from-emerald-500/10 to-teal-950/20 border-emerald-500/20"
    : (isWeb ? "from-red-650/10 to-stone-900/40 border-red-950/20" : "from-amber-600/10 to-neutral-900/40 border-amber-950/20");

  const techBadge = isAI ? "PyTorch • CUDA • Python" : (isWeb ? "TypeScript • Tailwind • React" : "C++ • Embedded RTOS • ESP32");

  return (
    <div className={`p-3.5 rounded-xl border bg-gradient-to-br ${backdropGradient} text-left flex flex-col justify-between transition-all duration-300 hover:scale-[1.01]`} id={`rich-project-student-${index}`}>
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
          className="text-[9.5px] bg-white/5 border border-white/5 px-2.5 py-1 rounded text-stone-300 hover:text-white transition cursor-pointer font-semibold"
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

interface StudentsSectionProps {
  studentsList: Student[];
  onSelectContact: (person: any) => void;
  chatFilter: {
    query?: string;
  } | null;
  activeTheme: string;
}

export function StudentsSection({ studentsList, onSelectContact, chatFilter, activeTheme }: StudentsSectionProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [textSearch, setTextSearch] = useState("");

  // Sync AI assist search intent
  useMemo(() => {
    if (chatFilter && chatFilter.query) {
      setTextSearch(chatFilter.query);
    }
  }, [chatFilter]);

  // Handle instant search computation over multiple student vectors (ID, Name, Skills)
  const filteredStudents = useMemo(() => {
    if (!textSearch.trim()) return studentsList;
    const q = textSearch.toLowerCase();
    return studentsList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.skills.some((sk) => sk.toLowerCase().includes(q)) ||
        (s.hobbies && s.hobbies.some((h) => h.toLowerCase().includes(q)))
    );
  }, [studentsList, textSearch]);

  const getThemeAccentClass = () => {
    switch (activeTheme) {
      case "dark-red-green":
        return "text-emerald-400";
      default:
        return "text-red-500";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" id="students-directory-section">
      
      {/* Header heading */}
      <div className="mb-6 text-left">
        <h2 className="font-display font-bold text-2xl text-white tracking-wide">CCE Student Directory</h2>
        <p className="text-xs text-stone-400">
          Find current students (1st to 8th semesters, Student ID formats: E19XXXX to E23XXXX) to collaborate on academic papers and engineering projects.
        </p>
      </div>

      {selectedStudent ? (
        /* Student Detailed Page */
        <div className="animate-fade-in-up glass-card rounded-[2rem] p-6 text-left relative overflow-hidden shadow-2xl" id="student-detail-card">
          
          <button
            onClick={() => setSelectedStudent(null)}
            id="close-student-detail-btn"
            className="absolute top-4 right-4 text-xs font-semibold bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-md text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            Back to Grid
          </button>

          <div className="flex flex-col sm:flex-row gap-6 items-start pb-6 border-b border-white/5">
            <img
              src={selectedStudent.profileImage}
              alt={selectedStudent.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover border-2 border-red-700/80 shadow-lg shrink-0"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1544717297-fa95b854e137?w=150";
              }}
            />
            <div className="flex-1 mt-2">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <h3 className="font-display font-bold text-2xl text-white tracking-wide">{selectedStudent.name}</h3>
                <span className="px-2 py-0.5 text-[9px] font-mono select-none bg-stone-900 border border-white/10 text-stone-300 rounded font-bold">
                  STUDENT ID: {selectedStudent.studentId}
                </span>
              </div>
              <p className="text-stone-400 text-xs mt-2.5 flex items-center gap-1">
                <GraduationCap className="w-4.5 h-4.5 text-zinc-500" /> Department of Computer Science & Communication Engineering (CCE)
              </p>
              <p className="text-emerald-400 text-[11px] font-semibold mt-1 font-mono uppercase tracking-wide">ACTIVE UNDERGRADUATE</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            
            {/* Core Skills, Hobbies and Details */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-stone-400 border-b border-white/5 pb-1">Specialties & Hobbies</h4>
              
              <div>
                <span className="block text-[10px] text-stone-500 uppercase font-mono font-semibold mb-1">SKILLSET LIST</span>
                <div className="flex flex-wrap gap-1">
                  {selectedStudent.skills && selectedStudent.skills.length > 0 ? (
                    selectedStudent.skills.map((s, i) => (
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
                <span className="block text-[10px] text-stone-500 uppercase font-mono font-semibold mb-1 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-red-500" /> HOBBIES & INTERESTS
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedStudent.hobbies && selectedStudent.hobbies.length > 0 ? (
                    selectedStudent.hobbies.map((h, i) => (
                      <span key={i} className="text-[10px] bg-red-950/10 text-red-400 border border-red-950/20 px-2 py-0.5 rounded font-medium">
                        {h}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-550 italic">None logged</span>
                  )}
                </div>
              </div>
            </div>

            {/* Academic works, Projects & LinkedIn Anchor */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-stone-400 border-b border-white/5 pb-1">Academic Works & Projects</h4>
              
              <div>
                <span className="block text-[10px] text-stone-500 uppercase font-mono font-semibold mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> CO-AUTHORED PAPERS
                </span>
                <div className="space-y-2 mt-1.5 scrollbar-thin max-h-[100px] overflow-y-auto">
                  {selectedStudent.papers && selectedStudent.papers.length > 0 ? (
                    selectedStudent.papers.map((p, idx) => (
                      <div key={idx} className="text-[11px] text-stone-300 leading-normal italic bg-black/30 p-2 rounded border border-white/5 text-left">
                        "{p}"
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-stone-550 italic block text-left">No academic publications archived.</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 mt-4">
                <span className="block text-[10px] text-stone-500 uppercase font-mono font-semibold mb-3 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-yellow-400" /> KEY LAB PROJECTS & PROTO DEMOS
                </span>
                <div className="grid grid-cols-1 gap-3 max-h-[190px] overflow-y-auto scrollbar-thin">
                  {selectedStudent.projects && selectedStudent.projects.length > 0 ? (
                    selectedStudent.projects.map((proj, idx) => (
                      <RichMediaProjectCard key={idx} item={proj} index={idx} />
                    ))
                  ) : (
                    <span className="text-xs text-stone-555 italic block text-left py-2">No active database projects listed.</span>
                  )}
                </div>
              </div>

              {/* LinkedIn profiles button */}
              <div className="pt-4 flex flex-col gap-3">
                {selectedStudent.linkedinUrl && (
                  <a
                    href={selectedStudent.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition"
                  >
                    <ExternalLink className="w-4 h-4" /> View Connected LinkedIn Profile
                  </a>
                )}

                <button
                  onClick={() => onSelectContact({ ...selectedStudent, type: "student" })}
                  id="submit-student-detail-contact"
                  className="w-full text-center font-semibold text-white bg-red-700 hover:bg-red-650 p-2.5 rounded-lg text-xs shadow-lg shadow-red-950/20 active:scale-95 transition cursor-pointer"
                >
                  Contact CCE Colleague
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Grid list index view */
        <div className="space-y-6">
          
          {/* Sub-bar Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-card p-4 rounded-xl">
            <span className="text-xs font-mono font-bold tracking-wider text-stone-400 flex items-center gap-2">
              ACTIVE CCE UNDERGRADUATES LIST ({filteredStudents.length})
            </span>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                id="student-search-input"
                value={textSearch}
                onChange={(e) => setTextSearch(e.target.value)}
                placeholder="Search students by name, skills..."
                className="w-full bg-stone-950 border border-white/5 hover:border-white/10 focus:border-red-650/40 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-200 outline-none transition"
              />
              <Search className="w-4 h-4 text-stone-550 absolute left-3 top-2.5" />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="glass-card rounded-[2rem] p-12 text-center" id="empty-students-filters">
              <p className="text-sm font-medium text-stone-300 tracking-wide">No students match your query</p>
              <button
                onClick={() => setTextSearch("")}
                className="mt-4 text-xs font-semibold px-4 py-2 bg-red-700 text-white rounded-lg cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="students-cards-grid">
              {filteredStudents.map((stud) => (
                <div
                  key={stud.id}
                  id={`student-card-${stud.id}`}
                  className="glass-card glass-card-hover p-5 rounded-2xl text-left cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Top element: profile image overlayed by ID tag */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <img
                        src={stud.profileImage}
                        alt={stud.name}
                        referrerPolicy="no-referrer"
                        className="w-13 h-13 rounded-full object-cover border border-white/10 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1544717297-fa95b854e137?w=150";
                        }}
                      />
                      <span className="px-2 py-0.5 text-[8px] font-mono tracking-wider bg-white/5 text-stone-300 rounded border border-white/15">
                        ID: {stud.studentId}
                      </span>
                    </div>

                    <h4 className="font-display font-semibold text-stone-100 text-[14px] leading-tight truncate">
                      {stud.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-1 font-semibold">DEPARTMENT OF CCE</p>

                    {/* Skill tags list */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {stud.skills && stud.skills.slice(0, 3).map((sk, i) => (
                        <span key={i} className="text-[8.5px] font-mono bg-stone-955 px-1.5 py-0.5 rounded border border-white/5 text-stone-300">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer profile navigation trigger */}
                  <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5">
                    <span className="text-[8.5px] text-stone-500 truncate max-w-28 font-semibold uppercase font-mono">
                      {stud.hobbies?.[0] ? `Interested in ${stud.hobbies[0]}` : "Active Learner"}
                    </span>
                    <button
                      onClick={() => setSelectedStudent(stud)}
                      id={`view-student-btn-${stud.id}`}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold tracking-wide uppercase cursor-pointer"
                    >
                      View Profile &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}

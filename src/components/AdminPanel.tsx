import React, { useState, useEffect } from "react";
import { Lock, LogOut, Plus, Edit, Trash2, Mail, Users, FileText, BellRing, Sparkles, Check, CheckCircle } from "lucide-react";
import { Alumni, Student } from "../types";

interface AdminPanelProps {
  alumniList: Alumni[];
  studentsList: Student[];
  onRefreshData: () => void;
  activeTheme: string;
}

export function AdminPanel({ alumniList, studentsList, onRefreshData, activeTheme }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("ADMIN_CCE");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // CRUD Modes: 'list' | 'create-alumni' | 'edit-alumni' | 'create-student' | 'edit-student' | 'broadcast'
  const [activeTab, setActiveTab] = useState<"alumni" | "students" | "broadcast">("alumni");
  const [panelView, setPanelView] = useState<"list" | "form">("list");
  const [editingAlumniId, setEditingAlumniId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // Broadcaster State
  const [pushTitle, setPushTitle] = useState("");
  const [pushMessage, setPushMessage] = useState("");
  const [pushSuccess, setPushSuccess] = useState(false);

  // Form Field States
  const [name, setName] = useState("");
  const [batch, setBatch] = useState("Batch 10");
  const [studentId, setStudentId] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [currentOccupation, setCurrentOccupation] = useState<"Job" | "Higher Studies">("Job");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  const [papersStr, setPapersStr] = useState("");
  const [projectsStr, setProjectsStr] = useState("");
  const [mentorTopics, setMentorTopics] = useState<string[]>([]);
  const [hobbiesStr, setHobbiesStr] = useState("");

  // Manage checked states for mentor checkbox
  const availableMentorTopics = ["Programming", "AI/ML", "SQA", "Career Guidance", "Web Development", "Mobile Apps"];

  const handleToggleMentorTopic = (topic: string) => {
    if (mentorTopics.includes(topic)) {
      setMentorTopics(mentorTopics.filter((t) => t !== topic));
    } else {
      setMentorTopics([...mentorTopics, topic]);
    }
  };

  // Check login credential on backend Express route
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminEmail, password: adminPassword }),
      });

      if (response.ok) {
        setIsLoggedIn(true);
        // Clean session passwords
        setAdminPassword("");
      } else {
        const errData = await response.json();
        setLoginError(errData.error || "Authentication failed. Try again.");
      }
    } catch (err) {
      setLoginError("Offline / Connection issue checking credentials.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEditingAlumniId(null);
    setEditingStudentId(null);
    setPanelView("list");
  };

  // CRUD Forms Triggers
  const openCreateAlumni = () => {
    resetFormStates();
    setEditingAlumniId(null);
    setPanelView("form");
  };

  const openEditAlumni = (alum: Alumni) => {
    resetFormStates();
    setEditingAlumniId(alum.id);
    setName(alum.name);
    setBatch(alum.batch);
    setStudentId(alum.studentId);
    setContactNumber(alum.contactNumber);
    setEmail(alum.email);
    setCurrentOccupation(alum.currentOccupation);
    setCompany(alum.company);
    setDesignation(alum.designation);
    setLocation(alum.location);
    setLinkedinUrl(alum.linkedinUrl);
    setProfileImage(alum.profileImage);
    setSkillsStr(alum.skills.join(", "));
    setPapersStr(alum.papers.join("\n"));
    setProjectsStr(alum.projects.join("\n"));
    setMentorTopics(alum.mentorTopics || []);
    setPanelView("form");
  };

  const openCreateStudent = () => {
    resetFormStates();
    setEditingStudentId(null);
    setPanelView("form");
  };

  const openEditStudent = (stud: Student) => {
    resetFormStates();
    setEditingStudentId(stud.id);
    setName(stud.name);
    setStudentId(stud.studentId);
    setContactNumber(stud.contactNumber);
    setEmail(stud.email);
    setLinkedinUrl(stud.linkedinUrl);
    setProfileImage(stud.profileImage);
    setSkillsStr(stud.skills.join(", "));
    setHobbiesStr(stud.hobbies.join(", "));
    setPapersStr(stud.papers.join("\n"));
    setProjectsStr(stud.projects.join("\n"));
    setPanelView("form");
  };

  const resetFormStates = () => {
    setName("");
    setBatch("Batch 15");
    setStudentId("");
    setContactNumber("");
    setEmail("");
    setCurrentOccupation("Job");
    setCompany("");
    setDesignation("");
    setLocation("");
    setLinkedinUrl("");
    setProfileImage("");
    setSkillsStr("");
    setPapersStr("");
    setProjectsStr("");
    setMentorTopics([]);
    setHobbiesStr("");
  };

  // Submit Alumni / Student Form to Server DB endpoints real-time!
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const skills = skillsStr.split(",").map((s) => s.trim()).filter(Boolean);
    const papers = papersStr.split("\n").map((p) => p.trim()).filter(Boolean);
    const projects = projectsStr.split("\n").map((pr) => pr.trim()).filter(Boolean);

    if (activeTab === "alumni") {
      const isEdit = !!editingAlumniId;
      const url = isEdit ? `/api/alumni/${editingAlumniId}` : "/api/alumni";
      const method = isEdit ? "PUT" : "POST";

      const bodyData = {
        name,
        batch,
        studentId,
        contactNumber,
        email,
        currentOccupation,
        company: currentOccupation === "Job" ? company : "N/A",
        designation: currentOccupation === "Job" ? designation : "Researcher / Postgraduate",
        location,
        linkedinUrl,
        profileImage: profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        skills,
        papers,
        projects,
        mentorTopics,
      };

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });

        if (response.ok) {
          onRefreshData();
          setPanelView("list");
          resetFormStates();
        }
      } catch (err) {
        console.error("Save Alumni DB action failed", err);
      }
    } else {
      // Students tab
      const isEdit = !!editingStudentId;
      const url = isEdit ? `/api/students/${editingStudentId}` : "/api/students";
      const method = isEdit ? "PUT" : "POST";

      const hobbies = hobbiesStr.split(",").map((h) => h.trim()).filter(Boolean);
      const studentBody = {
        name,
        studentId,
        contactNumber,
        email,
        linkedinUrl,
        profileImage: profileImage || "https://images.unsplash.com/photo-1544717297-fa95b854e137?w=150",
        skills,
        hobbies,
        papers,
        projects,
      };

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(studentBody),
        });

        if (response.ok) {
          onRefreshData();
          setPanelView("list");
          resetFormStates();
        }
      } catch (err) {
        console.error("Save Student DB action failed", err);
      }
    }
  };

  // Delete Entity from system
  const handleDeleteItem = async (id: string, type: "alumni" | "student") => {
    const doubleCheck = window.confirm(`Are you sure you wish to delete this CCE ${type} record permanently?`);
    if (!doubleCheck) return;

    try {
      const response = await fetch(`/api/${type === "alumni" ? "alumni" : "students"}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefreshData();
      } else {
        alert("Deletion failed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dispatch announcement push simulated info
  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushMessage.trim()) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: pushTitle, message: pushMessage }),
      });

      if (response.ok) {
        setPushSuccess(true);
        setPushTitle("");
        setPushMessage("");
        onRefreshData();
        setTimeout(() => setPushSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failing push trigger", err);
    }
  };

  if (!isLoggedIn) {
    /* Login Page */
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fade-in-up" id="admin-login-layout">
        <div className="glass-card p-6 rounded-2xl text-left">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-red-700/20 text-red-500">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-white">Secure Admin Panel</h3>
              <p className="text-[11px] text-zinc-400">Authenticated server authentication required</p>
            </div>
          </div>

          <form onSubmit={handleLogin} id="auth-admin-form" className="space-y-4">
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Fixed Login Email</label>
              <input
                type="email"
                required
                className="bg-stone-950 border border-white/5 hover:border-white/15 focus:border-red-650/40 rounded-lg p-2.5 text-xs text-white outline-none outline-0"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Private Admin Key</label>
              <input
                type="password"
                required
                className="bg-stone-950 border border-white/5 hover:border-white/15 focus:border-red-650/40 rounded-lg p-2.5 text-xs text-white outline-none outline-0"
                placeholder="Password Key Security"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 font-mono text-left">{loginError}</p>
            )}

            <button
              type="submit"
              id="admin-login-btn"
              className="w-full p-2.5 bg-red-700 hover:bg-red-600 rounded-lg text-xs font-semibold text-white shadow transition cursor-pointer"
            >
              Sign In to Control System
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" id="admin-dashboard-panel">
      {/* Top dashboard summary header */}
      <div className="glass-card rounded-2xl p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
        <div>
          <h2 className="font-display font-bold text-xl text-white tracking-wide flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            CCE Administration Portal
          </h2>
          <p className="text-xs text-stone-400">
            CRUD engine synced to server `/src/data/db.json`. Real-time changes applied to AI models context dynamically.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] font-mono bg-white/5 px-3 py-1.5 rounded-lg text-stone-300 border border-white/5">
            LOGGED: {adminEmail}
          </span>
          <button
            onClick={handleLogout}
            id="admin-logout-btn"
            className="flex items-center gap-1 px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:text-white rounded-lg text-xs font-semibold text-red-400 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>

      {/* Tabs configuration bar */}
      <div className="flex gap-2 border-b border-white/5 pb-2 mb-6">
        {[
          { tab: "alumni", label: "Alumni Directory", icon: Users },
          { tab: "students", label: "Student Directory", icon: Users },
          { tab: "broadcast", label: "Campus Broadcaster", icon: BellRing },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.tab;
          return (
            <button
              key={t.tab}
              id={`tab-admin-${t.tab}`}
              onClick={() => {
                setActiveTab(t.tab as any);
                setPanelView("list");
              }}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-display text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                isActive ? "border-red-650 text-white" : "border-transparent text-stone-450 hover:text-stone-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "broadcast" ? (
        /* Campus push announcements broadcaster system */
        <div className="glass-card rounded-[2rem] p-6 text-left max-w-xl mx-auto" id="broadcast-sub-view">
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <BellRing className="w-5 h-5 text-red-400" />
            <h3 className="font-display font-semibold text-white">Simulated Web-Push Broadcaster</h3>
          </div>

          <form onSubmit={handleSendPush} className="space-y-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Push Title Notification</label>
              <input
                type="text"
                required
                className="bg-stone-950 border border-white/5 hover:border-white/15 focus:border-red-650/40 rounded-lg p-2.5 text-xs text-white outline-none"
                placeholder="e.g. CCE Programming contest tomorrow!"
                value={pushTitle}
                onChange={(e) => setPushTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Rich Description Message</label>
              <textarea
                required
                rows={4}
                className="bg-stone-950 border border-white/5 hover:border-white/15 focus:border-red-650/40 rounded-lg p-2.5 text-xs text-white outline-none"
                placeholder="Details of the announcement push alert sent to all validated devices..."
                value={pushMessage}
                onChange={(e) => setPushMessage(e.target.value)}
              />
            </div>

            {pushSuccess && (
              <div className="p-2.5 rounded bg-emerald-950/30 text-emerald-400 text-xs border border-emerald-950 flex items-center gap-1.5">
                <CheckCircle className="w-4.5 h-4.5" /> Notification dispatched successfully to active permission listeners!
              </div>
            )}

            <button
              type="submit"
              className="w-full p-2.5 bg-red-700 hover:bg-red-600 rounded-lg text-xs font-semibold text-white"
            >
              Send Broadcast Push System
            </button>
          </form>
        </div>
      ) : panelView === "list" ? (
        /* Standard Listing list displaying tools */
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-stone-950 p-4 rounded-xl border border-white/5">
            <span className="text-xs text-stone-450 uppercase font-mono tracking-wider font-semibold">
              Currently Managing: {activeTab === "alumni" ? "Alumni Records" : "CCE Students"}
            </span>

            <button
              onClick={activeTab === "alumni" ? openCreateAlumni : openCreateStudent}
              id="admin-add-new-btn"
              className="flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-xs font-semibold text-white cursor-pointer active:scale-95 transition"
            >
              <Plus className="w-4 h-4" /> Add Record Profile
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 glass-card bg-white/5 max-h-[500px]">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-stone-950 text-stone-400 font-mono text-[10px] uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-4">Name & ID</th>
                  <th className="p-4">{activeTab === "alumni" ? "Batch / Designation" : "Corporate Email"}</th>
                  <th className="p-4">{activeTab === "alumni" ? "Company / Location" : "Specialty Skills"}</th>
                  <th className="p-4 text-right">Actions Panel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-stone-200">
                {activeTab === "alumni"
                  ? alumniList.map((a) => (
                      <tr key={a.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-semibold text-white">
                          <div>{a.name}</div>
                          <span className="text-[10px] text-zinc-550 font-mono">{a.studentId}</span>
                        </td>
                        <td className="p-4 text-stone-300">
                          <div>{a.batch}</div>
                          <span className="text-[10px] text-red-400 uppercase tracking-tight">{a.designation}</span>
                        </td>
                        <td className="p-4 text-stone-400">
                          <div>{a.company}</div>
                          <span className="text-[10px] font-mono text-zinc-500">{a.location}</span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openEditAlumni(a)}
                            className="p-1 px-2 text-[11px] font-mono bg-white/5 border border-white/10 rounded hover:bg-white/10 text-stone-300 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(a.id, "alumni")}
                            className="p-1 px-2 text-[11px] font-mono bg-red-950/15 border border-red-900/30 text-red-400 hover:text-red-350 rounded cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  : studentsList.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-semibold text-white">
                          <div>{s.name}</div>
                          <span className="text-[10px] text-zinc-550 font-mono">{s.studentId}</span>
                        </td>
                        <td className="p-4 text-stone-300 font-mono select-all">
                          {s.email}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-[260px]">
                            {s.skills.slice(0, 3).map((sk, i) => (
                              <span key={i} className="text-[9px] bg-stone-950 px-1 py-0.5 rounded text-stone-400 border border-white/5">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openEditStudent(s)}
                            className="p-1 px-2 text-[11px] font-mono bg-white/5 border border-white/10 rounded hover:bg-white/10 text-stone-300 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(s.id, "student")}
                            className="p-1 px-2 text-[11px] font-mono bg-red-950/15 border border-red-900/30 text-red-400 hover:text-red-350 rounded cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Create/Edit CRUD Form layout */
        <div className="glass-card rounded-[2rem] p-6 text-left animate-fade-in-up" id="cud-form-view">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-6">
            <h3 className="font-display font-semibold text-white">
              {activeTab === "alumni"
                ? editingAlumniId
                  ? "Edit Alumnus Profile Details"
                  : "Register New CCE Alumnus Entry"
                : editingStudentId
                ? "Edit Student Profile Record"
                : "Register New Current Student Entry"}
            </h3>
            <button
              onClick={() => {
                setPanelView("list");
                resetFormStates();
              }}
              className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded text-stone-300 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Full Name</label>
                <input
                  type="text"
                  required
                  className="bg-stone-950 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-white outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. S. M. Faridur Rashed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Student ID Code</label>
                <input
                  type="text"
                  required
                  className="bg-stone-950 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-white outline-none"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. E192031 / E101004"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Primary Email</label>
                <input
                  type="email"
                  required
                  className="bg-stone-950 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-white outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. username@domain.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Direct Contact Phone</label>
                <input
                  type="text"
                  className="bg-stone-950 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-white outline-none"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. +8801819XXXXXX"
                />
              </div>
            </div>

            {activeTab === "alumni" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Alumni CCE Batch</label>
                    <input
                      type="text"
                      required
                      className="bg-stone-950 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-white outline-none"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      placeholder="e.g. Batch 5 / Batch 15"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Path Status</label>
                    <select
                      value={currentOccupation}
                      onChange={(e) => setCurrentOccupation(e.target.value as any)}
                      className="bg-stone-950 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="Job">Industry Job Holder</option>
                      <option value="Higher Studies">Postgraduate Higher Studies</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Current Corporate Location</label>
                    <input
                      type="text"
                      className="bg-stone-950 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-white outline-none"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Dhaka / San Francisco / Oulu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Company Name / Affiliated School</label>
                    <input
                      type="text"
                      className="bg-stone-950 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-white outline-none"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Samsung / Google / Therap"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Designation / Role title</label>
                    <input
                      type="text"
                      className="bg-stone-950 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-white outline-none"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Senior Software Engineer / PhD Candidate"
                    />
                  </div>
                </div>

                {/* Mentorship checkboxes tags selection */}
                <div className="pt-2">
                  <span className="block text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400 mb-2">Assign Mentoring Specialities</span>
                  <div className="flex flex-wrap gap-2">
                    {availableMentorTopics.map((topic) => {
                      const isChecked = mentorTopics.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          id={`chk-mentoring-${topic}`}
                          onClick={() => handleToggleMentorTopic(topic)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition ${
                            isChecked
                              ? "bg-red-750 text-white border-red-700 font-bold"
                              : "bg-stone-950 text-stone-400 border-white/5 hover:border-white/15"
                          }`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Professional LinkedIn link</label>
                <input
                  type="url"
                  className="bg-stone-950 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-white outline-none"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Avatar Image Photo URI</label>
                <input
                  type="text"
                  className="bg-stone-950 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-white outline-none"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="Leave empty for standard CCE avatars"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Skills Specialities (comma-separated)</label>
                <input
                  type="text"
                  className="bg-stone-955 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-white outline-none"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="React, C++, TensorFlow, Distributed Systems"
                />
              </div>

              {activeTab === "students" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Hobbies (comma-separated)</label>
                  <input
                    type="text"
                    className="bg-stone-955 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-white outline-none"
                    value={hobbiesStr}
                    onChange={(e) => setHobbiesStr(e.target.value)}
                    placeholder="Chess, Gaming, Digital Illustration"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Academic Publications (one per line)</label>
                <textarea
                  rows={3}
                  className="bg-stone-955 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-stone-200 outline-none"
                  value={papersStr}
                  onChange={(e) => setPapersStr(e.target.value)}
                  placeholder="Title of published paper..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Lab Projects & Portfolios (one per line)</label>
                <textarea
                  rows={3}
                  className="bg-stone-955 border border-white/5 hover:border-white/15 rounded-lg p-2.5 text-xs text-stone-200 outline-none"
                  value={projectsStr}
                  onChange={(e) => setProjectsStr(e.target.value)}
                  placeholder="Project name..."
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-3">
              <button
                type="submit"
                id="save-cud-entity"
                className="px-6 py-2 bg-red-700 hover:bg-red-650 rounded-lg text-xs font-semibold text-white cursor-pointer transition active:scale-95"
              >
                Commit Changes to Database Store
              </button>
              <button
                type="button"
                onClick={() => {
                  setPanelView("list");
                  resetFormStates();
                }}
                className="px-6 py-2 bg-stone-950 hover:bg-stone-900 border border-white/5 rounded-lg text-xs text-stone-300 cursor-pointer"
              >
                Cancel / Return
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCircle2, XCircle, Clock, User, Mail, ShieldAlert, Sparkles, Star, MessageCircle, RefreshCw } from "lucide-react";
import { MentorshipRequest, DirectMessage, Alumni, Student } from "../types";

interface NetworkHubProps {
  alumniList: Alumni[];
  studentsList: Student[];
  activeTheme: string;
}

export function NetworkHub({ alumniList, studentsList, activeTheme }: NetworkHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<"mentorship" | "messages">("mentorship");
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  
  // Simulation states
  const [simulatedUserRole, setSimulatedUserRole] = useState<"student" | "alumnus">("student");
  const [simulatedUserId, setSimulatedUserId] = useState<string>("");
  
  // New Message input
  const [selectedChatPartnerId, setSelectedChatPartnerId] = useState<string>("");
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Set default simulated user IDs
  useEffect(() => {
    if (simulatedUserRole === "student" && studentsList.length > 0) {
      setSimulatedUserId(studentsList[0].id);
    } else if (simulatedUserRole === "alumnus" && alumniList.length > 0) {
      setSimulatedUserId(alumniList[0].id);
    }
  }, [simulatedUserRole, alumniList, studentsList]);

  const loadNetworkingData = async () => {
    try {
      const [reqRes, msgRes] = await Promise.all([
        fetch("/api/mentorship-requests"),
        fetch("/api/direct-messages")
      ]);
      if (reqRes.ok) setRequests(await reqRes.json());
      if (msgRes.ok) setMessages(await msgRes.json());
    } catch (err) {
      console.error("Networking load error", err);
    }
  };

  useEffect(() => {
    loadNetworkingData();
    const interval = setInterval(loadNetworkingData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Filter requests based on simulated identity
  const getFilteredRequests = () => {
    if (!simulatedUserId) return [];
    const simulatedEntity = simulatedUserRole === "student" 
      ? studentsList.find(s => s.id === simulatedUserId)
      : alumniList.find(a => a.id === simulatedUserId);
    
    if (!simulatedEntity) return [];

    if (simulatedUserRole === "alumnus") {
      // Alumni sees requests sent TO them
      return requests.filter(r => r.receiverId === simulatedUserId);
    } else {
      // Student sees requests sent BY them (matched by email or name, or match all sent if guest)
      return requests.filter(r => r.senderEmail === simulatedEntity.email || r.senderName === simulatedEntity.name);
    }
  };

  // Find simulated user details
  const getSimulatedUserLabel = () => {
    if (simulatedUserRole === "student") {
      const s = studentsList.find(st => st.id === simulatedUserId);
      return s ? `${s.name} (Student - ID: ${s.studentId})` : "Guest Student";
    } else {
      const a = alumniList.find(al => al.id === simulatedUserId);
      return a ? `${a.name} (Alumnus - ${a.company})` : "Guest Alumnus";
    }
  };

  // Update Mentorship status
  const updateRequestStatus = async (requestId: string, newStatus: "approved" | "declined") => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/mentorship-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        // Automatically send a secure system advice message indicating state shift
        const targetReq = requests.find(r => r.id === requestId);
        if (targetReq) {
          await fetch("/api/direct-messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              senderName: getSimulatedUserLabel(),
              senderEmail: "portal-dispatch@cce.iiuc",
              receiverId: targetReq.senderEmail,
              receiverName: targetReq.senderName,
              text: `AUTOMATED MENTORSHIP SYSTEM: Your request regarding "${targetReq.subject}" has been marked as [${newStatus.toUpperCase()}] by your nominated mentor.`
            })
          });
        }
        loadNetworkingData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChatPartnerId) return;

    // Resolve sender email/name based on simulated profile
    let currentSenderName = "Guest User";
    let currentSenderEmail = "guest@ugrad.iiuc.ac.bd";

    if (simulatedUserRole === "student") {
      const s = studentsList.find(st => st.id === simulatedUserId);
      if (s) {
        currentSenderName = s.name;
        currentSenderEmail = s.email;
      }
    } else {
      const a = alumniList.find(al => al.id === simulatedUserId);
      if (a) {
        currentSenderName = a.name;
        currentSenderEmail = a.email;
      }
    }

    // Chat partner identity
    const pAlum = alumniList.find(a => a.id === selectedChatPartnerId);
    const pStud = studentsList.find(s => s.id === selectedChatPartnerId);
    const partnerName = pAlum ? pAlum.name : (pStud ? pStud.name : "Contact");

    try {
      const response = await fetch("/api/direct-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: currentSenderName,
          senderEmail: currentSenderEmail,
          receiverId: selectedChatPartnerId,
          receiverName: partnerName,
          text: replyText
        })
      });

      if (response.ok) {
        setReplyText("");
        loadNetworkingData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Get conversation lines
  const getConversationLines = () => {
    if (!selectedChatPartnerId) return [];

    let currentSenderEmail = "";
    if (simulatedUserRole === "student") {
      currentSenderEmail = studentsList.find(st => st.id === simulatedUserId)?.email || "";
    } else {
      currentSenderEmail = alumniList.find(al => al.id === simulatedUserId)?.email || "";
    }

    const partnerAlum = alumniList.find(a => a.id === selectedChatPartnerId);
    const partnerStud = studentsList.find(s => s.id === selectedChatPartnerId);
    const partnerEmail = partnerAlum ? partnerAlum.email : (partnerStud ? partnerStud.email : "");

    return messages.filter(
      m => 
        (m.senderEmail === currentSenderEmail && m.receiverId === selectedChatPartnerId) || 
        (m.senderEmail === partnerEmail && m.receiverId === simulatedUserId) ||
        (m.receiverId === simulatedUserId && m.senderName.includes(partnerAlum?.name || partnerStud?.name || "_UNFOUNDED_"))
    );
  };

  const activeChatPartner = alumniList.find(a => a.id === selectedChatPartnerId) || studentsList.find(s => s.id === selectedChatPartnerId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in-up" id="network-hub-root-container">
      
      {/* Simulation Persona Bar Header - Dynamic feedback */}
      <div className="mb-6 p-4 rounded-2xl glass-card flex flex-col md:flex-row items-center justify-between gap-4 border-b border-red-500/20 shadow-xl">
        <div className="text-left">
          <span className="text-[10px] font-mono uppercase bg-emerald-600/10 text-emerald-400 px-2.5 py-1 rounded-full font-bold tracking-widest border border-emerald-950/20 flex items-center gap-1.5 w-fit">
            <Star className="w-3 h-3 fill-emerald-400 animate-spin-slow" /> Active Identity Simulation Mode
          </span>
          <h2 className="font-display font-black text-white text-md tracking-wide mt-2">
            Simulating: <span className="text-red-400 glow-text-red">{getSimulatedUserLabel()}</span>
          </h2>
          <p className="text-[11px] text-stone-400 font-sans mt-0.5 max-w-xl">
            To explore the user experience of both sides, toggle your simulated role below! Instantly see pending requests, approval cycles, and live threads.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setSimulatedUserRole("student")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              simulatedUserRole === "student" ? "bg-red-750 text-white shadow" : "bg-white/5 text-stone-400 hover:text-white"
            }`}
          >
            Role: Student
          </button>
          <button
            onClick={() => setSimulatedUserRole("alumnus")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              simulatedUserRole === "alumnus" ? "bg-red-750 text-white shadow" : "bg-white/5 text-stone-400 hover:text-white"
            }`}
          >
            Role: Alumnus
          </button>

          <select
            value={simulatedUserId}
            onChange={(e) => setSimulatedUserId(e.target.value)}
            className="bg-black/80 border border-white/10 text-xs text-stone-200 outline-none rounded p-1 max-w-[150px]"
          >
            {simulatedUserRole === "student" ? (
              studentsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
            ) : (
              alumniList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)
            )}
          </select>
        </div>
      </div>

      {/* Main Tab selectors (Mentorship Requests vs Direct Messaging) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Sidebar Nav Panels */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="glass-card p-4 rounded-2xl text-left">
            <h3 className="text-xs uppercase font-mono tracking-widest text-stone-400 border-b border-white/5 pb-2 mb-3">Academic Networking</h3>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveSubTab("mentorship")}
                className={`flex items-center gap-3 p-3 rounded-xl text-xs font-semibold tracking-wide transition select-none cursor-pointer ${
                  activeSubTab === "mentorship" ? "bg-red-750/20 text-red-400 border border-red-950/20" : "text-stone-300 hover:bg-white/5"
                }`}
              >
                <RefreshCw className="w-4.5 h-4.5 text-red-500 shrink-0" />
                <div className="text-left flex-1">
                  <span>Mentorship Advising</span>
                  <span className="block text-[8.5px] font-mono text-zinc-500 mt-0.5 uppercase">
                    Requests Received ({requests.length})
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveSubTab("messages");
                  // Auto-select first messaging partner if none selected
                  if (!selectedChatPartnerId) {
                    if (simulatedUserRole === "student" && alumniList.length > 0) {
                      setSelectedChatPartnerId(alumniList[0].id);
                    } else if (simulatedUserRole === "alumnus" && studentsList.length > 0) {
                      setSelectedChatPartnerId(studentsList[0].id);
                    }
                  }
                }}
                className={`flex items-center gap-3 p-3 rounded-xl text-xs font-semibold tracking-wide transition select-none cursor-pointer ${
                  activeSubTab === "messages" ? "bg-red-750/20 text-red-400 border border-red-950/20" : "text-stone-300 hover:bg-white/5"
                }`}
              >
                <MessageSquare className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                <div className="text-left flex-1">
                  <span>Direct Messaging Terminal</span>
                  <span className="block text-[8.5px] font-mono text-zinc-500 mt-0.5 uppercase">
                    Multi-Thread Sync ({messages.length})
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Guidelines Charter and double-checked systems */}
          <div className="p-4 rounded-2xl bg-red-950/15 border border-red-900/30 text-left">
            <div className="flex items-center gap-2 text-red-400 font-bold tracking-wider text-[10px] mb-2 font-mono">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>ACADEMIC PRIVACY DEED</span>
            </div>
            <p className="text-[10px] text-stone-400 leading-normal">
              Direct message lines and mentorship requests are secured. This portal simulates server mailbox triggers. Any identity selected above operates under professional campus code.
            </p>
          </div>
        </div>

        {/* Core Subtab Content Displays */}
        <div className="md:col-span-8">
          
          {activeSubTab === "mentorship" ? (
            /* Subview: Mentorship Request list tracker */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="font-display font-medium text-white text-md flex items-center gap-2">
                  <RefreshCw className="w-4.5 h-4.5 text-red-500" />
                  Mentorship Request Pipeline
                </h3>
                <span className="text-[10.5px] font-mono text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-full uppercase">
                  ACTIVE SIM ID TARGETS: {getFilteredRequests().length}
                </span>
              </div>

              {getFilteredRequests().length === 0 ? (
                <div className="glass-card rounded-[2rem] p-12 text-center">
                  <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-stone-400">No mentorship requests available for this identity.</p>
                  <p className="text-[10px] text-stone-500 mt-1">
                    {simulatedUserRole === "student" 
                      ? "Navigate to 'Alumni Directory', select an advisor, and click 'Contact' to trigger requests!"
                      : "No collegiate requests have been dispatched to you yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredRequests().map((req) => (
                    <div key={req.id} className="glass-card p-5 rounded-2xl block text-left relative overflow-hidden group border border-white/10 hover:border-red-500/20 transition-all duration-350">
                      {/* Status badge */}
                      <span className={`absolute top-4 right-4 text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        req.status === "approved" ? "bg-emerald-600/20 text-emerald-400 border border-emerald-900/40" : 
                        req.status === "declined" ? "bg-red-600/20 text-red-400 border border-red-950/40" : 
                        "bg-amber-600/20 text-amber-400 border border-amber-950/40"
                      }`}>
                        {req.status}
                      </span>

                      <div className="flex flex-col gap-1.5 max-w-[85%]">
                        <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">{req.topic}</span>
                        <h4 className="font-display font-bold text-sm text-stone-100">{req.subject}</h4>
                        <div className="flex items-center gap-15 mt-1 text-[11px] text-stone-400">
                          <span>From: <strong className="text-zinc-200">{req.senderName}</strong></span>
                          <span>&bull; Dispatch to: <strong className="text-zinc-205">{req.receiverName}</strong></span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-400 mt-3 p-3 bg-black/45 rounded-xl border border-white/5 leading-relaxed whitespace-pre-wrap font-sans">
                        {req.message}
                      </p>

                      <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Dispatched: {new Date(req.timestamp).toLocaleString()}
                        </span>

                        {simulatedUserRole === "alumnus" && req.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateRequestStatus(req.id, "approved")}
                              className="px-3 py-1 bg-emerald-700/80 hover:bg-emerald-600 text-white font-semibold text-[10.5px] rounded cursor-pointer transition flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => updateRequestStatus(req.id, "declined")}
                              className="px-3 py-1 bg-red-755/90 hover:bg-red-700 text-white font-semibold text-[10.5px] rounded cursor-pointer transition flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Subview: Direct Messaging terminal chat simulator */
            <div className="glass-card rounded-[2rem] p-4 flex flex-col h-[500px]">
              
              {/* Partner Select Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-3.5">
                <div className="text-left flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">Collegiate Direct Chat Lines</h3>
                    <p className="text-[10px] text-stone-400">
                      Connected to: <span className="text-white font-semibold">{activeChatPartner?.name || "No partner selected"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-stone-400 font-mono">Chat Partner:</span>
                  <select
                    value={selectedChatPartnerId}
                    onChange={(e) => setSelectedChatPartnerId(e.target.value)}
                    className="bg-black border border-white/10 rounded p-1 text-xs text-stone-200 outline-none max-w-[160px]"
                  >
                    <option value="">-- Choose Partner --</option>
                    {simulatedUserRole === "student" ? (
                      // Student can message any alumnus
                      alumniList.map(a => <option key={a.id} value={a.id}>{a.name} ({a.company})</option>)
                    ) : (
                      // Alumnus can message any student
                      studentsList.map(s => <option key={s.id} value={s.id}>{s.name} (ID: {s.studentId})</option>)
                    )}
                  </select>
                </div>
              </div>

              {/* Message lines box wrapper */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-black/45 rounded-2xl scrollbar-thin flex flex-col">
                {!selectedChatPartnerId ? (
                  <div className="m-auto text-center py-12">
                    <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="text-xs text-stone-400">Select a connection thread partner from the dropdown.</p>
                  </div>
                ) : getConversationLines().length === 0 ? (
                  <div className="m-auto text-center py-12">
                    <Mail className="w-8 h-8 text-zinc-650 mx-auto mb-2" />
                    <p className="text-xs text-stone-400">No chat history recorded on server with this node.</p>
                    <p className="text-[10px] text-stone-500 mt-1">Send a welcome message to start secure correspondence!</p>
                  </div>
                ) : (
                  getConversationLines().map((msg) => {
                    // Detect if this specific line was sent by current simulated user
                    let isSentByMe = false;
                    const cleanSender = msg.senderName.toLowerCase();
                    const cleanSimName = getSimulatedUserLabel().toLowerCase();
                    if (simulatedUserRole === "student") {
                      isSentByMe = cleanSender.includes(studentsList.find(s => s.id === simulatedUserId)?.name.toLowerCase() || "_UNFOUNDED_");
                    } else {
                      isSentByMe = cleanSender.includes(alumniList.find(a => a.id === simulatedUserId)?.name.toLowerCase() || "_UNFOUNDED_");
                    }

                    return (
                      <div key={msg.id} className={`flex flex-col max-w-[80%] ${isSentByMe ? "self-end items-end" : "self-start items-start"}`}>
                        <div className={`p-3 rounded-2xl text-[11.5px] text-left leading-relaxed ${
                          isSentByMe ? "bg-red-700 text-white rounded-tr-none" : "bg-neutral-900 border border-white/5 text-stone-150 rounded-tl-none"
                        }`}>
                          <span className="block text-[8.5px] font-mono text-stone-400 font-bold mb-1">{msg.senderName}</span>
                          <span className="whitespace-pre-wrap">{msg.text}</span>
                        </div>
                        <span className="text-[8.5px] font-mono text-stone-500 mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input form toolbar */}
              {selectedChatPartnerId && (
                <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply securing direct tunnel...`}
                    className="flex-1 bg-stone-950 border border-white/5 hover:border-white/10 focus:border-red-650/45 text-xs text-stone-250 outline-none rounded-xl px-4 py-2.5 outline-none transition"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-red-700 hover:bg-red-600 active:scale-95 text-white rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

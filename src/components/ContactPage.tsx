import React, { useState } from "react";
import { Send, ArrowLeft, ShieldAlert, Mail, Phone, ExternalLink, Sparkles, Check, Info } from "lucide-react";

interface ContactPageProps {
  contactPerson: {
    id: string;
    name: string;
    type: "alumni" | "student";
    batch?: string;
    studentId?: string;
    designation?: string;
    company?: string;
    email: string;
    contactNumber: string;
    profileImage: string;
  } | null;
  onBack: () => void;
  activeTheme: string;
}

export function ContactPage({ contactPerson, onBack, activeTheme }: ContactPageProps) {
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [isMentorship, setIsMentorship] = useState(contactPerson?.type === "alumni" ? true : false);
  const [selectedTopic, setSelectedTopic] = useState("Career Guidance");
  const [showDirectContact, setShowDirectContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!contactPerson) {
    return (
      <div className="p-8 text-center" id="empty-contact-state">
        <p className="text-zinc-450 text-sm">No profile selected for inquiry.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-red-700 text-white rounded-lg cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !messageText || !senderName || !senderEmail) return;

    setIsSubmitting(true);

    try {
      if (isMentorship) {
        // Post to Mentorship Requests
        const response = await fetch("/api/mentorship-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderName,
            senderEmail,
            receiverId: contactPerson.id,
            receiverName: contactPerson.name,
            subject,
            message: messageText,
            topic: selectedTopic
          })
        });
        if (response.ok) {
          setIsSuccess(true);
          setSubject("");
          setMessageText("");
        }
      } else {
        // Post to Direct Messages
        const response = await fetch("/api/direct-messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderName,
            senderEmail,
            receiverId: contactPerson.id,
            receiverName: contactPerson.name,
            text: `Inquiry: ${subject}\n\n${messageText}`
          })
        });
        if (response.ok) {
          setIsSuccess(true);
          setSubject("");
          setMessageText("");
        }
      }
    } catch (err) {
      console.error("Failed to post message on server", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAlumni = contactPerson.type === "alumni";

  const getThemeTextGlow = () => {
    switch (activeTheme) {
      case "dark-red-green":
        return "text-emerald-400";
      default:
        return "text-red-500";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" id="contact-page-outer-container">
      {/* Back button */}
      <button
        onClick={onBack}
        id="contact-back-btn"
        className="flex items-center gap-2 mb-6 text-xs text-stone-300 hover:text-white bg-white/5 border border-white/5 hover:bg-white/10 px-3.5 py-2 rounded-lg transition active:scale-95 cursor-pointer font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </button>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mini Profile card */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
            {/* Academic Batch banner */}
            <span className="absolute top-4 right-4 text-[9px] font-mono uppercase bg-red-650/20 text-red-400 border border-red-950/20 px-2 py-0.5 rounded font-bold">
              {isAlumni ? contactPerson.batch : "Current Student"}
            </span>

            <img
              src={contactPerson.profileImage}
              alt={contactPerson.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full border-2 border-red-700 object-cover shadow-xl mb-4"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
              }}
            />

            <h2 className="font-display font-bold text-xl text-white tracking-wide">{contactPerson.name}</h2>
            
            {isAlumni ? (
              <p className="text-xs text-stone-400 font-sans mt-1">
                {contactPerson.designation} at <span className="text-stone-300 font-semibold">{contactPerson.company}</span>
              </p>
            ) : (
              <p className="text-xs text-stone-400 font-sans mt-1">
                CCE Student &bull; ID: <span className="text-stone-300 font-mono font-medium">{contactPerson.studentId}</span>
              </p>
            )}

            {/* Direct Information Block if unlocked */}
            <div className="w-full mt-6 pt-6 border-t border-white/5 flex flex-col gap-3 text-left">
              <button
                onClick={() => setShowDirectContact(!showDirectContact)}
                id="toggle-direct-contact-btn"
                className="w-full text-center py-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 font-semibold transition active:scale-95 cursor-pointer"
              >
                {showDirectContact ? "Hide Authenticated Info" : "Reveal Professional Contact Keys"}
              </button>

              {showDirectContact ? (
                <div className="space-y-2.5 mt-2 animate-fade-in-up">
                  <div className="flex items-center gap-2 text-stone-300 text-xs">
                    <Mail className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="font-mono select-all truncate">{contactPerson.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300 text-xs">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-mono select-all">{contactPerson.contactNumber || "N/A"}</span>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-stone-500 leading-normal text-center mt-1">
                  Click to display corporate credentials & direct email keys under university policy context.
                </p>
              )}
            </div>
          </div>

          {/* Guidelines info card */}
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-5 text-left text-xs text-zinc-300 leading-relaxed">
            <div className="flex items-center gap-2 text-red-400 font-bold tracking-wider text-[11px] mb-2.5">
              <ShieldAlert className="w-4.5 h-4.5" />
              <span>COLLEGIATE NETWORKING CHARTER</span>
            </div>
            <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-zinc-400">
              <li>Always explain your academic background (e.g. your active CCE Batch or Student ID).</li>
              <li>Limit career mentoring messages to professional topics like recruitment pipelines and CV auditing.</li>
              <li>Respect boundaries: Alumni responses depend purely on active schedules.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Dynamic secure communication system */}
        <div className="md:col-span-7">
          <div className="glass-card rounded-[2rem] p-6 text-left">
            <h3 className="font-display font-bold text-lg text-white mb-1 tracking-wide flex items-center gap-2">
              <Sparkles className={`w-5 h-5 ${getThemeTextGlow()}`} />
              CCE Secure Inquiry Terminal
            </h3>
            <p className="text-xs text-stone-400 mb-6">
              Compose a signed, verified message dispatched to <span className="text-white font-medium">{contactPerson.name}</span>.
            </p>

            {isSuccess ? (
              <div className="py-12 px-4 text-center flex flex-col items-center gap-3 animate-fade-in-up" id="contact-success-screen">
                <div className="w-14 h-14 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-2">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="font-display font-semibold text-white text-lg">Message Dispatched!</h4>
                <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                  Your certified academic networking referral has been saved on the CCE campus server and sent to {contactPerson.name}'s institutional mailbox.
                </p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="px-4 py-2 bg-white/5 border border-white/15 hover:bg-white/10 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Send Another
                  </button>
                  <button
                    onClick={onBack}
                    className="px-4 py-2 bg-red-700 hover:bg-red-650 rounded-lg text-xs font-semibold text-white cursor-pointer"
                  >
                    Go Back to Directory
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4" id="cce-contact-form">
                
                {/* Networking Type selector (Direct message vs Mentorship Request if Alumnus) */}
                {isAlumni && (
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="text-left">
                      <span className="text-[10px] font-mono uppercase text-red-400 font-bold block">Inquiry Channel</span>
                      <span className="text-[11px] text-zinc-350">Formal mentorship request or standard inquiry thread?</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMentorship(true)}
                        className={`px-3 py-1.5 rounded text-[10.5px] font-semibold cursor-pointer transition ${
                          isMentorship ? "bg-red-750 text-white" : "bg-black/60 text-zinc-400"
                        }`}
                      >
                        Mentorship
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMentorship(false)}
                        className={`px-3 py-1.5 rounded text-[10.5px] font-semibold cursor-pointer transition ${
                          !isMentorship ? "bg-red-750 text-white" : "bg-black/60 text-zinc-400"
                        }`}
                      >
                        Direct Msg
                      </button>
                    </div>
                  </div>
                )}

                {/* Specific Topic Area Selector if Mentorship */}
                {isMentorship && (
                  <div className="flex flex-col gap-1.5 text-left animate-fade-in-up">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Mentorship Stream</label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="bg-stone-950 border border-white/5 focus:border-red-650/50 rounded-lg p-2.5 text-xs text-white outline-none transition"
                    >
                      <option value="Programming">Programming Fundamentals</option>
                      <option value="AI/ML">Artificial Intelligence & Machine Learning</option>
                      <option value="SQA">Software Quality Assurance</option>
                      <option value="Career Guidance">Career Development & Job Referrals</option>
                      <option value="Web Development">Full-Stack Web Engineering</option>
                      <option value="Mobile Apps">iOS & Android App Development</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Your Full Name</label>
                    <input
                      type="text"
                      className="bg-stone-950 border border-white/5 hover:border-white/15 focus:border-red-650/50 rounded-lg p-2.5 text-xs text-white outline-none transition"
                      placeholder="e.g. Sadman Rahman"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Institutional Email</label>
                    <input
                      type="email"
                      className="bg-stone-950 border border-white/5 hover:border-white/15 focus:border-red-650/50 rounded-lg p-2.5 text-xs text-white outline-none transition"
                      placeholder="username@ugrad.iiuc.ac.bd"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Inquiry Subject</label>
                  <input
                    type="text"
                    className="bg-stone-950 border border-white/5 hover:border-white/15 focus:border-red-650/50 rounded-lg p-2.5 text-xs text-white outline-none transition"
                    placeholder="e.g. Research mentorship on beamforming / Career referral check"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400">Message Content</label>
                  <textarea
                    rows={6}
                    className="bg-stone-950 border border-white/5 hover:border-white/15 focus:border-red-650/50 rounded-lg p-2.5 text-xs text-white outline-none transition"
                    placeholder="Provide context regarding your active CCE course modules, skills, and why you are reaching out to connect..."
                    required
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="submit-contact-form"
                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-700 hover:bg-red-600 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-lg hover:shadow-red-750/20 transition cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span>Encrypting & Dispatching...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Academic Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

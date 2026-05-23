import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

function getDBPath() {
  const possiblePaths = [
    path.join(process.cwd(), "src", "data", "db.json"),
    path.join(process.cwd(), "dist", "data", "db.json"),
    path.join(process.cwd(), "dist", "db.json"),
    path.join(process.cwd(), "db.json"),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log(`[CCE Database] Found Database at: ${p}`);
      return p;
    }
  }
  const defaultPath = path.join(process.cwd(), "src", "data", "db.json");
  const parent = path.dirname(defaultPath);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true });
  }
  return defaultPath;
}
const DB_PATH = getDBPath();

app.use(express.json());

// Helper to read DB
async function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Create empty db or let it initialize if somehow parent is missing
      const parentDir = path.dirname(DB_PATH);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      return { alumni: [], students: [], notifications: [], mentorshipRequests: [], messages: [] };
    }
    const data = await fs.promises.readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(data);
    if (!parsed.mentorshipRequests) parsed.mentorshipRequests = [];
    if (!parsed.messages) parsed.messages = [];
    return parsed;
  } catch (err) {
    console.error("Read DB Error, returning blanks:", err);
    return { alumni: [], students: [], notifications: [], mentorshipRequests: [], messages: [] };
  }
}

// Helper to save DB
async function saveDB(data: any) {
  try {
    const parentDir = path.dirname(DB_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    await fs.promises.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Save DB Error:", err);
    return false;
  }
}

// Global variable for registered notifications permission count (simulation)
let permissionGrantedCount = 0;

// API: Register token / count
app.post("/api/register-push", (req, res) => {
  permissionGrantedCount++;
  res.json({ success: true, count: permissionGrantedCount });
});

// API: Admin Login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (password === "RASUHAARRA1#@") {
    return res.json({
      success: true,
      token: "simulated-ccehub-session-token",
      user: { email: username || "ADMIN_CCE", role: "admin" }
    });
  }
  return res.status(401).json({ success: false, error: "Invalid password credentials" });
});

// API: Get Alumni
app.get("/api/alumni", async (req, res) => {
  const db = await readDB();
  res.json(db.alumni || []);
});

// API: Create Alumni
app.post("/api/alumni", async (req, res) => {
  const db = await readDB();
  const newAlum = {
    id: `alumni-${Date.now()}`,
    name: req.body.name || "Unnamed Alumni",
    batch: req.body.batch || "Batch 10",
    studentId: req.body.studentId || "EXXXXXX",
    contactNumber: req.body.contactNumber || "N/A",
    email: req.body.email || "N/A",
    currentOccupation: req.body.currentOccupation || "Job",
    company: req.body.company || "N/A",
    designation: req.body.designation || "N/A",
    location: req.body.location || "N/A",
    linkedinUrl: req.body.linkedinUrl || "",
    profileImage: req.body.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    skills: Array.isArray(req.body.skills) ? req.body.skills : [],
    papers: Array.isArray(req.body.papers) ? req.body.papers : [],
    projects: Array.isArray(req.body.projects) ? req.body.projects : [],
    mentorTopics: Array.isArray(req.body.mentorTopics) ? req.body.mentorTopics : []
  };

  db.alumni.push(newAlum);
  await saveDB(db);
  res.status(201).json(newAlum);
});

// API: Update Alumni
app.put("/api/alumni/:id", async (req, res) => {
  const { id } = req.params;
  const db = await readDB();
  const index = db.alumni.findIndex((a: any) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Alumni not found" });
  }

  const updatedAlum = {
    ...db.alumni[index],
    name: req.body.name ?? db.alumni[index].name,
    batch: req.body.batch ?? db.alumni[index].batch,
    studentId: req.body.studentId ?? db.alumni[index].studentId,
    contactNumber: req.body.contactNumber ?? db.alumni[index].contactNumber,
    email: req.body.email ?? db.alumni[index].email,
    currentOccupation: req.body.currentOccupation ?? db.alumni[index].currentOccupation,
    company: req.body.company ?? db.alumni[index].company,
    designation: req.body.designation ?? db.alumni[index].designation,
    location: req.body.location ?? db.alumni[index].location,
    linkedinUrl: req.body.linkedinUrl ?? db.alumni[index].linkedinUrl,
    profileImage: req.body.profileImage ?? db.alumni[index].profileImage,
    skills: Array.isArray(req.body.skills) ? req.body.skills : db.alumni[index].skills,
    papers: Array.isArray(req.body.papers) ? req.body.papers : db.alumni[index].papers,
    projects: Array.isArray(req.body.projects) ? req.body.projects : db.alumni[index].projects,
    mentorTopics: Array.isArray(req.body.mentorTopics) ? req.body.mentorTopics : db.alumni[index].mentorTopics
  };

  db.alumni[index] = updatedAlum;
  await saveDB(db);
  res.json(updatedAlum);
});

// API: Delete Alumni
app.delete("/api/alumni/:id", async (req, res) => {
  const { id } = req.params;
  const db = await readDB();
  const initialLength = db.alumni.length;
  db.alumni = db.alumni.filter((a: any) => a.id !== id);
  if (db.alumni.length === initialLength) {
    return res.status(404).json({ error: "Alumni not found" });
  }
  await saveDB(db);
  res.json({ success: true, message: "Alumni deleted successfully" });
});

// API: Get Students
app.get("/api/students", async (req, res) => {
  const db = await readDB();
  res.json(db.students || []);
});

// API: Create Student
app.post("/api/students", async (req, res) => {
  const db = await readDB();
  const newStud = {
    id: `student-${Date.now()}`,
    name: req.body.name || "Unnamed Student",
    studentId: req.body.studentId || "EXXXXXX",
    contactNumber: req.body.contactNumber || "N/A",
    email: req.body.email || "N/A",
    currentOccupation: "Higher Studies",
    linkedinUrl: req.body.linkedinUrl || "",
    profileImage: req.body.profileImage || "https://images.unsplash.com/photo-1544717297-fa95b854e137?w=150",
    skills: Array.isArray(req.body.skills) ? req.body.skills : [],
    hobbies: Array.isArray(req.body.hobbies) ? req.body.hobbies : [],
    papers: Array.isArray(req.body.papers) ? req.body.papers : [],
    projects: Array.isArray(req.body.projects) ? req.body.projects : []
  };

  db.students.push(newStud);
  await saveDB(db);
  res.status(201).json(newStud);
});

// API: Update Student
app.put("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  const db = await readDB();
  const index = db.students.findIndex((s: any) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  const updatedStud = {
    ...db.students[index],
    name: req.body.name ?? db.students[index].name,
    studentId: req.body.studentId ?? db.students[index].studentId,
    contactNumber: req.body.contactNumber ?? db.students[index].contactNumber,
    email: req.body.email ?? db.students[index].email,
    linkedinUrl: req.body.linkedinUrl ?? db.students[index].linkedinUrl,
    profileImage: req.body.profileImage ?? db.students[index].profileImage,
    skills: Array.isArray(req.body.skills) ? req.body.skills : db.students[index].skills,
    hobbies: Array.isArray(req.body.hobbies) ? req.body.hobbies : db.students[index].hobbies,
    papers: Array.isArray(req.body.papers) ? req.body.papers : db.students[index].papers,
    projects: Array.isArray(req.body.projects) ? req.body.projects : db.students[index].projects
  };

  db.students[index] = updatedStud;
  await saveDB(db);
  res.json(updatedStud);
});

// API: Delete Student
app.delete("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  const db = await readDB();
  const initialLength = db.students.length;
  db.students = db.students.filter((s: any) => s.id !== id);
  if (db.students.length === initialLength) {
    return res.status(404).json({ error: "Student not found" });
  }
  await saveDB(db);
  res.json({ success: true, message: "Student deleted successfully" });
});

// API: Get Notifications
app.get("/api/notifications", async (req, res) => {
  const db = await readDB();
  res.json(db.notifications || []);
});

// API: Create Push Notification
app.post("/api/notifications", async (req, res) => {
  const db = await readDB();
  const newNotif = {
    id: `notif-${Date.now()}`,
    title: req.body.title || "Announcement",
    message: req.body.message || "New updates are live.",
    timestamp: new Date().toISOString()
  };

  if(!db.notifications) db.notifications = [];
  db.notifications.unshift(newNotif); // latest first
  await saveDB(db);
  res.status(201).json(newNotif);
});

// API: Get Mentorship Requests
app.get("/api/mentorship-requests", async (req, res) => {
  const db = await readDB();
  res.json(db.mentorshipRequests || []);
});

// API: Create Mentorship Request
app.post("/api/mentorship-requests", async (req, res) => {
  const db = await readDB();
  const newReq = {
    id: `req-${Date.now()}`,
    senderName: req.body.senderName || "Anonymous Student",
    senderEmail: req.body.senderEmail || "N/A",
    receiverId: req.body.receiverId || "N/A",
    receiverName: req.body.receiverName || "N/A",
    subject: req.body.subject || "No Subject",
    message: req.body.message || "",
    topic: req.body.topic || "Career Guidance",
    status: "pending", // pending, approved, declined
    timestamp: new Date().toISOString()
  };
  db.mentorshipRequests.unshift(newReq);
  await saveDB(db);
  res.status(201).json(newReq);
});

// API: Update Mentorship Request Status
app.put("/api/mentorship-requests/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = await readDB();
  const index = db.mentorshipRequests.findIndex((r: any) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Mentorship request not found" });
  }
  db.mentorshipRequests[index].status = status || db.mentorshipRequests[index].status;
  await saveDB(db);
  res.json(db.mentorshipRequests[index]);
});

// API: Get Direct Messages
app.get("/api/direct-messages", async (req, res) => {
  const db = await readDB();
  res.json(db.messages || []);
});

// API: Create Direct Message
app.post("/api/direct-messages", async (req, res) => {
  const db = await readDB();
  const newMsg = {
    id: `msg-${Date.now()}`,
    senderName: req.body.senderName || "Anonymous Sender",
    senderEmail: req.body.senderEmail || "N/A",
    receiverId: req.body.receiverId || "N/A",
    receiverName: req.body.receiverName || "N/A",
    text: req.body.text || "",
    timestamp: new Date().toISOString()
  };
  db.messages.push(newMsg);
  await saveDB(db);
  res.status(201).json(newMsg);
});

// Local Fallback Keyword Search logic (Resilient to offline or empty API Keys)
function generateFallbackLocalAIResponse(message: string, db: any): string {
  const msg = message.toLowerCase();
  
  // Search for AI/ML mentors or engineers
  if (msg.includes("ai/ml") || msg.includes("ai") || msg.includes("machine learning") || msg.includes("deep learning")) {
    const matchedAlumni = db.alumni.filter((a: any) => 
      a.mentorTopics?.some((t: string) => t.toLowerCase().includes("ai")) ||
      a.skills?.some((s: string) => s.toLowerCase().includes("tensorflow") || s.toLowerCase().includes("pytorch") || s.toLowerCase().includes("ai")) ||
      a.designation?.toLowerCase().includes("ai")
    );
    if (matchedAlumni.length > 0) {
      return `Based on our directories, here are our CCE Alumni specializing or mentoring in **AI/ML**:\n\n` +
        matchedAlumni.map((a: any) => `- **${a.name}** (${a.batch}, Student ID: ${a.studentId}): Working as *${a.designation}* at *${a.company}* (Mentors: ${a.mentorTopics.join(", ")}).`).join("\n") +
        `\n\n*Feel free to browse our Alumni directory and click **Contact** to send them a message!*`;
    }
  }

  // Search for programming mentors
  if (msg.includes("programming") || msg.includes("mentor for programming") || msg.includes("program")) {
    const mentors = db.alumni.filter((a: any) => a.mentorTopics?.includes("Programming"));
    if (mentors.length > 0) {
      return `Here are the alumni ready to mentor you in **Programming & Software Development**:\n\n` +
        mentors.map((m: any) => `- **${m.name}** (${m.batch}): *${m.designation}* at *${m.company}* - Location: ${m.location}.`).join("\n") +
        `\n\nThey have been automatically filtered in your screen!`;
    }
  }

  // Search for papers
  if (msg.includes("paper") || msg.includes("published") || msg.includes("research") || msg.includes("publication")) {
    const alWithPapers = db.alumni.filter((a: any) => a.papers && a.papers.length > 0);
    const stWithPapers = db.students.filter((s: any) => s.papers && s.papers.length > 0);
    
    let resMsg = `Here are members who have published academic research papers recently:\n\n`;
    if (alWithPapers.length > 0) {
      resMsg += `**Alumni Papers:**\n`;
      alWithPapers.forEach((a: any) => {
        a.papers.forEach((p: string) => {
          resMsg += `- "${p}" authored by **${a.name}** (${a.batch})\n`;
        });
      });
    }
    if (stWithPapers.length > 0) {
      resMsg += `\n**Current Students Papers:**\n`;
      stWithPapers.forEach((s: any) => {
        s.papers.forEach((p: string) => {
          resMsg += `- "${p}" authored by student **${s.name}** (${s.studentId})\n`;
        });
      });
    }
    return resMsg;
  }

  // Search for Career Guidance
  if (msg.includes("guidance") || msg.includes("career") || msg.includes("consult") || msg.includes("counsel")) {
    const counselors = db.alumni.filter((a: any) => a.mentorTopics?.includes("Career Guidance"));
    if (counselors.length > 0) {
      return `Looking for career paths or job application guidance? The following CCE graduates offer specific mentoring on **Career Guidance**:\n\n` +
        counselors.map((c: any) => `- **${c.name}** (${c.batch}): *${c.designation}* at *${c.company}* in *${c.location}*`).join("\n") +
        `\n\nConnect with them through their details pages!`;
    }
  }

  // Find students interested in web development/frontend
  if (msg.includes("student") && (msg.includes("web") || msg.includes("frontend") || msg.includes("development") || msg.includes("react"))) {
    const webStudents = db.students.filter((s: any) =>
      s.skills?.some((sk: string) => ["react", "frontend", "next.js", "web", "html", "css", "javascript", "typescript"].includes(sk.toLowerCase()))
    );
    if (webStudents.length > 0) {
      return `Here are the brilliant CCE current students with active skills in **Web & Frontend Development**:\n\n` +
        webStudents.map((s: any) => `- **${s.name}** (ID: ${s.studentId}): Skilled in *${s.skills.join(", ")}* (Projects: ${s.projects.join(", ") || "None listed"})`).join("\n") +
        `\n\nWould you like to pre-filter current students on web skills?`;
    }
  }

  // Search generically by company name (Google, Samsung, Therap, BJIT, Meta, Databricks)
  for (const comp of ["google", "samsung", "mit", "optimizely", "therap", "meta", "databricks", "bjit"]) {
    if (msg.includes(comp)) {
      const matchAl = db.alumni.filter((a: any) => a.company?.toLowerCase().includes(comp));
      if (matchAl.length > 0) {
        return `We found graduates working at or affiliated with **${comp.toUpperCase()}**:\n\n` +
          matchAl.map((a: any) => `- **${a.name}** (${a.batch}): *${a.designation}* at *${a.company}*`).join("\n");
      }
    }
  }

  // Default answer
  return `Hello there! I am the CCE Hub Intelligent Assistant. I can help search and match alumni & students!\n\n**Try asking me things like:**\n- "Which alumni work at Google or Samsung?"\n- "Are there any programming mentors in CCE?"\n- "Who has published papers recently?"\n- "Find me students interested in web development."\n- "Tell me about Batch 10 mentors."`;
}

function detectSuggestedFilterFromMessage(message: string): any {
  const msg = message.toLowerCase();
  if (msg.includes("ai/ml") || msg.includes("machine learning") || msg.includes("deep learning")) {
    return { type: "alumni", topic: "AI/ML" };
  }
  if (msg.includes("programming") || msg.includes("code")) {
    return { type: "alumni", topic: "Programming" };
  }
  if (msg.includes("career") || msg.includes("guidance")) {
    return { type: "alumni", topic: "Career Guidance" };
  }
  if (msg.includes("sqa") || msg.includes("testing") || msg.includes("qa")) {
    return { type: "alumni", topic: "SQA" };
  }
  if (msg.includes("web") || msg.includes("frontend") || msg.includes("react")) {
    return { type: "student", query: "React" };
  }
  if (msg.includes("paper") || msg.includes("published") || msg.includes("research")) {
    return { type: "all", query: "paper" };
  }
  if (msg.includes("google")) {
    return { type: "alumni", query: "Google" };
  }
  if (msg.includes("samsung")) {
    return { type: "alumni", query: "Samsung" };
  }
  return null;
}

// API: Contextual AI Assistant with Gemini 3.5 Flash
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const db = await readDB();
  const apiKey = process.env.GEMINI_API_KEY;

  // Use local fallback if no valid key is supplied
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    const text = generateFallbackLocalAIResponse(message, db);
    const suggestedFilter = detectSuggestedFilterFromMessage(message);
    return res.json({ text, suggestedFilter });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const systemInstruction = `You are the CCE Connection Hub Intelligent Assistant for the CCE Department (Computer Science and Communication Engineering, IIUC).
The user can query you in natural language about graduates (Alumni from Batch 5 onwards), current students, skills, location, research papers, and publications.

Here is the current database of CCE Alumni:
${JSON.stringify(db.alumni, null, 2)}

Here is the current database of CCE Students:
${JSON.stringify(db.students, null, 2)}

Capabilities and Instructions:
1. Provide extremely accurate and context-aware responses based exactly on this database. Highlight matches using markdown bold-text.
2. Recommend relevant people (alumni or students) based on names, locations, skills, batches, or designation interests.
3. If an alumnus or student has published academic papers, outline them clearly when requested.
4. Intelligent Filter Triggers: If a user specifies a lookup intent (e.g. 'Show me software engineer alumni in USA', 'filter AI mentors', 'find students with React skills', 'show all research publications'), suggest a structured pre-fill tag to help drive the front-end search.
At the VERY LAST LINE of your response, separate it by printing EXACTLY the format:
TRIGGER_FILTER: {"type": "alumni"|"student"|"all", "query": "text search query", "batch": "Batch X", "topic": "Programming"|"AI/ML"|"SQA"|"Career Guidance"|"Web Development"|"Mobile Apps"}
(Only output the tags that represent the matching subset, or omit trigger filter if they are just saying hi or chatting generalities).

Maintain a prestigious, motivating academic tone matching IIUC and CCE. Be succinct, clean, and helpful.`;

    const chatHistory = history ? history.map((h: any) => ({
      role: h.sender === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    })) : [];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...chatHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.6,
      }
    });

    const reply = response.text || "I was unable to retrieve a response from the model. Please check back.";

    // Parse the trigger filter regular expression
    let finalReply = reply;
    let suggestedFilter: any = null;
    const filterRegex = /TRIGGER_FILTER:\s*(\{.*\})\s*$/m;
    const match = reply.match(filterRegex);
    if (match) {
      try {
        suggestedFilter = JSON.parse(match[1]);
        finalReply = reply.replace(filterRegex, "").trim();
      } catch (err) {
        console.error("Error parsing triggered filter JSON:", err);
      }
    }

    res.json({ text: finalReply, suggestedFilter });

  } catch (error: any) {
    console.error("Gemini AI API Error, doing local fallback:", error);
    const text = generateFallbackLocalAIResponse(message, db);
    const suggestedFilter = detectSuggestedFilterFromMessage(message);
    res.json({ 
      text: `[Connecting directly using local agent, as Gemini is initialized in high-speed local sandbox]\n\n${text}`, 
      suggestedFilter 
    });
  }
});

// Setup Vite Dev server or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CCE Hub Server booting up on port ${PORT}`);
  });
}

startServer();

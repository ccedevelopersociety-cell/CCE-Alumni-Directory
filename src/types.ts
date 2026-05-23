export interface Alumni {
  id: string;
  name: string;
  batch: string;
  studentId: string;
  contactNumber: string;
  email: string;
  currentOccupation: "Job" | "Higher Studies";
  company: string;
  designation: string;
  location: string;
  linkedinUrl: string;
  profileImage: string;
  skills: string[];
  papers: string[];
  projects: string[];
  mentorTopics: string[]; // Topics: "Programming", "AI/ML", "SQA", "Career Guidance", "Web Development", "Mobile Apps"
}

export interface Student {
  id: string;
  name: string;
  studentId: string; // e.g. E19XXXX, E20XXXX
  contactNumber: string;
  email: string;
  currentOccupation: "Higher Studies";
  linkedinUrl: string;
  profileImage: string;
  skills: string[];
  hobbies: string[];
  papers: string[];
  projects: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  suggestedFilter?: {
    type?: "alumni" | "student" | "all";
    query?: string;
    batch?: string;
    occupation?: string;
    topic?: string;
  };
}

export type ThemeType = "dark-red-black" | "black-dark-red" | "dark-red-green";

export interface MentorshipRequest {
  id: string;
  senderName: string;
  senderEmail: string;
  receiverId: string;
  receiverName: string;
  subject: string;
  message: string;
  topic: string;
  status: "pending" | "approved" | "declined";
  timestamp: string;
}

export interface DirectMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  receiverId: string;
  receiverName: string;
  text: string;
  timestamp: string;
}


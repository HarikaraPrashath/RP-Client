"use client";

import ChatArea from "@/components/career-guide/ChatArea";
import ChatHeader from "@/components/career-guide/ChatHeader";
import { useState, useRef, useEffect, FormEvent } from "react";
import { MessageSquareMore } from 'lucide-react';
import { Import } from 'lucide-react';
import { Settings } from 'lucide-react';


declare global {
  interface ImportMeta {
    readonly env: {
      readonly NEXT_PUBLIC_API_URL: string;
    };
  }
}

type Sender = "user" | "bot";

type Step =
  | "welcome"
  | "isSliit"          // NEW
  | "semester"
  | "gpa"
  | "specialization"   // NEW (only for > 2Y2S)
  | "softSkills"
  | "techSkills"
  | "english"
  // OCEAN (1–5)
  | "oceanO"
  | "oceanC"
  | "oceanE"
  | "oceanA"
  | "oceanN"
  // RIASEC (1–10)
  | "riaR"
  | "riaI"
  | "riaA"
  | "riaS"
  | "riaE"
  | "riaC";

interface Message {
  id: number;
  sender: Sender;
  text: string;
  timestamp: string;
}

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL) + "/predict-career";
console.log("Api public", API_URL)

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: '👋 Welcome to CareerPath AI!\nI\'ll help you discover your ideal career based on your skills, personality, and interests.\n\nType **"start"** when you\'re ready to begin.', timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [step, setStep] = useState<Step>("welcome");
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [progress, setProgress] = useState(0);

  // store answers
  const [softSkills, setSoftSkills] = useState("");
  const [techSkills, setTechSkills] = useState("");
  const [semester, setSemester] = useState("");
  const [gpa, setGpa] = useState<number | null>(null);
  const [englishScore, setEnglishScore] = useState<number | null>(null);
  const [isSliitStudent, setIsSliitStudent] = useState<boolean | null>(null);
  const [specialization, setSpecialization] = useState("");

  // OCEAN ratings (1–5)
  const [oceanO, setOceanO] = useState<number | null>(null);
  const [oceanC, setOceanC] = useState<number | null>(null);
  const [oceanE, setOceanE] = useState<number | null>(null);
  const [oceanA, setOceanA] = useState<number | null>(null);
  const [oceanN, setOceanN] = useState<number | null>(null);

  // RIASEC ratings (1–10)
  const [riaR, setRiaR] = useState<number | null>(null);
  const [riaI, setRiaI] = useState<number | null>(null);
  const [riaArt, setRiaArt] = useState<number | null>(null);
  const [riaS, setRiaS] = useState<number | null>(null);
  const [riaE, setRiaE] = useState<number | null>(null);
  const [riaC, setRiaC] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const stepOrder: Step[] = [
      "welcome",
      "isSliit",
      "semester",
      "gpa",
      "specialization",
      "softSkills",
      "techSkills",
      "english",
      "oceanO",
      "oceanC",
      "oceanE",
      "oceanA",
      "oceanN",
      "riaR",
      "riaI",
      "riaA",
      "riaS",
      "riaE",
      "riaC",
    ];

    const totalQuestions = stepOrder.length - 1; // excluding "welcome"
    const currentIndex = stepOrder.indexOf(step);
    const normalizedIndex = Math.max(0, currentIndex);
    const newProgress =
      normalizedIndex > 0 ? Math.round((normalizedIndex / totalQuestions) * 100) : 0;

    setProgress(newProgress);
  }, [step]);


  const addBotMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender: "bot",
        text,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const parseSemesterCode = (txt: string) => {
    // supports: 2Y2S, 1y1s, "2Y 2S"
    const cleaned = txt.replace(/\s+/g, "").toUpperCase();
    const m = cleaned.match(/^(\d)Y(\d)S$/);
    if (!m) return null;
    const year = Number(m[1]);
    const sem = Number(m[2]);
    if (![1, 2, 3, 4].includes(year) || ![1, 2].includes(sem)) return null;
    return { year, sem, code: `${year}Y${sem}S` };
  };

  const isOver2Y2S = (semObj: { year: number; sem: number }) => {
    if (semObj.year > 2) return true;
    if (semObj.year === 2 && semObj.sem === 2) return false;
    if (semObj.year === 2 && semObj.sem === 1) return false;
    return false;
  };

  // ✅ edit/extend these to match your backend labels + Sliit specialization names
  const ROLE_TO_SPECIALIZATIONS: Record<string, string[]> = {
    "Software Engineer": ["SE", "SOFTWARE ENGINEERING"],
    "Data Science & Analytics": ["DS", "DATA SCIENCE", "DATA SCIENCE & ANALYTICS"],
    "Cyber Security": ["CS", "CYBER SECURITY", "CYBERSECURITY"],
    "UI/UX Designer": ["UIUX", "UI/UX", "INTERACTION DESIGN", "HCI"],
    "Network Engineer": ["NETWORKING", "NETWORK ENGINEERING"],
  };

  const parseRating1to5 = (txt: string) => {
    const n = Number(txt);
    if (!Number.isInteger(n) || n < 1 || n > 5) return null;
    return n;
  };

  const parseRating1to10 = (txt: string) => {
    const n = Number(txt);
    if (!Number.isInteger(n) || n < 1 || n > 10) return null;
    return n;
  };

  // const ratingGuide5 =
  //   "* Rating (1–5)\n" +
  //   "1️⃣ Do not like it at all\n" +
  //   "2️⃣ Like it a little\n" +
  //   "3️⃣ Neutral\n" +
  //   "4️⃣ Like it\n" +
  //   "5️⃣ Like it very much\n";

  // const ratingGuide10 =
  //   "⭐ Rating (1–10)\n" +
  //   "1️⃣ Do not like it at all\n" +
  //   "2️⃣ Like it very little\n" +
  //   "3️⃣ Like it a little\n" +
  //   "4️⃣ Slightly like it\n" +
  //   "5️⃣ Neutral\n" +
  //   "6️⃣ Somewhat like it\n" +
  //   "7️⃣ Like it\n" +
  //   "8️⃣ Like it a lot\n" +
  //   "9️⃣ Like it very much\n" +
  //   "🔟 Like it extremely\n";

  const resetAll = () => {
    setStep("welcome");
    setCurrentQuestionNumber(1);
    setProgress(0);

    setIsSliitStudent(null);
    setSpecialization("");

    setSoftSkills("");
    setTechSkills("");
    setSemester("");
    setGpa(null);
    setEnglishScore(null);

    setOceanO(null);
    setOceanC(null);
    setOceanE(null);
    setOceanA(null);
    setOceanN(null);

    setRiaR(null);
    setRiaI(null);
    setRiaArt(null);
    setRiaS(null);
    setRiaE(null);
    setRiaC(null);
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userText = input.trim();
    const lower = userText.toLowerCase();

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        text: userText,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setInput("");

    // ✅ WELCOME STEP
    if (step === "welcome") {
      if (lower === "start" || lower === '"start"') {
        setStep("isSliit");
        setCurrentQuestionNumber(1);
        addBotMessage("📝 **Question 1:** Are you a **Sliit** student? (yes / no)");
      } else {
        addBotMessage('Type **"start"** when you\'re ready to begin your assessment.');
      }
      return;
    }

    // Chat Starting point
    if (step === "isSliit") {
      const ans = lower.replace(/[^a-z]/g, "");
      if (ans !== "yes" && ans !== "no") {
        addBotMessage("Please reply **yes** or **no**.");
        return;
      }

      const yes = ans === "yes";
      setIsSliitStudent(yes);

      if (yes) {
        setStep("semester");
        setCurrentQuestionNumber(2);
        addBotMessage(
          "✅ Noted!\n\n" +
          "📚 **Question 2:** What semester are you currently in? (e.g., **2Y2S**, **1Y1S**)"
        );
      } else {
        // non-student → skip semester/gpa/specialization
        setStep("softSkills");
        setCurrentQuestionNumber(2);
        addBotMessage(
          "✅ Noted!\n\n" +
          "📝 **Question 2:** List your top soft skills (communication, teamwork, leadership, etc.)"
        );
      }
      return;
    }

    if (step === "softSkills") {
      setSoftSkills(userText);
      setStep("techSkills");
      setCurrentQuestionNumber((n) => n + 1);
      addBotMessage(
        "✅ **Soft skills recorded!**\n\n" +
        "🛠️ **Next:** List your technical skills (Python, Java, React, etc.)"
      );
      return;
    }

    if (step === "techSkills") {
      setTechSkills(userText);
      setStep("english");
      setCurrentQuestionNumber((n) => n + 1);
      addBotMessage(
        "✅ **Technical skills recorded!**\n\n" +
        "🌐 **Next:** Enter your English score (0 - 100)"
      );
      return;
    }

    if (step === "semester") {
      const semObj = parseSemesterCode(userText);
      if (!semObj) {
        addBotMessage("Please enter semester like **2Y2S** or **1Y1S**.");
        return;
      }

      setSemester(semObj.code);
      setStep("gpa");
      setCurrentQuestionNumber(3);
      addBotMessage(
        "✅ **Semester recorded!**\n\n" +
        "🎓 **Question 3:** What is your current GPA? (0.0 - 4.0)"
      );
      return;
    }

    if (step === "gpa") {
      const gpaValue = parseFloat(userText);
      if (Number.isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4) {
        addBotMessage("Please enter a valid GPA between 0.0 and 4.0.");
        return;
      }
      setGpa(gpaValue);

      const semObj = parseSemesterCode(semester);

      // strictly: if year > 2 OR (year==2 && sem==2 is NOT over)
      const over = semObj ? (semObj.year > 2) : false;

      if (over) {
        setStep("specialization");
        setCurrentQuestionNumber(4);
        addBotMessage(
          "✅ **GPA recorded!**\n\n" +
          "🏷️ **Question 4:** What specialization are you doing? (e.g., SE, DS, Cyber Security, UI/UX)"
        );
      } else {
        // <= 2Y2S → no specialization question yet
        setStep("softSkills");
        setCurrentQuestionNumber(4);
        addBotMessage(
          "✅ **GPA recorded!**\n\n" +
          "📝 **Question 4:** List your top soft skills (communication, teamwork, leadership, etc.)"
        );
      }
      return;
    }

    if (step === "specialization") {
      setSpecialization(userText.trim());
      setStep("softSkills");
      setCurrentQuestionNumber(5);
      addBotMessage(
        "✅ **Specialization recorded!**\n\n" +
        "📝 **Next:** List your top soft skills (communication, teamwork, leadership, etc.)"
      );
      return;
    }

    if (step === "english") {
      const eng = parseFloat(userText);
      if (Number.isNaN(eng) || eng < 0 || eng > 100) {
        addBotMessage("Please enter a valid English score between 0 and 100.");
        return;
      }
      setEnglishScore(eng);
      setStep("oceanO");
      addBotMessage(
        "✅ **English score recorded!**\n\n" +
        "🧠 **Question 6 of 17: Personality Assessment**\n\n" +
        "**Rate 1-5: Openness to Experience**\n" +
        "Do you enjoy exploring new technologies and experimenting with creative ideas while working on a project?\n\n"
      );
      return;
    }

    // OCEAN
    if (step === "oceanO") {
      const r = parseRating1to5(userText);
      if (r === null) return addBotMessage("Please enter a number between 1 and 5.");
      setOceanO(r);
      setStep("oceanC");
      setCurrentQuestionNumber(7);
      addBotMessage(
        `✅ **Openness: ${r}/5**\n\n` +
        "**Question 7 of 17: Conscientiousness**\n" +
        "**Rate 1-5: Openness to Experience**\n" +
        "Do you always finish your assignments on time and double-check them for accuracy?\n\n"
      ); return;
    }

    if (step === "oceanC") {
      const r = parseRating1to5(userText);
      if (r === null) return addBotMessage("Please enter a number between 1 and 5.");
      setOceanC(r);
      setStep("oceanE");
      setCurrentQuestionNumber(8);
      addBotMessage(
        `✅ **Conscientiousness: ${r}/5**\n\n` +
        "**Question 8 of 17: Extraversion**\n" +
        "**Rate 1-5: Openness to Experience**\n" +
        "Do you feel energized when you work with others in group projects?\n\n"
      ); return;
    }

    if (step === "oceanE") {
      const r = parseRating1to5(userText);
      if (r === null) return addBotMessage("Please enter a number between 1 and 5.");
      setOceanE(r);
      setStep("oceanA");
      setCurrentQuestionNumber(9);
      addBotMessage(
        `✅ **Agreeableness: ${r}/5**\n\n` +
        "**Question 10 of 17: Neuroticism**\n" +
        "**Rate 1-5: Openness to Experience**\n" +
        "Do you easily get stressed or anxious before exams or project deadlines?\n\n"
      ); return;
    }

    if (step === "oceanA") {
      const r = parseRating1to5(userText);
      if (r === null) return addBotMessage("Please enter a number between 1 and 5.");
      setOceanA(r);
      setStep("oceanN");
      setCurrentQuestionNumber(10);
      addBotMessage(
        `✅ **Agreeableness: ${r}/5**\n\n` +
        "**Question 10 of 17: Neuroticism**\n" +
        "**Rate 1-5: Openness to Experience**\n" +
        "Do you easily get stressed or anxious before exams or project deadlines?\n\n"
      );
      return;
    }

    if (step === "oceanN") {
      const r = parseRating1to5(userText);
      if (r === null) return addBotMessage("Please enter a number between 1 and 5.");
      setOceanN(r);

      setStep("riaR");
      addBotMessage(
        `✅ **Neuroticism: ${r}/5**\n\n` +
        "🎯 **Personality assessment complete!**\n\n" +
        "**Question 11 of 17: RIASEC - Realistic**\n" +
        "**Rate your interest in hands-on, practical work (1-10)**:\n\n" +
        "Do you enjoy practical work such as assembling hardware or configuring devices?\n"
      );
      return;
    }

    // RIASEC
    if (step === "riaR") {
      const r = parseRating1to10(userText);
      if (r === null) return addBotMessage("Please enter a number between 1 and 10.");
      setRiaR(r);
      setStep("riaI");
      setCurrentQuestionNumber(12);
      addBotMessage(
        `✅ **Realistic: ${r}/10**\n\n` +
        "**Question 12 of 17: Investigative**\n" +
        "**Rate your interest in analytical thinking (1-10)**:\n\n" +
        "Do you like solving analytical problems, debugging code, or doing research on new tech?\n"
      ); return;
    }

    if (step === "riaI") {
      const r = parseRating1to10(userText);
      if (r === null) return addBotMessage("Please enter a number between 1 and 10.");
      setRiaI(r);
      setStep("riaA");
      setCurrentQuestionNumber(13);
      addBotMessage(
        `✅ **Investigative: ${r}/10**\n\n` +
        "**Question 13 of 17: Artistic**\n" +
        "**Rate your interest in creative expression (1-10)**:\n\n" +
        "Do you enjoy designing user interfaces, graphics, or creating something visually appealing?\n"
      ); return;
    }

    if (step === "riaA") {
      const r = parseRating1to10(userText);
      if (r === null) return addBotMessage("Please enter a number between 1 and 10.");
      setRiaArt(r);
      setStep("riaS");
      setCurrentQuestionNumber(14);
      addBotMessage(
        `✅ **Artistic: ${r}/10**\n\n` +
        "**Question 14 of 17: Social**\n" +
        "**Rate your interest in helping others (1-10)**:\n\n" +
        " Do you like helping friends understand complex technical concepts?\n"
      ); return;
    }

    if (step === "riaS") {
      const r = parseRating1to10(userText);
      if (r === null) return addBotMessage("Please enter a number between 1 and 10.");
      setRiaS(r);
      setStep("riaE");
      setCurrentQuestionNumber(15);
      addBotMessage(
        `✅ **Social: ${r}/10**\n\n` +
        "**Question 15 of 17: Enterprising**\n" +
        "**Rate your interest in leadership (1-10)**:\n\n" +
        "Do you enjoy taking leadership roles and guiding a team toward project goals?\n"
      ); return;
    }

    if (step === "riaE") {
      const r = parseRating1to10(userText);
      if (r === null) return addBotMessage("Please enter a number between 1 and 10.");
      setRiaE(r);
      setStep("riaC");
      setCurrentQuestionNumber(16);
      addBotMessage(
        `✅ **Enterprising: ${r}/10**\n\n` +
        "**Question 16 of 17: Conventional**\n" +
        "**Rate your interest in organized tasks (1-10)**:\n\n" +
        "Do you prefer structured tasks like organizing data, documentation, or reports?\n"
      ); return;
    }

    if (step === "riaC") {
      const r = parseRating1to10(userText);
      if (r === null) return addBotMessage("Please enter a number between 1 and 10.");
      setRiaC(r);

      setIsThinking(true);

      // Payload matching backend requirements
      const payload = {
        Is_Sliit_Student: isSliitStudent ?? false,   // ✅ ADD THIS
        Specialization: specialization ?? "",       // ✅ ADD THIS

        Soft_Skills: softSkills,
        Key_Skils: techSkills,
        Current_semester: semester,
        Learning_Style: "Visual", // Default value as per backend
        GPA: gpa ?? 0,
        English_score: englishScore ?? 0,

        Ocean_Openness: oceanO ?? 0,
        Ocean_Conscientiousness: oceanC ?? 0,
        Ocean_Extraversion: oceanE ?? 0,
        Ocean_Agreeableness: oceanA ?? 0,
        Ocean_Neuroticism: oceanN ?? 0,

        Riasec_Realistic: riaR ?? 0,
        Riasec_Investigative: riaI ?? 0,
        Riasec_Artistic: riaArt ?? 0,
        Riasec_Social: riaS ?? 0,
        Riasec_Enterprising: riaE ?? 0,
        Riasec_Conventional: r,
      };

      try {
        addBotMessage("✅ **All questions answered!**\n\n🤔 Analyzing your profile...");
        console.log("Payload", payload);

        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();

        const top1 = data.top_1_prediction;
        const top3 = data.top_3_predictions ?? [];
        const llmGuidance: string = data.guidance ?? "";
        const dynamicSuggestions = data.dynamic_suggestions ?? {};

        // 2️⃣ Guidance Summary
        let guidanceSummary = "";
        if (isSliitStudent) {
          const semObj = parseSemesterCode(semester);
          const g = gpa ?? 0;
          const safeSpec = specialization ? specialization.trim() : "";
          const specNorm = safeSpec.toUpperCase();
          const expectedSpecs: string[] = ROLE_TO_SPECIALIZATIONS[top1] ?? [];
          const match =
            expectedSpecs.length > 0 &&
            specNorm.length > 0 &&
            expectedSpecs.some((s) => specNorm.includes(s.toUpperCase()));

          if (semObj && semObj.year > 2) {
            guidanceSummary = match
              ? `✅ **SLIIT Alignment:** ${safeSpec || "(no specialization)"} matches **${top1}**.`
              : `⚠️ **SLIIT Alignment:** Predicted Role **${top1}**, Your Specialization: ${safeSpec || "(none)"}.\n\n👉 Consider bridge projects or adjusting career focus.`;
          } else {
            guidanceSummary =
              g >= 3.0
                ? `✅ **Strong Academic Foundation (GPA ≥ 3.0):** Targeting **${top1}**.`
                : `⚠️ **Academic Recovery Recommended (GPA < 3.0):** Focus on fundamentals + portfolio.`;
          }
        } else {
          guidanceSummary = `✅ **Career Direction Advice:** Your strongest path is **${top1}**.`;
        }

        addBotMessage(`🧭 **Guidance Summary:**\n\n${guidanceSummary}`);

        // 3️⃣ LLM Guidance (each line as separate bullet)
        if (llmGuidance) {
          const llmLines = llmGuidance
            .split(/\n|•/)
            .map((line) => line.trim())
            .filter(Boolean);
          addBotMessage(
            "🧠 **Model Guidance:**\n\n" +
            llmLines.map((line) => `• ${line}`).join("\n\n")
          );
        }

        // 4️⃣ Dynamic Suggestions (each bullet/module starts on a new line)
        if (Object.keys(dynamicSuggestions).length > 0) {
          const bullets = dynamicSuggestions.bullets ?? [];
          const modules = dynamicSuggestions.modules ?? [];
          addBotMessage(
            `💡 **Dynamic Suggestions:**\n` +
            `**Plan Title:** ${dynamicSuggestions.title || "–"}\n\n` +
            `**Audience:** ${dynamicSuggestions.audience || "–"}\n\n` +
            `**Semester:** ${dynamicSuggestions.semester || "–"}\n\n` +
            `**GPA Band:** ${dynamicSuggestions.gpa_band || "–"}\n` +
            `**Specialization:** ${dynamicSuggestions.specialization || "–"}\n\n` +
            `**Matches Top-1 Role:** ${dynamicSuggestions.specialization_matches_top1 ? "✅ Yes" : "❌ No"}\n\n` +
            `**Key Actions:**\n\n` +
            bullets.map((b: string) => `• ${b}`).join("\n\n") +
            (modules.length > 0
              ? `\n\n**Recommended Modules:**\n\n` +
              modules.map((m: string) => `• ${m}`).join("\n\n")
              : "")
          );
        }

        // 5️⃣ Prompt for new assessment
        addBotMessage(`\n🔄 **Take another assessment?**\nType **"start"** to begin again.`);
        resetAll();
      } catch (error) {
        console.error(error);
        addBotMessage(
          "❌ **Service Temporarily Unavailable**\n" +
          "Our prediction engine is currently updating. Please try again in a few minutes."
        );
        resetAll();
      } finally {
        setIsThinking(false);
      }
    }
  };

  return (
  <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans flex">

  {/* 🔵 Sidebar */}
  <aside className="w-64 bg-white border-r border-slate-200 shadow-lg hidden md:flex flex-col">
    
    {/* Logo / Title */}
    <div className="p-6 border-b border-slate-100">
      <h2 className="text-xl font-bold text-slate-800">Career AI</h2>
      <p className="text-xs text-slate-500 mt-1">Assessment Dashboard</p>
    </div>

    {/* Menu Buttons */}
    <div className="flex-1 p-4 space-y-3">

      <button type="button"
        className="w-full text-left px-4 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition"
      >
        <MessageSquareMore className="w-4 h-4 mr-2 inline" /> New Chat
      </button>

      <button type="button"
        className="w-full text-left px-4 py-3 rounded-xl items-center bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition"
      >
        <Import className="w-4 h-4 mr-2 inline" /> Save to Profile
      </button>

      <button type="button"
        className="w-full  text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition"
      >
        <Settings className="w-4 h-4 mr-2 inline"/> Settings
      </button>

    </div>

    {/* Bottom Section */}
    <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
      © 2026 Career AI
    </div>
  </aside>


  {/* 🔵 Chat Section */}
  <div className="flex-1 p-4 md:p-6 flex items-center justify-center">
    <div className="w-full max-w-6xl h-[90vh] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-200/30 flex flex-col overflow-hidden border border-slate-200">
      
      {/* Header */}
      <ChatHeader currentQuestionNumber={currentQuestionNumber} progress={progress} />

      {/* Chat Area */}
      <ChatArea
        messages={messages}
        isThinking={isThinking}
        messagesEndRef={messagesEndRef}
      />

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-100 bg-gradient-to-t from-white to-slate-50/50 px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <input
            className="flex-1 rounded-xl bg-white border border-slate-200 px-4 py-3.5 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all font-medium shadow-sm"
            placeholder={
              step === "welcome"
                ? 'Type "start" to begin your career assessment...'
                : step === "oceanO" || step === "oceanC" || step === "oceanE" || step === "oceanA" || step === "oceanN"
                  ? `Enter rating 1-5 for Question ${currentQuestionNumber}...`
                  : step === "riaR" || step === "riaI" || step === "riaA" || step === "riaS" || step === "riaE" || step === "riaC"
                    ? `Enter rating 1-10 for Question ${currentQuestionNumber}...`
                    : `Answer Question ${currentQuestionNumber}...`
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking}
          />

          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98]"
          >
            <span className="mr-2 font-bold">Send</span>
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>

        <div className="mt-2 text-xs text-slate-500 text-center font-medium">
          {step === "oceanO" || step === "oceanC" || step === "oceanE" || step === "oceanA" || step === "oceanN"
            ? "Rating scale: 1 (Lowest) to 5 (Highest)"
            : step === "riaR" || step === "riaI" || step === "riaA" || step === "riaS" || step === "riaE" || step === "riaC"
              ? "Rating scale: 1 (Lowest) to 10 (Highest)"
              : "Press Enter to send your response"}
        </div>
      </form>
    </div>
  </div>
</main>
  );

}
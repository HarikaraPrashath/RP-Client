"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

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
  | "softSkills"
  | "techSkills"
  | "semester"
  | "gpa"
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
  (process.env.NEXT_PUBLIC_API_URL) + "/predict`";
console.log("Api public",API_URL)

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: 'Hi, welcome to future Career prediction bot 👋\nIf you need to start bot type "Start".',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [step, setStep] = useState<Step>("welcome");

  // store answers
  const [softSkills, setSoftSkills] = useState("");
  const [techSkills, setTechSkills] = useState("");
  const [semester, setSemester] = useState("");
  const [gpa, setGpa] = useState<number | null>(null);
  const [englishScore, setEnglishScore] = useState<number | null>(null);

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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const ratingGuide5 =
    "* Rating (1–5)\n" +
    "1️⃣ Do not like it at all\n" +
    "2️⃣ Like it a little\n" +
    "3️⃣ Neutral\n" +
    "4️⃣ Like it\n" +
    "5️⃣ Like it very much\n";

  const ratingGuide10 =
    "⭐ Rating (1–10)\n" +
    "1️⃣ Do not like it at all\n" +
    "2️⃣ Like it very little\n" +
    "3️⃣ Like it a little\n" +
    "4️⃣ Slightly like it\n" +
    "5️⃣ Neutral\n" +
    "6️⃣ Somewhat like it\n" +
    "7️⃣ Like it\n" +
    "8️⃣ Like it a lot\n" +
    "9️⃣ Like it very much\n" +
    "🔟 Like it extremely\n";

  const resetAll = () => {
    setStep("welcome");
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

    // welcome
    if (step === "welcome") {
      if (lower === "start") {
        setStep("softSkills");
        addBotMessage(
          "Great! 🎯\n1) Please enter at least 3 soft skills, separated by commas.\nFor example: communication, teamwork, leadership."
        );
      } else {
        addBotMessage('To begin, please type "Start".');
      }
      return;
    }

    if (step === "softSkills") {
      setSoftSkills(userText);
      setStep("techSkills");
      addBotMessage(
        "Nice! 🙌\n2) Now tell me your technical skills (e.g., Python, Java, React).\nPlease list them separated by commas."
      );
      return;
    }

    if (step === "techSkills") {
      setTechSkills(userText);
      setStep("semester");
      addBotMessage(
        "Got it! 📚\n3) What is your current semester? (e.g., 2Y1S, 1Y2S)"
      );
      return;
    }

    if (step === "semester") {
      setSemester(userText);
      setStep("gpa");
      addBotMessage("Thanks! 🎓\n4) What is your current GPA? (e.g., 3.5)");
      return;
    }

    if (step === "gpa") {
      const gpaValue = parseFloat(userText);
      if (Number.isNaN(gpaValue)) {
        addBotMessage("Please enter a valid GPA as a number, e.g., 3.5.");
        return;
      }
      setGpa(gpaValue);
      setStep("english");
      addBotMessage("Great! ✅\n5) What is your English score? (e.g., 75)");
      return;
    }

    if (step === "english") {
      const eng = parseFloat(userText);
      if (Number.isNaN(eng)) {
        addBotMessage("Please enter a valid English score as a number, e.g., 75.");
        return;
      }
      setEnglishScore(eng);
      setStep("oceanO");
      addBotMessage(
        `Thanks! ✅\nNow answer these 5 questions using a rating.\n\n${ratingGuide5}\n` +
        "Q1) Do you enjoy exploring new technologies and experimenting with creative ideas while working on a project?"
      );
      return;
    }

    // OCEAN
    if (step === "oceanO") {
      const r = parseRating1to5(userText);
      if (r === null) return addBotMessage(`Enter 1–5.\n\n${ratingGuide5}`);
      setOceanO(r);
      setStep("oceanC");
      addBotMessage(`${ratingGuide5}\nQ2) Do you always finish your assignments on time and double-check them for accuracy?`);
      return;
    }

    if (step === "oceanC") {
      const r = parseRating1to5(userText);
      if (r === null) return addBotMessage(`Enter 1–5.\n\n${ratingGuide5}`);
      setOceanC(r);
      setStep("oceanE");
      addBotMessage(`${ratingGuide5}\nQ3) Do you feel energized when you work with others in group projects?`);
      return;
    }

    if (step === "oceanE") {
      const r = parseRating1to5(userText);
      if (r === null) return addBotMessage(`Enter 1–5.\n\n${ratingGuide5}`);
      setOceanE(r);
      setStep("oceanA");
      addBotMessage(`${ratingGuide5}\nQ4) Do you prefer working in a cooperative team rather than competing individually?`);
      return;
    }

    if (step === "oceanA") {
      const r = parseRating1to5(userText);
      if (r === null) return addBotMessage(`Enter 1–5.\n\n${ratingGuide5}`);
      setOceanA(r);
      setStep("oceanN");
      addBotMessage(`${ratingGuide5}\nQ5) Do you easily get stressed or anxious before exams or project deadlines?`);
      return;
    }

    if (step === "oceanN") {
      const r = parseRating1to5(userText);
      if (r === null) return addBotMessage(`Enter 1–5.\n\n${ratingGuide5}`);
      setOceanN(r);

      setStep("riaR");
      addBotMessage(
        `Great! ✅ Now answer these 6 interest questions using ⭐ rating.\n\n${ratingGuide10}\n` +
        "Q6) Do you enjoy practical work such as assembling hardware or configuring devices?"
      );
      return;
    }

    // RIASEC
    if (step === "riaR") {
      const r = parseRating1to10(userText);
      if (r === null) return addBotMessage(`Enter 1–10.\n\n${ratingGuide10}`);
      setRiaR(r);
      setStep("riaI");
      addBotMessage(`${ratingGuide10}\nQ7) Do you like solving analytical problems, debugging code, or doing research on new tech?`);
      return;
    }

    if (step === "riaI") {
      const r = parseRating1to10(userText);
      if (r === null) return addBotMessage(`Enter 1–10.\n\n${ratingGuide10}`);
      setRiaI(r);
      setStep("riaA");
      addBotMessage(`${ratingGuide10}\nQ8) Do you enjoy designing user interfaces, graphics, or creating something visually appealing?`);
      return;
    }

    if (step === "riaA") {
      const r = parseRating1to10(userText);
      if (r === null) return addBotMessage(`Enter 1–10.\n\n${ratingGuide10}`);
      setRiaArt(r);
      setStep("riaS");
      addBotMessage(`${ratingGuide10}\nQ9) Do you like helping friends understand complex technical concepts?`);
      return;
    }

    if (step === "riaS") {
      const r = parseRating1to10(userText);
      if (r === null) return addBotMessage(`Enter 1–10.\n\n${ratingGuide10}`);
      setRiaS(r);
      setStep("riaE");
      addBotMessage(`${ratingGuide10}\nQ10) Do you enjoy taking leadership roles and guiding a team toward project goals?`);
      return;
    }

    if (step === "riaE") {
      const r = parseRating1to10(userText);
      if (r === null) return addBotMessage(`Enter 1–10.\n\n${ratingGuide10}`);
      setRiaE(r);
      setStep("riaC");
      addBotMessage(`${ratingGuide10}\nQ11) Do you prefer structured tasks like organizing data, documentation, or reports?`);
      return;
    }

    if (step === "riaC") {
      const r = parseRating1to10(userText);
      if (r === null) return addBotMessage(`Enter 1–10.\n\n${ratingGuide10}`);
      setRiaC(r);

      setIsThinking(true);

      // EXACT payload keys that your FastAPI expects
      const payload = {
        Soft_Skills: softSkills,
        Key_Skils: techSkills,
        Current_semester: semester,
        Learning_Style: "Unknown",

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
        addBotMessage("Awesome! 🔍 Let me analyze your profile and predict a suitable career path...");
        console.log("Payload",payload)
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();
        const career = data.predicted_career ?? "Unknown";

        addBotMessage(`Based on your profile, a suitable career path for you is: ${career}.`);
        addBotMessage('If you want to try again with different skills, type "Start".');

        resetAll();
      } catch (error) {
        console.error(error);
        addBotMessage("Sorry, something went wrong while predicting your career. Please try again later.");
        resetAll();
      } finally {
        setIsThinking(false);
      }
      return;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-l from-blue-400 via-blue-500 to-blue-800 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-6xl h-[90vh] bg-white/90 border border-blue-200 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-blue-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2A5AA6] to-[#4AA2E4] flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-300/40">
              AI
            </div>
            <div>
              <h1 className="text-[#192A68] font-semibold text-lg">
                Future Career Bot
              </h1>
              <p className="text-xs text-blue-700/70">Career prediction assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700">Online</span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-5 space-y-4 scrollbar-thin scrollbar-thumb-blue-300/60 scrollbar-track-transparent">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"
                  }`}
              >
                {!isUser && (
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-blue-200 shadow-sm overflow-hidden">
                      <img
                        src="/logo.png"
                        alt="Bot"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[70%] ${isUser ? "order-1" : ""
                    }`}
                >
                  <div
                    className={[
                      "relative rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                      "shadow-sm border",
                      isUser
                        ? "bg-blue-800 text-white border-blue-500"
                        : "bg-white text-blue-800 border-blue-800",
                      isUser ? "rounded-br-md" : "rounded-bl-md",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute bottom-2 h-3 w-3 rotate-45",
                        isUser
                          ? "-right-1 bg-[#2A5AA6] border-r border-b border-blue-300"
                          : "-left-1 bg-white border-l border-b border-blue-200",
                      ].join(" ")}
                    />

                    <p>{msg.text}</p>

                    <div className="mt-2 flex items-center justify-end gap-2">
                      <span
                        className={`text-[10px] ${isUser ? "text-blue-100/80" : "text-blue-700/60"
                          }`}
                      >
                        {isUser ? "You" : "Career Bot"}
                      </span>
                      <span
                        className={`text-[10px] ${isUser ? "text-blue-100/70" : "text-blue-700/50"
                          }`}
                      >
                        • {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                {isUser && (
                  <div className="shrink-0 order-2">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-200 to-blue-100 border border-blue-200 shadow-sm flex items-center justify-center text-[#192A68] font-semibold">
                      U
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="flex items-end gap-3 justify-start">
              <div className="w-10 h-10 rounded-2xl bg-white border border-blue-200 shadow-sm overflow-hidden">
                <img src="/robot.png" alt="Bot" className="w-full h-full object-cover" />
              </div>

              <div className="bg-white border border-blue-200 text-slate-700 px-4 py-3 rounded-2xl rounded-bl-md text-sm flex items-center gap-3 shadow-sm">
                <span className="relative flex h-2 w-10 items-center justify-between">
                  <span className="h-2 w-2 rounded-full bg-[#2A5AA6] animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-[#4AA2E4] animate-bounce delay-150" />
                  <span className="h-2 w-2 rounded-full bg-blue-300 animate-bounce delay-300" />
                </span>
                <span className="text-blue-800/70">Thinking…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-blue-200 bg-white/70 px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-2xl bg-white border border-blue-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/70 focus:border-transparent"
              placeholder='Type your message here (e.g., "Start")...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium bg-[#2A5AA6] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1f4f96] transition-colors shadow-lg shadow-blue-300/40"
            >
              <span className="mr-1">Send</span>
              <svg className="w-4 h-4 -rotate-45" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3.172 16.828a.75.75 0 0 0 .79.182l12-4.5a.75.75 0 0 0 0-1.39l-12-4.5A.75.75 0 0 0 2.25 7.25L5.9 10 9 10.75a.25.25 0 0 1 0 .5L5.9 12 2.25 14.75a.75.75 0 0 0-.078 2.078z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

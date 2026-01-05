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
  (process.env.NEXT_PUBLIC_API_URL) + "/predict";
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

  useEffect(() => {
    // Update progress based on current step
    const totalSteps = 17; // Total questions/steps
    const stepOrder: Step[] = [
      "welcome", "softSkills", "techSkills", "semester", "gpa", "english",
      "oceanO", "oceanC", "oceanE", "oceanA", "oceanN",
      "riaR", "riaI", "riaA", "riaS", "riaE", "riaC"
    ];
    const currentIndex = stepOrder.indexOf(step);
    const newProgress = currentIndex >= 0 ? Math.round((currentIndex / totalSteps) * 100) : 0;
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
    setProgress(0)
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
      if (lower === "start" || lower === '"start"') {
        setStep("softSkills");
        setCurrentQuestionNumber(1);
        addBotMessage(
          "🚀 **Let's begin your career assessment!**\n\n" +
          "📝 **Question 1 of 17: Soft Skills**\n" +
          "List your top soft skills ( communication, teamwork, leadership, etc.)"
        );
      } else {
        addBotMessage('Type **"start"** when you\'re ready to begin your assessment.');
      }
      return;
    }

    if (step === "softSkills") {
      setSoftSkills(userText);
      setStep("techSkills");
      addBotMessage(
        "✅ **Soft skills recorded!**\n\n" +
        "🛠️ **Question 2 of 17: Technical Skills**\n" +
        "List your technical skills (Python, Java, React, etc.)"
      );
      return;
    }

    if (step === "techSkills") {
      setTechSkills(userText);
      setStep("semester");
      setCurrentQuestionNumber(3);
      addBotMessage(
        "✅ **Technical skills recorded!**\n\n" +
        "📚 **Question 3 of 17: Current Semester**\n" +
        "What semester are you currently in? (e.g., 2Y1S,1Y2S)");
      return;
    }

    if (step === "semester") {
      setSemester(userText);
      setStep("gpa");
      setCurrentQuestionNumber(4);
      addBotMessage(
        "✅ **Semester recorded!**\n\n" +
        "🎓 **Question 4 of 17: GPA**\n" +
        "What is your current GPA? (0.0 - 4.0 scale)"
      ); return;
    }

    if (step === "gpa") {
      const gpaValue = parseFloat(userText);
      if (Number.isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4) {
        addBotMessage("Please enter a valid GPA between 0.0 and 4.0.");
        return;
      }
      setGpa(gpaValue);
      setStep("english");
      setCurrentQuestionNumber(5);
      addBotMessage(
        "✅ **GPA recorded!**\n\n" +
        "🌐 **Question 5 of 17: English Proficiency**\n" +
        "Enter your English score (0 - 100 scale)"
      ); return;
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
      setCurrentQuestionNumber(10);
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
        console.log("Payload", payload)
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();
        const top1 = data.top_1_prediction;
        const top3 = data.top_3_predictions;

        addBotMessage(
          `🎉 **Career Prediction Complete!**\n\n` +
          `🏆 **Best Model Prediction:**\n` +
          `## ${top1}\n\n` +
          `📌 **Top-3 Suggested Careers:**\n` +
          `${top3.map((c: string, i: number) => `${i + 1}. ${c}`).join("\n")}\n\n` +
          `💡 **This recommendation is based on skills, personality (OCEAN), and interests (RIASEC).**
          ✅ **Why this fits you (Data Science & Analytics):**\n
          • **Recommended GPA:** 3.0+\n 
          • **Key technical skills:** Python, SQL, Statistics, Pandas, Machine Learning\n 
          • **Tools:** Jupyter, Power BI / Tableau (any one)\n 
          • **Soft skills:** Critical thinking, Communication\n 
          • **Next step:** Do 1 ML project + dashboard and upload to GitHub
          `
        );


        addBotMessage(
          `🔄 **Take another assessment?**\n` +
          `Type **"start"** to begin again with different responses.`
        );
        resetAll();
      } catch (error) {
        console.error(error);
        addBotMessage(
          "❌ **Service Temporarily Unavailable**\n" +
          "Our prediction engine is currently updating. Please try again in a few minutes."
        ); resetAll();
      } finally {
        setIsThinking(false);
      }
      return;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-6xl h-[90vh] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-200/30 flex flex-col overflow-hidden border border-slate-200">
        {/* Enhanced Header */}
        <header className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">CareerPath AI</h1>
                <p className="text-sm text-blue-100/80 font-medium">Intelligent Career Assessment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></div>
                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse absolute inset-0 opacity-50"></div>
              </div>
              <span className="text-sm font-medium text-white">Live Assessment</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white font-medium">Progress</span>
              <span className="text-white font-semibold">{currentQuestionNumber}/17 • {progress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-6 bg-gradient-to-b from-slate-50/50 to-white">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                {!isUser && (
                  <div className="shrink-0 mr-3 mt-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-blue-600 flex items-center justify-center text-white shadow-md">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                )}

                <div className={`max-w-[85%] ${isUser ? "order-2" : "order-1"}`}>

                  <div
                    className={`
                      relative rounded-2xl px-5 py-4 leading-relaxed whitespace-pre-wrap
                      shadow-sm border
                      ${isUser
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500/30 rounded-br-md"
                        : "bg-white text-slate-800 border-slate-200 rounded-bl-md"
                      }
                    `}
                  >
                    {/* Message triangle */}
                    <div className={`
                      absolute top-4 w-3 h-3 transform rotate-45
                      ${isUser
                        ? "-right-1 bg-gradient-to-r from-blue-600 to-blue-700 border-r border-b border-blue-500/30"
                        : "-left-1 bg-white border-l border-t border-slate-200"
                      }
                    `}></div>

                    <div className="space-y-2">
                      {msg.text.split('\n').map((line, idx) => {
                        if (line.startsWith('## ')) {
                          return <h2 key={idx} className={`text-lg font-bold ${isUser ? 'text-white' : 'text-blue-700'} mt-2`}>{line.replace('## ', '')}</h2>;
                        }
                        if (line.startsWith('• ')) {
                          return <div key={idx} className="flex items-start">
                            <span className={`mr-2 ${isUser ? 'text-blue-200' : 'text-blue-500'}`}>•</span>
                            <span className={isUser ? 'text-blue-100' : 'text-slate-700'}>{line.slice(2)}</span>
                          </div>;
                        }
                        if (line.includes('**') && line.includes('**')) {
                          const parts = line.split('**');
                          return <p key={idx} className={`font-normal ${isUser ? 'text-blue-100' : 'text-slate-700'}`}>
                            {parts.map((part, i) =>
                              i % 2 === 1 ?
                                <strong key={i} className={`font-bold ${isUser ? 'text-white' : 'text-slate-900'}`}>{part}</strong> :
                                <span key={i}>{part}</span>
                            )}
                          </p>;
                        }
                        if (line.startsWith('1️⃣') || line.startsWith('2️⃣') || line.startsWith('3️⃣') || line.startsWith('4️⃣') || line.startsWith('5️⃣')) {
                          return <div key={idx} className="flex items-center space-x-2">
                            <span className={isUser ? 'text-blue-200' : 'text-blue-600'}>{line.charAt(0)}</span>
                            <span className={isUser ? 'text-blue-100' : 'text-slate-700'}>{line.slice(2)}</span>
                          </div>;
                        }
                        return <p key={idx} className={`font-normal ${isUser ? 'text-blue-100' : 'text-slate-700'}`}>{line}</p>;
                      })}
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-opacity-20">
                      <span className={`text-xs ${isUser ? 'text-blue-200/70' : 'text-slate-500'}`}>
                        {isUser ? "You" : "Career Advisor"}
                      </span>
                      <span className={`text-xs ${isUser ? 'text-blue-200/50' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                {isUser && (
                  <div className="shrink-0 ml-3 mt-1 order-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-blue-700 shadow-md">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="flex items-start animate-fade-in">
              <div className="shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-blue-600 flex items-center justify-center text-white shadow-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-300"></div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-800">Processing your assessment</span>
                    <p className="text-xs text-slate-500 mt-0.5">Analyzing responses and predicting career path...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input Area */}
        <form onSubmit={handleSubmit} className="border-t border-slate-100 bg-gradient-to-t from-white to-slate-50/50 px-4 py-3">
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
              className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98]"            >
               <span className="mr-2 font-bold">Send</span>
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
          <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
    </main>
  );
  
}
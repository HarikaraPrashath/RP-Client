"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

type Sender = "user" | "bot";

type Step = "welcome" | "softSkills" | "techSkills" | "semester" | "gpa";

interface Message {
  id: number;
  sender: Sender;
  text: string;
  timestamp: string;
}

const API_URL = "http://127.0.0.1:8000/predict"; // <- FastAPI backend

export default function CareerGuide() {
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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userText = input.trim();
    const lower = userText.toLowerCase();

    // add user message
    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // conversation logic
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
        "Got it! 📚\n3) What is your current semester? (e.g., 1st, 2nd, 3rd, 4th)"
      );
      return;
    }

    if (step === "semester") {
      setSemester(userText);
      setStep("gpa");
      addBotMessage(
        "Thanks! 🎓\n4) Finally, what is your current GPA? (e.g., 3.5)"
      );
      return;
    }

    if (step === "gpa") {
      const gpaValue = parseFloat(userText);

      if (Number.isNaN(gpaValue)) {
        addBotMessage(
          "Please enter a valid GPA as a number, e.g., 3.5."
        );
        return;
      }

      // now call backend
      setIsThinking(true);

      const payload = {
        Soft_Skills: softSkills,
        Key_Skils: techSkills, // must match FastAPI model field name
        Current_semester: semester,
        GPA: gpaValue,
      };

      try {
        addBotMessage("Awesome! 🔍 Let me analyze your profile and predict a suitable career path...");

        const res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await res.json();
        const career = data.predicted_career ?? "Unknown";

        addBotMessage(
          `Based on your profile, a suitable career path for you is: ${career}.`
        );
        addBotMessage(
          'If you want to try again with different skills, type "Start".'
        );

        // reset to welcome state for next run
        setStep("welcome");
        setSoftSkills("");
        setTechSkills("");
        setSemester("");
      } catch (error) {
        console.error(error);
        addBotMessage(
          "Sorry, something went wrong while predicting your career. Please try again later."
        );
        setStep("welcome");
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
              <p className="text-xs text-blue-700/70">
                Career prediction assistant
              </p>
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
                className={`flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {/* Bot avatar (machine image) */}
                {!isUser && (
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-blue-200 shadow-sm overflow-hidden">
                      {/* Put your robot/machine image in /public/robot.png */}
                      <img
                        src="/logo.png"
                        alt="Bot"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Bubble */}
                <div className={`max-w-[85%] md:max-w-[70%] ${isUser ? "order-1" : ""}`}>
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
                    {/* Bubble tail */}
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

                {/* Optional user avatar */}
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
              <svg
                className="w-4 h-4 -rotate-45"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3.172 16.828a.75.75 0 0 0 .79.182l12-4.5a.75.75 0 0 0 0-1.39l-12-4.5A.75.75 0 0 0 2.25 7.25L5.9 10 9 10.75a.25.25 0 0 1 0 .5L5.9 12 2.25 14.75a.75.75 0 0 0-.078 2.078z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </main>
  );


}

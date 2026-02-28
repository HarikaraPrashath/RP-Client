import { RefObject } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

interface ChatAreaProps {
  messages: Message[];
  isThinking: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function ChatArea({
  messages,
  isThinking,
  messagesEndRef,
}: ChatAreaProps) {
  return (
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            )}

            <div className={`max-w-[85%] ${isUser ? "order-2" : "order-1"}`}>
              <div
                className={`
                  relative rounded-2xl px-5 py-4 leading-relaxed
                  shadow-sm border
                  ${isUser
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500/30 rounded-br-md"
                    : "bg-white text-slate-800 border-slate-200 rounded-bl-md"
                  }
                `}
              >
                {/* ✅ Markdown Content */}
                <div className={isUser ? "text-blue-100" : "text-slate-700"}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // keep spacing nice
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      li: ({ children }) => <li className="ml-5 list-disc">{children}</li>,
                      h2: ({ children }) => <h2 className="text-lg font-bold mt-2 mb-2">{children}</h2>,
                      strong: ({ children }) => (
                        <strong className={isUser ? "text-white font-bold" : "text-slate-900 font-bold"}>
                          {children}
                        </strong>
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>

                {/* Footer */}
                <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-opacity-20">
                  <span className={`text-xs ${isUser ? "text-blue-200/70" : "text-slate-500"}`}>
                    {isUser ? "You" : "Career Advisor"}
                  </span>
                  <span className={`text-xs ${isUser ? "text-blue-200/50" : "text-slate-400"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Thinking Indicator */}
      {isThinking && (
        <div className="flex items-start">
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
            <span className="text-sm font-semibold text-slate-800">
              Processing your assessment...
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
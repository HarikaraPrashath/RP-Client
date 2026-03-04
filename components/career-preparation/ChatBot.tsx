'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface ChatBotProps {
  selectedRole?: string;
}

const roleSpecificPrompts: Record<string, string[]> = {
  'data-science': [
    'What skills do I need for data science internships?',
    'How do I build a data science portfolio?',
    'What certifications help for data science roles?',
  ],
  'cybersecurity': [
    'What cybersecurity certifications should I get?',
    'How do I start a career in cybersecurity?',
    'What skills are needed for security analyst roles?',
  ],
  'web-development': [
    'What frontend frameworks should I learn?',
    'How do I build a full-stack portfolio?',
    'What are the best practices for web development?',
  ],
  'ai-engineering': [
    'What ML frameworks should I learn?',
    'How do I get started with AI engineering?',
    'What math skills do I need for AI?',
  ],
};

const defaultPrompts = [
  'How do I prepare for tech internships?',
  'What should I include in my resume?',
  'How do I improve my technical skills?',
  'What are common interview questions?',
];

export default function ChatBot({ selectedRole = 'data-science' }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I'm your Career Preparation AI Assistant. I can help you with:\n\n• Internship preparation guidance\n• Skill development recommendations\n• Resume and portfolio tips\n• Interview preparation\n• Career path advice\n\nWhat would you like to know about preparing for your career?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateBotResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('internship') || lowerMessage.includes('prepare')) {
      return `**Internship Preparation Tips:**

1. **Technical Skills**
   • Focus on core technologies for your field
   • Build practical projects
   • Practice coding challenges on LeetCode/HackerRank

2. **Portfolio**
   • Create a GitHub profile with quality projects
   • Document your work with README files
   • Include live demos when possible

3. **Resume**
   • Tailor it for each application
   • Highlight relevant projects and skills
   • Keep it concise (1 page for students)

4. **Interview Prep**
   • Practice behavioral questions (STAR method)
   • Review technical concepts
   • Prepare questions for the interviewer

Would you like more specific advice on any of these areas?`;
    }
    
    if (lowerMessage.includes('skill') || lowerMessage.includes('learn')) {
      return `**Essential Skills for ${selectedRole.replace('-', ' ').toUpperCase()}:**

**Technical Skills:**
• Programming languages relevant to your field
• Frameworks and tools used in industry
• Version control (Git/GitHub)
• Database management

**Soft Skills:**
• Communication and teamwork
• Problem-solving abilities
• Time management
• Adaptability and continuous learning

**Recommended Learning Path:**
1. Master fundamentals first
2. Build projects to apply knowledge
3. Contribute to open source
4. Participate in hackathons

Would you like a personalized roadmap for your specific career path?`;
    }
    
    if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
      return `**Resume Best Practices:**

**Structure:**
• Contact information (LinkedIn, GitHub)
• Education (GPA if above 3.0)
• Technical skills section
• Projects (with links!)
• Experience (internships, part-time jobs)
• Extracurricular activities

**Tips:**
✓ Use action verbs (Developed, Created, Implemented)
✓ Quantify achievements when possible
✓ Keep formatting clean and consistent
✓ Tailor for each job application
✓ Proofread carefully

**Common Mistakes to Avoid:**
✗ Including irrelevant information
✗ Using unprofessional email addresses
✗ Making it too long (keep to 1 page)
✗ Generic objective statements

Would you like tips on creating a standout portfolio as well?`;
    }
    
    if (lowerMessage.includes('interview')) {
      return `**Interview Preparation Guide:**

**Technical Interviews:**
• Practice data structures and algorithms
• Review system design basics
• Prepare to explain your projects in detail
• Use the STAR method for behavioral questions

**Common Questions:**
1. "Tell me about yourself" - Keep it professional, focus on relevant experience
2. "Why this company?" - Research the company thoroughly
3. "Describe a challenging project" - Show problem-solving skills
4. "Where do you see yourself in 5 years?" - Show ambition but be realistic

**Tips:**
• Prepare thoughtful questions to ask
• Practice with mock interviews
• Dress appropriately (even for video interviews)
• Send a thank-you email within 24 hours

Would you like specific tips for technical interviews in your field?`;
    }
    
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('project')) {
      return `**Building a Strong Portfolio:**

**Key Elements:**
• 3-4 quality projects that showcase different skills
• Clear project descriptions with your role
• Live demos or video walkthroughs
• Clean, readable code on GitHub
• Documentation explaining your approach

**Project Ideas by Field:**

**Data Science:**
• Data analysis with real datasets
• Machine learning models with predictions
• Interactive visualizations

**Web Development:**
• Full-stack applications
• Responsive web designs
• API integrations

**Cybersecurity:**
• Security analysis reports
• Vulnerability assessments
• Network security projects

**AI Engineering:**
• Neural network implementations
• NLP or computer vision projects
• AI-powered applications

Would you like suggestions for starter projects?`;
    }

    return `Thank you for your question! Here's some general career advice:

**Career Development Tips:**

1. **Continuous Learning**
   • Stay updated with industry trends
   • Take online courses (Coursera, Udemy, freeCodeCamp)
   • Read technical blogs and documentation

2. **Networking**
   • Join professional communities
   • Attend tech meetups and conferences
   • Connect with professionals on LinkedIn

3. **Practical Experience**
   • Work on personal projects
   • Contribute to open source
   • Participate in coding competitions

4. **Soft Skills Development**
   • Improve communication skills
   • Practice teamwork through group projects
   • Develop problem-solving abilities

Is there a specific aspect of career preparation you'd like to explore further?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(async () => {
      const botResponse = await generateBotResponse(userMessage.text);
      const botMessage: Message = {
        id: messages.length + 2,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handlePromptClick = (prompt: string) => {
    setInputMessage(prompt);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const prompts = roleSpecificPrompts[selectedRole] || defaultPrompts;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  Career AI Assistant
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </h3>
                <p className="text-blue-100 text-xs">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-md'
                        : 'bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-200'
                    } px-4 py-3 shadow-sm`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'bot' ? (
                        <Bot className="w-4 h-4 text-blue-600" />
                      ) : (
                        <User className="w-4 h-4 text-blue-200" />
                      )}
                      <span className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.sender === 'bot' ? 'Career AI' : 'You'}
                      </span>
                    </div>
                    <div className={`text-sm whitespace-pre-line ${message.sender === 'user' ? 'text-white' : 'text-gray-700'}`}>
                      {message.text}
                    </div>
                    <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-blue-600" />
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Prompts */}
          {messages.length < 3 && (
            <div className="px-4 py-2 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {prompts.slice(0, 3).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4"
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

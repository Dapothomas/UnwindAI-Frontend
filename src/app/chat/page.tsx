"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Star = { cx: number; cy: number; r: number; delay: number };

type Message = {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
};

export default function ChatPage() {
  const [stars, setStars] = useState<Star[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const generatedStars = Array.from({ length: 60 }, () => ({
      cx: Math.random() * 1600,
      cy: Math.random() * 600,
      r: Math.random() * 1.2 + 0.4,
      delay: Math.random() * 4,
    }));
    setStars(generatedStars);

    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      // Send to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: data.response || "I'm here to help you. How are you feeling?",
        sender: "ai",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        sender: "ai",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#181c2a] via-[#232946] to-[#1a2233] relative overflow-hidden">
      {/* Fixed Stars Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0 w-full h-full">
          <defs>
            <radialGradient id="star-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
          {stars.map((star, i) => (
            <circle
              key={i}
              cx={star.cx}
              cy={star.cy}
              r={star.r}
              fill="url(#star-glow)"
              style={{ opacity: 0.7, animation: `twinkle 2.5s infinite ${star.delay}s alternate` }}
            />
          ))}
        </svg>
      </div>

      {/* Fixed Header */}
      <div className="relative z-10 bg-white/5 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-center">
          <h1 className="text-white text-lg font-semibold">UnwindAI</h1>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 relative z-10 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <div className="text-center">
              <div className="mb-6">
                <svg width="80" height="40" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                  <ellipse cx="60" cy="40" rx="50" ry="15" fill="#3b3f5c" fillOpacity="0.7"/>
                  <ellipse cx="40" cy="25" rx="15" ry="5" fill="#4f5d75" fillOpacity="0.6"/>
                  <ellipse cx="80" cy="30" rx="18" ry="7" fill="#6c63ff" fillOpacity="0.5"/>
                  <circle cx="100" cy="18" r="12" fill="#fffbe6" fillOpacity="0.95" />
                  <ellipse cx="90" cy="22" rx="8" ry="3" fill="#fff" fillOpacity="0.4" />
                </svg>
              </div>
              <p className="text-xl text-white mb-2">Start a conversation with your AI therapist</p>
              <p className="text-indigo-300">How are you feeling today?</p>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-white/10 text-white backdrop-blur-sm"
                  }`}
                >
                  <p className="text-[16px] leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-sm text-white rounded-2xl px-4 py-3 max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Connected to Messages */}
      <div className="relative z-10 bg-white/5 backdrop-blur-md border-t border-white/10 px-4 py-4">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message UnwindAI..."
              className="w-full rounded-2xl px-4 py-3 bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
              style={{ fontSize: '16px' }}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-2xl transition-all ${
              input.trim() && !isLoading
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-white/10 text-gray-400 cursor-not-allowed"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>

      <style jsx global>{`
        @keyframes twinkle {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Ensure no body scroll */
        html, body {
          overflow: hidden;
          height: 100%;
          margin: 0;
          padding: 0;
        }
        
        #__next {
          height: 100%;
        }
      `}</style>
    </div>
  );
} 
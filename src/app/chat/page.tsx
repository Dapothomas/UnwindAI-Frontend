"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Star = { cx: number; cy: number; r: number; delay: number };

type Message = {
  id: number;
  user_id: string;
  session_id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
};

type ChatSession = {
  id: number;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message: string | null;
};

export default function ChatPage() {
  const [stars, setStars] = useState<Star[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
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
      } else {
        // Load chat sessions
        await fetchSessions();
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const fetchSessions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.log('No access token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSessions(data);
      
      // If no current session and sessions exist, select the first one
      if (!currentSessionId && data.length > 0) {
        setCurrentSessionId(data[0].id);
        await fetchMessages(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    }
  };

  const fetchMessages = async (sessionId: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const createNewSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Chat'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newSession = await response.json();
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const selectSession = async (sessionId: number) => {
    setCurrentSessionId(sessionId);
    await fetchMessages(sessionId);
    setSidebarOpen(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentSessionId) return;

    const messageText = input.trim();
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    let userMessage: Message | null = null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      // Add user message immediately
      userMessage = {
        id: Date.now(),
        user_id: session.user.id,
        session_id: currentSessionId,
        text: messageText,
        sender: "user" as const,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage!]);
      scrollToBottom();

      // Send to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: messageText,
          sender: 'user',
          session_id: currentSessionId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aiMessage = await response.json();
      
      // Replace the temporary user message and add AI response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== userMessage!.id);
        return [...filtered, userMessage!, aiMessage];
      });
      
      scrollToBottom();
      
      // Refresh sessions to update last message and timestamp
      await fetchSessions();
    } catch (error) {
      console.error('Error sending message:', error);
      if (userMessage) {
        setMessages(prev => prev.filter(msg => msg.id !== userMessage!.id));
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <main className="relative h-screen w-full bg-gradient-to-b from-[#181c2a] via-[#232946] to-[#1a2233] flex overflow-hidden font-sans">
      {/* Animated stars background - FIXED */}
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

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile unless opened */}
      <div className={`relative z-30 bg-white/5 backdrop-blur-sm border-r border-white/10 transition-all duration-300 ${
        sidebarOpen ? 'w-80' : 'w-0 md:w-16'
      } ${sidebarOpen ? 'fixed md:relative inset-y-0 left-0' : 'hidden md:block'}`}>
        <div className="p-4 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {sidebarOpen && (
              <button
                onClick={createNewSession}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Chat
              </button>
            )}
          </div>

          {/* Chat Sessions List */}
          {sidebarOpen && (
            <div className="flex-1 overflow-y-auto space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => selectSession(session.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    currentSessionId === session.id
                      ? 'bg-indigo-600/20 border border-indigo-500/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-white font-medium text-sm truncate mb-1">
                    {session.title}
                  </div>
                  {session.last_message && (
                    <div className="text-gray-400 text-xs truncate mb-1">
                      {session.last_message}
                    </div>
                  )}
                  <div className="text-gray-500 text-xs">
                    {formatTime(session.updated_at)} • {session.message_count} messages
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
            <div className="flex-1 flex flex-col absolute z-10">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">

          <div className="flex items-center justify-between">
            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors md:hidden"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo/Title */}
            <div className="flex items-center justify-center flex-1 md:flex-none">
              <svg width="60" height="30" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="60" cy="40" rx="50" ry="15" fill="#3b3f5c" fillOpacity="0.7"/>
                <ellipse cx="40" cy="25" rx="15" ry="5" fill="#4f5d75" fillOpacity="0.6"/>
                <ellipse cx="80" cy="30" rx="18" ry="7" fill="#6c63ff" fillOpacity="0.5"/>
                <circle cx="100" cy="18" r="12" fill="#fffbe6" fillOpacity="0.95" />
                <ellipse cx="90" cy="22" rx="8" ry="3" fill="#fff" fillOpacity="0.4" />
              </svg>
            </div>

            {/* Mobile New Chat Button */}
            <button
              onClick={createNewSession}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors md:hidden"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Desktop spacing */}
            <div className="hidden md:block w-10"></div>
          </div>
        </div>

        {/* Chat Messages - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto">
          {!currentSessionId ? (
            <div className="flex justify-center items-center h-full text-indigo-200">
              <div className="text-center px-4">
                <p className="mb-4 text-lg">Welcome to UnwindAI</p>
                <p className="mb-6 text-sm text-indigo-300">Your AI therapy companion</p>
                <button
                  onClick={createNewSession}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-indigo-200 px-4">
              <div className="text-center">
                <p className="text-lg">Start a conversation with your AI therapist</p>
                <p className="text-sm text-indigo-300 mt-2">How are you feeling today?</p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.sender}-${message.timestamp}-${index}`}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-white rounded-lg p-3 max-w-[85%] md:max-w-[70%]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Message Input - FIXED */}
        {currentSessionId && (
          <div className="sticky bottom-0 z-20 p-4 pb-6 md:pb-4 border-t border-white/10 bg-white/5 backdrop-blur-sm safe-area-bottom">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-2xl px-4 py-3 bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                style={{ fontSize: '16px' }}
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold rounded-2xl px-4 md:px-6 py-3 transition text-sm md:text-base ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes twinkle {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        /* Custom scrollbar for chat messages */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        .safe-area-bottom {
          padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
        }
        @media (min-width: 768px) {
          .safe-area-bottom {
            padding-bottom: 1rem;
          }
        }
        /* Ensure body and html don't scroll */
        html, body {
          overflow: hidden;
          height: 100%;
        }
        /* Reset for the app */
        #__next {
          height: 100%;
        }
      `}</style>
    </main>
  );
} 
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Star = { cx: number; cy: number; r: number; delay: number };

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [stars, setStars] = useState<Star[]>([]);
  const router = useRouter();

  useEffect(() => {
    const generatedStars = Array.from({ length: 40 }, () => ({
      cx: Math.random() * 1600,
      cy: Math.random() * 600,
      r: Math.random() * 1.2 + 0.4,
      delay: Math.random() * 4,
    }));
    setStars(generatedStars);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push("/chat");
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-b from-[#181c2a] via-[#232946] to-[#1a2233] flex flex-col items-center overflow-x-hidden font-sans">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0 w-full h-full" style={{ minHeight: 600 }}>
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
      <section className="relative z-10 flex flex-col items-center justify-center pt-16 md:pt-24 pb-8 md:pb-12 w-full px-4 animate-fadein min-h-screen">
        <div className="mb-6 md:mb-8">
          <svg width="100" height="50" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-[120px] md:h-[60px]">
            <ellipse cx="60" cy="40" rx="50" ry="15" fill="#3b3f5c" fillOpacity="0.7"/>
            <ellipse cx="40" cy="25" rx="15" ry="5" fill="#4f5d75" fillOpacity="0.6"/>
            <ellipse cx="80" cy="30" rx="18" ry="7" fill="#6c63ff" fillOpacity="0.5"/>
            <circle cx="100" cy="18" r="12" fill="#fffbe6" fillOpacity="0.95" />
            <ellipse cx="90" cy="22" rx="8" ry="3" fill="#fff" fillOpacity="0.4" />
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 md:mb-4 tracking-tight text-center" style={{ fontFamily: 'var(--font-poppins)' }}>Sign In</h1>
        <div className="w-full max-w-sm md:max-w-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" style={{ fontFamily: 'var(--font-poppins)' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="border border-white/20 bg-white/20 text-white placeholder-gray-300 rounded-xl px-4 py-3 md:py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base transition-all"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="border border-white/20 bg-white/20 text-white placeholder-gray-300 rounded-xl px-4 py-3 md:py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base transition-all"
            />
            <button 
              type="submit" 
              className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold rounded-xl py-3 md:py-3.5 text-base md:text-lg shadow-lg transition-all mt-2 active:scale-95"
            >
              Sign In
            </button>
            {error && <div className="text-red-400 text-center text-sm md:text-base bg-red-500/10 rounded-lg p-3 border border-red-500/20">{error}</div>}
          </form>
        </div>
        <p className="text-indigo-200 mt-6 text-center text-sm md:text-base" style={{ fontFamily: 'var(--font-poppins)' }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" className="underline hover:text-indigo-100 font-medium">Sign up</a>
        </p>
      </section>
      <style jsx global>{`
        @keyframes twinkle {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein {
          animation: fadein 1.2s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </main>
  );
} 
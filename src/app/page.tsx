"use client";

export default function LandingPage() {
  // Generate star positions and animation delays for twinkling
  const stars = Array.from({ length: 80 }, () => ({
    cx: Math.random() * 1600,
    cy: Math.random() * 600,
    r: Math.random() * 1.2 + 0.4,
    delay: Math.random() * 4,
  }));
  // Shooting stars
  const shootingStars = Array.from({ length: 3 }, () => ({
    x: Math.random() * 1400 + 100,
    y: Math.random() * 200 + 50,
    delay: Math.random() * 8,
  }));

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-b from-[#181c2a] via-[#232946] to-[#1a2233] flex flex-col items-center overflow-x-hidden font-sans">
      {/* Animated gradient overlay for extra depth */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-blue-900/40 animate-gradient-move" />
      </div>
      {/* Night sky with animated twinkling stars and shooting stars */}
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
              style={{
                opacity: 0.7,
                animation: `twinkle 2.5s infinite ${star.delay}s alternate`,
              }}
            />
          ))}
          {/* Shooting stars */}
          {shootingStars.map((s, i) => (
            <g key={i} style={{ animation: `shoot 8s linear ${s.delay}s infinite` }}>
              <rect x={s.x} y={s.y} width="2" height="60" rx="1" fill="#fff" fillOpacity="0.7" />
              <rect x={s.x} y={s.y + 40} width="2" height="20" rx="1" fill="#fff" fillOpacity="0.3" />
            </g>
          ))}
        </svg>
      </div>
      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-16 md:pt-32 pb-12 md:pb-20 w-full px-4 animate-fadein">
        <div className="mb-6 md:mb-8">
          {/* Beautiful moon and clouds illustration - responsive sizing */}
          <svg width="280" height="140" viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-[360px] md:h-[180px]">
            <ellipse cx="180" cy="120" rx="150" ry="40" fill="#3b3f5c" fillOpacity="0.7"/>
            <ellipse cx="100" cy="80" rx="40" ry="15" fill="#4f5d75" fillOpacity="0.6"/>
            <ellipse cx="240" cy="100" rx="50" ry="18" fill="#6c63ff" fillOpacity="0.5"/>
            {/* Moon */}
            <circle cx="270" cy="60" r="28" fill="#fffbe6" fillOpacity="0.95" />
            <circle cx="278" cy="54" r="6" fill="#f6e7b4" fillOpacity="0.5" />
            {/* Clouds */}
            <ellipse cx="220" cy="70" rx="18" ry="7" fill="#fff" fillOpacity="0.5" />
            <ellipse cx="250" cy="80" rx="14" ry="5" fill="#fff" fillOpacity="0.3" />
          </svg>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-3 md:mb-4 drop-shadow-lg animate-text-glow text-center tracking-tight px-2" style={{ fontFamily: 'var(--font-poppins)' }}>
          <span className="inline-block animate-headline">Unwind AI</span>
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl text-indigo-200 mb-4 md:mb-6 font-semibold animate-fadein-slow text-center px-4" style={{ fontFamily: 'var(--font-poppins)' }}>
          Your Serene AI Therapist Under the Stars
        </h2>
        <p className="text-gray-300 text-center mb-6 md:mb-8 max-w-2xl text-base md:text-lg animate-fadein-slow px-4 leading-relaxed" style={{ fontFamily: 'var(--font-poppins)' }}>
          Step into a tranquil night sky and let your thoughts drift. Unwind AI is your private, always-available AI therapist, ready to listen and support you on your journey to peace of mind.
        </p>
        <a
          href="/signup"
          className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3 px-8 md:px-10 rounded-full text-base md:text-lg shadow-xl transition mb-3 animate-bounce-slow mx-4"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          Get Started
        </a>
        <p className="text-indigo-200 px-4 text-center" style={{ fontFamily: 'var(--font-poppins)' }}>
          Already have an account?{' '}
          <a href="/signin" className="underline hover:text-indigo-100">Sign In</a>
        </p>
      </section>
      {/* Features Section */}
      <section className="relative z-10 w-full max-w-4xl px-4 md:px-6 py-8 md:py-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 animate-fadein-slow">
        <div className="bg-[#232946]/80 rounded-2xl p-5 md:p-6 shadow-lg flex flex-col items-center text-center">
          <span className="text-3xl md:text-4xl mb-3">🌙</span>
          <h3 className="text-lg md:text-xl text-white font-bold mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>Always Available</h3>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed" style={{ fontFamily: 'var(--font-poppins)' }}>Chat with your AI therapist any time, day or night, in a safe and private space.</p>
        </div>
        <div className="bg-[#232946]/80 rounded-2xl p-5 md:p-6 shadow-lg flex flex-col items-center text-center">
          <span className="text-3xl md:text-4xl mb-3">🧘‍♂️</span>
          <h3 className="text-lg md:text-xl text-white font-bold mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>Calming Experience</h3>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed" style={{ fontFamily: 'var(--font-poppins)' }}>A serene, night-inspired interface designed to help you relax and open up.</p>
        </div>
        <div className="bg-[#232946]/80 rounded-2xl p-5 md:p-6 shadow-lg flex flex-col items-center text-center">
          <span className="text-3xl md:text-4xl mb-3">🔒</span>
          <h3 className="text-lg md:text-xl text-white font-bold mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>Private & Secure</h3>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed" style={{ fontFamily: 'var(--font-poppins)' }}>Your conversations are confidential and protected with strong security.</p>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="relative z-10 w-full max-w-3xl px-4 md:px-6 py-8 md:py-12 animate-fadein-slow">
        <h3 className="text-xl md:text-2xl text-white font-bold mb-4 md:mb-6 text-center" style={{ fontFamily: 'var(--font-poppins)' }}>How It Works</h3>
        <ol className="space-y-4 md:space-y-6 text-gray-200 text-base md:text-lg" style={{ fontFamily: 'var(--font-poppins)' }}>
          <li className="leading-relaxed"><span className="font-bold text-indigo-200">1.</span> Sign up and create your secure account.</li>
          <li className="leading-relaxed"><span className="font-bold text-indigo-200">2.</span> Start a conversation with your AI therapist any time.</li>
          <li className="leading-relaxed"><span className="font-bold text-indigo-200">3.</span> Receive thoughtful, supportive responses and guidance.</li>
        </ol>
      </section>
      {/* Footer */}
      <footer className="relative z-10 w-full text-center text-gray-500 text-xs md:text-sm py-6 md:py-8 px-4 animate-fadein-slow" style={{ fontFamily: 'var(--font-poppins)' }}>
        &copy; {new Date().getFullYear()} Unwind AI. All rights reserved.
      </footer>
      {/* Animations */}
      <style jsx global>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein {
          animation: fadein 1.2s cubic-bezier(0.4,0,0.2,1) both;
        }
        .animate-fadein-slow {
          animation: fadein 2.2s cubic-bezier(0.4,0,0.2,1) both;
        }
        .animate-bounce-slow {
          animation: bounce 2.5s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes textglow {
          0%, 100% { text-shadow: 0 0 16px #6c63ff, 0 0 2px #fff; }
          50% { text-shadow: 0 0 32px #a5b4fc, 0 0 8px #fff; }
        }
        .animate-text-glow {
          animation: textglow 2.5s infinite alternate;
        }
        @keyframes twinkle {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @keyframes shoot {
          0% { opacity: 0; transform: translateY(0) scaleY(1); }
          5% { opacity: 1; }
          80% { opacity: 1; transform: translateY(120px) scaleY(1.2); }
          100% { opacity: 0; transform: translateY(180px) scaleY(0.8); }
        }
        .animate-headline {
          animation: fadein 1.5s cubic-bezier(0.4,0,0.2,1) both, textglow 2.5s infinite alternate;
        }
        .animate-gradient-move {
          animation: gradientMove 12s ease-in-out infinite alternate;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
    </main>
  );
}

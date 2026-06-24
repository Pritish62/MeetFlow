import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const Landingpage = () => {
  const { token } = useContext(AuthContext);
  const isLoggedIn = Boolean(token);

  return (
    <main className="min-h-[calc(100vh-84px)] px-6 py-11 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>

      <section id="why" className="relative w-full max-w-4xl mx-auto rounded-2xl border border-slate-600 bg-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-2 items-center gap-6 p-8">
        <div className="pr-0 lg:pr-4">
          <h1 className="m-0 text-5xl lg:text-6xl font-black leading-tight text-white">
            Connect with your loved one
          </h1>
          <p className="mt-4 mb-0 max-w-md text-lg leading-relaxed text-slate-300">
            Simple, private, and reliable video calls for every moment that matters.
          </p>

          <NavLink 
            to={isLoggedIn ? "/home" : "/register"} 
            className="inline-flex items-center justify-center mt-8 h-12 px-8 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-cyan-500/40 hover:-translate-y-1 active:translate-y-0 transition-all no-underline"
          >
            {isLoggedIn ? "✨ Join Meeting" : "🚀 Get Started"}
          </NavLink>
        </div>

        {/* Hero SVG */}
        <div className="hidden lg:flex justify-center items-center">
          <svg
            className="w-full h-auto"
            viewBox="0 0 520 420"
            role="img"
            aria-label="Two people connected on a video call"
          >
            <defs>
              <linearGradient id="bgCard" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1f2937" />
                <stop offset="100%" stopColor="#111827" />
              </linearGradient>
              <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            <circle cx="90" cy="70" r="42" fill="rgba(56,189,248,0.18)" />
            <circle cx="430" cy="340" r="56" fill="rgba(59,130,246,0.16)" />

            <rect x="70" y="80" width="380" height="260" rx="24" fill="url(#bgCard)" stroke="#334155" strokeWidth="2" />

            <rect x="95" y="110" width="150" height="190" rx="16" fill="#0f172a" stroke="#334155" />
            <rect x="275" y="110" width="150" height="190" rx="16" fill="#0f172a" stroke="#334155" />

            <circle cx="170" cy="166" r="32" fill="url(#accent)" />
            <rect x="128" y="206" width="84" height="62" rx="30" fill="#1e40af" />

            <circle cx="350" cy="166" r="32" fill="#60a5fa" />
            <rect x="308" y="206" width="84" height="62" rx="30" fill="#1d4ed8" />

            <rect x="220" y="318" width="80" height="8" rx="4" fill="#38bdf8" />
          </svg>
        </div>
      </section>

      {/* Feature sections */}
      <section id="features" className="relative w-full max-w-4xl mx-auto mt-4 rounded-xl border border-slate-600 bg-slate-800/50 px-6 py-4">
        <p className="m-0 text-slate-300 text-sm">
          ⚡ Built for fast and simple meetings.
        </p>
      </section>

      <section id="platforms" className="relative w-full max-w-4xl mx-auto mt-4 rounded-xl border border-slate-600 bg-slate-800/50 px-6 py-4">
        <p className="m-0 text-slate-300 text-sm">
          🌐 Works smoothly on desktop and mobile browsers.
        </p>
      </section>
    </main>
  );
};

export default Landingpage;
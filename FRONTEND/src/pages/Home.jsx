import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import isAuth from "../utils/isAuth";
import joinImage from "../assets/images/join.png";

const Home = () => {
    const [meetingCode, setMeetingCode] = useState("");
    const navigate = useNavigate();

    const buildRandomMeetingCode = () => {
        if (window.crypto?.randomUUID) {
            return window.crypto.randomUUID().split("-")[0];
        }
        return Math.random().toString(36).slice(2, 10);
    };

    const handleJoinSubmit = (event) => {
        event.preventDefault();
        const code = meetingCode.trim();
        if (!code) return;
        navigate(`/${code}`);
    };

    const handleCreateMeeting = () => {
        const code = buildRandomMeetingCode();
        navigate(`/${code}`);
    };

    return (
        <main className="min-h-[calc(100vh-84px)] px-6 py-12 bg-gradient-to-b from-blue-50 to-blue-100 relative overflow-hidden">
            {/* Background decorative circles */}
            <div className="absolute top-20 right-10 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-72 h-72 bg-cyan-200 rounded-full opacity-15 blur-3xl"></div>

            <section className="relative w-full max-w-4xl mx-auto rounded-3xl border border-slate-300 bg-white shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                {/* Left Panel */}
                <div className="px-12 py-14">
                    <p className="m-0 text-xs tracking-widest uppercase font-bold text-blue-600">
                        Quick Join
                    </p>
                    <h1 className="mt-4 mb-3 text-4xl font-black leading-tight text-slate-900">
                        Join a Meeting With Room Code
                    </h1>
                    <p className="m-0 max-w-md text-base leading-relaxed text-slate-600">
                        Enter your meeting code to join instantly
                    </p>

                    <form className="mt-8 grid gap-3" onSubmit={handleJoinSubmit}>
                        <label htmlFor="meeting-code" className="text-sm font-bold text-slate-800">
                            Enter Meeting Code
                        </label>
                        <input
                            id="meeting-code"
                            type="text"
                            value={meetingCode}
                            onChange={(event) => setMeetingCode(event.target.value)}
                            placeholder="e.g. team-sync-4821"
                            className="w-full h-12 rounded-xl border border-slate-300 px-4 text-base text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-200"
                        />

                        <button 
                            type="submit" 
                            className="h-12 border-0 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-base font-bold cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/40 hover:-translate-y-1 active:translate-y-0"
                        >
                            Join Meeting
                        </button>
                        <button
                            type="button"
                            className="h-12 border-2 border-blue-200 rounded-xl bg-blue-50 text-blue-700 text-base font-bold cursor-pointer transition-all hover:border-blue-400 hover:shadow-lg hover:shadow-blue-200/50 hover:-translate-y-1 active:translate-y-0"
                            onClick={handleCreateMeeting}
                        >
                            Create Meeting
                        </button>
                    </form>
                </div>

                {/* Right Panel - Image */}
                <div className="hidden lg:flex bg-gradient-to-br from-blue-50 to-blue-100 items-center justify-center px-8 py-8">
                    <img 
                        src={joinImage} 
                        alt="Join meeting illustration" 
                        className="w-full max-w-sm h-auto object-contain" 
                    />
                </div>
            </section>
        </main>
    )
}

export default isAuth(Home);
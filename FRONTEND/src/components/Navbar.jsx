import { useContext, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from '../assets/images/logo.png';
import AuthContext from "../contexts/AuthContext.jsx";

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(token);
  const isLandingPage = location.pathname === "/";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const handleOpenHistory = () => {
    setIsMenuOpen(false);
    navigate("/history");
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setIsMenuOpen(false);
    }
  }, [isLoggedIn]);

  return (
    <div className={`w-full sticky top-0 z-50 border-b ${
      isLandingPage 
        ? "bg-slate-800 border-slate-600 shadow-lg" 
        : "bg-blue-400 border-blue-300 shadow-lg"
    }`}>
      <nav className="flex items-center justify-between max-w-6xl mx-auto px-6 py-4 gap-5">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
          <span className={`flex items-center justify-center rounded-xl p-1 ${
            isLandingPage 
              ? "bg-white/10 border border-white/20" 
              : "bg-white/40 border border-white/20"
          }`}>
            <img src={logo} alt="MeetFlow logo" className="w-10 h-10 object-contain" />
          </span>
          <h2 className={`text-xl font-bold m-0 ${
            isLandingPage ? "text-white" : "text-slate-900"
          }`}>
            MeetFlow
          </h2>
        </div>

        {/* Desktop Navigation */}
        {!isLoggedIn && (
          <>
            <div className="hidden md:flex gap-8 items-center">
              <a href="#why" className={`text-sm font-semibold transition-colors ${
                isLandingPage 
                  ? "text-white hover:text-cyan-300" 
                  : "text-slate-900 hover:text-blue-600"
              }`}>
                Why MeetFlow?
              </a>
              <a href="#features" className={`text-sm font-semibold transition-colors ${
                isLandingPage 
                  ? "text-white hover:text-cyan-300" 
                  : "text-slate-900 hover:text-blue-600"
              }`}>
                Features
              </a>
              <a href="#platforms" className={`text-sm font-semibold transition-colors ${
                isLandingPage 
                  ? "text-white hover:text-cyan-300" 
                  : "text-slate-900 hover:text-blue-600"
              }`}>
                Platforms
              </a>
            </div>

            <div className="hidden md:flex gap-3 items-center">
              <NavLink 
                to="/guest" 
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition-opacity"
              >
                Join as Guest
              </NavLink>
              <NavLink 
                to="/login" 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isLandingPage 
                    ? "text-white hover:text-cyan-300" 
                    : "text-slate-900 hover:text-blue-600"
                }`}
              >
                Login
              </NavLink>
              <NavLink 
                to="/register" 
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition-opacity"
              >
                Sign Up
              </NavLink>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex gap-2 items-center">
              <NavLink 
                to="/login" 
                className={`px-2 py-1 text-xs font-semibold transition-colors ${
                  isLandingPage 
                    ? "text-white hover:text-cyan-300" 
                    : "text-slate-900 hover:text-blue-600"
                }`}
              >
                Login
              </NavLink>
              <NavLink 
                to="/register" 
                className="px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition-opacity rounded"
              >
                Sign Up
              </NavLink>
            </div>
          </>
        )}

        {/* Logged In Menu */}
        {isLoggedIn && (
          <div className="relative flex items-center ml-auto">
            <button
              type="button"
              className={`w-11 h-11 flex flex-col justify-center items-center gap-1.5 rounded-xl border transition-all ${
                isLandingPage
                  ? "border-white/20 bg-white/10 hover:bg-white/20" 
                  : "border-white/20 bg-white/40 hover:bg-white/50"
              }`}
              aria-label="Open account menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <span className={`w-4 h-0.5 rounded-full transition-all ${
                isLandingPage ? "bg-white" : "bg-slate-900"
              }`}></span>
              <span className={`w-4 h-0.5 rounded-full transition-all ${
                isLandingPage ? "bg-white" : "bg-slate-900"
              }`}></span>
              <span className={`w-4 h-0.5 rounded-full transition-all ${
                isLandingPage ? "bg-white" : "bg-slate-900"
              }`}></span>
            </button>

            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 min-w-56 p-2 rounded-xl border border-white/20 bg-slate-900 shadow-2xl z-50">
                <button 
                  type="button" 
                  className="w-full text-left px-4 py-3 rounded-lg text-slate-200 text-sm font-semibold cursor-pointer hover:bg-blue-500/20 transition-colors"
                  onClick={handleOpenHistory}
                >
                  📞 Call History
                </button>
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 rounded-lg text-red-400 text-sm font-semibold cursor-pointer hover:bg-red-500/20 transition-colors"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;

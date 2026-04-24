import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import styles from "./Landingpage.module.css";

const Landingpage = () => {
  const { token } = useContext(AuthContext);
  const isLoggedIn = Boolean(token);

  return (
    <main className={styles.pageWrap}>
      <section id="why" className={styles.heroSection}>
        <div className={styles.leftSide}>
          <h1 className={styles.title}>Connect with your loved one</h1>
          <p className={styles.slogan}>Simple, private, and reliable video calls for every moment that matters.</p>

          <NavLink to={isLoggedIn ? "/home" : "/register"} className={styles.ctaButton}>
            {isLoggedIn ? "Join Meeting" : "Get Started"}
          </NavLink>
        </div>

        <div className={styles.rightSide}>
          <svg
            className={styles.heroSvg}
            viewBox="0 0 520 420"
            role="img"
            aria-label="Two people connected on a video call">
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

      <section id="features" className={styles.anchorSection}>
        <p>Built for fast and simple meetings.</p>
      </section>

      <section id="platforms" className={styles.anchorSection}>
        <p>Works smoothly on desktop and mobile browsers.</p>
      </section>
    </main>
  );
};

export default Landingpage;
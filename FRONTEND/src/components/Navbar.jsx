import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from '../assets/images/logo.png';
import AuthContext from "../contexts/AuthContext.jsx";

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const isLoggedIn = Boolean(token);
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
    <div className={styles.Navcontainer}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}><img src={logo} alt="MeetFlow logo" /></span>
          <h2>MeetFlow</h2>
        </div>

        {!isLoggedIn && (
          <>
            <div className={styles.navLinks}>
              <a href="#why" className={styles.btn}>Why MeetFlow?</a>
              <a href="#features" className={styles.btn}>Features</a>
              <a href="#platforms" className={styles.btn}>Platforms</a>
            </div>

            <div className={styles.authLinks}>
              <NavLink to="/guest" className={`${styles.btnPrimary} ${styles.joinBtn}`}>Join as Guest</NavLink>
              <NavLink to="/login" className={styles.btn}>Login</NavLink>
              <NavLink to="/register" className={styles.btnPrimary}>Sign Up</NavLink>
            </div>
          </>
        )}

        {isLoggedIn && (
          <div className={styles.loggedInActions}>
            <button
              type="button"
              className={styles.burgerButton}
              aria-label="Open account menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            {isMenuOpen && (
              <div className={styles.menuDropdown}>
                <button type="button" className={styles.dropdownItem} onClick={handleOpenHistory}>Call History</button>
                <button
                  type="button"
                  className={`${styles.dropdownItem} ${styles.dangerItem}`}
                  onClick={handleLogout}
                >
                  Logout
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

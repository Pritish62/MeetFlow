import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from '../assets/images/logo.png';

const Navbar = () => {
  return (
    <div className={styles.Navcontainer}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}><img src={logo} alt="MeetFlow logo" /></span>
          <h2>MeetFlow</h2>
        </div>

        <div className={styles.navLinks}>
          <a href="#why" className={styles.btn}>Why MeetFlow?</a>
          <a href="#features" className={styles.btn}>Features</a>
          <a href="#platforms" className={styles.btn}>Platforms</a>
      
        </div>

        <div className={styles.authLinks}>
          <NavLink to="/guest" className={`${styles.btnPrimary} ${styles.joinBtn}`}>Join as geust</NavLink>
          <NavLink to="/Login" className={styles.btn}>Login</NavLink>
          <NavLink to="/Register" className={styles.btnPrimary}>Sign Up</NavLink>

        </div>
      </nav>
    </div>
  );
};

export default Navbar;

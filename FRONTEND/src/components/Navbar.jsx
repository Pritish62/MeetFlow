import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <div className={styles.Navcontainer}>
      <nav className={styles.navbar}>
        <h2 className={styles.logo}>VideoApp</h2>

        <div className={styles.navLinks}>
          <NavLink to="/Home" className={styles.btn}>Home</NavLink>
          <NavLink to="/Login" className={styles.btn}>Login</NavLink>
          <NavLink to="/Register" className={styles.btnPrimary}>Register</NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

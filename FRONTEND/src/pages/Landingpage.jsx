import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Landingpage.module.css";
import img1 from "../assets/images/img1.jpg"

const Landingpage = () => {
  return (
    <div className={styles.landingContainer}>
      
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <span className={styles.badge}>🎥 Live Conference</span>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.mainHeading}>
            Your <span className={styles.highlight}>Communication</span>
            <br />
            with Seamless <span className={styles.highlight}>Video</span> Conferencing
          </h1>

          <p className={styles.subHeading}>
            Welcome to our revolutionary video conferencing platform, where communication knows no boundaries. 
            Crystal clear audio, intuitive interface, and enterprise-grade security.
          </p>

          <div className={styles.ctaButtons}>
            <button className={styles.btnPrimaryLarge}>
              🚀 Try 14 Days Free Trial
            </button>
            <button className={styles.btnSecondaryLarge}>
              ▶ Play Video Demo
            </button>
          </div>
        </div>

        {/* Conference Preview Grid */}
        <div className={styles.conferenceGrid}>
          <div className={styles.mainVideo}>
            <div className={styles.videoPlaceholder}>
              
              <div className={styles.userCard}> <img src={img1} alt="" />Jack Williams</div>
            </div>
          </div>

          <div className={styles.sideVideos}>
            <div className={styles.videoCard}>
              <div className={styles.videoSmall}>
                <span className={styles.userName}>Chloe Johnson</span>
              </div>
            </div>
            <div className={styles.videoCard}>
              <div className={styles.videoSmall}>
                <span className={styles.userName}>Ruby Brown</span>
              </div>
            </div>
            <div className={styles.videoCard}>
              <div className={styles.videoSmall}>
                <span className={styles.userName}>Olivia Davis</span>
              </div>
            </div>
            <div className={styles.videoCard}>
              <div className={styles.videoSmall}>
                <span className={styles.userName}>+5 more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conference Info */}
        <div className={styles.conferenceInfo}>
          <div className={styles.infoItem}>
            <span className={styles.avatar}>👤</span>
            <span className={styles.infoText}>Start at 09:15 AM to 10:15 AM</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Why Choose MeetFlow?</h2>
        
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎵</div>
            <h3>Crystal Clear Video & Audio</h3>
            <p>Experience pristine HD video and crystal-clear audio with advanced noise cancellation technology.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚙️</div>
            <h3>Intuitive Interface</h3>
            <p>User-friendly design that requires no technical knowledge. Start your first meeting in seconds.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔒</div>
            <h3>Secure & Private</h3>
            <p>End-to-end encryption ensures your conversations remain private and protected at all times.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💻</div>
            <h3>Cross-Platform Compatibility</h3>
            <p>Connect from any device - desktop, tablet, or mobile. Work seamlessly across all platforms.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={styles.ctaSection}>
        <h2>Ready to Transform Your Meetings?</h2>
        <p>Join thousands of teams already using MeetFlow for seamless collaboration</p>
        
        <div className={styles.ctaButtons}>
          <NavLink to="/Register" className={styles.btnPrimaryLarge}>
            Get Started Free
          </NavLink>
          <button className={styles.btnSecondaryLarge}>
            Schedule a Demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>MeetFlow</h4>
            <p>Your trusted video conferencing platform</p>
          </div>

          <div className={styles.footerSection}>
            <h5>Product</h5>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#security">Security</a></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h5>Company</h5>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h5>Legal</h5>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; 2024 MeetFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landingpage;
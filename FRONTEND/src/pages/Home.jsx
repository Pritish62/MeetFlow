import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import isAuth from "../utils/isAuth";
import styles from "./Home.module.css";
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
        <main className={styles.pageWrap}>
            <section className={styles.joinCard}>
                <div className={styles.leftPanel}>
                    <p className={styles.eyebrow}>Quick Join</p>
                    <h1 className={styles.title}>Join a Meeting With Room Code</h1>
                    

                    <form className={styles.joinForm} onSubmit={handleJoinSubmit}>
                        <label htmlFor="meeting-code" className={styles.label}>
                          Enter Meeting Code
                        </label>
                        <input
                            id="meeting-code"
                            type="text"
                            value={meetingCode}
                            onChange={(event) => setMeetingCode(event.target.value)}
                            placeholder="e.g. team-sync-4821"
                            className={styles.codeInput}
                        />

                        <button type="submit" className={styles.joinButton}>
                            Join Meeting
                        </button>
                        <button
                            type="button"
                            className={styles.createButton}
                            onClick={handleCreateMeeting}>
                            Create Meeting
                        </button>
                    </form>
                </div>

                <div className={styles.rightPanel}>
                    <img src={joinImage} alt="Join meeting illustration" className={styles.joinImage} />
                </div>
            </section>
        </main>
    )
}

export default isAuth(Home);
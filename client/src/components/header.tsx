import { useState } from "react"
import styles from "./header.module.css"

export default function Header() {
    const [activeTab, setActiveTab] = useState("Candidate")

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <span className={styles.logoIcon}>✦</span>
                <span className={styles.logoText}>tiimi</span>
                <span className={styles.navTitle}>Recruitment</span>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "Jobs" ? styles.active : ""}`}
                    onClick={() => setActiveTab("Jobs")}
                >
                    Jobs <span className={styles.badge}>8</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "Candidate" ? styles.active : ""}`}
                    onClick={() => setActiveTab("Candidate")}
                >
                    Candidate <span className={styles.badge}>54</span>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "Career Site" ? styles.active : ""}`}
                    onClick={() => setActiveTab("Career Site")}
                >
                    Career Site
                </button>
            </div>

            <div className={styles.actions}>
                <button className={styles.addButton}>
                    <span>+</span>
                </button>
                <button className={styles.searchButton}>
                    <SearchIcon />
                </button>
                <button className={styles.notificationButton}>
                    <BellIcon />
                </button>
                <button className={styles.profileButton}>
                    <img src="/placeholder.svg?height=36&width=36" alt="Profile" />
                </button>
            </div>
        </header>
    )
}

function SearchIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    )
}

function BellIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
    )
}

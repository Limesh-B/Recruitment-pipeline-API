import RecruitmentBoard from "./components/recruitment-board"
// import Header from "./components/header"
import Sidebar from "./components/sidebar"
import styles from "./App.module.css"
import './App.css'

export default function App() {
    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                {/*<Header />*/}
                <RecruitmentBoard />
            </div>
        </div>
    )
}

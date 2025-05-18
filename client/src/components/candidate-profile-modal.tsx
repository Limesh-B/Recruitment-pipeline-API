import React, { useEffect, useState } from 'react';
import styles from './candidate-profile-modal.module.css';
import type {FrontendCandidate} from '../types/candidate';
import { getCandidateById } from '../services/candidateApi';

interface CandidateProfileModalProps {
    candidateId: string;
    onClose: () => void;
}

const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({ candidateId, onClose }) => {
    const [candidate, setCandidate] = useState<FrontendCandidate | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                setLoading(true);
                const candidateData = await getCandidateById(parseInt(candidateId, 10));

                // Map to frontend candidate format
                setCandidate({
                    id: candidateData.id.toString(),
                    name: candidateData.name,
                    stage: candidateData.stage === 'APPLYING_PERIOD' ? 'applying' :
                        candidateData.stage === 'SCREENING' ? 'screening' :
                            candidateData.stage === 'INTERVIEW' ? 'interview' : 'test',
                    rating: Math.floor(candidateData.overallScore || 0),
                    appliedDate: new Date(candidateData.applicationDate).toLocaleDateString(),
                    isReferred: candidateData.referred || false,
                    assessment: candidateData.assessmentStatus === 'PENDING',
                    color: getRandomColor(candidateData.id),
                    avatar: undefined
                });
                setError(null);
            } catch (err) {
                console.error('Failed to fetch candidate:', err);
                setError('Failed to load candidate data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCandidate();
    }, [candidateId]);

    // Function to get a random color based on candidate ID
    const getRandomColor = (id: number): string => {
        const colors = [
            "#4f46e5", "#0ea5e9", "#0891b2", "#059669",
            "#65a30d", "#ca8a04", "#dc2626", "#e11d48",
            "#9333ea", "#7c3aed", "#2563eb"
        ];
        return colors[id % colors.length];
    };

    // Helper to get stage display name
    const getStageDisplayName = (stage: string): string => {
        switch (stage) {
            case 'applying': return 'Applying Period';
            case 'screening': return 'Screening';
            case 'interview': return 'Interview';
            case 'test': return 'Test';
            default: return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className={styles.modalOverlay}>
                <div className={styles.profileModal}>
                    <div className={styles.loadingState}>Loading candidate profile...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.modalOverlay}>
                <div className={styles.profileModal}>
                    <div className={styles.errorState}>{error}</div>
                    <button className={styles.closeButton} onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className={styles.modalOverlay}>
                <div className={styles.profileModal}>
                    <div className={styles.errorState}>No candidate data found.</div>
                    <button className={styles.closeButton} onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.profileModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.profileHeader}>
                    <button className={styles.closeButton} onClick={onClose}>
                        <CloseIcon />
                    </button>
                    <h2 className={styles.profileTitle}>Candidate Profile</h2>
                </div>

                <div className={styles.profileContent}>
                    <div className={styles.profileBasicInfo}>
                        {candidate.avatar ? (
                            <img
                                src={candidate.avatar}
                                alt={candidate.name}
                                className={styles.profileAvatar}
                            />
                        ) : (
                            <div
                                className={styles.profileInitial}
                                style={{ backgroundColor: candidate.color }}
                            >
                                {candidate.name.charAt(0)}
                            </div>
                        )}

                        <div className={styles.profileNameContainer}>
                            <h3 className={styles.profileName}>{candidate.name}</h3>
                            <div className={styles.profileMeta}>
                <span className={styles.profileStage} style={{
                    backgroundColor:
                        candidate.stage === 'applying' ? '#f97316' :
                            candidate.stage === 'screening' ? '#a855f7' :
                                candidate.stage === 'interview' ? '#0ea5e9' : '#06b6d4'
                }}>
                  {getStageDisplayName(candidate.stage)}
                </span>

                                {candidate.isReferred && (
                                    <span className={styles.referredBadge}>
                    <UserPlusIcon />
                    Referred
                  </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.profileDetails}>
                        <div className={styles.profileDetailItem}>
                            <span className={styles.profileDetailLabel}>Application Date:</span>
                            <span className={styles.profileDetailValue}>{candidate.appliedDate}</span>
                        </div>

                        <div className={styles.profileDetailItem}>
                            <span className={styles.profileDetailLabel}>Assessment Status:</span>
                            <span className={styles.profileDetailValue}>
                {candidate.assessment ? 'Pending Assessment' : 'Assessment Completed'}
              </span>
                        </div>

                        {!candidate.assessment && (
                            <div className={styles.profileDetailItem}>
                                <span className={styles.profileDetailLabel}>Overall Rating:</span>
                                <div className={styles.candidateRating}>
                                    <div className={styles.stars}>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <span
                                                key={i}
                                                className={i < candidate.rating ? styles.starFilled : styles.star}
                                            >
                        ★
                      </span>
                                        ))}
                                    </div>
                                    <span className={styles.ratingText}>{candidate.rating} / 5</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.profileSection}>
                        <h4 className={styles.profileSectionTitle}>Notes</h4>
                        <p className={styles.profileNotes}>
                            No notes available for this candidate. Add notes functionality can be implemented here.
                        </p>
                    </div>

                    <div className={styles.profileSection}>
                        <h4 className={styles.profileSectionTitle}>Activities</h4>
                        <div className={styles.profileActivities}>
                            <div className={styles.activityItem}>
                                <div className={styles.activityIcon}>
                                    <FileIcon />
                                </div>
                                <div className={styles.activityInfo}>
                                    <div className={styles.activityTitle}>Application Submitted</div>
                                    <div className={styles.activityDate}>{candidate.appliedDate}</div>
                                </div>
                            </div>

                            <div className={styles.activityItem}>
                                <div className={styles.activityIcon}>
                                    <TagIcon />
                                </div>
                                <div className={styles.activityInfo}>
                                    <div className={styles.activityTitle}>Moved to {getStageDisplayName(candidate.stage)}</div>
                                    <div className={styles.activityDate}>Recently</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function CloseIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    );
}

function UserPlusIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
    );
}

function FileIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
    );
}

function TagIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
    );
}

export default CandidateProfileModal;
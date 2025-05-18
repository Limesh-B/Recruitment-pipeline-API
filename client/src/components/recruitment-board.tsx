
import type React from "react"
import { useState, useEffect } from "react"
import Header from "./header.tsx"
import styles from "./recruitment-board.module.css"
import AddCandidateForm from "./add-candidate-form"
import FilterPopup, {type FilterCriteria } from "./filter-popup"
import type {
    FrontendStage,
    FrontendCandidate,
    Candidate,
} from "../types/candidate"
import { ApplicationStage } from "../types/ApplicationStage"

import {
    getAllCandidates,
    searchCandidatesByName,
    updateCandidateStage,
    mapStageToFrontend,
    mapStageToBackend,
    deleteCandidate
} from "../services/candidateApi.ts";

export default function RecruitmentBoard() {
    const [candidates, setCandidates] = useState<FrontendCandidate[]>([]);
    const [filteredCandidates, setFilteredCandidates] = useState<FrontendCandidate[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddCandidateForm, setShowAddCandidateForm] = useState<boolean>(false);
    const [selectedStage, setSelectedStage] = useState<ApplicationStage>(ApplicationStage.APPLYING_PERIOD);

    // Filter state
    const [showFilterPopup, setShowFilterPopup] = useState<boolean>(false);
    const [activeFilterType, setActiveFilterType] = useState<"date" | "score" | null>(null);
    const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({ isActive: false });

    // Search state
    const [searchInput, setSearchInput] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Delete-confirmation modal state
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
    const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);

    // Function to map backend candidate to frontend format
    const mapToFrontendCandidate = (candidate: Candidate): FrontendCandidate => {
        return {
            id: candidate.id.toString(),
            name: candidate.name,
            stage: mapStageToFrontend(candidate.stage),
            rating: Math.floor(candidate.overallScore || 0),
            appliedDate: new Date(candidate.applicationDate).toLocaleDateString(),
            isReferred: candidate.referred || false,
            assessment: candidate.assessmentStatus === 'PENDING',
            color: getRandomColor(candidate.id),
            avatar: undefined
        };
    };

    // Function to get a random color based on candidate ID
    const getRandomColor = (id: number): string => {
        const colors = [
            "#4f46e5", "#0ea5e9", "#0891b2", "#059669",
            "#65a30d", "#ca8a04", "#dc2626", "#e11d48",
            "#9333ea", "#7c3aed", "#2563eb"
        ];
        return colors[id % colors.length];
    };

    // Fetch candidates on component mount
    useEffect(() => {
        fetchCandidates();
    }, []);

    // Apply filters whenever candidates or filter criteria change
    useEffect(() => {
        applyFilters();
    }, [candidates, filterCriteria, searchQuery]);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const apiCandidates = await getAllCandidates();
            const frontendCandidates = apiCandidates.map(mapToFrontendCandidate);
            setCandidates(frontendCandidates);
            setFilteredCandidates(frontendCandidates);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch candidates:', err);
            setError('Failed to load candidates. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Function to apply all active filters
    const applyFilters = () => {
        let result = [...candidates];

        // Apply search filter
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            result = result.filter(candidate =>
                candidate.name.toLowerCase().includes(query)
            );
        }

        // Apply date range filter
        if (filterCriteria.isActive && filterCriteria.dateRange) {
            const { startDate, endDate } = filterCriteria.dateRange;

            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                // Set end date to end of day
                end.setHours(23, 59, 59, 999);

                result = result.filter(candidate => {
                    const appliedDate = new Date(candidate.appliedDate);
                    return appliedDate >= start && appliedDate <= end;
                });
            }
        }

        // Apply score range filter
        if (filterCriteria.isActive && filterCriteria.scoreRange) {
            const { minScore, maxScore } = filterCriteria.scoreRange;

            if (minScore !== null && maxScore !== null) {
                result = result.filter(candidate =>
                    candidate.rating >= minScore && candidate.rating <= maxScore
                );
            }
        }

        setFilteredCandidates(result);
    };

    const moveCandidate = async (candidateId: string, newStage: FrontendStage) => {
        try {
            // First update locally for quick UI feedback
            setCandidates(
                candidates.map((candidate) =>
                    candidate.id === candidateId ? { ...candidate, stage: newStage } : candidate
                )
            );

            // Then update on the server
            const id = parseInt(candidateId);
            const backendStage = mapStageToBackend(newStage);
            await updateCandidateStage(id, backendStage);
        } catch (err) {
            console.error(`Error moving candidate ${candidateId} to ${newStage}:`, err);
            // If the API call fails, refresh all candidates to ensure UI reflects server state
            const apiCandidates = await getAllCandidates();
            setCandidates(apiCandidates.map(mapToFrontendCandidate));
            setError('Failed to update candidate. Please try again.');
        }
    };

    const handleAddCandidate = (stage: ApplicationStage) => {
        setSelectedStage(stage);
        setShowAddCandidateForm(true);
    };

    // Handle filter button clicks
    const handleFilterClick = (filterType: "date" | "score") => {
        setActiveFilterType(filterType);
        setShowFilterPopup(true);
    };

    // Handle filter changes from popup
    const handleFilterChange = (newFilters: FilterCriteria) => {
        setFilterCriteria(newFilters);
    };

    // Handle search input changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const q = searchInput.trim();
            setSearchQuery(q);

            if (q === "") {
                await fetchCandidates();
            } else {
                setLoading(true);
                try {
                    const apiResults = await searchCandidatesByName(q);
                    setCandidates(apiResults.map(mapToFrontendCandidate));
                } catch (err) {
                    console.error("Search failed:", err);
                    setError("Search failed. Please try again.");
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    // FIXED: Moved handleDeleteCandidate inside the component
    const handleDeleteCandidate = async (candidateId: string) => {
        try {
            const id = parseInt(candidateId);
            await deleteCandidate(id);

            // After successful deletion, refresh the candidates list
            await fetchCandidates();
            setError(null);
        } catch (err) {
            console.error(`Error deleting candidate ${candidateId}:`, err);
            setError('Failed to delete candidate. Please try again.');
        } finally {
            // Close the confirmation modal
            setShowDeleteConfirmation(false);
            setCandidateToDelete(null);
        }
    };

    const applyingCandidates = filteredCandidates.filter((c) => c.stage === "applying")
    const screeningCandidates = filteredCandidates.filter((c) => c.stage === "screening")
    const interviewCandidates = filteredCandidates.filter((c) => c.stage === "interview")
    const testCandidates = filteredCandidates.filter((c) => c.stage === "test")

    if (loading) {
        return <div className={styles.loadingState}>Loading candidates...</div>;
    }

    if (error) {
        return <div className={styles.errorState}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <Header />

            <div className={styles.toolbarSection}>
                <div className={styles.searchContainer}>
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder="Search by Name"
                        className={styles.searchInput}
                        value={searchInput}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchKeyDown}
                    />
                </div>

                <div className={styles.filters}>
                    <button
                        className={`${styles.filterButton} ${filterCriteria.isActive && filterCriteria.dateRange ? styles.activeFilter : ''}`}
                        onClick={() => handleFilterClick("date")}
                    >
                        <CalendarIcon />
                        Date Range
                        <ChevronDownIcon />
                    </button>

                    <button
                        className={`${styles.filterButton} ${filterCriteria.isActive && filterCriteria.scoreRange ? styles.activeFilter : ''}`}
                        onClick={() => handleFilterClick("score")}
                    >
                        <ScoreIcon />
                        Score Range
                        <ChevronDownIcon />
                    </button>

                    <button
                        className={`${styles.filterButton} ${styles.disabledFilterButton}`}
                        disabled
                    >
                        <FilterIcon />
                        Advance Filter
                        <ChevronDownIcon />
                    </button>
                </div>

                <div className={styles.actions}>
                    <button className={styles.actionButton}>
                        <UsersIcon />
                        Refer People
                    </button>

                    <button className={styles.actionButton}>
                        <SettingsIcon />
                    </button>

                    <button className={styles.actionButton}>
                        <KanbanIcon />
                        Kanban
                        <ChevronDownIcon />
                    </button>
                </div>
            </div>

            <div className={styles.boardContainer}>
                <div className={styles.board}>
                    <div className={styles.column}>
                        <div className={styles.columnHeader} style={{ backgroundColor: "#f97316" }}>
                            <h3 className={styles.columnTitle}>Applying Period</h3>
                            <div className={styles.columnActions}>
                                <span className={styles.columnCount}>{applyingCandidates.length}</span>
                                <button
                                    className={styles.addButton}
                                    onClick={() => handleAddCandidate(ApplicationStage.APPLYING_PERIOD)}
                                    title="Add Candidate"
                                >
                                    <PlusIcon />
                                </button>
                            </div>
                        </div>
                        <div className={styles.columnContent}>
                            {applyingCandidates.map((candidate) => (
                                <CandidateCard
                                    key={candidate.id}
                                    candidate={candidate}
                                    isSelected={selectedCandidate === candidate.id}
                                    onSelect={() => setSelectedCandidate(candidate.id === selectedCandidate ? null : candidate.id)}
                                    onMove={(stage) => moveCandidate(candidate.id, stage)}
                                    onDelete={() => {
                                        setCandidateToDelete(candidate.id);
                                        setShowDeleteConfirmation(true);
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.column}>
                        <div className={styles.columnHeader} style={{ backgroundColor: "#a855f7" }}>
                            <h3 className={styles.columnTitle}>Screening</h3>
                            <div className={styles.columnActions}>
                                <span className={styles.columnCount}>{screeningCandidates.length}</span>
                                <button
                                    className={styles.addButton}
                                    onClick={() => handleAddCandidate(ApplicationStage.SCREENING)}
                                    title="Add Candidate"
                                >
                                    <PlusIcon />
                                </button>
                            </div>
                        </div>
                        <div className={styles.columnContent}>
                            {screeningCandidates.map((candidate) => (
                                <CandidateCard
                                    key={candidate.id}
                                    candidate={candidate}
                                    isSelected={selectedCandidate === candidate.id}
                                    onSelect={() => setSelectedCandidate(candidate.id === selectedCandidate ? null : candidate.id)}
                                    onMove={(stage) => moveCandidate(candidate.id, stage)}
                                    onDelete={() => {
                                        setCandidateToDelete(candidate.id);
                                        setShowDeleteConfirmation(true);
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.column}>
                        <div className={styles.columnHeader} style={{ backgroundColor: "#0ea5e9" }}>
                            <h3 className={styles.columnTitle}>Interview</h3>
                            <div className={styles.columnActions}>
                                <span className={styles.columnCount}>{interviewCandidates.length}</span>
                                <button
                                    className={styles.addButton}
                                    onClick={() => handleAddCandidate(ApplicationStage.INTERVIEW)}
                                    title="Add Candidate"
                                >
                                    <PlusIcon />
                                </button>
                            </div>
                        </div>
                        <div className={styles.columnContent}>
                            {interviewCandidates.map((candidate) => (
                                <CandidateCard
                                    key={candidate.id}
                                    candidate={candidate}
                                    isSelected={selectedCandidate === candidate.id}
                                    onSelect={() => setSelectedCandidate(candidate.id === selectedCandidate ? null : candidate.id)}
                                    onMove={(stage) => moveCandidate(candidate.id, stage)}
                                    onDelete={() => {
                                        setCandidateToDelete(candidate.id);
                                        setShowDeleteConfirmation(true);
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.column}>
                        <div className={styles.columnHeader} style={{ backgroundColor: "#06b6d4" }}>
                            <h3 className={styles.columnTitle}>Test</h3>
                            <div className={styles.columnActions}>
                                <span className={styles.columnCount}>{testCandidates.length}</span>
                                <button
                                    className={styles.addButton}
                                    onClick={() => handleAddCandidate(ApplicationStage.TEST)}
                                    title="Add Candidate"
                                >
                                    <PlusIcon />
                                </button>
                            </div>
                        </div>
                        <div className={styles.columnContent}>
                            {testCandidates.map((candidate) => (
                                <CandidateCard
                                    key={candidate.id}
                                    candidate={candidate}
                                    isSelected={selectedCandidate === candidate.id}
                                    onSelect={() => setSelectedCandidate(candidate.id === selectedCandidate ? null : candidate.id)}
                                    onMove={(stage) => moveCandidate(candidate.id, stage)}
                                    onDelete={() => {
                                        setCandidateToDelete(candidate.id);
                                        setShowDeleteConfirmation(true);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {showAddCandidateForm && (
                <AddCandidateForm
                    initialStage={selectedStage}
                    onClose={() => setShowAddCandidateForm(false)}
                    onSuccess={fetchCandidates}
                />
            )}

            {showFilterPopup && (
                <FilterPopup
                    onFilterChange={handleFilterChange}
                    isOpen={showFilterPopup}
                    onClose={() => setShowFilterPopup(false)}
                    filterType={activeFilterType}
                />
            )}
            {showDeleteConfirmation && candidateToDelete && (
                <div className={styles.modalOverlay}>
                    <div className={styles.confirmationModal}>
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this candidate? This action cannot be undone.</p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => {
                                    setShowDeleteConfirmation(false);
                                    setCandidateToDelete(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.deleteButton}
                                onClick={() => handleDeleteCandidate(candidateToDelete)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

interface CandidateCardProps {
    candidate: FrontendCandidate
    isSelected: boolean
    onSelect: () => void
    onMove: (stage: FrontendStage) => void
    onDelete: () => void
}

function CandidateCard({ candidate, isSelected, onSelect, onMove, onDelete }: CandidateCardProps) {
    const [showMenu, setShowMenu] = useState(false)

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation()
        setShowMenu(!showMenu)
    }

    return (
        <div className={`${styles.candidateCard} ${isSelected ? styles.selectedCard : ""}`} onClick={onSelect}>
            <div className={styles.candidateHeader}>
                <div className={styles.candidateInfo}>
                    {candidate.avatar ? (
                        <img src={candidate.avatar || "/placeholder.svg"} alt={candidate.name} className={styles.candidateAvatar} />
                    ) : (
                        <div className={styles.candidateInitial} style={{ backgroundColor: candidate.color || "#4f46e5" }}>
                            {candidate.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <h4 className={styles.candidateName}>{candidate.name}</h4>
                        <p className={styles.candidateDate}>Applied at {candidate.appliedDate}</p>
                    </div>
                </div>

                <button className={styles.menuButton} onClick={handleMenuToggle}>
                    <MoreIcon />

                    {showMenu && (
                        <div className={styles.menuDropdown}>
                            <div role="button" onClick={() => onMove("applying")}>Move to Applying</div>
                            <div role="button" onClick={() => onMove("screening")}>Move to Screening</div>
                            <div role="button" onClick={() => onMove("interview")}>Move to Interview</div>
                            <div role="button" onClick={() => onMove("test")}>Move to Test</div>
                            <div className={styles.menuDivider}></div>
                            <div role="button">View Profile</div>
                            <div role="button" onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                                onDelete();
                            }} className={styles.deleteOption}>Delete
                            </div>
                        </div>
                    )}
                </button>
            </div>

            <div className={styles.candidateRating}>
                <div className={styles.stars}>
                    {Array.from({length: 5 }).map((_, i) => (
                        <span key={i} className={i < candidate.rating ? styles.starFilled : styles.star}>
                            ★
                        </span>
                    ))}
                </div>
                <span className={styles.ratingText}>{candidate.rating} Overall</span>

                {candidate.isReferred && (
                    <span className={styles.referredBadge}>
                        <UserPlusIcon />
                        Referred
                    </span>
                )}
            </div>

            {candidate.assessment && (
                <div className={styles.assessmentButton}>
                    <PlusIcon />
                    Add Assessment
                </div>
            )}
        </div>
    )
}

function SearchIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
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

function CalendarIcon() {
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    )
}

function ChevronDownIcon() {
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
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    )
}

function ScoreIcon() {
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
            <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"></path>
        </svg>
    )
}

function FilterIcon() {
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
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
    )
}

function UsersIcon() {
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    )
}

function SettingsIcon() {
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
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
    )
}

function KanbanIcon() {
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
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
        </svg>
    )
}

function MoreIcon() {
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
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
        </svg>
    )
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
    )
}

function PlusIcon() {
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
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    )
}
import { useState } from "react";
import styles from "./filter-popup.module.css";

interface FilterProps {
    onFilterChange: (filters: FilterCriteria) => void;
    isOpen: boolean;
    onClose: () => void;
    filterType: "date" | "score" | null;
}

export interface FilterCriteria {
    dateRange?: {
        startDate: string | null;
        endDate: string | null;
    };
    scoreRange?: {
        minScore: number | null;
        maxScore: number | null;
    };
    isActive: boolean;
}

export default function FilterPopup({ onFilterChange, isOpen, onClose, filterType }: FilterProps) {
    // Default date values (30 days ago to today)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [dateRange, setDateRange] = useState({
        startDate: formatDate(thirtyDaysAgo),
        endDate: formatDate(today)
    });

    const [scoreRange, setScoreRange] = useState({
        minScore: 0,
        maxScore: 5
    });

    const [, setIsFilterActive] = useState(false);

    // Format date to YYYY-MM-DD
    function formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    // Handle date range changes
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle score range changes
    const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setScoreRange(prev => ({
            ...prev,
            [name]: parseInt(value, 10)
        }));
    };

    // Apply filters and close popup
    const applyFilter = () => {
        setIsFilterActive(true);
        onFilterChange({
            dateRange: filterType === "date" ? dateRange : undefined,
            scoreRange: filterType === "score" ? scoreRange : undefined,
            isActive: true
        });
        onClose();
    };

    // Clear filters
    const clearFilter = () => {
        if (filterType === "date") {
            setDateRange({
                startDate: formatDate(thirtyDaysAgo),
                endDate: formatDate(today)
            });
        } else if (filterType === "score") {
            setScoreRange({
                minScore: 0,
                maxScore: 5
            });
        }

        setIsFilterActive(false);
        onFilterChange({
            dateRange: undefined,
            scoreRange: undefined,
            isActive: false
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.filterPopupOverlay}>
            <div className={styles.filterPopup}>
                <div className={styles.filterHeader}>
                    <h3>{filterType === "date" ? "Date Range Filter" : "Score Range Filter"}</h3>
                    <button onClick={onClose} className={styles.closeButton}>
                        <CloseIcon />
                    </button>
                </div>

                <div className={styles.filterContent}>
                    {filterType === "date" && (
                        <div className={styles.dateFilterContainer}>
                            <div className={styles.formGroup}>
                                <label htmlFor="startDate" className={styles.formLabel}>
                                    From
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={dateRange.startDate}
                                    onChange={handleDateChange}
                                    className={styles.formInput}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="endDate" className={styles.formLabel}>
                                    To
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={dateRange.endDate}
                                    onChange={handleDateChange}
                                    className={styles.formInput}
                                />
                            </div>
                        </div>
                    )}

                    {filterType === "score" && (
                        <div className={styles.scoreFilterContainer}>
                            <div className={styles.scoreLabels}>
                                <span>0</span>
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                                <span>5</span>
                            </div>

                            <div className={styles.rangeSliderContainer}>
                                <input
                                    type="range"
                                    id="minScore"
                                    name="minScore"
                                    min="0"
                                    max="5"
                                    step="1"
                                    value={scoreRange.minScore}
                                    onChange={handleScoreChange}
                                    className={styles.rangeSlider}
                                />
                                <input
                                    type="range"
                                    id="maxScore"
                                    name="maxScore"
                                    min="0"
                                    max="5"
                                    step="1"
                                    value={scoreRange.maxScore}
                                    onChange={handleScoreChange}
                                    className={styles.rangeSlider}
                                />
                            </div>

                            <div className={styles.scoreRangeValues}>
                                <span>Min: {scoreRange.minScore}</span>
                                <span>Max: {scoreRange.maxScore}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.filterActions}>
                    <button
                        onClick={clearFilter}
                        className={styles.clearFilterButton}
                    >
                        Clear Filter
                    </button>
                    <button
                        onClick={applyFilter}
                        className={styles.applyFilterButton}
                    >
                        Apply Filter
                    </button>
                </div>
            </div>
        </div>
    );
}

function CloseIcon() {
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
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    );
}
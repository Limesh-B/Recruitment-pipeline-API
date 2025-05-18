import React, { useState } from 'react';
import styles from './assessment-modal.module.css';

interface AssessmentModalProps {
    candidateId: string;
    candidateName: string;
    onClose: () => void;
    onSave: (candidateId: string, rating: number) => Promise<void>;
}

export default function AssessmentModal({
                                            candidateId,
                                            candidateName,
                                            onClose,
                                            onSave
                                        }: AssessmentModalProps) {
    const [rating, setRating] = useState<number>(3);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await onSave(candidateId, rating);
            onClose();
        } catch (err) {
            console.error('Failed to save assessment:', err);
            setError('Failed to save assessment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Assessment for {candidateName}</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Overall Rating</label>
                        <div className={styles.rating}>
                            <input
                                value="5"
                                name="rate"
                                id="star5"
                                type="radio"
                                checked={rating === 5}
                                onChange={() => setRating(5)}
                            />
                            <label title="Excellent" htmlFor="star5"></label>

                            <input
                                value="4"
                                name="rate"
                                id="star4"
                                type="radio"
                                checked={rating === 4}
                                onChange={() => setRating(4)}
                            />
                            <label title="Very Good" htmlFor="star4"></label>

                            <input
                                value="3"
                                name="rate"
                                id="star3"
                                type="radio"
                                checked={rating === 3}
                                onChange={() => setRating(3)}
                            />
                            <label title="Good" htmlFor="star3"></label>

                            <input
                                value="2"
                                name="rate"
                                id="star2"
                                type="radio"
                                checked={rating === 2}
                                onChange={() => setRating(2)}
                            />
                            <label title="Average" htmlFor="star2"></label>

                            <input
                                value="1"
                                name="rate"
                                id="star1"
                                type="radio"
                                checked={rating === 1}
                                onChange={() => setRating(1)}
                            />
                            <label title="Poor" htmlFor="star1"></label>
                        </div>
                    </div>

                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Assessment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
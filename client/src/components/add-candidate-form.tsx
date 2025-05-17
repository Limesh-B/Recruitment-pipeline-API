import React, { useState } from 'react';
import { createCandidate } from '../services/candidateApi';
import { ApplicationStage } from '../types/ApplicationStage';
import styles from './add-candidate-form.module.css';

interface AddCandidateFormProps {
    initialStage: ApplicationStage;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormErrors {
    submit: any;
    name?: string;
    applicationDate?: string;
    overallScore?: string;
}

export default function AddCandidateForm({ initialStage, onClose, onSuccess }: AddCandidateFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        applicationDate: new Date().toISOString().split('T')[0], // Default to today
        overallScore: 3,
        referred: false,
        assessmentStatus: 'PENDING',
        stage: initialStage
    });
    const [errors, setErrors] = useState<FormErrors>({ submit: undefined });

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {
            submit: undefined
        };
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        if (!formData.applicationDate) {
            newErrors.applicationDate = 'Application date is required';
            isValid = false;
        } else {
            // Validate date format
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (!datePattern.test(formData.applicationDate)) {
                newErrors.applicationDate = 'Invalid date format (YYYY-MM-DD)';
                isValid = false;
            }
        }

        if (formData.overallScore < 1 || formData.overallScore > 5) {
            newErrors.overallScore = 'Score must be between 1 and 5';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : type === 'number'
                    ? parseInt(value, 10)
                    : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);
            await createCandidate(formData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create candidate:', error);
            setErrors(prev => ({
                ...prev,
                submit: 'Failed to create candidate. Please try again.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Add New Candidate</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Full Name*</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={errors.name ? styles.inputError : ''}
                        />
                        {errors.name && <p className={styles.errorText}>{errors.name}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="applicationDate">Application Date*</label>
                        <input
                            type="date"
                            id="applicationDate"
                            name="applicationDate"
                            value={formData.applicationDate}
                            onChange={handleChange}
                            className={errors.applicationDate ? styles.inputError : ''}
                        />
                        {errors.applicationDate && <p className={styles.errorText}>{errors.applicationDate}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="overallScore">Overall Score (1-5)*</label>
                        <input
                            type="number"
                            id="overallScore"
                            name="overallScore"
                            min="1"
                            max="5"
                            value={formData.overallScore}
                            onChange={handleChange}
                            className={errors.overallScore ? styles.inputError : ''}
                        />
                        {errors.overallScore && <p className={styles.errorText}>{errors.overallScore}</p>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="referred"
                                checked={formData.referred}
                                onChange={handleChange}
                            />
                            Referred Candidate
                        </label>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="assessmentStatus">Assessment Status</label>
                        <select
                            id="assessmentStatus"
                            name="assessmentStatus"
                            value={formData.assessmentStatus}
                            onChange={handleChange}
                        >
                            <option value="PENDING">Pending</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="NOT_REQUIRED">Not Required</option>
                        </select>
                    </div>

                    {errors.submit && <p className={styles.submitError}>{errors.submit}</p>}

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
                            {isSubmitting ? 'Adding...' : 'Add Candidate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
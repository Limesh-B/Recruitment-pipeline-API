// candidateApi.ts - API service for candidate operations
import { ApplicationStage } from '../types/ApplicationStage';
import type {Candidate, FrontendStage} from '../types/candidate';

const API_BASE_URL = '/api/candidates';

// Convert backend enum to frontend types
export const mapStageToFrontend = (backendStage: ApplicationStage): FrontendStage => {
    const stageMap: Record<ApplicationStage, FrontendStage> = {
        [ApplicationStage.APPLYING_PERIOD]: 'applying',
        [ApplicationStage.SCREENING]: 'screening',
        [ApplicationStage.INTERVIEW]: 'interview',
        [ApplicationStage.TEST]: 'test'
    };

    return stageMap[backendStage] || 'applying';
};

// Convert frontend types to backend enum
export const mapStageToBackend = (frontendStage: FrontendStage): ApplicationStage => {
    const stageMap: Record<FrontendStage, ApplicationStage> = {
        'applying': ApplicationStage.APPLYING_PERIOD,
        'screening': ApplicationStage.SCREENING,
        'interview': ApplicationStage.INTERVIEW,
        'test': ApplicationStage.TEST
    };

    return stageMap[frontendStage] || ApplicationStage.APPLYING_PERIOD;
};

// Fetch all candidates
export const getAllCandidates = async (): Promise<Candidate[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
};

// Get candidates by stage
export const getCandidatesByStage = async (stage: ApplicationStage): Promise<Candidate[]> => {
    const response = await fetch(`${API_BASE_URL}/stage/${stage}`);
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
};

// Update just the stage of a candidate (for drag-and-drop)
export const updateCandidateStage = async (id: number, stage: ApplicationStage): Promise<Candidate> => {
    const response = await fetch(`${API_BASE_URL}/${id}/stage`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage }),
    });
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
};

// Create a new candidate
export const createCandidate = async (candidate: Omit<Candidate, 'id'>): Promise<Candidate> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidate),
    });
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
};

// Update a candidate
export const updateCandidate = async (id: number, candidate: Partial<Candidate>): Promise<Candidate> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidate),
    });
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
};

// Delete a candidate
export const deleteCandidate = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
};
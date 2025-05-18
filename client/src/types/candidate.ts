import { ApplicationStage } from './ApplicationStage';

// Backend candidate model
export interface Candidate {
    id: number;
    name: string;
    stage: ApplicationStage;
    applicationDate: string;
    overallScore: number;
    referred: boolean;
    assessmentStatus: string;
}

// Frontend stage types - simplified for UI
export type FrontendStage = "applying" | "screening" | "interview" | "test";

// Frontend candidate model - optimized for UI
export interface FrontendCandidate {
    id: string;
    name: string;
    stage: FrontendStage;
    rating: number;
    appliedDate: string;
    isReferred: boolean;
    assessment: boolean;
    color: string;
    avatar?: string;
}
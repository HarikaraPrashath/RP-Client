export interface EmotionData {
    angry: number;
    disgust: number;
    fear: number;
    happy: number;
    sad: number;
    neutral: number;
    surprise: number;
}

export interface Question {
    id: number;
    question: string;
    category: string;
    duration: number;
}

export interface QuestionEmotions {
    questionId: number;
    emotions: EmotionData;
    timestamp?: string;
}

export interface CareerRecommendation {
    career: string;
    confidence: number;
    description: string;
    skills: string[];
    growth_path?: string;
    justification?: string;
}

export interface PersonalityTraits {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
}

export interface AnalysisResult {
    userName: string;
    aggregatedEmotions: EmotionData;
    personality: PersonalityTraits;
    topCareers: CareerRecommendation[];
    otherCareers: CareerRecommendation[];
    emotionTimeline: any[];
    insights: string[];
    blinkRate?: number; // Added blinkRate
}

import { Question, QuestionEmotions, AnalysisResult } from '@/types';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
    // Get interview questions
    getQuestions: async (): Promise<Question[]> => {
        const response = await fetch(`${API_BASE_URL}/questions`);
        if (!response.ok) throw new Error('Failed to fetch questions');
        const data = await response.json();
        return data.questions;
    },

    // Analyze emotions and predict career
    analyzeInterview: async (userName: string, emotionHistory: QuestionEmotions[], blinkRate?: number): Promise<AnalysisResult> => {
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName,
                emotionHistory,
                blinkRate,
            }),
        });

        if (!response.ok) throw new Error('Analysis failed');
        return await response.json();
    },

    // Health check
    checkHealth: async (): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch {
            return false;
        }
    }
};

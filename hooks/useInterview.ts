import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-r';
import { Question, QuestionEmotions, EmotionData, AnalysisResult } from '@/types';

export function useInterview() {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [emotionHistory, setEmotionHistory] = useState<QuestionEmotions[]>([]);
    const [currentEmotions, setCurrentEmotions] = useState<EmotionData | null>(null);
    const [webcamStatus, setWebcamStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [webcamError, setWebcamError] = useState<string | null>(null);
    const [blinkCount, setBlinkCount] = useState(0);
    const blinkCountRef = useRef(0);
    const startTimeRef = useRef<number>(Date.now());

    const timerRef = useRef<any>(null);

    // Initial load
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await api.getQuestions();
                setQuestions(data);
                if (data.length > 0) {
                    setTimeLeft(data[0].duration);
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to load interview questions. Please try again.');
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    // Timer logic
    useEffect(() => {
        if (loading || questions.length === 0) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev: number) => {
                if (prev <= 1) {
                    handleNext();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [currentIndex, loading, questions]);

    const submitInterview = useCallback(async (history: QuestionEmotions[]) => {
        setLoading(true);
        const userName = sessionStorage.getItem('userName') || 'Candidate';

        // Calculate blinks per minute
        const durationMinutes = (Date.now() - startTimeRef.current) / 60000;
        const blinkRate = blinkCountRef.current / (durationMinutes || 1);

        try {
            const results = await api.analyzeInterview(userName, history, blinkRate);
            sessionStorage.setItem('interviewResults', JSON.stringify(results));
            router.push('/Personality-career/results');
        } catch (err) {
            setError('Failed to analyze interview. Please try again.');
            setLoading(false);
        }
    }, [router]);

    const handleNext = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        const currentQ = questions[currentIndex];
        const emotions = currentEmotions || { angry: 0, disgust: 0, fear: 0, happy: 0, sad: 0, surprise: 0, neutral: 1 };

        const newHistory = [...emotionHistory, {
            questionId: currentQ.id,
            emotions: emotions,
            timestamp: new Date().toISOString()
        }];

        setEmotionHistory(newHistory);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setTimeLeft(questions[currentIndex + 1].duration);
        } else {
            submitInterview(newHistory);
        }
    }, [currentIndex, questions, currentEmotions, emotionHistory, submitInterview]);

    const handleEmotionsDetected = useCallback((emotions: EmotionData) => {
        console.log('Emotions captured:', emotions);
        setCurrentEmotions(emotions);
        setIsRecording(true);
        setWebcamStatus('ready');
    }, []);

    const handleBlinkDetected = useCallback(() => {
        blinkCountRef.current += 1;
        setBlinkCount(blinkCountRef.current);
    }, []);

    const handleWebcamError = useCallback((err: string) => {
        setWebcamStatus('error');
        setWebcamError(err);
    }, []);

    return {
        questions,
        currentIndex,
        loading,
        error,
        webcamStatus,
        webcamError,
        timeLeft,
        isRecording,
        currentEmotions,
        blinkCount,
        handleNext,
        handleEmotionsDetected,
        handleBlinkDetected,
        handleWebcamError,
        progress: Math.round(((currentIndex) / questions.length) * 100)
    };
}

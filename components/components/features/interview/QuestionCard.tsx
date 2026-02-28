import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuestionCardProps {
    question: string;
    category: string;
    currentNumber: number;
    totalQuestions: number;
    timeLeft: number;
    duration: number;
}

const QuestionCard = React.memo(({
    question,
    category,
    currentNumber,
    totalQuestions,
    timeLeft,
    duration
}: QuestionCardProps) => {
    const progress = (timeLeft / duration) * 100;

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                    Question {currentNumber} of {totalQuestions}
                </span>
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    {category}
                </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 leading-snug">
                {question}
            </h2>

            <div className="space-y-2 pt-2">
                <div className="flex justify-between items-end">
                    <span className="text-xs text-gray-500">Time Remaining</span>
                    <span className={`text-lg font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-gray-900'}`}>
                        {timeLeft}<span className="text-xs ml-0.5 text-gray-400">s</span>
                    </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-1000 ease-linear rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
});

QuestionCard.displayName = 'QuestionCard';

export default QuestionCard;

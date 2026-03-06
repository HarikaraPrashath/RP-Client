import { useState, useEffect, useCallback, useRef } from 'react';
import { EmotionData, PersonalityTraits } from '@/types';

interface LiveInsight {
    type: string;
    topCareer: string;
    confidence: number;
    dominantEmotion: string;
    personality?: PersonalityTraits;
}

export const useWebSocket = (url: string) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [lastInsight, setLastInsight] = useState<LiveInsight | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const connect = useCallback(() => {
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('WebSocket Connected');
            setIsConnected(true);
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'LIVE_INSIGHT') {
                setLastInsight(data);
            }
        };

        ws.onclose = (event) => {
            console.log(`WebSocket Disconnected. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
            setIsConnected(false);
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error Details:', error);
            // Don't close immediately in onerror, let onclose handle it
        };

        setSocket(ws);
    }, [url]);

    useEffect(() => {
        connect();
        return () => {
            if (socket) socket.close();
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, [connect]);

    const sendEmotions = useCallback((emotions: EmotionData) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ emotions }));
        }
    }, [socket]);

    return { isConnected, lastInsight, sendEmotions };
};

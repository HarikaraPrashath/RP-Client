'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { cn } from '@/lib/utils';
import { EmotionData } from '@/types';

interface WebcamCaptureProps {
    onEmotionsDetected: (emotions: EmotionData) => void;
    onBlinkDetected?: () => void; // New prop
    onError?: (error: string) => void;
    isActive: boolean;
    className?: string;
}

/**
 * Handles real-time face detection and emotion analysis using @vladmandic/face-api.
 * Optimized with a throttled loop (10 FPS) and reduced input dimensions.
 */
export default function WebcamCapture({ onEmotionsDetected, onBlinkDetected, onError, isActive, className }: WebcamCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [internalError, setInternalError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadModels = async () => {
            const MODEL_URL = '/models';
            try {
                try {
                    await tf.setBackend('webgl');
                } catch (e) {
                    await tf.setBackend('cpu');
                }
                await tf.ready();
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL); // Load landmarks

                if (isMounted) setIsModelLoaded(true);
            } catch (error) {
                const msg = 'Failed to load AI models. Please ensure the /models directory is complete.';
                console.error(msg, error);
                if (isMounted) {
                    setInternalError(msg);
                    onError?.(msg);
                }
            }
        };
        loadModels();
        return () => { isMounted = false; };
    }, [onError]);

    useEffect(() => {
        let currentStream: MediaStream | null = null;
        let isMounted = true;

        const startVideo = async () => {
            if (!videoRef.current) return;
            try {
                currentStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, frameRate: { ideal: 15 } }
                });
                if (isMounted && videoRef.current) {
                    videoRef.current.srcObject = currentStream;
                    try {
                        await videoRef.current.play();
                        setIsCameraReady(true);
                        setInternalError(null);
                    } catch (playErr) {
                        console.error('Video play error:', playErr);
                    }
                }
            } catch (err) {
                const msg = 'Camera access denied or unavailable. Please check permissions.';
                console.error(msg, err);
                if (isMounted) {
                    setInternalError(msg);
                    onError?.(msg);
                }
            }
        };

        if (isActive && isModelLoaded) startVideo();

        return () => {
            isMounted = false;
            if (currentStream) currentStream.getTracks().forEach(track => track.stop());
            setIsCameraReady(false);
        };
    }, [isActive, isModelLoaded]);

    useEffect(() => {
        if (!isActive || !isModelLoaded || !isCameraReady || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        let isMounted = true;
        let animationFrameId: number;
        const isEyeClosedRef = { current: false }; // Use a local variable to track state across frames

        const detect = async () => {
            if (!isMounted || !isActive || video.paused || video.ended) return;

            try {
                if (video.videoWidth > 0) {
                    const displaySize = { width: video.videoWidth, height: video.videoHeight };
                    faceapi.matchDimensions(canvas, displaySize);

                    // OPTIMIZED: 320px input for better accuracy, 0.4 threshold
                    const detections = await faceapi.detectSingleFace(
                        video,
                        new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4, inputSize: 320 })
                    ).withFaceLandmarks().withFaceExpressions();

                    // Blink Detection Logic (EAR - Eye Aspect Ratio)
                    if (detections && detections.landmarks) {
                        const landmarks = detections.landmarks;
                        const leftEye = landmarks.getLeftEye();
                        const rightEye = landmarks.getRightEye();

                        const calculateEAR = (eye: any[]) => {
                            const v1 = Math.sqrt(Math.pow(eye[1].x - eye[5].x, 2) + Math.pow(eye[1].y - eye[5].y, 2));
                            const v2 = Math.sqrt(Math.pow(eye[2].x - eye[4].x, 2) + Math.pow(eye[2].y - eye[4].y, 2));
                            const h = Math.sqrt(Math.pow(eye[0].x - eye[3].x, 2) + Math.pow(eye[0].y - eye[3].y, 2));
                            return (v1 + v2) / (2.0 * h);
                        };

                        const leftEAR = calculateEAR(leftEye);
                        const rightEAR = calculateEAR(rightEye);
                        const avgEAR = (leftEAR + rightEAR) / 2.0;

                        // Threshold for blink (experimentally ~0.2)
                        if (avgEAR < 0.22) {
                            if (!isEyeClosedRef.current) {
                                isEyeClosedRef.current = true;
                                onBlinkDetected?.();
                            }
                        } else {
                            isEyeClosedRef.current = false;
                        }
                    }

                    const ctx = canvas.getContext('2d', { alpha: true });
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        if (detections && isMounted) {
                            const resizedDetections = faceapi.resizeResults(detections, displaySize);
                            faceapi.draw.drawDetections(canvas, resizedDetections);
                            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

                            if (resizedDetections.expressions) {
                                // Sensitivity boost: Power law scaling to make subtle emotions more visible
                                // Using 0.7 power to lift low values (e.g., 0.1 -> 0.2, 0.05 -> 0.12)
                                const boost = (val: number) => Math.pow(val, 0.7);

                                const expressions = resizedDetections.expressions;
                                onEmotionsDetected({
                                    angry: boost(expressions.angry),
                                    disgust: boost(expressions.disgusted),
                                    fear: boost(expressions.fearful),
                                    happy: boost(expressions.happy),
                                    sad: boost(expressions.sad),
                                    surprise: boost(expressions.surprised),
                                    neutral: expressions.neutral, // Keep neutral as a baseline
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Detection error:', err);
            }

            if (isMounted && isActive) {
                animationFrameId = window.setTimeout(() => {
                    requestAnimationFrame(detect);
                }, 100) as unknown as number;
            }
        };

        detect();

        return () => {
            isMounted = false;
            if (animationFrameId) {
                window.clearTimeout(animationFrameId);
                cancelAnimationFrame(animationFrameId);
            }
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
    }, [isActive, isModelLoaded, isCameraReady, onEmotionsDetected]);

    return (
        <div className={cn("relative rounded-lg overflow-hidden bg-black/50 aspect-video", className)}>
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
            {internalError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white z-30 p-8 text-center">
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto text-destructive border-2 border-destructive/30">
                            <span className="text-2xl font-black">!</span>
                        </div>
                        <p className="text-sm font-bold tracking-tight text-destructive-foreground">{internalError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                        >
                            Retry System
                        </button>
                    </div>
                </div>
            )}
            {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white z-10">
                    <p className="text-lg font-medium">Camera Off</p>
                </div>
            )}
            {!isModelLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white z-20">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-lg font-medium tracking-tight">AI Analysis Booting...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

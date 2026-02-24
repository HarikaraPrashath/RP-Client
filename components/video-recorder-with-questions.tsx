"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Webcam from "react-webcam"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Video, VideoOff, Play, RotateCw } from "lucide-react"

interface VideoRecorderWithQuestionsProps {
  questions: string[]
  onComplete: (recordedChunks: Blob[]) => void
}

export function VideoRecorderWithQuestions({ questions, onComplete }: VideoRecorderWithQuestionsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [questionTimer, setQuestionTimer] = useState(30)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showCamera, setShowCamera] = useState(false)
  const [isWebcamReady, setIsWebcamReady] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [error, setError] = useState<string | null>(null)

  const webcamRef = useRef<Webcam>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setQuestionTimer(30)
    } else {
      // Stop recording when all questions are complete
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
      }
      // Complete the session
      setTimeout(() => {
        onComplete(recordedChunks)
      }, 500)
    }
  }, [currentQuestionIndex, questions.length, recordedChunks, onComplete, isRecording])

  // Question timer countdown
  useEffect(() => {
    if (isRecording && questionTimer > 0) {
      questionTimerRef.current = setTimeout(() => {
        setQuestionTimer((prev) => prev - 1)
      }, 1000)
    } else if (questionTimer === 0 && isRecording) {
      handleNextQuestion()
    }

    return () => {
      if (questionTimerRef.current) {
        clearTimeout(questionTimerRef.current)
      }
    }
  }, [isRecording, questionTimer, handleNextQuestion])

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [isRecording])

  const handleDataAvailable = useCallback(({ data }: BlobEvent) => {
    if (data.size > 0) {
      setRecordedChunks((prev) => [...prev, data])
    }
  }, [])

  const handleWebcamReady = useCallback(() => {
    console.log("[v0] Webcam is ready")
    setIsWebcamReady(true)
    setError(null)
  }, [])

  const handleWebcamError = useCallback((error: string | DOMException) => {
    console.error("[v0] Webcam error:", error)
    setError(typeof error === "string" ? error : error.message)
    setIsWebcamReady(false)
  }, [])

  const handleStartRecording = useCallback(async () => {
    try {
      setError(null)

      // First, show the camera if not already shown
      if (!showCamera) {
        setShowCamera(true)
        // Wait a bit for the camera to initialize
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Check if webcam and stream are ready
      if (!webcamRef.current?.stream) {
        console.error("[v0] Webcam stream not available")
        setError("Camera not ready. Please wait a moment and try again.")
        return
      }

      console.log("[v0] Starting recording with stream:", webcamRef.current.stream)

      setIsRecording(true)
      setQuestionTimer(30)

      const mediaRecorder = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm",
      })

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.addEventListener("dataavailable", handleDataAvailable)
      mediaRecorder.start()

      console.log("[v0] MediaRecorder started successfully")
    } catch (err) {
      console.error("[v0] Error starting recording:", err)
      setError("Failed to start recording. Please check camera permissions.")
      setIsRecording(false)
    }
  }, [handleDataAvailable, showCamera])

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const handleRetake = () => {
    setCurrentQuestionIndex(0)
    setRecordedChunks([])
    setRecordingTime(0)
    setQuestionTimer(30)
    setIsRecording(false)
    setShowCamera(false)
    setIsWebcamReady(false)
    setError(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Video and Question Display */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-muted">
            {showCamera ? (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={true}
                  className="h-full w-full object-cover"
                  mirrored
                  screenshotFormat="image/jpeg"
                  onUserMedia={handleWebcamReady}
                  onUserMediaError={handleWebcamError}
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user",
                  }}
                />
                {!isWebcamReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center">
                      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                      <p className="text-white">Loading camera...</p>
                    </div>
                  </div>
                )}
                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-2 text-sm font-semibold text-white">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    REC {formatTime(recordingTime)}
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <VideoOff className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                  <p className="text-lg font-medium text-foreground">Camera Preview</p>
                  <p className="text-sm text-muted-foreground">Click Start Recording to begin</p>
                </div>
              </div>
            )}

            {/* Question Overlay */}
            {isRecording && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-white/80">Time Remaining</span>
                  <span className="text-2xl font-bold text-white">{questionTimer}s</span>
                </div>
                <p className="text-pretty text-lg leading-relaxed text-white">{currentQuestion}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {!isRecording ? (
          <>
            <Button
              onClick={handleStartRecording}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={showCamera && !isWebcamReady}
            >
              <Play className="mr-2 h-5 w-5" />
              {recordingTime > 0 ? "Resume Recording" : "Start Recording"}
            </Button>
            {recordingTime > 0 && (
              <Button onClick={handleRetake} size="lg" variant="outline">
                <RotateCw className="mr-2 h-5 w-5" />
                Retake
              </Button>
            )}
          </>
        ) : (
          <>
            <Button onClick={handleNextQuestion} size="lg" className="bg-blue-600 hover:bg-blue-700">
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Analysis"}
            </Button>
            <Button onClick={handleStopRecording} size="lg" variant="outline">
              <Video className="mr-2 h-5 w-5" />
              Pause Recording
            </Button>
          </>
        )}
      </div>

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardContent className="p-4">
          <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">Instructions</h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>• Answer each question naturally and honestly</li>
            <li>• You have 30 seconds per question</li>
            <li>• Make sure your face is clearly visible</li>
            <li>• Speak clearly and maintain eye contact with the camera</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

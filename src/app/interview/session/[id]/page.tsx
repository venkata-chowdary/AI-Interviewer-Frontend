"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Mic, Settings, Video, ShieldAlert, Square, Send, CheckCircle2, Volume2, AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface InterviewQuestion {
    id: string;
    question_text: string;
}

interface NextQuestionResponse {
    completed: boolean;
    question?: InterviewQuestion;
    question_order?: number;
    total_questions?: number;
}

interface SubmitAnswerResponse {
    is_completed: boolean;
}

type SpeechRecognitionResultLike = {
    isFinal: boolean;
    0: { transcript: string };
};

type SpeechRecognitionEventLike = Event & {
    resultIndex: number;
    results: SpeechRecognitionResultLike[];
};

type SpeechRecognitionErrorEventLike = Event & {
    error?: string;
};

interface SpeechRecognitionLike {
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface ExtendedWindow extends Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
}

export default function InterviewSessionPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const sessionId = params?.id as string;
    const { token } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);

    // Interview State
    const [question, setQuestion] = useState<InterviewQuestion | null>(null);
    const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [answerText, setAnswerText] = useState("");
    const [questionStartTime, setQuestionStartTime] = useState<number>(0);
    const [elapsedTime, setElapsedTime] = useState("00:00");
    const [questionInfo, setQuestionInfo] = useState({ current: 0, total: 0 });

    // Voice State
    const [interviewMode, setInterviewMode] = useState<"text" | "voice">("text");
    const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
    const [hasSpeechSynthesis, setHasSpeechSynthesis] = useState(false);
    const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState("");
    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
    const isRecordingRef = useRef(false);

    const [showTimer, setShowTimer] = useState(true);
    const currentQuestionOrder = questionInfo.current;

    useEffect(() => {
        const requestedMode = (searchParams?.get("mode") || "").toLowerCase();

        if (requestedMode === "voice" || requestedMode === "text") {
            setInterviewMode(requestedMode);
            if (typeof window !== "undefined" && sessionId) {
                window.localStorage.setItem(`interview_mode_${sessionId}`, requestedMode);
            }
            return;
        }

        if (typeof window !== "undefined" && sessionId) {
            const storedMode = window.localStorage.getItem(`interview_mode_${sessionId}`);
            if (storedMode === "voice" || storedMode === "text") {
                setInterviewMode(storedMode);
            }
        }
    }, [searchParams, sessionId]);

    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    // Timer for display
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = window.localStorage.getItem("timer_visibility");
            setShowTimer(stored === null ? true : stored === "true");
        }

        let interval: NodeJS.Timeout;
        if (hasStarted && !isCompleted && !isFetchingQuestion) {
            interval = setInterval(() => {
                const diff = Math.floor((Date.now() - questionStartTime) / 1000);
                const mins = Math.floor(diff / 60).toString().padStart(2, '0');
                const secs = (diff % 60).toString().padStart(2, '0');
                setElapsedTime(`${mins}:${secs}`);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [hasStarted, isCompleted, isFetchingQuestion, questionStartTime]);

    // Speech Recognition Setup
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        setHasSpeechSynthesis(typeof window.speechSynthesis !== "undefined");

        const browserWindow = window as ExtendedWindow;
        const SpeechRecognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setHasSpeechRecognition(false);
            recognitionRef.current = null;
            return;
        }

        setHasSpeechRecognition(true);

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const cleanedFinal = finalTranscript.trim();
            if (cleanedFinal) {
                setAnswerText((prev) => (prev ? prev + " " + cleanedFinal : cleanedFinal));
            }
            setLiveTranscript(interimTranscript.trim());
        };

        recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
            console.error("Speech recognition error:", event.error);
            isRecordingRef.current = false;
            setIsRecording(false);
            setLiveTranscript("");
        };

        recognition.onend = () => {
            isRecordingRef.current = false;
            setIsRecording(false);
            setLiveTranscript("");
        };

        recognitionRef.current = recognition;

        return () => {
            try {
                recognition.stop();
            } catch (error) {
                console.error("Unable to stop recognition during cleanup:", error);
            }
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const fetchNextQuestion = async () => {
        if (!token) return;
        stopRecording();
        stopQuestionNarration();
        setIsFetchingQuestion(true);
        try {
            const response = await fetch(`http://localhost:8000/api/interview/${sessionId}/next-question`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data: NextQuestionResponse = await response.json();

            if (response.ok) {
                if (data.completed) {
                    setIsCompleted(true);
                } else {
                    setQuestion(data.question ?? null);
                    setQuestionInfo({
                        current: data.question_order ?? 0,
                        total: data.total_questions ?? 0
                    });
                    setAnswerText("");
                    setLiveTranscript("");
                    setElapsedTime("00:00");
                    setQuestionStartTime(Date.now());
                }
            } else {
                console.error("Failed to fetch next question:", data);
            }
        } catch (error) {
            console.error("Error fetching question:", error);
        } finally {
            setIsFetchingQuestion(false);
        }
    };

    const handleStart = () => {
        setHasStarted(true);
        fetchNextQuestion();
    };

    const stopQuestionNarration = useCallback(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setIsSpeakingQuestion(false);
    }, []);

    const speakQuestion = useCallback((text: string, onEnd?: () => void) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onstart = () => setIsSpeakingQuestion(true);
        utterance.onend = () => {
            setIsSpeakingQuestion(false);
            onEnd?.();
        };
        utterance.onerror = () => {
            setIsSpeakingQuestion(false);
            onEnd?.();
        };
        window.speechSynthesis.speak(utterance);
    }, []);

    const startRecording = useCallback(() => {
        if (!recognitionRef.current || !hasSpeechRecognition || isRecordingRef.current) return;
        try {
            setLiveTranscript("");
            recognitionRef.current.start();
            isRecordingRef.current = true;
            setIsRecording(true);
        } catch (error) {
            console.error("Unable to start recording:", error);
        }
    }, [hasSpeechRecognition]);

    const stopRecording = useCallback(() => {
        if (!recognitionRef.current || !isRecordingRef.current) return;
        try {
            recognitionRef.current.stop();
        } catch (error) {
            console.error("Unable to stop recording:", error);
        }
        isRecordingRef.current = false;
        setIsRecording(false);
        setLiveTranscript("");
    }, []);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    useEffect(() => {
        if (interviewMode !== "voice") {
            stopRecording();
            stopQuestionNarration();
        }
    }, [interviewMode, stopRecording, stopQuestionNarration]);

    useEffect(() => {
        if (!question?.question_text || interviewMode !== "voice") {
            return;
        }

        const questionPrompt = `Question ${currentQuestionOrder}. ${question.question_text}`;

        if (hasSpeechSynthesis) {
            speakQuestion(questionPrompt, () => {
                if (hasSpeechRecognition) {
                    startRecording();
                }
            });
        } else if (hasSpeechRecognition) {
            startRecording();
        }

        return () => {
            stopQuestionNarration();
        };
    }, [
        question?.id,
        question?.question_text,
        currentQuestionOrder,
        interviewMode,
        hasSpeechSynthesis,
        hasSpeechRecognition,
        speakQuestion,
        startRecording,
        stopQuestionNarration
    ]);

    const submitAnswer = async () => {
        if (!answerText.trim() || !question || !token) return;

        if (isRecording) {
            stopRecording();
        }

        setIsSubmitting(true);
        const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

        try {
            const payload = {
                question_id: question.id,
                answer_text: answerText,
                time_taken: timeTaken
            };

            const response = await fetch(`http://localhost:8000/api/interview/${sessionId}/answer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data: SubmitAnswerResponse = await response.json();
                if (data.is_completed) {
                    setIsCompleted(true);
                } else {
                    await fetchNextQuestion();
                }
            } else {
                console.error("Error submitting answer");
            }
        } catch (error) {
            console.error("Error submitting answer:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="mx-auto max-w-5xl space-y-8 animate-in slide-in-from-bottom-4 duration-500 pt-2 md:pt-4">
            {!hasStarted ? (
                /* Gateway Screen */
                <Card className="premium-card p-6 max-w-xl mx-auto shadow-xl border-primary/20 bg-background/50 backdrop-blur-xl mt-8">
                    <CardHeader className="text-center space-y-3 pb-6">
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                            <ShieldAlert className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Interview Setup Complete</CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            Your AI-powered mock interview session (<span className="font-mono text-primary">{sessionId?.split('-')[0]}</span>) is ready to begin in{" "}
                            <span className="font-semibold text-primary capitalize">{interviewMode}</span> mode.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-secondary/30 p-5 rounded-xl space-y-3">
                            <h3 className="font-medium text-base flex items-center gap-2">
                                <Settings className="w-4 h-4" /> Before you start:
                            </h3>
                            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                <li>Ensure you are in a quiet environment.</li>
                                <li>Check your microphone and camera settings.</li>
                                <li>You will be presented with questions sequentially.</li>
                                <li>Take your time to think, but keep an eye on the clock.</li>
                                {interviewMode === "voice" && <li>Voice mode auto-reads each question and starts recording your answer.</li>}
                            </ul>
                        </div>
                        {interviewMode === "voice" && (!hasSpeechRecognition || !hasSpeechSynthesis) && (
                            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 mt-0.5" />
                                <p>
                                    Your browser does not support full voice features. You can still continue and type answers.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-center pt-2">
                            <Button
                                size="default"
                                className="w-full md:w-auto h-12 px-8 text-base rounded-xl shadow-md shadow-primary/20 transition-all hover:scale-105"
                                onClick={handleStart}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing...</>
                                ) : (
                                    "Click to Continue to Interview"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : isCompleted ? (
                /* Completion Screen */
                <Card className="premium-card p-8 max-w-xl mx-auto shadow-xl border-primary/20 bg-background/50 backdrop-blur-xl mt-8 text-center space-y-6">
                    <div className="mx-auto bg-green-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">Interview Completed!</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        Your answers have been submitted successfully. Our AI engine is currently evaluating your performance.
                    </CardDescription>
                    <div className="pt-6">
                        <Button
                            className="w-full md:w-auto px-8"
                            onClick={() => router.push("/dashboard")}
                        >
                            Return to Dashboard
                        </Button>
                    </div>
                </Card>
            ) : (
                /* Actual Interview Interface */
                <div className="space-y-8">
                    <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-foreground text-center md:text-left flex items-center gap-3">
                                Interview Room
                            </h1>
                            <p className="mt-2 text-muted-foreground text-center md:text-left">
                                Question {questionInfo.current} of {questionInfo.total} | Mode:{" "}
                                <span className="capitalize font-medium text-primary">{interviewMode}</span>
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="destructive" onClick={() => router.push("/dashboard")}>End Session</Button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="premium-card p-6 border-primary/20 bg-primary/5 lg:col-span-2 shadow-lg flex flex-col min-h-[500px]">
                            <CardHeader className="p-0 mb-6 flex-row justify-between items-center border-b pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Video className="h-5 w-5 text-primary" /> Active Session
                                </CardTitle>
                                {showTimer && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background px-3 py-1 rounded-full border shadow-sm">
                                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                        {elapsedTime}
                                    </div>
                                )}
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col p-0 space-y-6">
                                {isFetchingQuestion ? (
                                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                        <p className="text-muted-foreground">Loading next question...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Question Display */}
                                        <div className="bg-background/80 p-6 rounded-2xl border shadow-sm space-y-4">
                                            <div className="text-lg font-medium">
                                                {question?.question_text}
                                            </div>
                                            {interviewMode === "voice" && hasSpeechSynthesis && (
                                                <div className="flex justify-end">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="h-8 gap-2 rounded-full px-4"
                                                        onClick={() => {
                                                            stopRecording();
                                                            speakQuestion(
                                                                `Question ${questionInfo.current}. ${question?.question_text || ""}`,
                                                                () => {
                                                                    if (hasSpeechRecognition) {
                                                                        startRecording();
                                                                    }
                                                                }
                                                            );
                                                        }}
                                                        disabled={isSpeakingQuestion}
                                                    >
                                                        <Volume2 className="w-3.5 h-3.5" />
                                                        {isSpeakingQuestion ? "Reading..." : "Replay Question"}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Answer Input Area */}
                                        <div className="flex-1 flex flex-col space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-medium text-muted-foreground">Your Answer</label>
                                                {interviewMode === "voice" && hasSpeechRecognition && (
                                                    <Button
                                                        variant={isRecording ? "destructive" : "secondary"}
                                                        size="sm"
                                                        className="h-8 gap-2 rounded-full px-4"
                                                        onClick={toggleRecording}
                                                    >
                                                        {isRecording ? (
                                                            <><Square className="w-3.5 h-3.5 fill-current" /> Stop</>
                                                        ) : (
                                                            <><Mic className="w-3.5 h-3.5" /> Speak</>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>

                                            <textarea
                                                className={`flex-1 min-h-[200px] p-4 text-base rounded-2xl border bg-background/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${isRecording ? "border-red-400 ring-2 ring-red-400/20" : "border-primary/20"}`}
                                                placeholder={isRecording ? "Listening... Speak your answer now." : interviewMode === "voice" ? "Voice transcript appears here. You can also edit manually." : "Type your answer here..."}
                                                value={answerText}
                                                onChange={(e) => setAnswerText(e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                            {interviewMode === "voice" && !hasSpeechRecognition && (
                                                <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                                                    Voice input is not supported in this browser. Type your answer instead.
                                                </div>
                                            )}
                                            {interviewMode === "voice" && isRecording && (
                                                <div className="rounded-xl border border-red-200 bg-red-50/70 px-3 py-2 text-sm text-red-700">
                                                    <span className="font-medium">Live:</span> {liveTranscript || "Listening..."}
                                                </div>
                                            )}
                                        </div>

                                        {/* Submit Action */}
                                        <div className="flex justify-end pt-2">
                                            <Button
                                                size="lg"
                                                className="px-8 rounded-xl"
                                                onClick={submitAnswer}
                                                disabled={isSubmitting || !answerText.trim() || isFetchingQuestion}
                                            >
                                                {isSubmitting ? (
                                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                                                ) : (
                                                    <><Send className="w-4 h-4 mr-2" /> Submit Answer</>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="premium-card p-4">
                                <CardHeader className="p-0 mb-4 pb-2 border-b">
                                    <CardTitle className="text-lg">Session Info</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Status</span>
                                        <span className="font-medium text-green-500 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> Live</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-medium font-mono">{questionInfo.current} / {questionInfo.total}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Network</span>
                                        <span className="font-medium text-green-500">Excellent</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Input</span>
                                        <span className="font-medium capitalize">
                                            {interviewMode === "voice" ? (
                                                <span className={`${isRecording ? "text-destructive animate-pulse" : "text-foreground"} flex items-center gap-1`}>
                                                    <Mic className="w-3 h-3" /> Voice
                                                </span>
                                            ) : (
                                                "Text"
                                            )}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="premium-card p-4 bg-secondary/30">
                                <CardContent className="p-0 flex items-start gap-3">
                                    <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Interview Tips</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {interviewMode === "voice"
                                                ? "Voice mode reads each question and captures your answer as transcript. Review the transcript before submitting to ensure accuracy."
                                                : "Answer in clear, structured text with key points first. The AI evaluator grades the submitted response text."
                                            }
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

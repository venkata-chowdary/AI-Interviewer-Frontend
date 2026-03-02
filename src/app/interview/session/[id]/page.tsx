"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Mic, Settings, Video, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function InterviewSessionPage() {
    const params = useParams();
    const sessionId = params?.id as string;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulating some initialization
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="mx-auto max-w-5xl space-y-8 animate-in slide-in-from-bottom-4 duration-500 pt-10">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground text-center md:text-left">
                        Interview Room
                    </h1>
                    <p className="mt-2 text-muted-foreground text-center md:text-left">
                        Your AI-powered mock interview is ready.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="icon" title="Hardware Settings"><Settings className="h-4 w-4" /></Button>
                    <Button variant="destructive" title="End Session">Leave</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="premium-card p-6 border-primary/20 bg-primary/5 lg:col-span-2 shadow-lg min-h-[500px] flex flex-col">
                    <CardHeader className="p-0 mb-6 flex-row justify-between items-center border-b pb-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Video className="h-5 w-5 text-primary" /> Active Session
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background px-3 py-1 rounded-full border shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            ID: <span className="font-mono">{sessionId?.split('-')[0] || 'loading'}...</span>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col items-center justify-center p-0">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="animate-pulse">Connecting to AI Server...</p>
                            </div>
                        ) : (
                            <div className="text-center space-y-6 w-full max-w-md mx-auto relative group">
                                <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-2xl -z-10 group-hover:bg-primary/10 transition-colors duration-500"></div>
                                <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary/20 relative">
                                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping opacity-20"></div>
                                    <Mic className="h-12 w-12 text-primary animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-medium">Listening...</h3>
                                    <p className="text-muted-foreground">
                                        The AI interviewer is ready. Speak clearly into your microphone when prompted.
                                    </p>
                                </div>
                            </div>
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
                                <span className="text-muted-foreground">Duration</span>
                                <span className="font-medium font-mono">00:00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Network</span>
                                <span className="font-medium text-green-500">Excellent</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="premium-card p-4 bg-secondary/30">
                        <CardContent className="p-0 flex items-start gap-3">
                            <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Interview Tips</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">Ensure you are in a quiet room. Speak clearly and concisely. You can stop the session at any time using the Leave button above.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

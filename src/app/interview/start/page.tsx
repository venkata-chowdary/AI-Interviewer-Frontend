"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Resume {
    id: string;
    file_name: string;
    analysis_status: string;
    experience_level?: string;
}

export default function StartInterviewPage() {
    const router = useRouter();
    const { token, user } = useAuth();

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoadingResumes, setIsLoadingResumes] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [selectedResumeId, setSelectedResumeId] = useState<string>("");
    const [role, setRole] = useState<string>("");
    const [difficulty, setDifficulty] = useState<string>("");
    const [duration, setDuration] = useState<string>("");

    useEffect(() => {
        if (!token) {
            setIsLoadingResumes(false);
            return;
        }

        const fetchResumes = async () => {
            try {
                // Fetch all resumes for the user
                // Endpoint might be different depending on exact backend impl, using /api/resume/me for now or waiting for backend. We assume a GET /api/resumes endpoint exists or we use the latest.
                // Based on spec: GET /resumes
                const response = await fetch("http://localhost:8000/api/resumes", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Filter only completed resumes
                    const completedResumes = data.filter((r: any) => r.analysis_status === "completed");
                    setResumes(completedResumes);
                } else if (response.status !== 404) {
                    console.error("Failed to fetch resumes");
                }
            } catch (err) {
                console.error("Error fetching resumes:", err);
            } finally {
                setIsLoadingResumes(false);
            }
        };

        fetchResumes();
    }, [token]);

    const handleStartInterview = async () => {
        if (!selectedResumeId || !role || !difficulty || !duration) {
            setError("Please answer all choices before starting.");
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const payload = {
                resume_id: selectedResumeId,
                role: role,
                difficulty: difficulty,
                duration: parseInt(duration)
            };

            const response = await fetch("http://localhost:8000/api/interview/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                // Ensure session_id is returned by the new backend schema
                if (data.session_id) {
                    router.push(`/interview/session/${data.session_id}`);
                } else {
                    // Fallback check if it returns ID directly or diff prop
                    router.push(`/interview/session/${data.id || "new"}`);
                }
            } else {
                const errorData = await response.json();
                setError(errorData.detail || "Failed to start interview. Please try again.");
            }
        } catch (err) {
            console.error("Error starting interview:", err);
            setError("A network error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="mx-auto max-w-2xl space-y-8 animate-in slide-in-from-bottom-4 duration-500 pt-10">
            <header className="text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Start Mock Interview
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Customize your mock interview based on your profile.
                </p>
            </header>

            <Card className="premium-card p-6">
                <CardContent className="space-y-8 p-0">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Resume Selector */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Resume Source
                        </h3>
                        {isLoadingResumes ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/20 p-4 rounded-xl">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading your resumes...
                            </div>
                        ) : resumes.length === 0 ? (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>No Processed Resumes Found</AlertTitle>
                                <AlertDescription className="pt-2">
                                    You don't have any fully processed resumes available for an interview.
                                    Please upload and wait for analysis to complete on the dashboard.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                                <SelectTrigger className="w-full h-14 bg-background">
                                    <SelectValue placeholder="Select your resume" />
                                </SelectTrigger>
                                <SelectContent>
                                    {resumes.map((resume) => (
                                        <SelectItem key={resume.id} value={resume.id.toString()}>
                                            <div className="flex flex-col text-left">
                                                <span className="font-medium">{resume.file_name}</span>
                                                {resume.experience_level && (
                                                    <span className="text-xs text-muted-foreground capitalize">
                                                        Level: {resume.experience_level}
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Role
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {["backend", "frontend", "fullstack", "genai", "ml"].map((r) => (
                                <Button
                                    key={r}
                                    variant="outline"
                                    onClick={() => setRole(r)}
                                    className={`h-12 capitalize ${role === r
                                        ? "border-primary bg-primary/10 font-semibold shadow-sm text-primary"
                                        : "font-normal text-muted-foreground"
                                        }`}
                                >
                                    {r === "genai" ? "GenAI" : r === "ml" ? "ML" : r}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Difficulty
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            {["easy", "medium", "hard"].map((d) => (
                                <Button
                                    key={d}
                                    variant="outline"
                                    onClick={() => setDifficulty(d)}
                                    className={`h-12 capitalize ${difficulty === d
                                        ? "border-primary bg-primary/10 font-semibold shadow-sm text-primary"
                                        : "font-normal text-muted-foreground"
                                        }`}
                                >
                                    {d}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Duration
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            {[10, 20, 30].map((t) => (
                                <Button
                                    key={t}
                                    variant="outline"
                                    onClick={() => setDuration(t.toString())}
                                    className={`h-12 ${duration === t.toString()
                                        ? "border-primary bg-primary/10 font-semibold shadow-sm text-primary"
                                        : "font-normal text-muted-foreground"
                                        }`}
                                >
                                    {t} mins
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button
                            className="w-full h-14 rounded-xl text-lg shadow-lg shadow-primary/25"
                            onClick={handleStartInterview}
                            disabled={!selectedResumeId || !role || !difficulty || !duration || isSubmitting || resumes.length === 0}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Starting Session...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-5 w-5 fill-current" />
                                    Begin Session
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowRight,
    Brain,
    Target,
    Loader2,
    UploadCloud,
    FileText,
    ClipboardCheck,
    CalendarDays,
    Clock3,
    Flame,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
    buildInterviewInsights,
    type InterviewInsights,
    type RecentInterviewRecord,
} from "@/lib/interview-insights";
import { GitHubHeatmapCard } from "@/components/github/GitHubHeatmapCard";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ResumeData {
    skills: string;
    experience_level: string;
    years_of_experience: number;
    resume_summary: string;
    analysis_status: string;
}

export default function DashboardPage() {
    const { user, token, isLoading: authLoading, logout } = useAuth();
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [resumeLoading, setResumeLoading] = useState(true);
    const [showWelcomePopup, setShowWelcomePopup] = useState(false);

    const [insights, setInsights] = useState<InterviewInsights | null>(null);
    const [latestLoading, setLatestLoading] = useState(true);
    const [latestError, setLatestError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !token) {
            setResumeLoading(false);
            return;
        }

        const fetchResumeData = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/resume/me", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setResumeData(data);
                    setShowWelcomePopup(false);
                } else if (response.status === 401) {
                    // Token has expired or is invalid
                    logout();
                } else if (response.status === 404) {
                    // No resume found, show the welcome popup
                    setResumeData(null);
                    setShowWelcomePopup(true);
                } else {
                    console.error("Failed to fetch resume:", await response.text());
                }
            } catch (err) {
                console.error("Network error fetching resume:", err);
            } finally {
                setResumeLoading(false);
            }
        };

        fetchResumeData();
    }, [user, token, logout]);

    useEffect(() => {
        if (!user || !token) {
            setLatestLoading(false);
            return;
        }

        const fetchLatestScore = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/interviews/recent?limit=50", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                });

                if (response.status === 401) {
                    logout();
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch latest interview score");
                }

                const data: RecentInterviewRecord[] = await response.json();
                setInsights(buildInterviewInsights(data));
                setLatestError(null);
            } catch (err) {
                setLatestError(
                    err instanceof Error ? err.message : "Error loading latest score"
                );
                setInsights(null);
            } finally {
                setLatestLoading(false);
            }
        };

        fetchLatestScore();
    }, [user, token, logout]);

    if (authLoading || !user) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Helper to safely parse comma-separated skills
    const parsedSkills = resumeData?.skills
        ? resumeData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const latestScore = insights?.latestScore ?? null;
    const latestRole = insights?.latestRole ?? null;

    const formatDuration = (seconds: number | null) => {
        if (seconds === null) return "--";
        const roundedSeconds = Math.round(seconds);
        const mins = Math.floor(roundedSeconds / 60);
        const secs = roundedSeconds % 60;
        if (mins === 0) return `${secs}s`;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Welcome back,{" "}
                        {user.first_name
                            ? user.first_name
                            : user.email.split("@")[0]}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Here&apos;s a summary of your recent interview performance.
                    </p>
                </div>
                <Button asChild className="rounded-xl px-6" size="lg">
                    <Link href="/interview/start">
                        Start New Interview
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Stats Cards */}
                <Card className="premium-card col-span-2 relative min-h-[300px]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Brain className="h-5 w-5 text-primary" />
                            Developer Profile
                            {resumeData?.analysis_status === "processing" && (
                                <Badge variant="outline" className="ml-auto animate-pulse border-primary/50 text-primary">
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                    Analysis in progress
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {resumeLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : !resumeData ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                <h3 className="text-lg font-medium">No Resume Found</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
                                    Upload your resume to build your profile and get custom interviews.
                                </p>
                                <Button asChild variant="outline">
                                    <Link href="/upload">Upload Resume</Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                                        Extracted Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {parsedSkills.length > 0 ? (
                                            parsedSkills.map((skill) => (
                                                <Badge
                                                    key={skill}
                                                    variant="secondary"
                                                    className="rounded-md bg-secondary/60 px-2.5 py-1 text-sm font-normal text-secondary-foreground"
                                                >
                                                    {skill}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic">No specific skills parsed yet.</span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 rounded-xl border border-border/50 bg-secondary/20 p-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Professional Summary</p>
                                        <p className="text-sm text-foreground line-clamp-3">
                                            {resumeData.resume_summary || "No summary available."}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Experience Level</p>
                                        <p className="font-semibold text-foreground capitalize">
                                            {resumeData.experience_level || "Unknown"}{" "}
                                            {resumeData.years_of_experience ? `(${resumeData.years_of_experience} yrs)` : ""}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Latest Score - now wired to analytics */}
                <Card className="premium-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Target className="h-5 w-5 text-primary" />
                            Latest Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                        {latestLoading ? (
                            <div className="flex flex-col items-center gap-3 w-full">
                                <div className="h-32 w-32 rounded-full bg-secondary/40 animate-pulse" />
                                <div className="h-4 w-40 rounded bg-secondary/50 animate-pulse" />
                            </div>
                        ) : latestError ? (
                            <p className="text-sm text-destructive text-center">{latestError}</p>
                        ) : latestScore === null ? (
                            <p className="text-sm text-muted-foreground text-center">
                                No completed interviews with scores yet. Start a session to see your latest score here.
                            </p>
                        ) : (
                            <>
                                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-[6px] border-primary/20">
                                    <div className="absolute inset-0 rounded-full border-[6px] border-primary border-t-transparent border-r-transparent rotate-45" />
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl font-bold tracking-tighter text-foreground">
                                            {latestScore}
                                        </span>
                                        <span className="text-sm font-medium text-muted-foreground">/ 100</span>
                                    </div>
                                </div>
                                <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
                                    {latestRole ? (
                                        <>
                                            Latest completed interview for{" "}
                                            <span className="text-foreground capitalize">{latestRole}</span>
                                        </>
                                    ) : (
                                        "Latest completed interview score."
                                    )}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h2 className="text-lg font-semibold tracking-tight">Performance Snapshot</h2>
                    <p className="text-xs text-muted-foreground">Derived from your latest 50 sessions</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="premium-card">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Completion Rate
                                    </p>
                                    {latestLoading ? (
                                        <div className="mt-2 h-8 w-20 rounded bg-secondary/60 animate-pulse" />
                                    ) : (
                                        <p className="mt-2 text-3xl font-bold tracking-tight">
                                            {insights?.completionRate != null ? `${insights.completionRate}%` : "--"}
                                        </p>
                                    )}
                                </div>
                                <ClipboardCheck className="h-5 w-5 text-primary" />
                            </div>
                            <p className="mt-3 text-xs text-muted-foreground">
                                {insights
                                    ? `${insights.completedInterviews} of ${insights.totalInterviews} interviews completed`
                                    : "No interview attempts yet"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="premium-card">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Sessions This Week
                                    </p>
                                    {latestLoading ? (
                                        <div className="mt-2 h-8 w-16 rounded bg-secondary/60 animate-pulse" />
                                    ) : (
                                        <p className="mt-2 text-3xl font-bold tracking-tight">
                                            {insights?.thisWeekCount ?? 0}
                                        </p>
                                    )}
                                </div>
                                <CalendarDays className="h-5 w-5 text-primary" />
                            </div>
                            <p className="mt-3 text-xs text-muted-foreground">
                                {insights?.totalInterviews != null
                                    ? `${insights.totalInterviews} total sessions recorded`
                                    : "No sessions recorded yet"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="premium-card">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Avg Interview Time
                                    </p>
                                    {latestLoading ? (
                                        <div className="mt-2 h-8 w-20 rounded bg-secondary/60 animate-pulse" />
                                    ) : (
                                        <p className="mt-2 text-3xl font-bold tracking-tight">
                                            {formatDuration(insights?.averageTimeTakenSeconds ?? null)}
                                        </p>
                                    )}
                                </div>
                                <Clock3 className="h-5 w-5 text-primary" />
                            </div>
                            <p className="mt-3 text-xs text-muted-foreground">
                                {insights?.answerRate != null
                                    ? `${insights.answerRate}% question coverage`
                                    : "No answered questions yet"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="premium-card">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Active-Day Streak
                                    </p>
                                    {latestLoading ? (
                                        <div className="mt-2 h-8 w-16 rounded bg-secondary/60 animate-pulse" />
                                    ) : (
                                        <p className="mt-2 text-3xl font-bold tracking-tight">
                                            {insights?.activeDayStreak ?? 0}d
                                        </p>
                                    )}
                                </div>
                                <Flame className="h-5 w-5 text-primary" />
                            </div>
                            <p className="mt-3 text-xs text-muted-foreground">
                                {insights?.mostPracticedRole
                                    ? `Most practiced: ${insights.mostPracticedRole.role} (${insights.mostPracticedRole.count})`
                                    : "Build consistency with regular sessions"}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <GitHubHeatmapCard username={user.github_username} />

            {/* Welcome / First-Time Login Popup */}
            <Dialog open={showWelcomePopup} onOpenChange={setShowWelcomePopup}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <Brain className="h-5 w-5 text-primary" />
                            Welcome to AI Interviewer
                        </DialogTitle>
                        <DialogDescription className="pt-3 pb-2 text-base">
                            You haven&apos;t uploaded a resume yet. Upload one to get interviews tailored to your experience.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/60 rounded-xl bg-secondary/10 mb-4">
                        <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-sm font-medium text-center">
                            Upload your resume to unlock custom interviews.
                        </p>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
                        <Button variant="outline" onClick={() => setShowWelcomePopup(false)} className="w-full sm:w-auto">
                            Remind me later
                        </Button>
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/upload">
                                Upload Resume Now
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


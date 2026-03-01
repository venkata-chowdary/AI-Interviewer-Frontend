"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, Code, FileText, Target, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

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
                } else if (response.status === 401) {
                    // Token has expired or is invalid
                    logout();
                } else if (response.status !== 404) {
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

    return (
        <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500">
            <header className="flex items-end justify-between border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Welcome back, {user.email.split('@')[0]}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Here's a summary of your recent interview performance.
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
                                    Upload your resume to let our AI build your technical profile and customize your interviews.
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

                {/* Score Card - Remains Static for now */}
                <Card className="premium-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Target className="h-5 w-5 text-primary" />
                            Latest Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-[6px] border-primary/20">
                            <div className="absolute inset-0 rounded-full border-[6px] border-primary border-t-transparent border-r-transparent rotate-45" />
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-bold tracking-tighter text-foreground">72</span>
                                <span className="text-sm font-medium text-muted-foreground">/ 100</span>
                            </div>
                        </div>
                        <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
                            Above average for <span className="text-foreground">Backend Roles</span>
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Focus Areas - Remains Static for now */}
            <h2 className="mt-10 mb-4 text-xl font-semibold tracking-tight">Areas of Focus</h2>
            <div className="grid gap-4 sm:grid-cols-2">
                <Card className="premium-card border-l-4 border-l-green-500/80">
                    <CardContent className="flex items-start gap-4 pt-6">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                            <Code className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Strong Areas</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                REST APIs, Database Indexing, and Python Core concepts are highly solid.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card border-l-4 border-l-destructive/80">
                    <CardContent className="flex items-start gap-4 pt-6">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Needs Practice</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Distributed Systems and Caching strategies showed gaps in deep knowledge.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

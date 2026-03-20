"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    BarChart3,
    BriefcaseBusiness,
    CheckCircle2,
    CircleAlert,
    FileText,
    Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResumeData {
    skills: string;
    analysis_status: string;
}

interface JobDescriptionMatch {
    required_skills: string[];
    matched_skills: string[];
    missing_skills: string[];
    match_score: number;
}

function getMatchTone(score: number) {
    if (score >= 80) {
        return {
            label: "Strong fit",
            cardClass: "border-emerald-200 bg-emerald-50/70",
            textClass: "text-emerald-700",
            badgeClass: "border-emerald-200 bg-emerald-100 text-emerald-800",
            barClass: "bg-[linear-gradient(90deg,#10b981,#14b8a6)]",
        };
    }

    if (score >= 55) {
        return {
            label: "Partial fit",
            cardClass: "border-amber-200 bg-amber-50/70",
            textClass: "text-amber-700",
            badgeClass: "border-amber-200 bg-amber-100 text-amber-800",
            barClass: "bg-[linear-gradient(90deg,#f59e0b,#f97316)]",
        };
    }

    return {
        label: "Needs work",
        cardClass: "border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,0.92),rgba(255,247,237,0.9))]",
        textClass: "text-rose-700",
        badgeClass: "border-rose-200 bg-white/80 text-rose-700",
        barClass: "bg-[linear-gradient(90deg,#f97316,#f43f5e)]",
    };
}

export default function JobMatchPage() {
    const { user, token, isLoading: authLoading, logout } = useAuth();
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [resumeLoading, setResumeLoading] = useState(true);
    const [jobDescription, setJobDescription] = useState("");
    const [jobMatch, setJobMatch] = useState<JobDescriptionMatch | null>(null);
    const [jobMatchLoading, setJobMatchLoading] = useState(false);
    const [jobMatchError, setJobMatchError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !token) {
            setResumeLoading(false);
            return;
        }

        const fetchResumeData = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/resume/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    setResumeData(await response.json());
                } else if (response.status === 401) {
                    logout();
                } else if (response.status === 404) {
                    setResumeData(null);
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

    if (authLoading || !user) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const parsedSkills = resumeData?.skills
        ? resumeData.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
        : [];
    const wordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;
    const matchTone = getMatchTone(jobMatch?.match_score ?? 0);

    const handleJobMatch = async () => {
        if (!token) {
            return;
        }

        if (!jobDescription.trim()) {
            setJobMatchError("Paste a job description to generate a match score.");
            setJobMatch(null);
            return;
        }

        if (jobDescription.trim().length < 20) {
            setJobMatchError("Paste a fuller job description so the matcher can extract requirements.");
            setJobMatch(null);
            return;
        }

        setJobMatchLoading(true);
        setJobMatchError(null);

        try {
            const response = await fetch("http://localhost:8000/api/resume/me/job-match", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ job_description: jobDescription }),
            });

            if (response.status === 401) {
                logout();
                return;
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || "Unable to match this job description right now.");
            }

            setJobMatch(data);
        } catch (err) {
            setJobMatch(null);
            setJobMatchError(
                err instanceof Error ? err.message : "Unable to match this job description right now."
            );
        } finally {
            setJobMatchLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-6xl space-y-4 animate-in fade-in duration-500">
            <header className="space-y-3 border-b border-border/40 pb-4">
                <div className="min-w-0">
                    <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                        Resume Fit
                    </Badge>
                    <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.035em] text-foreground md:text-[2.4rem]">
                        Job Description Matcher
                    </h1>
                    <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted-foreground">
                        Compare your latest resume against a target role, see visible overlap, and identify missing skills before applying.
                    </p>
                </div>
                <div className="grid gap-2 md:grid-cols-3">
                    <div className="min-w-0 rounded-2xl border border-border/50 bg-white px-4 py-2.5 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Resume Skills</p>
                        <p className="mt-1.5 text-[24px] font-semibold tracking-[-0.04em]">{parsedSkills.length}</p>
                    </div>
                    <div className="min-w-0 rounded-2xl border border-border/50 bg-white px-4 py-2.5 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">JD Words</p>
                        <p className="mt-1.5 text-[24px] font-semibold tracking-[-0.04em]">{wordCount}</p>
                    </div>
                    <div className={`min-w-0 rounded-2xl border px-4 py-2.5 shadow-sm ${jobMatch ? matchTone.cardClass : "border-border/50 bg-white"}`}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Current Read</p>
                        <p className={`mt-1.5 text-[24px] font-semibold tracking-[-0.04em] ${jobMatch ? matchTone.textClass : "text-foreground"}`}>
                            {jobMatch ? matchTone.label : "Waiting"}
                        </p>
                    </div>
                </div>
            </header>

            <div className="space-y-4">
                <Card className="premium-card min-w-0 overflow-hidden border-border/60">
                    <CardHeader className="border-b border-border/40 px-5 py-4">
                        <CardTitle className="flex items-center gap-2 text-[1.35rem] tracking-[-0.03em]">
                            <BriefcaseBusiness className="h-5 w-5 text-primary" />
                            Match This Resume To A Role
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-5">
                        <textarea
                            value={jobDescription}
                            onChange={(event) => {
                                setJobDescription(event.target.value);
                                setJobMatchError(null);
                            }}
                            placeholder="Paste responsibilities, required skills, and preferred qualifications here."
                            className="min-h-64 w-full resize-none rounded-2xl border border-border/60 bg-white px-4 py-3 text-[14px] leading-6 tracking-[-0.01em] text-foreground shadow-sm outline-none transition placeholder:text-[13px] placeholder:tracking-normal placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                            disabled={!resumeData || resumeLoading || jobMatchLoading}
                        />

                        <div className="grid gap-2 text-[11px] leading-5 text-muted-foreground sm:grid-cols-3">
                            <div className="rounded-2xl border border-border/50 bg-secondary/20 px-3 py-2">
                                Full requirements sections score better than titles alone.
                            </div>
                            <div className="rounded-2xl border border-border/50 bg-secondary/20 px-3 py-2">
                                The matcher focuses on visible skill overlap.
                            </div>
                            <div className="rounded-2xl border border-border/50 bg-secondary/20 px-3 py-2">
                                Resume summary context helps when extracted skills are thin.
                            </div>
                        </div>

                        <Button
                            onClick={handleJobMatch}
                            disabled={!resumeData || resumeLoading || jobMatchLoading || !jobDescription.trim()}
                            className="h-11 rounded-2xl px-5 shadow-lg shadow-primary/20"
                        >
                            {jobMatchLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Evaluating Match
                                </>
                            ) : (
                                <>
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Analyze Match
                                </>
                            )}
                        </Button>

                        {jobMatchError && (
                            <div className="flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                <p>{jobMatchError}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {resumeLoading ? (
                    <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-border/60 bg-white shadow-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : !resumeData ? (
                    <Card className="premium-card min-h-[300px] justify-center border-dashed">
                        <CardContent className="flex flex-col items-center justify-center px-6 py-8 text-center">
                            <FileText className="h-10 w-10 text-primary/60" />
                            <p className="mt-3 text-lg font-semibold">Upload a resume first</p>
                            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                This page works against your latest analyzed resume. Upload one first to unlock role matching.
                            </p>
                            <Button asChild variant="outline" className="mt-4 rounded-xl">
                                <Link href="/upload">Upload Resume</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : resumeData.analysis_status === "processing" ? (
                    <Card className="premium-card min-h-[300px] justify-center border-primary/20">
                        <CardContent className="flex flex-col items-center justify-center px-6 py-8 text-center">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="mt-3 text-lg font-semibold">Resume analysis is still running</p>
                            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                Once your skills finish processing, this page will show your match score, gaps, and detected requirements.
                            </p>
                        </CardContent>
                    </Card>
                ) : !jobMatch ? (
                    <Card className="premium-card min-h-[300px] min-w-0">
                        <CardHeader className="px-5 py-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                What You&apos;ll See
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 px-5 pb-5 pt-0">
                            <div className="grid gap-2 md:grid-cols-3">
                                <div className="min-w-0 rounded-2xl border border-border/50 bg-white p-3 shadow-sm">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Coverage</p>
                                    <p className="mt-1.5 text-[24px] font-semibold tracking-[-0.04em]">Score</p>
                                </div>
                                <div className="min-w-0 rounded-2xl border border-border/50 bg-white p-3 shadow-sm">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Strengths</p>
                                    <p className="mt-1.5 text-[24px] font-semibold tracking-[-0.04em]">Matched</p>
                                </div>
                                <div className="min-w-0 rounded-2xl border border-border/50 bg-white p-3 shadow-sm">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Gaps</p>
                                    <p className="mt-1.5 text-[24px] font-semibold tracking-[-0.04em]">Missing</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border/50 bg-white p-3 shadow-sm">
                                <p className="text-sm font-medium text-muted-foreground">Resume skills in scope</p>
                                <div className="mt-2.5 flex flex-wrap gap-2">
                                    {parsedSkills.length > 0 ? (
                                        parsedSkills.slice(0, 12).map((skill) => (
                                            <Badge key={skill} variant="secondary" className="rounded-full px-3 py-1.5 text-[11px] tracking-[0.01em]">
                                                {skill}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No extracted skills are available yet.</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2.5">
                        <Card className={`premium-card min-w-0 border ${matchTone.cardClass}`}>
                            <CardContent className="space-y-3 p-4">
                                <div className="space-y-1.5">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Hiring Read</p>
                                        <p className="mt-1.5 text-[1.75rem] font-semibold tracking-[-0.045em]">{matchTone.label}</p>
                                        <p className="mt-1.5 text-[14px] leading-6 text-muted-foreground">
                                            {jobMatch.matched_skills.length} of {jobMatch.required_skills.length} detected requirements are already visible in your resume profile.
                                        </p>
                                    </div>
                                    <Badge className={`w-fit rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-none ${matchTone.badgeClass}`}>
                                        {jobMatch.match_score}% match
                                    </Badge>
                                </div>

                                <div>
                                    <div className="mb-1 flex items-center justify-between text-[13px]">
                                        <span className="font-medium text-foreground">Requirement coverage</span>
                                        <span className="text-muted-foreground">{jobMatch.match_score}%</span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-white/80">
                                        <div className={`h-full rounded-full ${matchTone.barClass}`} style={{ width: `${jobMatch.match_score}%` }} />
                                    </div>
                                </div>

                                <div className="grid gap-2 md:grid-cols-3">
                                    <div className="min-w-0 rounded-2xl border border-white/70 bg-white/90 p-2.5 shadow-sm">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Required</p>
                                        <p className="mt-1 text-[24px] font-semibold tracking-[-0.04em]">{jobMatch.required_skills.length}</p>
                                    </div>
                                    <div className="min-w-0 rounded-2xl border border-white/70 bg-white/90 p-2.5 shadow-sm">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Matched</p>
                                        <p className="mt-1 text-[24px] font-semibold tracking-[-0.04em] text-emerald-700">{jobMatch.matched_skills.length}</p>
                                    </div>
                                    <div className="min-w-0 rounded-2xl border border-white/70 bg-white/90 p-2.5 shadow-sm">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Missing</p>
                                        <p className="mt-1 text-[24px] font-semibold tracking-[-0.04em] text-amber-700">{jobMatch.missing_skills.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-2.5 lg:grid-cols-2">
                            <Card className="premium-card min-w-0">
                                <CardHeader className="px-5 py-4">
                                    <CardTitle className="text-lg">Matched Skills</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-2 px-5 pb-5 pt-0">
                                    {jobMatch.matched_skills.length > 0 ? (
                                        jobMatch.matched_skills.map((skill) => (
                                            <Badge key={skill} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] tracking-[0.01em] text-emerald-700 hover:bg-emerald-50">
                                                {skill}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No overlap found yet between the JD and your current resume profile.</span>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="premium-card min-w-0">
                                <CardHeader className="px-5 py-4">
                                    <CardTitle className="text-lg">Missing Skills</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-2 px-5 pb-5 pt-0">
                                    {jobMatch.missing_skills.length > 0 ? (
                                        jobMatch.missing_skills.map((skill) => (
                                            <Badge key={skill} variant="secondary" className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] tracking-[0.01em] text-amber-700">
                                                {skill}
                                            </Badge>
                                        ))
                                    ) : jobMatch.required_skills.length > 0 ? (
                                        <span className="text-sm text-emerald-700">No obvious skill gaps detected from the extracted requirements.</span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Missing skills will appear here after a match run.</span>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="premium-card min-w-0">
                            <CardHeader className="px-5 py-4">
                                <CardTitle className="text-lg">Detected Job Requirements</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2 px-5 pb-5 pt-0">
                                {jobMatch.required_skills.length > 0 ? (
                                    jobMatch.required_skills.map((skill) => (
                                        <Badge key={skill} variant="outline" className="rounded-full px-3 py-1 text-[11px] tracking-[0.01em]">
                                            {skill}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">No recognizable skills were detected. Try pasting the job requirements section.</span>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

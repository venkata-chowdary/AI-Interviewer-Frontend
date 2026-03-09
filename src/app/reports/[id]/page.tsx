"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Award, BookOpen, Clock3 } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface AttemptReportItem {
    question_id: string;
    question_order: number;
    question_text: string | null;
    max_score: number | null;
    score: number | null;
    feedback: string | null;
    time_taken: number | null;
}

interface PerformanceReport {
    strengts?: string[];
    strengths?: string[];
    strong_areas?: string[];
    weakness?: string[];
    weaknesses?: string[];
    negative_areas?: string[];
    areas_for_improvement?: string[];
    suggestions?: string[];
    recommendations?: string[];
    next_steps?: string[];
    summary?: string;
    overall_summary?: string;
}

interface InterviewReportResponse {
    id: string;
    role: string;
    difficulty_level: string;
    duration: number | null;
    status: string;
    marks: number | null;
    selected_status: string | null;
    time_taken: number | null;
    created_at: string;
    questions_total: number;
    questions_answered: number;
    progress_percent: number;
    performance_report: PerformanceReport | null;
    attempts: AttemptReportItem[];
}

export default function ReportPage() {
    const params = useParams<{ id: string }>();
    const sessionId = params?.id;
    const { token, user, logout } = useAuth();

    const [report, setReport] = useState<InterviewReportResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        if (!sessionId || !token || !user) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const fetchReport = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/interview/${sessionId}/report`, {
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
                    const text = await response.text();
                    throw new Error(text || "Failed to fetch interview report.");
                }

                const data: InterviewReportResponse = await response.json();
                if (isMounted) {
                    setReport(data);
                    setError(null);
                    setLastUpdated(new Date());
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to fetch interview report.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchReport();
        const intervalId = setInterval(fetchReport, 5000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [sessionId, token, user, logout]);

    const readFirstList = (...candidates: (string[] | undefined)[]) => {
        for (const candidate of candidates) {
            if (Array.isArray(candidate) && candidate.length > 0) {
                return candidate.filter((item) => typeof item === "string" && item.trim().length > 0);
            }
        }
        return [];
    };

    const readFirstText = (...candidates: (string | undefined)[]) => {
        for (const candidate of candidates) {
            if (typeof candidate === "string" && candidate.trim().length > 0) {
                return candidate.trim();
            }
        }
        return "";
    };

    const reportDetails = report?.performance_report;
    const strengths = readFirstList(
        reportDetails?.strengts,
        reportDetails?.strengths,
        reportDetails?.strong_areas
    );
    const negativeAreas = readFirstList(
        reportDetails?.weakness,
        reportDetails?.weaknesses,
        reportDetails?.negative_areas,
        reportDetails?.areas_for_improvement
    );
    const suggestions = readFirstList(
        reportDetails?.suggestions,
        reportDetails?.recommendations,
        reportDetails?.next_steps
    );
    const summary = readFirstText(
        reportDetails?.summary,
        reportDetails?.overall_summary
    );

    const chartData = useMemo(() => {
        if (!report?.attempts?.length) return [];
        return report.attempts.map((attempt) => {
            const scorePercent =
                attempt.score != null && attempt.max_score != null && attempt.max_score > 0
                    ? Math.round((attempt.score / attempt.max_score) * 100)
                    : 0;
            return {
                name: `Q${attempt.question_order}`,
                score: scorePercent,
            };
        });
    }, [report]);

    const averageAttemptPercent = useMemo(() => {
        if (!chartData.length) return 0;
        const total = chartData.reduce((sum, item) => sum + item.score, 0);
        return Math.round(total / chartData.length);
    }, [chartData]);

    const createdAtLabel = report
        ? new Date(report.created_at).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        })
        : "";

    const totalTimeLabel =
        report?.time_taken != null
            ? `${Math.floor(report.time_taken / 60)}m ${report.time_taken % 60}s`
            : "--";

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="mx-auto max-w-3xl pt-10">
                <Card className="premium-card">
                    <CardContent className="p-6 text-sm text-destructive">
                        {error || "Unable to load interview report."}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            Mock Interview Result
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                            {report.status.replace("_", " ")}
                        </Badge>
                        {report.selected_status && (
                            <Badge className="capitalize">{report.selected_status}</Badge>
                        )}
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        {report.role} Assessment
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        {createdAtLabel} | Difficulty: {report.difficulty_level} | Last refresh: {lastUpdated?.toLocaleTimeString()}
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-border/40">
                    <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Overall Score</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-4xl font-bold tracking-tighter">{report.marks ?? "--"}</span>
                            <span className="text-muted-foreground">/ 100</span>
                        </div>
                    </div>
                    <Award className="h-12 w-12 text-yellow-500/90" />
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="premium-card col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Core Dimensions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-foreground">Technical Accuracy</span>
                                <span className="text-muted-foreground">{Math.round(report.marks ?? 0)}%</span>
                            </div>
                            <Progress value={Math.round(report.marks ?? 0)} className="h-2 bg-secondary" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-foreground">Attempt Quality Avg</span>
                                <span className="text-muted-foreground">{averageAttemptPercent}%</span>
                            </div>
                            <Progress value={averageAttemptPercent} className="h-2 bg-secondary" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-foreground">Completion</span>
                                <span className="text-muted-foreground">{report.progress_percent}%</span>
                            </div>
                            <Progress value={report.progress_percent} className="h-2 bg-secondary" />
                        </div>

                        <div className="pt-2 text-xs text-muted-foreground flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            Total time: {totalTimeLabel}
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Question Score Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#6b7280", fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        domain={[0, 100]}
                                        tick={{ fill: "#6b7280", fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "#f3f4f6" }}
                                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    />
                                    <Bar
                                        dataKey="score"
                                        fill="var(--color-primary)"
                                        radius={[4, 4, 0, 0]}
                                        barSize={34}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="premium-card border-none bg-secondary/30">
                    <CardContent className="p-6 space-y-6">
                        <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-4 text-lg">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                Strength Areas
                            </h3>
                            <ul className="list-disc list-outside pl-5 space-y-2 text-muted-foreground text-sm">
                                {strengths.length > 0 ? (
                                    strengths.map((item, idx) => <li key={`s-${idx}`}>{item}</li>)
                                ) : (
                                    <li>No strength areas generated yet.</li>
                                )}
                            </ul>
                        </div>

                        <div className="h-px w-full bg-border/50" />

                        <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-4 text-lg">
                                <XCircle className="h-5 w-5 text-destructive" />
                                Negative Areas
                            </h3>
                            <ul className="list-disc list-outside pl-5 space-y-2 text-muted-foreground text-sm">
                                {negativeAreas.length > 0 ? (
                                    negativeAreas.map((item, idx) => <li key={`w-${idx}`}>{item}</li>)
                                ) : (
                                    <li>No negative areas generated yet.</li>
                                )}
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card overflow-hidden gap-0">
                    <CardHeader className=" border-b border-border/40 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Suggestions and Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                        <div>
                            <p className="text-sm font-medium mb-2">Suggestions</p>
                            <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-muted-foreground">
                                {suggestions.length > 0 ? (
                                    suggestions.map((item, idx) => <li key={`sg-${idx}`}>{item}</li>)
                                ) : (
                                    <li>No suggestions available yet.</li>
                                )}
                            </ul>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-2">Summary</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {summary || "Evaluation summary is not available yet."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="premium-card">
                <CardHeader>
                    <CardTitle className="text-lg">Question-Level Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {report.attempts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No answers recorded yet.</p>
                    ) : (
                        report.attempts.map((attempt) => {
                            const scoreLabel =
                                attempt.score != null && attempt.max_score != null
                                    ? `${attempt.score}/${attempt.max_score}`
                                    : "--";
                            const timeLabel =
                                attempt.time_taken != null
                                    ? `${Math.floor(attempt.time_taken / 60)}m ${attempt.time_taken % 60}s`
                                    : "--";

                            return (
                                <div key={attempt.question_id} className="rounded-xl border border-border/50 p-4 space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="font-medium text-sm">
                                            Q{attempt.question_order}: {attempt.question_text ?? "Question text unavailable"}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">Score: {scoreLabel}</Badge>
                                            <Badge variant="outline">Time: {timeLabel}</Badge>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {attempt.feedback || "Feedback will appear after evaluation completes."}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

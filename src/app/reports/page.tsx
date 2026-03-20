"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    Calendar,
    Target,
    ArrowUpRight,
    CheckCircle2,
    Trophy,
    Flame,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
    buildInterviewInsights,
    type InterviewInsights,
    type RecentInterviewRecord,
} from "@/lib/interview-insights";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function AnalyticsDashboardPage() {
    const { token, user, logout } = useAuth();
    const [recentInterviews, setRecentInterviews] = useState<RecentInterviewRecord[]>([]);
    const [insights, setInsights] = useState<InterviewInsights | null>(null);
    const [isRecentLoading, setIsRecentLoading] = useState(true);
    const [recentError, setRecentError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        if (!token || !user) {
            setIsRecentLoading(false);
            return;
        }

        let isMounted = true;

        const fetchRecentInterviews = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/interviews/recent?limit=50", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    cache: "no-store"
                });

                if (response.status === 401) {
                    logout();
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch recent interviews.");
                }

                const data: RecentInterviewRecord[] = await response.json();
                if (isMounted) {
                    setRecentInterviews(data);
                    setInsights(buildInterviewInsights(data));
                    setRecentError(null);
                    setLastUpdated(new Date());
                }
            } catch (error) {
                if (isMounted) {
                    setRecentError(error instanceof Error ? error.message : "Network error while loading recent interviews.");
                    setInsights(null);
                }
            } finally {
                if (isMounted) {
                    setIsRecentLoading(false);
                }
            }
        };

        fetchRecentInterviews();

        return () => {
            isMounted = false;
        };
    }, [token, user, logout]);

    const rolePerformanceData = useMemo(
        () =>
            (insights?.roleAverageScores ?? [])
                .slice(0, 6)
                .map((item) => ({
                    role: item.role,
                    score: item.averageScore,
                    sessions: item.sessions,
                })),
        [insights]
    );

    const difficultyData = useMemo(
        () =>
            (insights?.difficultyBreakdown ?? []).map((item) => ({
                difficulty: item.difficulty,
                count: item.count,
            })),
        [insights]
    );

    const formatCreatedAt = (isoDate: string) =>
        new Date(isoDate).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });

    const formatTimeTaken = (seconds: number | null) => {
        if (seconds == null) return "--";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const formatAverageSeconds = (seconds: number | null) => {
        if (seconds == null) return "--";
        const roundedSeconds = Math.round(seconds);
        const mins = Math.floor(roundedSeconds / 60);
        const secs = roundedSeconds % 60;
        if (mins === 0) return `${secs}s`;
        return `${mins}m ${secs}s`;
    };

    const getStatusBadgeClass = (status: string) => {
        if (status === "completed") return "bg-green-500/10 text-green-700 border-green-500/20";
        if (status === "under_evaluation") return "bg-amber-500/10 text-amber-700 border-amber-500/20";
        if (status === "failed_evaluation") return "bg-destructive/10 text-destructive border-destructive/20";
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
    };

    return (
        <div className="mx-auto max-w-6xl space-y-10 animate-in fade-in duration-700">

            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between pb-6 border-b border-border/50">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Performance Analytics
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Track your interview progression and actionable performance metrics.
                    </p>
                </div>
                <Button className="rounded-xl px-6" asChild>
                    <Link href="/interview/start">
                        New Interview
                    </Link>
                </Button>
            </header>

            <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h2 className="text-lg font-semibold tracking-tight">Snapshot</h2>
                    <p className="text-xs text-muted-foreground">Latest 50 interviews</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="premium-card">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                                {isRecentLoading ? (
                                    <div className="h-8 w-20 rounded-lg bg-secondary/60 animate-pulse" />
                                ) : (
                                    <p className="text-4xl font-bold tracking-tight">
                                        {insights?.averageScore ?? "--"}
                                    </p>
                                )}
                            </div>
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Target className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5 text-sm">
                            {isRecentLoading ? (
                                <div className="h-4 w-32 rounded bg-secondary/50 animate-pulse" />
                            ) : insights?.scoreChangePercent == null ? (
                                <span className="text-muted-foreground">Not enough data for trend yet</span>
                            ) : (
                                <>
                                    <TrendingUp
                                        className={`h-4 w-4 ${
                                            insights.scoreChangePercent >= 0 ? "text-green-500" : "text-red-500"
                                        }`}
                                    />
                                    <span
                                        className={`font-medium ${
                                            insights.scoreChangePercent >= 0 ? "text-green-500" : "text-red-500"
                                        }`}
                                    >
                                        {insights.scoreChangePercent >= 0 ? "+" : ""}
                                        {insights.scoreChangePercent}%
                                    </span>
                                    <span className="text-muted-foreground ml-1">vs earlier sessions</span>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                                {isRecentLoading ? (
                                    <div className="h-8 w-20 rounded-lg bg-secondary/60 animate-pulse" />
                                ) : (
                                    <p className="text-4xl font-bold tracking-tight">
                                        {insights?.completionRate != null ? `${insights.completionRate}%` : "--"}
                                    </p>
                                )}
                            </div>
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                            {insights
                                ? `${insights.completedInterviews}/${insights.totalInterviews} sessions completed`
                                : "No data yet"}
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Selection Rate</p>
                                {isRecentLoading ? (
                                    <div className="h-8 w-20 rounded-lg bg-secondary/60 animate-pulse" />
                                ) : (
                                    <p className="text-4xl font-bold tracking-tight">
                                        {insights?.selectionRate != null ? `${insights.selectionRate}%` : "--"}
                                    </p>
                                )}
                            </div>
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Trophy className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                            {insights && insights.completedInterviews > 0
                                ? `${insights.selectedInterviews}/${insights.completedInterviews} completed interviews`
                                : "Complete interviews to track this"}
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Active-Day Streak</p>
                                {isRecentLoading ? (
                                    <div className="h-8 w-20 rounded-lg bg-secondary/60 animate-pulse" />
                                ) : (
                                    <p className="text-4xl font-bold tracking-tight">
                                        {insights?.activeDayStreak ?? 0}d
                                    </p>
                                )}
                            </div>
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Flame className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                            {insights
                                ? `${insights.thisWeekCount} sessions this week | Avg time ${formatAverageSeconds(insights.averageTimeTakenSeconds)}`
                                : "Start interviewing to build consistency"}
                        </div>
                    </CardContent>
                </Card>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h2 className="text-lg font-semibold tracking-tight">Comparisons</h2>
                    <p className="text-xs text-muted-foreground">Role performance and difficulty mix</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="premium-card">
                        <CardHeader>
                            <CardTitle className="text-lg">Role-Wise Average Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full mt-4">
                                {isRecentLoading ? (
                                    <div className="h-full w-full rounded-xl bg-secondary/40 animate-pulse" />
                                ) : rolePerformanceData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                                        Not enough completed interviews to compare roles.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={rolePerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis
                                                dataKey="role"
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
                                                formatter={(value: number, _name, payload) => [
                                                    `${value} / 100 (${payload.payload.sessions} sessions)`,
                                                    "Average Score",
                                                ]}
                                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                            />
                                            <Bar
                                                dataKey="score"
                                                fill="var(--color-primary)"
                                                radius={[6, 6, 0, 0]}
                                                barSize={36}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="premium-card">
                        <CardHeader>
                            <CardTitle className="text-lg">Difficulty Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full mt-4">
                                {isRecentLoading ? (
                                    <div className="h-full w-full rounded-xl bg-secondary/40 animate-pulse" />
                                ) : difficultyData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                                        No interview difficulty data available.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={difficultyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis
                                                dataKey="difficulty"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: "#f3f4f6" }}
                                                formatter={(value: number) => [`${value} interview(s)`, "Sessions"]}
                                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill="var(--color-primary)"
                                                radius={[6, 6, 0, 0]}
                                                barSize={42}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <h2 className="text-lg font-semibold tracking-tight">Score Trend</h2>
                    <p className="text-xs text-muted-foreground">How scores move over time</p>
                </div>

                <Card className="premium-card">
                    <CardHeader>
                        <CardTitle className="text-lg">Score Progression</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            {isRecentLoading ? (
                                <div className="h-full w-full rounded-xl bg-secondary/40 animate-pulse" />
                            ) : (insights?.progressData.length ?? 0) === 0 ? (
                                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                                    No completed interviews with scores yet.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={insights?.progressData ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#6b7280", fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#6b7280", fontSize: 12 }}
                                            domain={[0, 100]}
                                        />
                                        <Tooltip
                                            cursor={{ stroke: "#e5e7eb", strokeWidth: 2, strokeDasharray: "4 4" }}
                                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="score"
                                            stroke="var(--color-primary)"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorScore)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </section>

            <div>
                <div className="flex items-center justify-between mb-6 border-b border-border/40 pb-4">
                    <h2 className="text-xl font-semibold tracking-tight">Recent Interviews</h2>
                    <p className="text-xs text-muted-foreground">
                        {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : "Loaded once on page open"}
                    </p>
                </div>

                <div className="grid gap-4">
                    {isRecentLoading ? (
                        <Card className="premium-card">
                            <CardContent className="p-5 text-sm text-muted-foreground">
                                Preparing your recent interviews...
                            </CardContent>
                        </Card>
                    ) : recentError ? (
                        <Card className="premium-card">
                            <CardContent className="p-5 text-sm text-destructive">{recentError}</CardContent>
                        </Card>
                    ) : recentInterviews.length === 0 ? (
                        <Card className="premium-card">
                            <CardContent className="p-5 text-sm text-muted-foreground">
                                You have not run any interviews yet. Start a new session to see your history here.
                            </CardContent>
                        </Card>
                    ) : (
                        recentInterviews.map((interview) => (
                            <Link
                                key={interview.id}
                                href={interview.status === "active" ? `/interview/session/${interview.id}` : `/reports/${interview.id}`}
                            >
                                <Card className="premium-card hover:bg-secondary/20 transition-colors group cursor-pointer border-transparent hover:border-border/60">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                    {interview.role}
                                                </h4>
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {formatCreatedAt(interview.created_at)} | {interview.difficulty_level}
                                                </p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <Badge variant="outline" className={getStatusBadgeClass(interview.status)}>
                                                        {interview.status.replace("_", " ")}
                                                    </Badge>
                                                    {interview.selected_status && (
                                                        <Badge variant="secondary" className="capitalize">
                                                            {interview.selected_status}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="min-w-[220px]">
                                                <div className="flex justify-between text-xs font-medium mb-1.5">
                                                    <span className="text-muted-foreground">Progress</span>
                                                    <span className="text-foreground">{interview.questions_answered}/{interview.questions_total}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full"
                                                        style={{ width: `${interview.progress_percent}%` }}
                                                    />
                                                </div>
                                                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                                    <span>Score: {interview.score ?? "--"} / 100</span>
                                                    <span>Time: {formatTimeTaken(interview.time_taken)}</span>
                                                </div>
                                            </div>
                                            <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}

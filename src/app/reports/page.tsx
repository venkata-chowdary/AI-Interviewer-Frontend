"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, TrendingUp, Calendar, Target, Activity } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";

// Mock data for overall progress over time
const progressData = [
    { date: "Jan 12", score: 62 },
    { date: "Jan 19", score: 65 },
    { date: "Feb 02", score: 70 },
    { date: "Feb 15", score: 68 },
    { date: "Feb 24", score: 74 },
];

// Mock data for skill radar
const skillData = [
    { subject: "System Design", A: 85, fullMark: 100 },
    { subject: "REST APIs", A: 90, fullMark: 100 },
    { subject: "Databases", A: 80, fullMark: 100 },
    { subject: "Caching", A: 60, fullMark: 100 },
    { subject: "Concurrency", A: 75, fullMark: 100 },
    { subject: "Algorithms", A: 65, fullMark: 100 },
];

interface RecentInterview {
    id: string;
    role: string;
    difficulty_level: string;
    status: string;
    score: number | null;
    selected_status: string | null;
    time_taken: number | null;
    created_at: string;
    questions_total: number;
    questions_answered: number;
    progress_percent: number;
}

export default function AnalyticsDashboardPage() {
    const { token, user, logout } = useAuth();
    const [recentInterviews, setRecentInterviews] = useState<RecentInterview[]>([]);
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
                const response = await fetch("http://localhost:8000/api/interviews/recent?limit=10", {
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

                const data: RecentInterview[] = await response.json();
                if (isMounted) {
                    setRecentInterviews(data);
                    setRecentError(null);
                    setLastUpdated(new Date());
                }
            } catch (error) {
                if (isMounted) {
                    setRecentError(error instanceof Error ? error.message : "Network error while loading recent interviews.");
                }
            } finally {
                if (isMounted) {
                    setIsRecentLoading(false);
                }
            }
        };

        fetchRecentInterviews();
        const intervalId = setInterval(fetchRecentInterviews, 5000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [token, user, logout]);

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

    const getStatusBadgeClass = (status: string) => {
        if (status === "completed") return "bg-green-500/10 text-green-700 border-green-500/20";
        if (status === "under_evaluation") return "bg-amber-500/10 text-amber-700 border-amber-500/20";
        if (status === "failed_evaluation") return "bg-destructive/10 text-destructive border-destructive/20";
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
    };

    return (
        <div className="mx-auto max-w-6xl space-y-10 animate-in fade-in duration-700">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Performance Analytics
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Track your interview progression and skill development over time.
                    </p>
                </div>
                <Button className="rounded-xl px-6" asChild>
                    <Link href="/interview/start">
                        New Interview
                    </Link>
                </Button>
            </header>

            {/* Top Level KPIs */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="premium-card">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                                <div className="flexItems-baseline gap-2">
                                    <p className="text-4xl font-bold tracking-tight">69.8</p>
                                </div>
                            </div>
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Target className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5 text-sm">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-green-500 font-medium">+12%</span>
                            <span className="text-muted-foreground ml-1">from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Interviews Taken</p>
                                <p className="text-4xl font-bold tracking-tight">5</p>
                            </div>
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-secondary text-foreground">
                                <Activity className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">2</span> this week
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Strongest Skill</p>
                                <p className="text-2xl font-bold tracking-tight mt-2">REST APIs</p>
                            </div>
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                                <ArrowUpRight className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                            Based on <span className="font-medium text-foreground">14 questions</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {/* Score Over Time (Area Chart) */}
                <Card className="premium-card lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Score Progression</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                        cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '4 4' }}
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
                        </div>
                    </CardContent>
                </Card>

                {/* Skill Radar Chart */}
                <Card className="premium-card">
                    <CardHeader>
                        <CardTitle className="text-lg">Skill Radar</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <div className="h-[300px] w-full max-w-[300px] -mt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: "#374151", fontSize: 11, fontWeight: 500 }}
                                    />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Skill Match"
                                        dataKey="A"
                                        stroke="var(--color-primary)"
                                        strokeWidth={2}
                                        fill="var(--color-primary)"
                                        fillOpacity={0.2}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Interview History List */}
            <div>
                <div className="flex items-center justify-between mb-6 border-b border-border/40 pb-4">
                    <h2 className="text-xl font-semibold tracking-tight">Recent Interviews</h2>
                    <p className="text-xs text-muted-foreground">
                        {lastUpdated ? `Live refresh (5s) • Updated ${lastUpdated.toLocaleTimeString()}` : "Live refresh (5s)"}
                    </p>
                </div>

                <div className="grid gap-4">
                    {isRecentLoading ? (
                        <Card className="premium-card">
                            <CardContent className="p-5 text-sm text-muted-foreground">Loading recent interviews...</CardContent>
                        </Card>
                    ) : recentError ? (
                        <Card className="premium-card">
                            <CardContent className="p-5 text-sm text-destructive">{recentError}</CardContent>
                        </Card>
                    ) : recentInterviews.length === 0 ? (
                        <Card className="premium-card">
                            <CardContent className="p-5 text-sm text-muted-foreground">No interviews found yet. Start one to see live history here.</CardContent>
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
                                                    {formatCreatedAt(interview.created_at)} • {interview.difficulty_level}
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
                                            <div className="min-w-[200px]">
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

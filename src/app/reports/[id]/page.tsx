"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    XCircle,
    Award,
    BookOpen
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const performanceData = [
    { name: "REST APIs", score: 90 },
    { name: "Database Indexing", score: 85 },
    { name: "System Design", score: 65 },
    { name: "Caching", score: 60 },
    { name: "Concurrency", score: 75 },
];

export default function ReportPage({ params }: { params: { id: string } }) {
    return (
        <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in duration-700">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            Mock Interview Result
                        </Badge>
                        <span className="text-sm text-muted-foreground">Today at 2:00 PM</span>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Backend Engineering Assesment
                    </h1>
                </div>

                <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-border/40">
                    <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Overall Score</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-4xl font-bold tracking-tighter">74</span>
                            <span className="text-muted-foreground">/ 100</span>
                        </div>
                    </div>
                    <Award className="h-12 w-12 text-yellow-500/90" />
                </div>
            </header>

            {/* Primary Analytics Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Core Dimensions */}
                <Card className="premium-card col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Core Dimensions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-foreground">Technical Accuracy</span>
                                <span className="text-muted-foreground">85%</span>
                            </div>
                            <Progress value={85} className="h-2 bg-secondary" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-foreground">System Depth</span>
                                <span className="text-muted-foreground">62%</span>
                            </div>
                            <Progress value={62} className="h-2 bg-secondary" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-foreground">Clarity & Communication</span>
                                <span className="text-muted-foreground">78%</span>
                            </div>
                            <Progress value={78} className="h-2 bg-secondary" />
                        </div>
                    </CardContent>
                </Card>

                {/* Chart Visualization */}
                <Card className="premium-card col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Skill Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Analysis & Study Plan */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Strengths & Weaknesses */}
                <Card className="premium-card border-none bg-secondary/30">
                    <CardContent className="p-6 space-y-6">
                        <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-4 text-lg">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                Strong Areas
                            </h3>
                            <ul className="space-y-2 text-muted-foreground text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">•</span>
                                    Excellent grasp of RESTful design principles and state management.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">•</span>
                                    Solid understanding of relational database indexing and query optimization.
                                </li>
                            </ul>
                        </div>

                        <div className="h-px w-full bg-border/50" />

                        <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-4 text-lg">
                                <XCircle className="h-5 w-5 text-destructive" />
                                Areas for Improvement
                            </h3>
                            <ul className="space-y-2 text-muted-foreground text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-destructive mt-0.5">•</span>
                                    Struggled with trade-offs in distributed systems (CAP theorem applications).
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-destructive mt-0.5">•</span>
                                    Needs deeper understanding of specific caching eviction policies under load.
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Study Plan */}
                <Card className="premium-card overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-border/40 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Recommended Study Plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ul className="space-y-6">
                            <li className="relative pl-6">
                                <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary" />
                                <h4 className="font-medium text-foreground">Deep dive: Redis Eviction Strategies</h4>
                                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                    Review differences between LRU, LFU, and volatile vs. allkeys policies. Read Redis documentation on memory management.
                                </p>
                            </li>
                            <li className="relative pl-6">
                                <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary" />
                                <h4 className="font-medium text-foreground">Practice System Design</h4>
                                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                    Focus on designing high-throughput systems. Study rate limiting, load balancer algorithms, and database sharding techniques.
                                </p>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}

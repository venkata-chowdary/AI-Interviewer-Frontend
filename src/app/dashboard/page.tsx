import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, Code, FileText, Target } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500">
            <header className="flex items-end justify-between border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Welcome back, Alex
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
                <Card className="premium-card col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Brain className="h-5 w-5 text-primary" />
                            Developer Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                                Extracted Skills from Resume
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {["Python", "FastAPI", "React", "Next.js", "Docker", "PostgreSQL", "Redis", "System Design"].map((skill) => (
                                    <Badge
                                        key={skill}
                                        variant="secondary"
                                        className="rounded-md bg-secondary/60 px-2.5 py-1 text-sm font-normal text-secondary-foreground"
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 rounded-xl border border-border/50 bg-secondary/20 p-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Target Role</p>
                                <p className="font-semibold text-foreground">Backend Engineer</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Experience Level</p>
                                <p className="font-semibold text-foreground">Mid-Senior</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Score Card */}
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

            {/* Focus Areas */}
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

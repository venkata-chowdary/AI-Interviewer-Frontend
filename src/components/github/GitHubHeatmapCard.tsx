"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Activity, ExternalLink, Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GitHubHeatmapCardProps {
    username?: string | null;
}

export function GitHubHeatmapCard({ username }: GitHubHeatmapCardProps) {
    const [failedSource, setFailedSource] = useState<string | null>(null);
    const normalizedUsername = username?.trim().replace(/^@/, "") ?? "";
    const profileUrl = normalizedUsername
        ? `https://github.com/${encodeURIComponent(normalizedUsername)}`
        : "";
    const heatmapUrl = normalizedUsername
        ? `https://ghchart.rshah.org/${encodeURIComponent(normalizedUsername)}`
        : "";
    const imageError = Boolean(heatmapUrl) && failedSource === heatmapUrl;

    if (!normalizedUsername) {
        return (
            <Card className="premium-card overflow-hidden">
                <CardHeader className="border-b border-border/40">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Github className="h-5 w-5 text-primary" />
                        GitHub Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Activity className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-base font-medium text-foreground">
                            Add a GitHub username to enable the contribution heat map.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Save your GitHub handle in settings and the dashboard will pull in your public activity grid.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/settings">Open Settings</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="premium-card overflow-hidden border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(17,24,39,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,250,251,0.94))] shadow-xl shadow-black/5">
            <CardHeader className="border-b border-border/40 px-4 py-2.5">
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Github className="h-5 w-5 text-primary" />
                            GitHub Activity
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">@{normalizedUsername}</p>
                    </div>
                    <Button asChild variant="outline" className="h-9 w-fit rounded-lg bg-white/80 px-3.5 shadow-sm">
                        <a href={profileUrl} target="_blank" rel="noreferrer">
                            View Profile
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-3">
                <div className="rounded-2xl border border-border/50 bg-white/80 p-2.5 shadow-sm">
                    {imageError ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-6 text-sm text-amber-800">
                            The contribution graph could not be loaded for this username right now. Check the handle in settings or try again later.
                        </div>
                    ) : (
                        <div className="rounded-xl bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,0.95))] p-1.5 sm:p-2">
                            <Image
                                key={normalizedUsername}
                                src={heatmapUrl}
                                alt={`${normalizedUsername} GitHub contribution heat map`}
                                width={1080}
                                height={170}
                                unoptimized
                                className="block h-auto w-full rounded-xl"
                                sizes="(max-width: 1024px) 100vw, 960px"
                                loading="lazy"
                                onError={() => setFailedSource(heatmapUrl)}
                                onLoad={() => setFailedSource((current) => (current === heatmapUrl ? null : current))}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}




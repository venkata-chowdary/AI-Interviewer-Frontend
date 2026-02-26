import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play } from "lucide-react";
import Link from "next/link";

export default function StartInterviewPage() {
    return (
        <div className="mx-auto max-w-2xl space-y-8 animate-in slide-in-from-bottom-4 duration-500 pt-10">
            <header className="text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Start Mock Interview
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Configure your session based on the skills we extracted.
                </p>
            </header>

            <Card className="premium-card p-6">
                <CardContent className="space-y-8 p-0">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Role
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-14 justify-start px-4 text-left border-primary bg-primary/5 shadow-sm">
                                Backend Engineer
                            </Button>
                            <Button variant="outline" className="h-14 justify-start px-4 text-left font-normal text-muted-foreground">
                                ML Engineer
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Difficulty
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <Button variant="outline" className="h-12 font-normal text-muted-foreground">
                                Easy
                            </Button>
                            <Button variant="outline" className="h-12 border-primary bg-primary/5 shadow-sm">
                                Medium
                            </Button>
                            <Button variant="outline" className="h-12 font-normal text-muted-foreground">
                                Hard
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Duration
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <Button variant="outline" className="h-12 border-primary bg-primary/5 shadow-sm">
                                10 mins
                            </Button>
                            <Button variant="outline" className="h-12 font-normal text-muted-foreground">
                                20 mins
                            </Button>
                            <Button variant="outline" className="h-12 font-normal text-muted-foreground">
                                30 mins
                            </Button>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button asChild className="w-full h-14 rounded-xl text-lg shadow-lg shadow-primary/25">
                            <Link href="/interview/session">
                                <Play className="mr-2 h-5 w-5 fill-current" />
                                Begin Session
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

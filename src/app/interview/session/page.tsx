"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Send, CheckCircle2 } from "lucide-react";

export default function InterviewSessionPage() {
    const [answer, setAnswer] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer.trim()) return;

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setFeedback("Good understanding of the caching strategy. You correctly identified cache invalidation as a key challenge. However, you could improve by mentioning specific eviction policies like LRU or LFU.");
        }, 1500);
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header & Progress */}
            <header className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium tracking-tight text-foreground">
                        Backend Engineering Mock Interview
                    </h2>
                    <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                        18:42 remaining
                    </span>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground font-medium">
                        <span>Question 3 of 8</span>
                        <span>37% Complete</span>
                    </div>
                    <Progress value={37} className="h-2 bg-secondary" />
                </div>
            </header>

            {/* Main Content Area */}
            <Card className="premium-card overflow-hidden">
                {/* The Question */}
                <div className="bg-primary/[0.03] border-b border-border/40 p-8">
                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                        System Design
                    </span>
                    <h1 className="text-2xl font-semibold leading-relaxed text-foreground">
                        Explain how Redis improves backend performance. What are the common challenges when implementing caching strategies?
                    </h1>
                </div>

                {/* Answer Area */}
                <CardContent className="p-8">
                    {!feedback ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <label htmlFor="answer" className="sr-only">Your Answer</label>
                            <textarea
                                id="answer"
                                className="w-full min-h-[250px] resize-y rounded-xl border border-border/60 bg-white p-5 text-base leading-relaxed text-foreground placeholder-muted-foreground/60 shadow-sm focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                                placeholder="Type your answer here..."
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                disabled={isSubmitting}
                                autoFocus
                            />
                            <div className="flex justify-end pt-2">
                                <Button
                                    type="submit"
                                    disabled={!answer.trim() || isSubmitting}
                                    className="rounded-xl px-8 h-12 shadow-md shadow-primary/20"
                                >
                                    {isSubmitting ? (
                                        "Evaluating your response..."
                                    ) : (
                                        <>
                                            Submit Answer
                                            <Send className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        /* Feedback State */
                        <div className="animate-in fade-in duration-500 space-y-8">
                            <div className="flex gap-4 items-start p-6 bg-secondary/30 rounded-2xl border border-border/40">
                                <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full border-4 border-green-500/20 bg-white shadow-sm">
                                    <span className="text-xl font-bold text-foreground">7.2</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        Feedback
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    </h3>
                                    <p className="mt-2 text-muted-foreground leading-relaxed">
                                        {feedback}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button className="rounded-xl px-8 h-12">
                                    Next Question
                                    <Send className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

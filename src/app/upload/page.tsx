import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudUpload, FileText, CheckCircle2 } from "lucide-react";

export default function UploadPage() {
    return (
        <div className="mx-auto max-w-3xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header className="text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Upload Your Resume
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Our AI will extract your skills to customize your technical interview.
                </p>
            </header>

            {/* Upload Zone */}
            <Card className="premium-card overflow-hidden transition-all duration-300 hover:border-primary/50 hover:bg-primary/5">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CloudUpload className="h-10 w-10" />
                    </div>
                    <h3 className="mb-2 text-xl font-medium text-foreground">
                        Drag & Drop Resume
                    </h3>
                    <p className="mb-6 text-sm text-muted-foreground">
                        Supported formats: PDF, DOCX (Max 5MB)
                    </p>
                    <Button size="lg" className="rounded-xl px-8 shadow-md shadow-primary/20">
                        Browse Files
                    </Button>
                </CardContent>
            </Card>

            {/* Mock Processed State (for UI demonstration purposes) */}
            <div className="mt-12 space-y-6 rounded-2xl border border-border/60 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <h3 className="text-lg font-medium">Resume Processed Successfully!</h3>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-border/40 bg-secondary/30 p-4">
                    <FileText className="h-8 w-8 text-primary/80" />
                    <div>
                        <p className="font-medium">alex_backend_resume_2024.pdf</p>
                        <p className="text-xs text-muted-foreground">Loaded 12 seconds ago</p>
                    </div>
                </div>

                <div>
                    <p className="mb-3 text-sm font-medium text-muted-foreground">
                        Extracted Skills Snapshot
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {["Python", "FastAPI", "PostgreSQL", "System Architecture", "Redis", "Docker"].map((skill) => (
                            <Badge
                                key={skill}
                                className="animate-in zoom-in rounded-lg bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/20"
                                variant="secondary"
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button variant="outline" className="rounded-xl px-6">
                        Continue to Interview
                    </Button>
                </div>
            </div>
        </div>
    );
}

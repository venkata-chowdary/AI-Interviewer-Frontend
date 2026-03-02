"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudUpload, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function UploadPage() {
    const { user, token, logout } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== "application/pdf") {
                setError("Please upload a PDF file.");
                setFile(null);
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                setError("File is too large. Maximum size is 5MB.");
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
            setUploadSuccess(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleUploadSubmit = async () => {
        if (!file || !user) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("user_id", user.id); // Send user ID as Form data

        try {
            const response = await fetch("http://localhost:8000/upload-resume", {
                method: "POST",
                headers: {
                    // Note: fetch will automatically set Content-Type to multipart/form-data 
                    // with the correct boundary when passing FormData
                    ...(token && { "Authorization": `Bearer ${token}` }),
                },
                body: formData,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    return;
                }
                const data = await response.json();
                throw new Error(data.detail || "Failed to upload resume");
            }

            setUploadSuccess(true);
        } catch (err: any) {
            setError(err.message || "An error occurred during upload");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header className="text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Upload Your Resume
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Upload your resume to get a personalized interview tailored to your experience.
                </p>
            </header>

            {error && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-destructive border border-destructive/20 animate-in fade-in">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {!uploadSuccess ? (
                /* Upload Zone */
                <Card
                    className="premium-card overflow-hidden transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                    onClick={handleUploadClick}
                >
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center h-full">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="application/pdf"
                            className="hidden"
                        />

                        {isUploading ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="mb-6 h-16 w-16 animate-spin text-primary" />
                                <h3 className="mb-2 text-xl font-medium text-foreground">
                                    Processing your resume...
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-xs">
                                    Our AI is currently chunking and indexing your resume content for interview context.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <CloudUpload className="h-10 w-10" />
                                </div>
                                <h3 className="mb-2 text-xl font-medium text-foreground">
                                    {file ? file.name : "Drag & Drop Resume"}
                                </h3>
                                <p className="mb-6 text-sm text-muted-foreground">
                                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Supported formats: PDF (Max 5MB)"}
                                </p>
                                <Button
                                    size="lg"
                                    className="rounded-xl px-8 shadow-md shadow-primary/20"
                                    onClick={(e) => {
                                        if (file) {
                                            e.stopPropagation(); // prevent clicking the card triggers input again
                                            handleUploadSubmit();
                                        }
                                    }}
                                >
                                    {file ? "Upload to AI" : "Browse Files"}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            ) : (
                /* Success State */
                <div className="mt-12 space-y-6 rounded-2xl border border-border/60 bg-white p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        <h3 className="text-lg font-medium">Resume Processed Successfully!</h3>
                    </div>

                    <div className="flex items-start gap-4 rounded-xl border border-border/40 bg-secondary/30 p-4">
                        <FileText className="h-8 w-8 text-primary/80" />
                        <div>
                            <p className="font-medium">{file?.name}</p>
                            <p className="text-xs text-muted-foreground">Loaded just now</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <Button variant="outline" onClick={() => { setFile(null); setUploadSuccess(false); }} className="rounded-xl px-6">
                            Upload Another
                        </Button>
                        <Button
                            className="rounded-xl px-6"
                            onClick={() => router.push('/interview/start')}
                        >
                            Continue to Interview
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

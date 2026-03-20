"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(user?.email ?? "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"request" | "verify" | "done">("request");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/auth/email/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to request OTP");
      }
      // We don't expose the OTP from the API anymore.
      // In development, the code is printed in the backend logs.
      await res.json();
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to verify email");
      }
      setStep("done");
      setTimeout(() => {
        router.push("/settings");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in duration-500">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Verify your email
          </h1>
          <p className="text-muted-foreground text-center">
            Complete verification to secure your account and unlock all features.
          </p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Email verification</CardTitle>
            <CardDescription>
              {step === "request"
                ? "We will send a one-time code to your email."
                : step === "verify"
                ? "Enter the 6-digit code sent to your email."
                : "Your email is now verified."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "done" ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <p className="text-sm text-muted-foreground">
                  Email verified successfully. Redirecting to settings...
                </p>
              </div>
            ) : (
              <form
                onSubmit={step === "request" ? handleRequestOtp : handleVerifyOtp}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!user?.email}
                    className="rounded-xl h-12 bg-white"
                    required
                  />
                </div>

                {step === "verify" && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification code</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="rounded-xl h-12 bg-white tracking-[0.4em] text-center"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Check your email (or backend logs in dev) for the code.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base shadow-lg shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Please wait...
                    </>
                  ) : step === "request" ? (
                    "Send verification code"
                  ) : (
                    "Verify email"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

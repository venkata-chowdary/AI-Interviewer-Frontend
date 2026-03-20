"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Bell,
    Shield,
    Laptop,
    Camera,    Loader2,
    KeyRound,
    Github,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { user, token, login } = useAuth();
    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [bio, setBio] = useState("");
    const [githubUsername, setGithubUsername] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [showTimer, setShowTimer] = useState<boolean>(() => {
        if (typeof window === "undefined") return true;
        const stored = window.localStorage.getItem("timer_visibility");
        return stored === null ? true : stored === "true";
    });
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;

        const loadProfile = async () => {
            try {
                const res = await fetch("http://localhost:8000/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) return;
                const data = await res.json();
                setFirstName(data.first_name || "");
                setLastName(data.last_name || "");
                setBio(data.bio || "");
                setGithubUsername(data.github_username || "");

                if (user) {
                    login(token, {
                        ...user,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        bio: data.bio,
                        github_username: data.github_username,
                        is_email_verified: data.is_email_verified,
                    });
                }
                setProfileLoaded(true);
            } catch {
                // ignore for now
            }
        };

        loadProfile();
    }, [token, login, user]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem("timer_visibility", String(showTimer));
        }
    }, [showTimer]);

    const handleChangePassword = async () => {
        if (!token) return;
        setPasswordError(null);
        setPasswordSuccess(null);

        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirmation do not match.");
            return;
        }

        setIsChangingPassword(true);
        try {
            const res = await fetch("http://localhost:8000/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setPasswordError(data.detail || "Failed to change password. Please try again.");
                return;
            }

            setPasswordSuccess("Password updated successfully.");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch {
            setPasswordError("Something went wrong. Please try again.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSave = async () => {
        if (!token) return;
        setIsSaving(true);
        try {
            const res = await fetch("http://localhost:8000/auth/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    bio,
                    github_username: githubUsername,
                }),
            });
            if (!res.ok) return;
            const data = await res.json();
            if (user) {
                login(token, {
                    ...user,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    bio: data.bio,
                    github_username: data.github_username,
                    is_email_verified: data.is_email_verified,
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in duration-700">

            {/* Simple Header */}
            <div className="flex items-end justify-between border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Account Settings
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Manage your profile, interview preferences, and communication settings.
                    </p>
                </div>
            </div>

            {/* Main Settings Body */}
            <Tabs defaultValue="profile" className="space-y-8">
                <TabsList className="bg-secondary/60 p-1.5 rounded-2xl border border-border/50 inline-flex h-auto w-full md:w-auto shadow-sm">
                    <TabsTrigger value="profile" className="rounded-xl px-6 py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                        <User className="w-4 h-4 mr-2" />
                        Public Profile
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="rounded-xl px-6 py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                        <Laptop className="w-4 h-4 mr-2" />
                        Interview Engine
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-xl px-6 py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                        <Bell className="w-4 h-4 mr-2" />
                        Comms
                    </TabsTrigger>
                </TabsList>

                {/* --- PROFILE TAB --- */}
                <TabsContent value="profile" className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">

                    {/* Top Profile Banner */}
                    <Card className="premium-card overflow-hidden border-none shadow-md">
                        <div className="h-32 bg-gradient-to-r from-primary/30 via-primary/10 to-secondary/30 w-full" />
                        <CardContent className="px-8 pb-8 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12 sm:-mt-16">
                                <div className="relative group inline-block">
                                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl bg-white relative z-10 transition-transform duration-300 group-hover:scale-105">
                                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" className="object-cover" />
                                        <AvatarFallback className="text-3xl bg-primary/10 text-primary font-light">
                                            {(firstName || lastName
                                                ? `${firstName || ""}${lastName ? lastName.charAt(0) : ""}`
                                                : (user?.email ?? "??").slice(0, 2)
                                            ).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <button className="absolute bottom-2 -right-1 z-20 bg-primary text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="mb-2 space-y-1.5 mt-4 sm:mt-0">
                                    <h3 className="text-2xl font-bold tracking-tight">
                                        {firstName || lastName
                                            ? `${firstName} ${lastName}`.trim()
                                            : user?.email?.split("@")[0] ?? "Your public profile"}
                                    </h3>
                                    <p className="text-muted-foreground text-sm font-medium">
                                        {bio
                                            ? bio
                                            : "Tell recruiters a bit about yourself in your professional bio."}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 sm:mt-0 flex items-center gap-3 mb-2">
                                <Button variant="outline" className="rounded-xl bg-white shadow-sm border-border/60 hover:bg-secondary/50 h-10 text-sm font-medium">
                                    View Public Profile
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Column: Detailed Form */}
                        <Card className="premium-card col-span-1 md:col-span-2 h-fit relative overflow-hidden">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl">Personal Information</CardTitle>
                                <CardDescription>
                                    Update your details and how recruiters see you.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {!profileLoaded && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            <span className="text-xs text-muted-foreground">
                                                Getting your profile ready…
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <Label htmlFor="firstName" className="text-muted-foreground">First name</Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="rounded-xl h-12 bg-secondary/20 border-border/60 focus:bg-white transition-colors"
                                            disabled={!profileLoaded}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="lastName" className="text-muted-foreground">Last name</Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="rounded-xl h-12 bg-secondary/20 border-border/60 focus:bg-white transition-colors"
                                            disabled={!profileLoaded}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-muted-foreground flex items-center justify-between">
                                        Email Address{" "}
                                        <Badge
                                            variant="secondary"
                                            className={`font-normal text-xs border-none ${
                                                user?.is_email_verified
                                                    ? "bg-green-500/10 text-green-600"
                                                    : "bg-yellow-500/10 text-yellow-700"
                                            }`}
                                        >
                                            {user?.is_email_verified ? "Verified" : "Not verified"}
                                        </Badge>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user?.email ?? ""}
                                        disabled
                                        className="rounded-xl h-12 bg-secondary/30 text-muted-foreground border-transparent opacity-80"
                                    />
                                    {!user?.is_email_verified && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 rounded-xl"
                                            onClick={() => router.push("/verify-email")}
                                            disabled={!profileLoaded}
                                        >
                                            Verify email
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="bio" className="text-muted-foreground">Professional Bio</Label>
                                    <textarea
                                        id="bio"
                                        className="w-full min-h-[120px] resize-y rounded-xl border border-border/60 bg-secondary/20 focus:bg-white p-4 text-sm leading-relaxed text-foreground placeholder-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        disabled={!profileLoaded}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="githubUsername" className="text-muted-foreground">
                                        GitHub Username
                                    </Label>
                                    <div className="relative">
                                        <Github className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="githubUsername"
                                            value={githubUsername}
                                            onChange={(e) => setGithubUsername(e.target.value)}
                                            placeholder="octocat or github.com/octocat"
                                            className="rounded-xl h-12 bg-secondary/20 border-border/60 pl-11 focus:bg-white transition-colors"
                                            disabled={!profileLoaded}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Used to render your GitHub contribution heat map on the dashboard.
                                    </p>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-border/40 mt-8 pt-8">
                                    <p className="text-sm text-muted-foreground">
                                        {profileLoaded
                                            ? "Your latest profile details are saved."
                                            : "Fetching your profile details…"}
                                    </p>
                                    <Button
                                        className="rounded-xl px-8 shadow-md h-11"
                                        onClick={handleSave}
                                        disabled={isSaving || !profileLoaded}
                                    >
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column: Security & Danger Zone */}
                        <div className="col-span-1 space-y-8">
                            <Card className="premium-card h-fit">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <KeyRound className="w-5 h-5" />
                                        Change Password
                                    </CardTitle>
                                    <CardDescription>
                                        Update your password using your current credentials.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="oldPassword">Current password</Label>
                                        <Input
                                            id="oldPassword"
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="rounded-xl h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New password</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="rounded-xl h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm new password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="rounded-xl h-10"
                                        />
                                    </div>

                                    {passwordError && (
                                        <p className="text-sm text-destructive">{passwordError}</p>
                                    )}
                                    {passwordSuccess && (
                                        <p className="text-sm text-emerald-600">{passwordSuccess}</p>
                                    )}

                                    <Button
                                        className="w-full rounded-xl h-11"
                                        onClick={handleChangePassword}
                                        disabled={isChangingPassword || !oldPassword || !newPassword || !confirmPassword}
                                    >
                                        {isChangingPassword ? "Updating..." : "Update Password"}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="premium-card border-destructive/20 bg-destructive/[0.02] h-fit">
                                <CardHeader>
                                    <CardTitle className="text-xl text-destructive flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        Data & Privacy
                                    </CardTitle>
                                    <CardDescription>
                                        Permanently delete your account and wipe all uploaded resumes and interview history.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="destructive" className="w-full rounded-xl bg-destructive hover:bg-destructive/90 shadow-sm shadow-destructive/20 h-11">
                                        Delete Account
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* --- PREFERENCES TAB --- */}
                <TabsContent value="preferences" className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <Card className="premium-card">
                        <CardHeader className="pb-6">
                            <CardTitle className="text-xl">AI Interview Engine</CardTitle>
                            <CardDescription>
                                Customize how you are evaluated during mock interviews.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="group flex items-center justify-between rounded-2xl border border-border/40 p-6 bg-white hover:border-primary/30 transition-colors shadow-sm">
                                <div className="space-y-1.5 max-w-[80%]">
                                    <Label className="text-base font-semibold">Strict Mode Evaluation</Label>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Get evaluated more strictly on edge cases, system design, and performance. Recommended for senior roles.
                                    </p>
                                </div>
                                <Switch className="data-[state=checked]:bg-primary opacity-50 cursor-not-allowed" disabled />
                            </div>

                            <div className="group flex items-center justify-between rounded-2xl border border-border/40 p-6 bg-white hover:border-primary/30 transition-colors shadow-sm">
                                <div className="space-y-1.5 max-w-[80%]">
                                    <Label className="text-base font-semibold">Mock Pressure Mode</Label>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Experience rapid follow-up questions and challenged assumptions to simulate high-stress interviews.
                                    </p>
                                </div>
                                <Switch className="opacity-50 cursor-not-allowed" disabled />
                            </div>

                            <div className="group flex items-center justify-between rounded-2xl border border-border/40 p-6 bg-white hover:border-primary/30 transition-colors shadow-sm">
                                <div className="space-y-1.5 max-w-[80%]">
                                    <Label className="text-base font-semibold">Timer Visibility</Label>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Show the countdown timer during interviews. Turn off to reduce pressure.
                                    </p>
                                </div>
                                <Switch
                                    checked={showTimer}
                                    onCheckedChange={setShowTimer}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- NOTIFICATIONS TAB --- */}
                <TabsContent value="notifications" className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <Card className="premium-card">
                        <CardHeader className="pb-6">
                            <CardTitle className="text-xl">Communication Settings</CardTitle>
                            <CardDescription>
                                Manage your email notifications.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="flex items-center justify-between rounded-2xl border border-border/40 p-6 bg-white shadow-sm opacity-50">
                                <div className="space-y-1.5 max-w-[80%]">
                                    <Label className="text-base font-semibold">Weekly Summary</Label>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Get a weekly digest of your interview performance and progress.
                                    </p>
                                </div>
                                <Switch defaultChecked className="data-[state=checked]:bg-primary cursor-not-allowed" disabled />
                            </div>

                            <div className="flex items-center justify-between rounded-2xl border border-border/40 p-6 bg-white shadow-sm opacity-50">
                                <div className="space-y-1.5 max-w-[80%]">
                                    <Label className="text-base font-semibold">Study Plan Reminders</Label>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Get email reminders for your study plans to stay on track.
                                    </p>
                                </div>
                                <Switch defaultChecked className="data-[state=checked]:bg-primary cursor-not-allowed" disabled />
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}



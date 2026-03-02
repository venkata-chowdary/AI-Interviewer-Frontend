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
    Camera,
    CheckCircle2,
    Sparkles
} from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="mx-auto max-w-5xl space-y-10 animate-in fade-in duration-700">

            {/* Premium Header Area with Background Accent */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 border border-border/40 shadow-sm">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                    <Sparkles className="w-48 h-48 text-primary" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Badge className="bg-primary text-primary-foreground hover:bg-primary shadow-md">
                                Pro Plan
                            </Badge>
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-green-500" /> All systems active
                            </span>
                        </div>
                        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                            Account Settings
                        </h1>
                        <p className="mt-2 text-lg text-muted-foreground max-w-xl">
                            Manage your profile, interview preferences, and account settings.
                        </p>
                    </div>
                    <Button className="rounded-xl px-8 shadow-lg shadow-primary/20 h-12 text-base">
                        Upgrade Account
                    </Button>
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
                                        <AvatarFallback className="text-3xl bg-primary/10 text-primary font-light">AL</AvatarFallback>
                                    </Avatar>
                                    <button className="absolute bottom-2 -right-1 z-20 bg-primary text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="mb-2 space-y-1.5 mt-4 sm:mt-0">
                                    <h3 className="text-2xl font-bold tracking-tight">Alex Lee</h3>
                                    <p className="text-muted-foreground text-sm font-medium">Backend Engineer • Member since 2024</p>
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
                        <Card className="premium-card col-span-1 md:col-span-2 h-fit">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl">Personal Information</CardTitle>
                                <CardDescription>
                                    Update your details and how recruiters see you.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <Label htmlFor="firstName" className="text-muted-foreground">First name</Label>
                                        <Input id="firstName" defaultValue="Alex" className="rounded-xl h-12 bg-secondary/20 border-border/60 focus:bg-white transition-colors" />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="lastName" className="text-muted-foreground">Last name</Label>
                                        <Input id="lastName" defaultValue="Lee" className="rounded-xl h-12 bg-secondary/20 border-border/60 focus:bg-white transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-muted-foreground flex items-center justify-between">
                                        Email Address <Badge variant="secondary" className="font-normal text-xs bg-green-500/10 text-green-600 border-none">Verified</Badge>
                                    </Label>
                                    <Input id="email" type="email" defaultValue="alex.lee@example.com" disabled className="rounded-xl h-12 bg-secondary/30 text-muted-foreground border-transparent opacity-80" />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="bio" className="text-muted-foreground">Professional Bio</Label>
                                    <textarea
                                        id="bio"
                                        className="w-full min-h-[120px] resize-y rounded-xl border border-border/60 bg-secondary/20 focus:bg-white p-4 text-sm leading-relaxed text-foreground placeholder-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                                        defaultValue="Backend specialist with 4 years focusing on Python, FastAPI, and distributed systems. Looking to level up system design skills."
                                    />
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-border/40 mt-8 pt-8">
                                    <p className="text-sm text-muted-foreground">Last updated today at 10:42 AM.</p>
                                    <Button className="rounded-xl px-8 shadow-md h-11">Save Changes</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column: Danger Zone (Spans remaining space in grid) */}
                        <div className="col-span-1 space-y-8">
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
                                <Switch className="data-[state=checked]:bg-primary" />
                            </div>

                            <div className="group flex items-center justify-between rounded-2xl border border-border/40 p-6 bg-white hover:border-primary/30 transition-colors shadow-sm">
                                <div className="space-y-1.5 max-w-[80%]">
                                    <Label className="text-base font-semibold">Mock Pressure Mode</Label>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Experience rapid follow-up questions and challenged assumptions to simulate high-stress interviews.
                                    </p>
                                </div>
                                <Switch />
                            </div>

                            <div className="group flex items-center justify-between rounded-2xl border border-border/40 p-6 bg-white hover:border-primary/30 transition-colors shadow-sm">
                                <div className="space-y-1.5 max-w-[80%]">
                                    <Label className="text-base font-semibold">Timer Visibility</Label>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Show the countdown timer during interviews. Turn off to reduce pressure.
                                    </p>
                                </div>
                                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
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

                            <div className="flex items-center justify-between rounded-2xl border border-border/40 p-6 bg-white shadow-sm">
                                <div className="space-y-1.5 max-w-[80%]">
                                    <Label className="text-base font-semibold">Weekly Summary</Label>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Get a weekly digest of your interview performance and progress.
                                    </p>
                                </div>
                                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                            </div>

                            <div className="flex items-center justify-between rounded-2xl border border-border/40 p-6 bg-white shadow-sm">
                                <div className="space-y-1.5 max-w-[80%]">
                                    <Label className="text-base font-semibold">Study Plan Reminders</Label>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Get email reminders for your study plans to stay on track.
                                    </p>
                                </div>
                                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

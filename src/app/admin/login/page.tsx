"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth.store";

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [email, setEmail] = useState("admin@goldendrip.cafe");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (isAuthenticated) router.replace("/admin/dashboard");
  }, [isAuthenticated, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email !== "admin@goldendrip.cafe" || password !== "admin123") {
      setError("Use the demo account shown below.");
      return;
    }
    login({ id: "admin-1", name: "Golden Drip Admin", email, role: "admin" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Button
        type="button"
        variant="outline"
        className="absolute left-4 top-4 gap-2 rounded-full"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <Card className="animate-content-enter w-full max-w-md">
        <CardHeader className="items-center text-center">
          <AppLogo showText={false} className="mb-3" />
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Sign in to manage Golden Drip Café.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" className="pl-10" value={email} onChange={(event) => setEmail(event.target.value)} /></div></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><div className="relative"><LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="password" type="password" className="pl-10" value={password} onChange={(event) => setPassword(event.target.value)} /></div></div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <p className="mt-5 rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground">Demo: admin@goldendrip.cafe · admin123</p>
        </CardContent>
      </Card>
    </main>
  );
}

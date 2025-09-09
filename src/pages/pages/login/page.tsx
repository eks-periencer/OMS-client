"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { login } from "../../../toolkit/authSlice";
import { auth, provider } from "../../../../lib/firebaseConfig.tsx";

import { Button } from "../../../components/components/ui/button";
import { Input } from "../../../components/components/ui/input";
import { Label } from "../../../components/components/ui/label";
import { Card } from "../../../components/components/ui/card";
import { CardContent } from "../../../components/components/ui/card";
import { CardDescription } from "../../../components/components/ui/card";
import { CardHeader } from "../../../components/components/ui/card";
import { CardTitle } from "../../../components/components/ui/card";
import { Alert } from "../../../components/components/ui/alert";
import { AlertDescription } from "../../../components/components/ui/alert";


import { Building2, Loader2 } from "lucide-react";
import { signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const authState = useSelector((state: any) => state.authentication);
  const { loading, error, isAuthenticated } = authState;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"email" | "google">("email");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    dispatch(login({ method: "email", email, password }))
      .unwrap()
      .then(() => {
        navigate("/dashboard");
      })
      .catch(() => {});
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const firebaseToken = await user.getIdToken();

      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      dispatch(
        login({
          method: "google",
          idToken: firebaseToken,
          deviceInfo,
        })
      )
        .unwrap()
        .then(() => {
          navigate("/dashboard");
        })
        .catch(() => {});
    } catch (err: any) {
      console.error("Google login failed", err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">ISP Order Management</CardTitle>
          <CardDescription>
            Sign in to access the order management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "email" ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setMode("google")}
              >
                Use Google instead
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="button"
                className="w-full bg-white text-black"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setMode("email")}
              >
                Use Email instead
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

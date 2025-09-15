"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import { login, clearError } from "../../../toolkit/authSlice";
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
  const location = useLocation();

  // Get auth state - using 'authentication' to match your store
  const authState = useSelector((state: any) => state.authentication);
  const { loading, error, isAuthenticated, user, accessToken, refreshToken, expiresIn } = authState;

  console.log("🔥 CURRENT AUTH STATE:", authState);
  console.log("👤 USER DATA:", user);
  console.log("🔐 ACCESS TOKEN:", accessToken);
  console.log("🔄 REFRESH TOKEN:", refreshToken);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"email" | "google">("email");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const from = location.state?.from || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, accessToken, navigate, location]);

  // Clear error when component unmounts or mode changes
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Clear error when switching modes
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [mode, dispatch]);

  // Log user data and redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("🎉 USER IS AUTHENTICATED!");
      console.log("===== COMPLETE USER INFORMATION =====");
      console.log("📧 Email:", user.email);
      console.log("👤 First Name:", user.first_name);
      console.log("👤 Last Name:", user.last_name);
      console.log("👤 Full Name:", `${user.first_name} ${user.last_name}`);
      console.log("🆔 User ID:", user.id);
      console.log("📱 Phone:", user.phone);
      console.log("🎭 Role Name:", user.role_name);
      console.log("🏢 Role ID:", user.role_id);
      console.log("👔 Manager ID:", user.reporting_manager_id);
      console.log("✅ Email Verified:", user.email_verified);
      console.log("🔑 Login Method:", user.login_method);
      console.log("🔥 Firebase UID:", user.firebase_uid);
      console.log("📸 Profile Picture:", user.profile_picture_url);
      console.log("🟢 Is Active:", user.is_active);
      console.log("📅 Created At:", user.created_at);
      console.log("🔄 Updated At:", user.updated_at);
      console.log("🔐 User Permissions:", user.role_permissions);
      console.log("===== TOKEN INFORMATION =====");
      console.log("🎫 Access Token:", accessToken);
      console.log("🔄 Refresh Token:", refreshToken);
      console.log("⏰ Token Expires In:", expiresIn, "seconds");
      console.log("===== COMPLETE OBJECTS =====");
      console.log("👤 Complete User Object:", user);
      console.log("📊 Complete Auth State:", authState);
      console.log("=====================================");
      
      // Redirect to the originally requested page or dashboard
      const from = location.state?.from || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, authState, accessToken, refreshToken, expiresIn]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      const result = await dispatch(login({ 
        method: "email", 
        email: email.trim(), 
        password 
      })).unwrap();
      
      console.log("🎉 EMAIL LOGIN SUCCESS!");
      console.log("===== LOGIN RESPONSE DATA =====");
      console.log("📝 Complete Result:", result);
      console.log("👤 User Data:", result.user);
      console.log("🔐 Access Token:", result.accessToken);
      console.log("🔄 Refresh Token:", result.refreshToken);
      console.log("⏰ Expires In:", result.expiresIn, "seconds");
      console.log("================================");
      
    } catch (error) {
      console.error("❌ EMAIL LOGIN FAILED:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      dispatch(clearError());
      
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const firebaseToken = await firebaseUser.getIdToken();

      console.log("🔥 FIREBASE GOOGLE LOGIN DATA:");
      console.log("Firebase User:", firebaseUser);
      console.log("Firebase Token:", firebaseToken);

      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString(),
      };

      const loginResult = await dispatch(
        login({
          method: "google",
          idToken: firebaseToken,
          deviceInfo,
        })
      ).unwrap();

      console.log("🎉 GOOGLE LOGIN SUCCESS!");
      console.log("===== GOOGLE LOGIN RESPONSE DATA =====");
      console.log("📝 Complete Result:", loginResult);
      console.log("👤 User Data:", loginResult.user);
      console.log("🔐 Access Token:", loginResult.accessToken);
      console.log("🔄 Refresh Token:", loginResult.refreshToken);
      console.log("⏰ Expires In:", loginResult.expiresIn, "seconds");
      console.log("🛠️ Device Info:", deviceInfo);
      console.log("====================================");
      
    } catch (err: any) {
      console.error("❌ GOOGLE LOGIN FAILED:", err);
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
          {/* DEBUG SECTION - Remove in production */}
          {user && (
            <div className="mb-4">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => {
                  console.log("🔍 MANUAL DEBUG TRIGGER:");
                  console.log("Current User:", user);
                  console.log("Current Auth State:", authState);
                  console.log("Access Token:", accessToken);
                  console.log("Refresh Token:", refreshToken);
                }}
              >
                🐛 Debug Current User
              </Button>
            </div>
          )}
          
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
                  autoComplete="email"
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
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !email.trim() || !password.trim()}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setMode("google")}
                disabled={loading}
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
                className="w-full bg-white text-black border border-gray-300 hover:bg-gray-50"
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
                disabled={loading}
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
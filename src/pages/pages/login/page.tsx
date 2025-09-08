"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../../../lib/auth"
import { Button } from "../../../components/components/ui/button"
import { Input } from "../../../components/components/ui/input"
import { Label } from "../../../components/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/components/ui/card"
import { Alert, AlertDescription } from "../../../components/components/ui/alert"
import { Building2, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("google123")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const router = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login({ email, password })
      router.push("/dashboard")
    } catch (err) {
      setError("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async () => {
    setEmail("admin@ispoms.com")
    setPassword("google123")
    setError("")
    setIsLoading(true)

    try {
      await login({ email: "admin@ispoms.com", password: "google123" })
      router.push("/dashboard")
    } catch (err) {
      setError("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">ISP Order Management</CardTitle>
          <CardDescription>Sign in to access the order management system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Google password (google123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleQuickLogin}
              disabled={isLoading}
            >
              Quick Demo Login
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Demo Credentials:</p>
            <p className="text-xs font-mono">Email: admin@ispoms.com</p>
            <p className="text-xs font-mono">Password: google123</p>
            <p className="text-xs text-muted-foreground mt-2">
              Use the Google placeholder password "google123" for any account
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

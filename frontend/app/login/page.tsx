"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "student"
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleLogin = (role: string) => {
    setIsLoading(true)

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Login successful",
        description: `Logged in as ${role}`,
      })

      // Redirect based on role
      if (role === "student") {
        router.push("/dashboard/student")
      } else {
        router.push("/dashboard/professor")
      }
    }, 1500)
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 inline-flex items-center justify-center text-sm font-medium"
      >
        ← Back to home
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
        </div>

        <Tabs defaultValue={defaultRole} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="professor">Professor</TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Student Login</CardTitle>
                <CardDescription>Access your assignments and feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input id="student-email" type="email" placeholder="student@university.edu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input id="student-password" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleLogin("student")} disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="professor">
            <Card>
              <CardHeader>
                <CardTitle>Professor Login</CardTitle>
                <CardDescription>Manage assignments and grading</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="professor-email">Email</Label>
                  <Input id="professor-email" type="email" placeholder="professor@university.edu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professor-password">Password</Label>
                  <Input id="professor-password" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleLogin("professor")} disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline underline-offset-4 hover:text-primary">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}


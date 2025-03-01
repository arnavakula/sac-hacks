"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { BookOpen, FileText, Home, LogOut, Upload, User } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "student" | "professor"
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [userName, setUserName] = useState(role === "student" ? "John Doe" : "Dr. Smith")

  const studentMenuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard/student",
    },
    {
      title: "Assignments",
      icon: BookOpen,
      href: "/dashboard/student/assignments",
    },
    {
      title: "Submissions",
      icon: Upload,
      href: "/dashboard/student/submissions",
    },
    {
      title: "Profile",
      icon: User,
      href: "/dashboard/student/profile",
    },
  ]

  const professorMenuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard/professor",
    },
    {
      title: "Assignments",
      icon: BookOpen,
      href: "/dashboard/professor/assignments",
    },
    {
      title: "Answer Keys",
      icon: FileText,
      href: "/dashboard/professor/answer-keys",
    },
    {
      title: "Grading",
      icon: FileText,
      href: "/dashboard/professor/grading",
    },
    {
      title: "Profile",
      icon: User,
      href: "/dashboard/professor/profile",
    },
  ]

  const menuItems = role === "student" ? studentMenuItems : professorMenuItems

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-md bg-primary p-1">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">GradeAI</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Log out</span>
                </Link>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            <ModeToggle />
            <span className="text-sm font-medium">Welcome, {userName}</span>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}


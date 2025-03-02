"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Users, PlusCircle, BookOpenText, ClipboardList, Calendar, Settings } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [classCode, setClassCode] = useState("");
  const [activeTab, setActiveTab] = useState("classes");

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchClasses() {
      try {
        const response = await fetch("/api/classes/student");
        if (!response.ok) throw new Error("Failed to load classes.");
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }

    fetchClasses();
  }, [status]);

  const handleJoinClass = async () => {
    if (!classCode) {
      toast({ title: "Error", description: "Please enter a class code.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classCode }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to join class.");

      setClasses([...classes, data]); // Add new class to UI
      setClassCode("");
      toast({ title: "Success", description: "You have joined the class!" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) return <p className="text-center text-lg">Loading your classes...</p>;

  return (
    <DashboardLayout role="student">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Page Title & Join Class Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter Class Code"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="border p-2 rounded-md text-sm w-48"
            />
            <Button onClick={handleJoinClass} className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              Join Class
            </Button>
          </div>
        </div>

        {/* Sidebar Navigation Tabs */}
        <div className="flex gap-4 border-b pb-2">
          {[
            { key: "classes", label: "Classes", icon: BookOpenText },
            { key: "assignments", label: "Assignments", icon: ClipboardList },
            { key: "calendar", label: "Calendar", icon: Calendar },
            { key: "settings", label: "Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 flex items-center gap-2 text-sm font-medium ${
                activeTab === tab.key ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "classes" && (
            <>
              <h2 className="text-xl font-semibold">Your Classes</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classes.length > 0 ? (
                  classes.map((cls) => (
                    <Card key={cls.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{cls.name} ({cls.code})</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">Quarter: {cls.quarter}, {cls.year}</p>
                        <Link href={`/dashboard/student/classes/${cls.id}`}>
                          <Button size="sm" variant="outline" className="mt-2 w-full">
                            View Class
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">You are not enrolled in any classes yet.</p>
                )}
              </div>
            </>
          )}

          {activeTab === "assignments" && <p className="text-gray-600">Assignments section coming soon...</p>}
          {activeTab === "calendar" && <p className="text-gray-600">Calendar section coming soon...</p>}
          {activeTab === "settings" && <p className="text-gray-600">Settings section coming soon...</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
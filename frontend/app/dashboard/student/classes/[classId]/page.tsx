"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { DashboardLayout } from "@/components/dashboard-layout";
import { FileUp, ClipboardList, Calendar, Settings, ArrowLeft } from "lucide-react";

export default function StudentClassDetailsPage() {
  const { classId } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assignments");

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchClassDetails() {
      try {
        const response = await fetch(`/api/classes/student/${classId}`);
        if (!response.ok) throw new Error("You are not enrolled in this class.");
        const data = await response.json();
        setClassData(data);
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        router.push("/dashboard/student");
      } finally {
        setIsLoading(false);
      }
    }

    fetchClassDetails();
  }, [status, classId]);

  if (isLoading) return <p className="text-center text-lg">Loading class details...</p>;
  if (!classData) return <p className="text-center text-lg text-red-500">Class not found.</p>;

  return (
    <DashboardLayout role="student">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* Back Button */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/student")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Class Title & Details */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{classData.name} ({classData.code})</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FileUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classData.assignments.length}</div>
              <p className="text-xs text-muted-foreground">Assignments available in this class</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Navigation Tabs */}
        <div className="flex gap-4 border-b pb-2">
          {[
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
          {activeTab === "assignments" && (
            <div>
              <h2 className="text-xl font-semibold mt-4">Assignments</h2>
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Due Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classData.assignments.length > 0 ? (
                        classData.assignments.map((assignment) => (
                          <tr key={assignment.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">{assignment.title}</td>
                            <td className="p-4 align-middle">{new Date(assignment.dueDate).toLocaleDateString()}</td>
                            <td className="p-4 align-middle">
                              <Link href={`/dashboard/student/assignments/${assignment.id}`}>
                                <Button size="sm">View</Button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-4 text-center">No assignments found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "calendar" && <p className="text-gray-600">Calendar section coming soon...</p>}
          {activeTab === "settings" && <p className="text-gray-600">Settings section coming soon...</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}

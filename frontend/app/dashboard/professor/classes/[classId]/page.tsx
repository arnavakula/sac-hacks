"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { DashboardLayout } from "@/components/dashboard-layout";
import { FileUp, Users, CheckCircle, Clock, ArrowLeft } from "lucide-react";

export default function ClassDetailsPage() {
  const { classId } = useParams(); // Get class ID from URL
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
        const response = await fetch(`/api/classes/${classId}`);
        if (!response.ok) throw new Error("Class not found.");
        const data = await response.json();
        setClassData(data);
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        router.push("/dashboard/professor");
      } finally {
        setIsLoading(false);
      }
    }

    fetchClassDetails();
  }, [status, classId]);

  if (isLoading) return <p>Loading class details...</p>;
  if (!classData) return <p>Class not found.</p>;

  return (
    <DashboardLayout role="professor">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/professor")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{classData.name} ({classData.code})</h1>
          <div className="flex gap-2">
            <Link href={`/dashboard/professor/classes/${classId}/assignments/create`}>
              <Button>Add Assignment</Button>
            </Link>
          </div>
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
              <p className="text-xs text-muted-foreground">Assignments created for this class</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graded Submissions</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10</div> {/* Placeholder */}
              <p className="text-xs text-muted-foreground">Submissions graded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div> {/* Placeholder */}
              <p className="text-xs text-muted-foreground">Submissions awaiting grading</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Navigation Tabs */}
        <div className="flex gap-4 border-b pb-2">
          {["assignments", "roster", "calendar", "course-settings", "account-settings"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "assignments" && (
            <div>
              <h2 className="text-xl font-semibold mt-4">Your Assignments</h2>
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
                              <Link href={`/dashboard/professor/classes/${classId}/assignments/${assignment.id}`}>
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

          {activeTab === "roster" && <p>Roster section coming soon...</p>}
          {activeTab === "calendar" && <p>Calendar section coming soon...</p>}
          {activeTab === "course-settings" && <p>Course settings section coming soon...</p>}
          {activeTab === "account-settings" && <p>Account settings section coming soon...</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}

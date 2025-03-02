"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard-layout";
import { FileUp, Users, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

export default function AssignmentDetailsPage() {
  const { classId, assignmentId } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [answerKey, setAnswerKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchAssignment() {
      try {
        const response = await fetch(`/api/assignments/${assignmentId}`);
        if (!response.ok) throw new Error("Assignment not found.");
        const data = await response.json();
        setAssignment(data);
        setSubmissions(data.submissions || []);
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        router.push(`/dashboard/professor/classes/${classId}`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAssignment();
  }, [status, assignmentId, classId]);

  const handleAnswerKeyUpload = async () => {
    if (!answerKey) {
      toast({ title: "Error", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", answerKey);
    formData.append("assignmentId", assignmentId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data);
      if (!response.ok) throw new Error(data.message || "Failed to upload.");

      toast({ title: "Success", description: "Answer key uploaded successfully!" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <p className="text-center text-lg">Loading assignment details...</p>;
  if (!assignment) return <p className="text-center text-lg text-red-500">Assignment not found.</p>;

  return (
    <DashboardLayout role="professor">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Back Button */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/professor/classes/${classId}`)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Class
          </Button>
        </div>

        {/* Assignment Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{assignment.title}</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
              <p className="text-xs text-muted-foreground">Submissions received</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graded</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.filter(s => s.grade !== null).length}</div>
              <p className="text-xs text-muted-foreground">Submissions graded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.filter(s => s.grade === null).length}</div>
              <p className="text-xs text-muted-foreground">Submissions awaiting grading</p>
            </CardContent>
          </Card>
        </div>

        {/* Answer Key Upload */}
        <div className="bg-white rounded-lg shadow-md p-6 border">
          <h2 className="text-lg font-semibold">Upload Answer Key</h2>
          <div className="mt-4 flex gap-4 items-center">
            <Input type="file" onChange={(e) => setAnswerKey(e.target.files?.[0] || null)} />
            <Button onClick={handleAnswerKeyUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>

        {/* Student Submissions */}
        <h2 className="text-xl font-semibold mt-4">Student Submissions</h2>
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Student</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Submitted</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Grade</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <tr key={submission.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">{submission.student.name}</td>
                      <td className="p-4 align-middle">{new Date(submission.submittedAt).toLocaleDateString()}</td>
                      <td className="p-4 align-middle">{submission.grade !== null ? submission.grade : "Not graded"}</td>
                      <td className="p-4 align-middle">
                        <Link href={submission.fileUrl} target="_blank">
                          <Button size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center">No submissions yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

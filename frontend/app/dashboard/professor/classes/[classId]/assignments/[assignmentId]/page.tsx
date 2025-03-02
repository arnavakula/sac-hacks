"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle } from "lucide-react";

export default function AssignmentDetailsPage() {
  const { assignmentId } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchAssignment() {
      try {
        const response = await fetch(`/api/assignments/${assignmentId}`);
        if (!response.ok) throw new Error("Assignment not found.");
        const data = await response.json();
        setAssignment(data);
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        router.push("/dashboard/professor");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAssignment();
  }, [status, assignmentId]);

  const handleGradeSubmission = async (submission) => {
    setGradingSubmission(submission.id);
  
    try {
      let studentStructuredTextUrl = submission.structuredText;
      let answerKeyStructuredTextUrl = assignment.answerKey?.structuredText;

  
      // Generate structured text for student submission if missing
      if (!studentStructuredTextUrl) {
        const studentResponse = await fetch("/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfUrl: submission.fileUrl,
            professorId: session.user.id,
            filename: `submissions/${submission.student.id}-${assignmentId}-structured.txt`,
            type: "submission",
            id: submission.id,
          }),
        });
  
        if (!studentResponse.ok) throw new Error("Failed to process student submission.");
        const studentData = await studentResponse.json();
        studentStructuredTextUrl = studentData.fileUrl;
      }

      console.log(assignment);
  
      // Generate structured text for answer key if missing
      if (!answerKeyStructuredTextUrl && assignment.answerKey?.fileUrl) {
        const answerKeyResponse = await fetch("/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfUrl: assignment.answerKey.fileUrl,
            professorId: session.user.id,
            filename: `answer-keys/${assignmentId}-structured.txt`,
            type: "answerKey",
            id: assignment.answerKey.id,
          }),
        });
  
        if (!answerKeyResponse.ok) throw new Error("Failed to process answer key.");
        const answerKeyData = await answerKeyResponse.json();
        console.log(answerKeyData);
        answerKeyStructuredTextUrl = answerKeyData.fileUrl;
      }
  
      toast({ title: "Success", description: "Submission is being processed for grading." });
  
      // Refresh assignment state
      setAssignment((prev) => ({
        ...prev,
        submissions: prev.submissions.map((sub) =>
          sub.id === submission.id ? { ...sub, structuredText: studentStructuredTextUrl } : sub
        ),
      }));
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setGradingSubmission(null);
    }
  };
  

  if (isLoading) return <p className="text-center text-lg">Loading assignment details...</p>;
  if (!assignment) return <p className="text-center text-lg text-red-500">Assignment not found.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-3 mb-4">
        <Button variant="outline" onClick={() => router.push("/dashboard/professor")} className="flex items-center gap-2">
          <ArrowLeft className="h-5 w-5" />
          Back to Class
        </Button>
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
      </div>

      {/* Description */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Description:</strong> {assignment.description || "No description provided."}</p>
          <p><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleDateString()}</p>
        </CardContent>
      </Card>

      {/* Submissions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm border">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="py-2 px-4 text-left">Student</th>
                <th className="py-2 px-4 text-left">Submitted At</th>
                <th className="py-2 px-4 text-left">Grade</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignment.submissions.length > 0 ? (
                assignment.submissions.map((submission) => (
                  <tr key={submission.id} className="border-b">
                    <td className="py-2 px-4">{submission.student.name} ({submission.student.email})</td>
                    <td className="py-2 px-4">{new Date(submission.submittedAt).toLocaleDateString()}</td>
                    <td className="py-2 px-4">
                      {submission.grade !== null ? (
                        <span className="text-green-600 font-semibold">{submission.grade}%</span>
                      ) : (
                        <span className="text-gray-500">Not Graded</span>
                      )}
                    </td>
                    <td className="py-2 px-4 flex gap-2">
                      <Link href={submission.fileUrl} target="_blank">
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleGradeSubmission(submission)}
                        disabled={gradingSubmission === submission.id}
                      >
                        {gradingSubmission === submission.id ? "Processing..." : "Grade"}
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-gray-500">No submissions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

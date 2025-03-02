"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function AssignmentDetailsPage() {
  const { assignmentId } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchAssignment() {
      try {
        const response = await fetch(`/api/assignments/${assignmentId}`);
        if (!response.ok) throw new Error("Assignment not found.");
        const data = await response.json();
        setAssignment(data);
        setSubmission(data.submissions.length > 0 ? data.submissions[0] : null);
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        router.push("/dashboard/student");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAssignment();
  }, [status, assignmentId]);

  const handleSubmit = async () => {
    if (!file) {
      toast({ title: "Error", description: "Please select a file to submit.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assignmentId", assignmentId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload and submission failed.");
      }

      const { submission } = await response.json();
      setSubmission(submission);

      toast({ title: "Success", description: "Assignment submitted successfully!" });

    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to render grading detail item with appropriate icon
  const renderGradingDetailItem = (detail, index) => {
    let icon = <AlertCircle className="h-4 w-4 text-gray-500" />;
    let textColor = "text-gray-700";
    
    if (detail.toLowerCase().includes("correct")) {
      icon = <CheckCircle className="h-4 w-4 text-green-500" />;
      textColor = "text-green-700";
    } else if (
      detail.toLowerCase().includes("incorrect") || 
      detail.toLowerCase().includes("wrong") || 
      detail.toLowerCase().includes("missing")
    ) {
      icon = <XCircle className="h-4 w-4 text-red-500" />;
      textColor = "text-red-700";
    } else if (
      detail.toLowerCase().includes("partial") || 
      detail.toLowerCase().includes("incomplete")
    ) {
      icon = <AlertCircle className="h-4 w-4 text-amber-500" />;
      textColor = "text-amber-700";
    }
    
    return (
      <li key={index} className={`flex items-start gap-2 py-1.5 ${index > 0 ? "border-t border-gray-100" : ""}`}>
        <span className="mt-0.5 flex-shrink-0">{icon}</span>
        <span className={textColor}>{detail}</span>
      </li>
    );
  };

  if (isLoading) return <p className="text-center text-lg">Loading assignment details...</p>;
  if (!assignment) return <p className="text-center text-lg text-red-500">Assignment not found.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-3 mb-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard/student")} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <p className="text-sm text-gray-500">
            Due {new Date(assignment.dueDate).toLocaleDateString()} at{" "}
            {new Date(assignment.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* Description */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{assignment.description || "No description provided."}</p>
        </CardContent>
      </Card>

      {/* Submission Section */}
      <Card className="mt-4 shadow-lg">
        <CardHeader>
          <CardTitle>Your Submission</CardTitle>
        </CardHeader>
        <CardContent>
          {submission ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-300 text-green-800 rounded-md space-y-2">
                <p>
                  <strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleDateString()}{" "}
                  at {new Date(submission.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p>
                  <strong>Grade:</strong>{" "}
                  {submission.grade !== null ? (
                    <span className="font-semibold">{submission.grade}%</span>
                  ) : (
                    "Not graded yet"
                  )}
                </p>
                {submission.feedback && (
                  <p>
                    <strong>Feedback:</strong> {submission.feedback}
                  </p>
                )}
                <p className="mt-2">
                  <Link href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      View Submission
                    </Button>
                  </Link>
                </p>
              </div>

              {/* Grading Details Section */}
              {submission.grade !== null && submission.gradingDetails && submission.gradingDetails.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Grading Details</h3>
                  <div className="bg-white border rounded-md shadow-sm">
                    <ul className="p-3">
                      {submission.gradingDetails.map((detail, index) => 
                        renderGradingDetailItem(detail, index)
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-3">You have not submitted this assignment yet.</p>
              <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <Button onClick={handleSubmit} disabled={isSubmitting} className="mt-3 w-full">
                {isSubmitting ? "Submitting..." : "Submit Assignment"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
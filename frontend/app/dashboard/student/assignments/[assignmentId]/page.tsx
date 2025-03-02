"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
        setSubmission(data.submission);
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
  

  if (isLoading) return <p className="text-center text-lg">Loading assignment details...</p>;
  if (!assignment) return <p className="text-center text-lg text-red-500">Assignment not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-3">
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
      <div className="mt-6 p-4 bg-gray-50 rounded-md border">
        <p className="text-gray-700">{assignment.description || "No description provided."}</p>
      </div>

      {/* Submission Section */}
      <div className="mt-6 p-6 bg-white rounded-lg shadow-md border">
        <h2 className="text-lg font-semibold">Your Submission</h2>

        {submission ? (
          <div className="mt-4 bg-green-50 border border-green-300 text-green-800 p-4 rounded-md">
            <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleDateString()}</p>
            <p><strong>Grade:</strong> {submission.grade !== null ? submission.grade : "Not graded yet"}</p>
            <p><strong>Feedback:</strong> {submission.feedback || "No feedback yet"}</p>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">You have not submitted this assignment yet.</p>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <Button onClick={handleSubmit} disabled={isSubmitting} className="mt-3 w-full">
              {isSubmitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

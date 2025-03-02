"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function StudentClassDetailsPage() {
  const { classId } = useParams(); // Get class ID from URL
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>{classData.name} ({classData.code})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Quarter:</strong> {classData.quarter}</p>
          <p><strong>Year:</strong> {classData.year}</p>
          <p><strong>Description:</strong> {classData.description || "No description available."}</p>
          <p><strong>Professor:</strong> {classData.professor.name} ({classData.professor.email})</p>

          {/* ✅ Display Assignments */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Assignments</h3>
            {classData.assignments.length > 0 ? (
              <ul className="list-disc pl-5">
                {classData.assignments.map((assignment) => (
                  <li key={assignment.id} className="text-sm flex justify-between items-center">
                    <span>{assignment.title} - Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    <Link href={`/dashboard/student/assignments/${assignment.id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No assignments available.</p>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Link href="/dashboard/student">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

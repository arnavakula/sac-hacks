"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function ClassDetailsPage() {
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
    <div className="flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>{classData.name} ({classData.code})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Quarter:</strong> {classData.quarter}</p>
          <p><strong>Year:</strong> {classData.year}</p>
          <p><strong>Description:</strong> {classData.description || "No description available."}</p>
          {/* <p><strong>Enrolled Students:</strong> {classData.students.length}</p> */}
          
          <div className="flex gap-2">
            <Link href="/dashboard/professor">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Link href={`/dashboard/professor/classes/${classId}/manage`}>
              <Button>Manage Class</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


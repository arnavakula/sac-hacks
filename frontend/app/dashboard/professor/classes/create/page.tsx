"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function CreateClassPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [classCode, setClassCode] = useState("");
  const [className, setClassName] = useState("");
  const [quarter, setQuarter] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleCreateClass = async () => {
    if (!classCode || !className || !quarter || !year) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/classes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professorId: session?.user?.id,
          code: classCode,
          name: className,
          quarter,
          year: parseInt(year),
          description,
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create class.");
      }

      toast({ title: "Class Created", description: "The class has been successfully created." });
      router.push("/dashboard/professor");
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create a New Class</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="classCode">Class Code</Label>
            <Input
              id="classCode"
              type="text"
              placeholder="e.g., CS101"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="className">Class Name</Label>
            <Input
              id="className"
              type="text"
              placeholder="e.g., Introduction to Computer Science"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="quarter">Quarter</Label>
            <Input
              id="quarter"
              type="text"
              placeholder="e.g., Fall"
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              placeholder="e.g., 2025"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter a brief description of the class"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateClass} disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Class"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


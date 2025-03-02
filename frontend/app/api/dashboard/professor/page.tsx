"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { FileUp, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ProfessorDashboard() {
  const { data: session, status } = useSession();
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchClasses() {
      try {
        const response = await fetch("/api/classes");
        if (!response.ok) throw new Error("Failed to fetch classes");
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClasses();
  }, [status]);

  return (
    <DashboardLayout role="professor">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Professor Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/dashboard/professor/classes/create">
              <Button>Create Class</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
              <FileUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
              <p className="text-xs text-muted-foreground">Classes currently running</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classes.reduce((total, cls) => total + cls.users.length - 1, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Enrolled across all classes</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mt-4">Your Classes</h2>
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Class Code</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Class Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Quarter</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Year</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Students</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center">Loading classes...</td>
                  </tr>
                ) : classes.length > 0 ? (
                  classes.map((cls) => (
                    <tr key={cls.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">{cls.code}</td>
                      <td className="p-4 align-middle">{cls.name}</td>
                      <td className="p-4 align-middle">{cls.quarter}</td>
                      <td className="p-4 align-middle">{cls.year}</td>
                      <td className="p-4 align-middle">{cls.users.length - 1}</td>
                      <td className="p-4 align-middle">
                        <Link href={`/dashboard/professor/classes/${cls.id}`}>
                          <Button size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center">No classes found</td>
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

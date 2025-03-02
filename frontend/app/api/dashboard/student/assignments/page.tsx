import { DashboardLayout } from "@/components/dashboard-layout"
import { FileUpload } from "@/components/file-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Clock, FileText, AlertCircle } from "lucide-react"

export default function StudentAssignmentsPage() {
  return (
    <DashboardLayout role="student">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Data Structures Assignment 3</CardTitle>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-amber-100 text-amber-800">
                      <Clock className="mr-1 h-3 w-3" /> Due in 4 days
                    </span>
                  </div>
                  <CardDescription>Implement a balanced binary search tree and analyze its performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Assignment Details</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Due Date: March 5, 2025 at 11:59 PM</p>
                      <p>Points: 100</p>
                    </div>
                    <FileUpload acceptedFileTypes=".pdf,.zip,.java,.py,.cpp" className="mt-4" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Algorithms Quiz 2</CardTitle>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-red-100 text-red-800">
                      <AlertCircle className="mr-1 h-3 w-3" /> Due Tomorrow
                    </span>
                  </div>
                  <CardDescription>Solve problems related to graph algorithms and dynamic programming</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Assignment Details</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Due Date: March 2, 2025 at 11:59 PM</p>
                      <p>Points: 50</p>
                    </div>
                    <FileUpload acceptedFileTypes=".pdf,.doc,.docx" className="mt-4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Database Systems Final Project</CardTitle>
                  <CardDescription>Design and implement a database system for a real-world application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Assignment Details</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Due Date: March 20, 2025 at 11:59 PM</p>
                      <p>Points: 200</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Algorithms Midterm</CardTitle>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800">
                      Graded: 92%
                    </span>
                  </div>
                  <CardDescription>Midterm exam covering sorting, searching, and graph algorithms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Assignment Details</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Due Date: February 28, 2025 at 11:59 PM</p>
                      <p>Points: 100</p>
                    </div>
                    <Button className="w-full">View Feedback</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}


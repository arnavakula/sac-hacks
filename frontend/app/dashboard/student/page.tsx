import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { FileUp, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function StudentDashboard() {
  return (
    <DashboardLayout role="student">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <Link href="/dashboard/student/assignments">
            <Button>Upload Assignment</Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Assignments due this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Assignments</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Assignments submitted and graded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <FileUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">Overall performance across all assignments</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mt-4">Recent Assignments</h2>
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Assignment</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Due Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Score</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle">Data Structures Assignment 3</td>
                  <td className="p-4 align-middle">Mar 5, 2025</td>
                  <td className="p-4 align-middle">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-amber-100 text-amber-800">
                      <Clock className="mr-1 h-3 w-3" /> Due Soon
                    </span>
                  </td>
                  <td className="p-4 align-middle">-</td>
                  <td className="p-4 align-middle">
                    <Button size="sm" variant="outline">
                      Submit
                    </Button>
                  </td>
                </tr>
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle">Algorithms Midterm</td>
                  <td className="p-4 align-middle">Feb 28, 2025</td>
                  <td className="p-4 align-middle">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" /> Graded
                    </span>
                  </td>
                  <td className="p-4 align-middle">92%</td>
                  <td className="p-4 align-middle">
                    <Button size="sm" variant="outline">
                      View Feedback
                    </Button>
                  </td>
                </tr>
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle">Database Systems Project</td>
                  <td className="p-4 align-middle">Feb 20, 2025</td>
                  <td className="p-4 align-middle">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-800">
                      <AlertCircle className="mr-1 h-3 w-3" /> Submitted
                    </span>
                  </td>
                  <td className="p-4 align-middle">Pending</td>
                  <td className="p-4 align-middle">
                    <Button size="sm" variant="outline" disabled>
                      Awaiting Grade
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


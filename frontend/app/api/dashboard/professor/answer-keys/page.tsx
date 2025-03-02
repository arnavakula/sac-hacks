import { DashboardLayout } from "@/components/dashboard-layout"
import { FileUpload } from "@/components/file-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Calendar } from "lucide-react"

export default function ProfessorAnswerKeysPage() {
  return (
    <DashboardLayout role="professor">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Upload Answer Key</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Answer Key Details</CardTitle>
                <CardDescription>
                  Provide information about the assignment and upload the answer key
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignment-name">Assignment Name</Label>
                    <Input id="assignment-name" placeholder="e.g., Data Structures Assignment 3" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Select>
                      <SelectTrigger id="course">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cs101">CS101: Introduction to Programming</SelectItem>
                        <SelectItem value="cs201">CS201: Data Structures</SelectItem>
                        <SelectItem value="cs301">CS301: Algorithms</SelectItem>
                        <SelectItem value="cs401">CS401: Database Systems</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input id="due-date" type="date" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Provide a brief description of the assignment"
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Answer Key</Label>
                    <FileUpload 
                      acceptedFileTypes=".pdf,.doc,.docx,.zip,.java,.py,.cpp"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button className="w-full">Save Answer Key</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Answer Keys</CardTitle>
                <CardDescription>
                  Answer keys you've uploaded recently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Algorithms Midterm</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded on Feb 25, 2025
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>\


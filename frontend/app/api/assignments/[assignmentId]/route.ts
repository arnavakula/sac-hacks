import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { assignmentId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  try {
    let assignment;

    if (session.user.role === "student") {
      // Student: Fetch the assignment and their latest submission
      assignment = await prisma.assignment.findUnique({
        where: { id: params.assignmentId },
        include: {
          submissions: {
            where: { studentId: session.user.id },
            orderBy: { submittedAt: "desc" }, // Get the latest submission
            take: 1, // Only return one submission
          },
        },
      });
    } else if (session.user.role === "professor") {
      // Professor: Fetch the assignment and all submissions
      assignment = await prisma.assignment.findUnique({
        where: { id: params.assignmentId },
        include: {
          submissions: {
            include: { student: true }, // Include student details in submissions
            orderBy: { submittedAt: "desc" }, // Order submissions by latest first
          },
        },
      });
    }

    if (!assignment) {
      return new Response(JSON.stringify({ message: "Assignment not found." }), { status: 404 });
    }

    return new Response(JSON.stringify(assignment), { status: 200 });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return new Response(JSON.stringify({ message: "Error retrieving assignment details." }), { status: 500 });
  }
}

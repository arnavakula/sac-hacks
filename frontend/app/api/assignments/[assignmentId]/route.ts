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
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.assignmentId },
      include: {
        submissions: session.user.role === "student"
          ? { where: { studentId: session.user.id } } // Student: Get only their submission
          : { include: { student: true } }, // Professor: Get all submissions with student info
      },
    });

    if (!assignment) {
      return new Response(JSON.stringify({ message: "Assignment not found." }), { status: 404 });
    }

    return new Response(JSON.stringify(assignment), { status: 200 });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return new Response(JSON.stringify({ message: "Error retrieving assignment details." }), { status: 500 });
  }
}
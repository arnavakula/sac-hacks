import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { classId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "student") {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  try {
    const classData = await prisma.class.findUnique({
      where: { id: params.classId },
      include: {
        assignments: {
          include: {
            submissions: {
              where: { studentId: session.user.id },
              select: { id: true }, // Only check if a submission exists
            },
          },
        },
      },
    });

    if (!classData) {
      return new Response(JSON.stringify({ message: "Class not found." }), { status: 404 });
    }

    return new Response(JSON.stringify(classData), { status: 200 });
  } catch (error) {
    console.error("Error fetching class details:", error);
    return new Response(JSON.stringify({ message: "Error retrieving class details." }), { status: 500 });
  }
}

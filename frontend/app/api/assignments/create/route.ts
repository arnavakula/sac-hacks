import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "professor") {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  try {
    const { classId, title, description, dueDate } = await req.json();

    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        classId,
      },
    });

    return new Response(JSON.stringify(newAssignment), { status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return new Response(JSON.stringify({ message: "Error creating assignment.", error }), { status: 500 });
  }
}

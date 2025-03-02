import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "student") {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  try {
    const { classCode } = await req.json();

    // ✅ Find the class by code
    const classToJoin = await prisma.class.findUnique({
      where: { code: classCode },
    });

    if (!classToJoin) {
      return new Response(JSON.stringify({ message: "Class not found." }), { status: 404 });
    }

    // ✅ Check if student is already enrolled
    const existingEnrollment = await prisma.usersOnClasses.findFirst({
      where: {
        classId: classToJoin.id,
        userId: session.user.id,
      },
    });

    if (existingEnrollment) {
      return new Response(JSON.stringify({ message: "Already enrolled in this class." }), { status: 400 });
    }

    // ✅ Enroll the student
    await prisma.usersOnClasses.create({
      data: {
        classId: classToJoin.id,
        userId: session.user.id,
      },
    });

    return new Response(JSON.stringify(classToJoin), { status: 200 });
  } catch (error) {
    console.error("Error joining class:", error);
    return new Response(JSON.stringify({ message: "Error joining class." }), { status: 500 });
  }
}

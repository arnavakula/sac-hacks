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
    const studentClass = await prisma.class.findFirst({
      where: {
        id: params.classId,
        users: { some: { userId: session.user.id } }, // ✅ Ensure student is enrolled
      },
      include: {
        professor: true, // ✅ Fetch professor details
        assignments: true, // ✅ Fetch assignments in the class
      },
    });

    if (!studentClass) {
      return new Response(JSON.stringify({ message: "Class not found or access denied." }), { status: 404 });
    }

    return new Response(JSON.stringify(studentClass), { status: 200 });
  } catch (error) {
    console.error("Error fetching student class:", error);
    return new Response(JSON.stringify({ message: "Error retrieving class details." }), { status: 500 });
  }
}
